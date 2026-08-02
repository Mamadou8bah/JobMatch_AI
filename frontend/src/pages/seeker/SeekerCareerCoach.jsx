import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import ICONS, { Icon } from "../../components/dashboard/icons.jsx";
import PremiumGate from "../../components/dashboard/PremiumGate.jsx";

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I can help with career advice, interview prep, and job search strategy in Africa. What would you like to work on?",
};

export default function SeekerCareerCoach() {
  const { user, isPremium } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");
  const [premiumBlocked, setPremiumBlocked] = useState(false);
  const [quota, setQuota] = useState(null);
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

    api.billing.me().then((status) => {
      setQuota(status.features?.coachChat || null);
    }).catch(() => {});
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
    setPremiumBlocked(false);

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
      api.billing.me().then((status) => setQuota(status.features?.coachChat || null)).catch(() => {});
    } catch (err) {
      if (err.isPremiumRequired) setPremiumBlocked(true);
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
          {!isPremium && quota?.limit != null ? (
            <p className="text-sm text-zinc-500" style={{ marginTop: 6 }}>
              Free plan: {quota.used}/{quota.limit} coach messages today ·{" "}
              <Link to="/seeker/billing" className="dash-inline-link">Upgrade</Link>
            </p>
          ) : null}
        </div>
        {messages.some((m) => m.id !== "welcome") && (
          <button type="button" className="dash-btn sm" onClick={clearHistory} disabled={loading}>
            Clear chat
          </button>
        )}
      </div>
      {premiumBlocked ? (
        <PremiumGate
          title="Daily coach limit reached"
          message="Free seekers get a limited number of AI coach messages each day. Upgrade for unlimited personalized guidance."
        />
      ) : null}
      {error && !premiumBlocked ? <div className="dash-alert error">{error}</div> : null}

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
