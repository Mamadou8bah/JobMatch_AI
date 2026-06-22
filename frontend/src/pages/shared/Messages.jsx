import { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import ICONS, { formatDate, Icon } from "../../components/dashboard/icons.jsx";

export default function Messages() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.chat
      .listThreads()
      .then((data) => {
        setThreads(data);
        if (data.length) setSelectedId(data[0].id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    api.chat
      .listMessages(selectedId)
      .then((data) => {
        setMessages(data);
        return api.chat.markRead(selectedId);
      })
      .catch((err) => setError(err.message));
  }, [selectedId]);

  const getPeer = (thread) => {
    if (user?.role === "employer") {
      return thread.applicant?.fullName || "Candidate";
    }
    return thread.employer?.companyName || thread.employer?.fullName || "Employer";
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !selectedId) return;

    setSending(true);
    setError("");
    try {
      const message = await api.chat.sendMessage(selectedId, draft.trim());
      setMessages((prev) => [...prev, message]);
      setDraft("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="dash-loading" style={{ minHeight: 400 }}>
        <div className="dash-spinner" />
      </div>
    );
  }

  return (
    <>
      <h1 className="dash-page-title">Messages</h1>
      {error && <div className="dash-alert error">{error}</div>}

      <div className="dash-chat-layout">
        <aside className="dash-card dash-chat-threads">
          <h3 className="dash-card-title">Conversations</h3>
          {threads.length === 0 ? (
            <p className="dash-empty">No conversations yet</p>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.id}
                type="button"
                className={`dash-chat-thread${selectedId === thread.id ? " active" : ""}`}
                onClick={() => setSelectedId(thread.id)}
              >
                <strong>{getPeer(thread)}</strong>
                <span>{thread.job?.title || "General inquiry"}</span>
                <small>{formatDate(thread.updatedAt)}</small>
              </button>
            ))
          )}
        </aside>

        <section className="dash-card dash-chat-panel">
          {!selectedId ? (
            <p className="dash-empty">Select a conversation</p>
          ) : (
            <>
              <div className="dash-chat-messages">
                {messages.length === 0 ? (
                  <p className="dash-empty">Start the conversation</p>
                ) : (
                  messages.map((message) => {
                    const mine = message.sender?.id === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`dash-chat-bubble${mine ? " mine" : ""}`}
                      >
                        <div>{message.content}</div>
                        <small>{formatDate(message.createdAt)}</small>
                      </div>
                    );
                  })
                )}
              </div>
              <form className="dash-chat-compose" onSubmit={handleSend}>
                <input
                  className="dash-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a message..."
                />
                <button type="submit" className="dash-btn primary" disabled={sending} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Icon icon={ICONS.send} size={16} />
                  {sending ? "Sending..." : "Send"}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </>
  );
}
