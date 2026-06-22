import { useState } from "react";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import ICONS, { Icon } from "../../components/dashboard/icons.jsx";

export default function SeekerCareerCoach() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I can help with career advice, interview prep, and job search strategy in The Gambia. What would you like to work on?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);
    setError("");

    try {
      const data = await api.ai.chat(question);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response || "I could not generate a response." },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="dash-page-title">AI Career Coach</h1>
      <p style={{ color: "#71717a", marginBottom: 20 }}>
        Ask about roles, skills, CV tips, and interview preparation for {user?.fullName || "your profile"}.
      </p>
      {error && <div className="dash-alert error">{error}</div>}

      <div className="dash-card dash-coach-panel">
        <div className="dash-chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`dash-chat-bubble${message.role === "user" ? " mine" : ""}`}
            >
              <div>{message.content}</div>
            </div>
          ))}
          {loading && <div className="dash-chat-bubble">Thinking...</div>}
        </div>
        <form className="dash-chat-compose" onSubmit={send}>
          <input
            className="dash-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your career question..."
            disabled={loading}
          />
          <button type="submit" className="dash-btn primary" disabled={loading} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Icon icon={ICONS.send} size={16} />
            Ask
          </button>
        </form>
      </div>
    </>
  );
}
