import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: 24,
            fontFamily: "system-ui, sans-serif",
            maxWidth: 640,
            margin: "48px auto",
          }}
        >
          <h1 style={{ fontSize: 20, marginBottom: 12 }}>Something broke</h1>
          <p style={{ color: "#444", marginBottom: 16 }}>
            Open the browser console (F12 → Console) for details. If you just
            deployed, set{" "}
            <code style={{ background: "#eee", padding: "2px 6px" }}>
              REACT_APP_BACKEND_URL
            </code>{" "}
            in Vercel → Settings → Environment Variables, then redeploy.
          </p>
          <pre
            style={{
              background: "#f5f5f5",
              padding: 12,
              overflow: "auto",
              fontSize: 12,
              borderRadius: 4,
            }}
          >
            {String(this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const el = document.getElementById("root");
if (!el) {
  throw new Error('Missing #root — check public/index.html');
}

const root = ReactDOM.createRoot(el);
root.render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </React.StrictMode>,
);
