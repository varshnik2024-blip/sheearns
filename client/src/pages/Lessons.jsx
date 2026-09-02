import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { LESSONS, QUIZ } from "../data/lessons.js";
import { SpeakButton, Stat, Modal } from "../components/ui.jsx";

export default function Lessons() {
  const { t, record, update } = useApp();
  const [open, setOpen] = useState(null);
  const [quiz, setQuiz] = useState(false);

  const completed = record.lessons?.completed || [];
  const quizScore = record.lessons?.quizScore;

  const markDone = (id) => {
    if (completed.includes(id)) return;
    update((prev) => ({
      ...prev,
      lessons: { ...prev.lessons, completed: [...(prev.lessons.completed || []), id] }
    }));
  };

  if (open) {
    const lesson = LESSONS.find((l) => l.id === open);
    const done = completed.includes(lesson.id);
    const fullText = `${lesson.title}. ${lesson.body.join(" ")} ${lesson.takeaway}`;

    return (
      <>
        <button className="btn ghost" onClick={() => setOpen(null)} style={{ alignSelf: "flex-start" }}>
          ← {t("backToLessons")}
        </button>

        <div className="card pad-lg" style={{ gap: 18 }}>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
            <div className="row" style={{ gap: 12 }}>
              <span style={{ fontSize: "2rem" }} aria-hidden="true">{lesson.icon}</span>
              <div>
                <h1 style={{ fontSize: "1.35rem" }}>{lesson.title}</h1>
                <p className="sub">{lesson.minutes} {t("lessonMin")}</p>
              </div>
            </div>
            <SpeakButton text={fullText} />
          </div>

          <div className="lesson-body">
            {lesson.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="banner good">
            <span className="ic" aria-hidden="true">🔑</span>
            <div>
              <b>{t("rememberThis")}</b>
              <p style={{ marginTop: 4 }}>{lesson.takeaway}</p>
            </div>
          </div>

          {done ? (
            <span className="pill good" style={{ alignSelf: "flex-start" }}>✓ {t("doneLesson")}</span>
          ) : (
            <button className="btn" onClick={() => { markDone(lesson.id); setOpen(null); }}>
              ✓ {t("markDone")}
            </button>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>{t("lessonsTitle")}</h1>
          <p className="sub">{t("lessonsSub")}</p>
        </div>
        <button className="btn ghost" onClick={() => setQuiz(true)}>
          📝 {quizScore === null || quizScore === undefined ? t("takeQuiz") : t("retakeQuiz")}
        </button>
      </div>

      <div className="grid g3">
        <Stat
          label={t("moneyKnowledge")}
          value={quizScore === null || quizScore === undefined ? "—" : `${quizScore}/100`}
          note={quizScore === null || quizScore === undefined ? t("takeQuizToFindOut") : undefined}
        />
        <Stat label={t("lessonsDone")} value={`${completed.length} / ${LESSONS.length}`} />
        <Stat
          label={t("pointsFromLessons")}
          value={`+${Math.round(((completed.length / LESSONS.length) * 0.6 + ((quizScore || 0) / 100) * 0.4) * 0.08 * 600)}`}
          note={t("countsTowardScore")}
        />
      </div>

      <div className="grid" style={{ gap: 10 }}>
        {LESSONS.map((l, i) => {
          const done = completed.includes(l.id);
          return (
            <button
              key={l.id}
              className="card"
              onClick={() => setOpen(l.id)}
              style={{
                flexDirection: "row", alignItems: "center", gap: 14,
                cursor: "pointer", textAlign: "left", font: "inherit", color: "var(--ink)"
              }}
            >
              <span style={{ fontSize: "1.7rem" }} aria-hidden="true">{l.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700 }}>{i + 1}. {l.title}</div>
                <div style={{ color: "var(--muted)", fontSize: "0.87rem" }}>{l.summary}</div>
                <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: 3 }}>
                  {l.minutes} {t("lessonMin")}
                </div>
              </div>
              <span className={`pill ${done ? "good" : "info"}`}>
                {done ? `✓ ${t("doneLesson")}` : `▶ ${t("startLesson")}`}
              </span>
            </button>
          );
        })}
      </div>

      {quiz && <Quiz onClose={() => setQuiz(false)} />}
    </>
  );
}

/* --------------------------------------------------------------------------
   The quiz. One question at a time, with the answer explained immediately.
   -------------------------------------------------------------------------- */
function Quiz({ onClose }) {
  const { t, update } = useApp();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);

  const q = QUIZ[step];

  const choose = (i) => {
    setPicked(i);
    setAnswers((a) => ({ ...a, [q.id]: i }));
  };

  const next = () => {
    setPicked(null);
    if (step + 1 < QUIZ.length) {
      setStep(step + 1);
    } else {
      const correct = QUIZ.filter((question) => answers[question.id] === question.answer).length;
      const score = Math.round((correct / QUIZ.length) * 100);
      update((prev) => ({
        ...prev,
        lessons: { ...prev.lessons, quizScore: score, quizAnswers: answers }
      }));
      setDone(true);
    }
  };

  if (done) {
    const correct = QUIZ.filter((question) => answers[question.id] === question.answer).length;
    const score = Math.round((correct / QUIZ.length) * 100);
    return (
      <Modal title={t("yourResult")} onClose={onClose}>
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <div style={{ fontSize: "3rem", fontWeight: 700 }}>{score}%</div>
          <p style={{ color: "var(--muted)" }}>{correct} {t("of")} {QUIZ.length} {t("correctOf")}</p>
        </div>
        <div className="banner info">
          <span className="ic" aria-hidden="true">📈</span>
          <span>{t("quizSaved")}</span>
        </div>
        <button className="btn block" onClick={onClose}>{t("save")}</button>
      </Modal>
    );
  }

  return (
    <Modal title={`${t("questionOf")} ${step + 1} ${t("of")} ${QUIZ.length}`} onClose={onClose}>
      <p style={{ fontWeight: 700, fontSize: "1.05rem" }}>{q.question}</p>

      <div className="choices" style={{ gridTemplateColumns: "1fr" }}>
        {q.options.map((o, i) => {
          const isPicked = picked === i;
          const isRight = i === q.answer;
          let style = {};
          if (picked !== null && isRight) style = { borderColor: "var(--pos)", background: "var(--pos-soft)" };
          else if (isPicked && !isRight) style = { borderColor: "var(--crit)", background: "var(--crit-soft)" };

          return (
            <button
              key={i}
              type="button"
              className="choice"
              aria-pressed={isPicked}
              disabled={picked !== null}
              onClick={() => choose(i)}
              style={style}
            >
              {picked !== null && isRight && <span aria-hidden="true">✓</span>}
              {picked !== null && isPicked && !isRight && <span aria-hidden="true">✕</span>}
              <span>{o}</span>
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <button className="btn block" onClick={next}>
          {step + 1 < QUIZ.length ? `${t("nextQuestion")} →` : `${t("seeResult")} →`}
        </button>
      )}
    </Modal>
  );
}
