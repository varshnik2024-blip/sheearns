import { Component } from "react";

// If one page throws, this catches it so the rest of the app keeps working.
// Without it, a single bad render turns the whole screen white — which is the
// last thing you want happening in front of judges.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Page crashed:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="card" style={{ gap: 14 }}>
        <div className="banner bad">
          <span className="ic" aria-hidden="true">⚠</span>
          <div>
            <b>This page could not open.</b>
            <p style={{ marginTop: 4 }}>
              Nothing you saved has been lost. Please try another page from the menu.
            </p>
          </div>
        </div>

        <button className="btn" style={{ alignSelf: "flex-start" }} onClick={() => this.setState({ error: null })}>
          Try again
        </button>

        <details>
          <summary style={{ cursor: "pointer", fontSize: "0.85rem", color: "var(--muted)" }}>
            Technical details (for the developer)
          </summary>
          <pre
            style={{
              fontSize: "0.75rem",
              whiteSpace: "pre-wrap",
              background: "var(--surface-2)",
              padding: 12,
              borderRadius: 8,
              marginTop: 8,
              overflowX: "auto"
            }}
          >
            {String(this.state.error?.stack || this.state.error)}
          </pre>
        </details>
      </div>
    );
  }
}
