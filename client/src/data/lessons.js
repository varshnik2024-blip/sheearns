// Six short lessons. Written to be read aloud, so sentences are short and
// there is no banking jargon that is not explained on the spot.

export const LESSONS = [
  {
    id: "lesson-1",
    minutes: 4,
    icon: "🪙",
    title: "Keep business money and house money apart",
    summary: "Why mixing them hides whether you are actually making a profit.",
    body: [
      "When you sell something, that money is business money. When you buy food for your family, that is house money.",
      "Most small businesses keep both in one place. This feels easier. But then you cannot tell if your business is making money or losing it.",
      "Try this. Keep two envelopes, or two places in your box. One for the business, one for the house.",
      "Every day, take out what the house needs and put it in the house envelope. Whatever is left is business money. Do not touch it.",
      "After one month, look at the business envelope. If it grew, your business is making a profit. If it shrank, something needs to change.",
      "Banks ask this question too. If you can show them your business money separately, they take you much more seriously."
    ],
    takeaway: "Two envelopes. House money and business money never mix."
  },
  {
    id: "lesson-2",
    minutes: 5,
    icon: "📈",
    title: "What interest really costs you",
    summary: "The difference between flat rate and reducing balance, in rupees.",
    body: [
      "Interest is the extra money you pay the lender for letting you use their money.",
      "There are two ways lenders calculate it, and the difference is large.",
      "Reducing balance: interest is charged only on what you still owe. As you repay, you owe less, so the interest gets smaller every month.",
      "Flat rate: interest is charged on the full original amount for the whole time, even after you have repaid most of it.",
      "Here is what that means. Borrow 50,000 rupees for 2 years at 12 percent. On reducing balance you pay about 6,600 rupees in interest. On flat rate you pay 12,000 rupees. Same number, double the cost.",
      "Always ask the lender: is this reducing balance or flat rate? If they will not answer clearly, be careful."
    ],
    takeaway: "Always ask: reducing balance or flat rate? Flat rate costs about double."
  },
  {
    id: "lesson-3",
    minutes: 4,
    icon: "🏦",
    title: "What a bank looks at, and what it misses",
    summary: "Why banks say no to women who are clearly good with money.",
    body: [
      "A bank wants to know one thing: will this person pay me back?",
      "To answer it, most banks look at three things. Your past loans. Your property. Your salary slips.",
      "If you have never taken a bank loan, you have no record. The bank sees nothing, and nothing looks like risk.",
      "If the land and the house are in your husband's or father's name, you have no property to show, even if you helped pay for it.",
      "If you sell vegetables or stitch clothes, there are no salary slips at all.",
      "So the bank says no. Not because you are bad with money, but because it is looking in the wrong places.",
      "What you actually have is better evidence: you pay your suppliers, you work most days, you are in a group that has never defaulted. That is what this app measures."
    ],
    takeaway: "A 'no' from a bank often means it looked in the wrong place, not that you are risky."
  },
  {
    id: "lesson-4",
    minutes: 5,
    icon: "📋",
    title: "Reading a loan paper before you sign",
    summary: "Five things to find on any loan document.",
    body: [
      "Never sign a loan paper you have not understood. Ask for time. Take it home. This is your right.",
      "Find these five things. If any of them is missing, do not sign.",
      "One. The amount. How much money will actually reach your hand? Fees are often cut before you get it.",
      "Two. The interest rate, and whether it is reducing balance or flat.",
      "Three. The EMI. This is the fixed amount you pay every month. Ask for it in rupees, not in percentages.",
      "Four. How many months. More months means smaller EMI but more total interest.",
      "Five. What happens if you repay early. Some lenders charge you for this. It is called a foreclosure charge.",
      "If the person will not explain these, that is your answer. Walk away and go somewhere else."
    ],
    takeaway: "Amount, rate, EMI, months, early-repayment charge. Find all five before you sign."
  },
  {
    id: "lesson-5",
    minutes: 4,
    icon: "⚖️",
    title: "Your rights when you ask for a loan",
    summary: "What a bank may not do, and what to say if it does.",
    body: [
      "A bank cannot refuse you a loan only because you are a woman. This is not allowed.",
      "For a Mudra loan up to 10 lakh rupees, no collateral is needed. No land, no gold, nothing. If someone asks you for collateral on a Mudra loan, that is wrong.",
      "A bank cannot demand your husband's signature for a scheme that does not require it. If a loan officer asks, say: please show me the rule in writing.",
      "You have the right to know why you were refused. Ask for the reason in writing.",
      "If a bank treats you unfairly, you can complain to the RBI Ombudsman. It is free. You do not need a lawyer.",
      "Write down what happened, the date, the branch, and the name of the person. That record is what makes a complaint work."
    ],
    takeaway: "Mudra needs no collateral and no male co-signer. Ask for any refusal in writing."
  },
  {
    id: "lesson-6",
    minutes: 4,
    icon: "🛡️",
    title: "Warning signs about money in a family",
    summary: "Patterns worth noticing. Information only, not a judgement.",
    body: [
      "Money in a family can be shared fairly, or it can be used to control someone. It helps to know the difference.",
      "Some patterns worth noticing: you earn but you never decide how it is spent. You are not allowed to see the bank passbook. A loan was taken in your name and you were not told what for.",
      "Nothing in your name, even after many years of working. You have to ask permission for small everyday spending.",
      "If some of these feel familiar, it does not mean anything is definitely wrong. Families work in different ways.",
      "But it is worth knowing that these patterns have a name, and that support exists.",
      "Small first steps: open a bank account in your own name only. Keep some savings you decide about. Write down what you earn, so you know your own numbers.",
      "You can call the Women's Helpline on 181 at any time. It is free and confidential."
    ],
    takeaway: "An account in your own name, and knowing your own numbers, are the first two steps."
  }
];

// Six questions, one per lesson. Used for the literacy score.
export const QUIZ = [
  {
    id: "q1",
    question: "Which one costs you more money?",
    options: ["Reducing balance interest", "Flat rate interest", "They cost the same"],
    answer: 1
  },
  {
    id: "q2",
    question: "How much collateral does a Mudra loan up to 10 lakh need?",
    options: ["Land worth the loan", "Gold worth half the loan", "None at all"],
    answer: 2
  },
  {
    id: "q3",
    question: "What does EMI mean?",
    options: [
      "The fixed amount you pay every month",
      "The total interest on the loan",
      "The bank's processing fee"
    ],
    answer: 0
  },
  {
    id: "q4",
    question: "Why should business money and house money be kept apart?",
    options: [
      "Because the bank makes it a rule",
      "So you can see if the business is making a profit",
      "It does not really matter"
    ],
    answer: 1
  },
  {
    id: "q5",
    question: "A loan officer asks for your husband's signature on a Mudra loan. What can you do?",
    options: [
      "Ask for the rule in writing",
      "Nothing, it is required",
      "Find a different husband"
    ],
    answer: 0
  },
  {
    id: "q6",
    question: "Before signing a loan paper, how many things should you check?",
    options: ["Just the amount", "Amount, rate, EMI, months, early-repayment charge", "Nothing, the bank checks it"],
    answer: 1
  }
];
