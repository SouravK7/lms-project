import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Send } from "lucide-react";

import Navbar from "../components/Navbar";
import api from "../api/axios";
import { loadMessages, saveMessages, clearMessages } from "../utils/chatStorage";

function AITutorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    setMessages(loadMessages(id));
  }, [id]);

  useEffect(() => {
    saveMessages(id, messages);

    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, id]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = {
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.post("/api/aichat/", {
        lesson_id: Number(id),
        message: text,
      });

      const aiMessage = {
        role: "assistant",
        content:
          response.data?.reply ||
          "Sorry, I couldn't generate a response.",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I am unable to answer right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClear = () => {
    const confirmed = window.confirm(
      "Clear all chat messages?"
    );

    if (!confirmed) return;

    clearMessages(id);
    setMessages([]);
  };

  const isSendDisabled =
    loading || input.trim().length === 0;

  return (
    <>
      <Navbar />

      <div className="page-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="chat-header">
          <h1>AI Tutor</h1>
          <p>Ask anything about this lesson.</p>
        </div>

        <div className="chat-box">
          {messages.length === 0 && (
            <div className="empty-chat">
              Ask your first question.
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`message ${
                message.role === "user"
                  ? "message-user"
                  : "message-ai"
              }`}
            >
              <p>{message.content}</p>
            </div>
          ))}

          {loading && (
            <div className="message message-ai">
              <p>Thinking...</p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="chat-input">
          <textarea
            rows={3}
            placeholder="Ask anything about this lesson..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button onClick={sendMessage} disabled={isSendDisabled}>
            <Send size={18} />
          </button>
        </div>

        <button
          className="clear-btn"
          onClick={handleClear}
          disabled={loading}
        >
          <Trash2 size={18} />
          Clear Chat
        </button>
      </div>
    </>
  );
}

export default AITutorPage;