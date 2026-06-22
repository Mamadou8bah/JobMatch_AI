import { useEffect, useRef, useState } from "react";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import ICONS, { Icon } from "../../components/dashboard/icons.jsx";

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I can help with career advice, interview prep, and job search strategy in The Gambia. What would you like to work on?",
};

export default function SeekerCareerCoach() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    api.ai
      .coachMessages()
      .then((history) => {
        setMessages(history.length ? history : [WELCOME_MESSAGE]);
      })
      .catch((err) => {
        setError(err.message);
        setMessages([WELCOME_MESSAGE]);
      })
      .finally(() => setHistoryLoading(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput("");
    setLoading(true);
    setError("");

    const optimisticUser = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: question,
    };
    setMessages((prev) => [...prev.filter((m) => m.id !== "welcome"), optimisticUser]);

    try {
      const data = await api.ai.chat(question);
      setMessages((prev) => {
        const withoutOptimistic = prev.filter((m) => m.id !== optimisticUser.id);
        const next = [...withoutOptimistic];
        if (data.userMessage) next.push(data.userMessage);
        if (data.assistantMessage) next.push(data.assistantMessage);
        else if (data.response) {
          next.push({ id: `temp-ai-${Date.now()}`, role: "assistant", content: data.response });
        }
        return next.length ? next : [WELCOME_MESSAGE];
      });
    } catch (err) {
      setError(err.message);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    setLoading(true);
    setError("");
    try {
      await api.ai.clearCoachMessages();
      setMessages([WELCOME_MESSAGE]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="dash-coach-header">
        <div>
          <h1 className="dash-page-title">AI Career Coach</h1>
          <p className="dash-coach-subtitle">
            Ask about roles, skills, CV tips, and interview preparation for {user?.fullName || "your profile"}.
          </p>
        </div>
        {messages.some((m) => m.id !== "welcome") && (
          <button type="button" className="dash-btn sm" onClick={clearHistory} disabled={loading}>
            Clear chat
          </button>
        )}
      </div>
      {error && <div className="dash-alert error">{error}</div>}

      <div className="dash-card dash-coach-panel">
        {historyLoading ? (
          <div className="dash-loading" style={{ minHeight: 280 }}>
            <div className="dash-spinner" />
          </div>
        ) : (
          <>
            <div className="dash-chat-messages dash-coach-messages">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`dash-chat-bubble${message.role === "user" ? " mine" : ""}`}
                >
                  <div>{message.content}</div>
                </div>
              ))}
              {loading && <div className="dash-chat-bubble">Thinking...</div>}
              <div ref={messagesEndRef} />
            </div>
            <form className="dash-chat-compose" onSubmit={send}>
              <input
                className="dash-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your career question..."
                disabled={loading}
              />
              <button
                type="submit"
                className="dash-btn primary"
                disabled={loading}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Icon icon={ICONS.send} size={16} />
                Ask
              </button>
            </form>
          </>
        )}
      </div>
    </>
  );
}
