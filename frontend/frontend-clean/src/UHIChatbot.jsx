import { useState } from "react";
import axios from "axios";

export default function UHIChatbot({ lat, lon }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Ask me about heat, weather, or safety 🌡" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        message: input,
        lat,
        lon
      });

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: res.data.reply }
      ]);

    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "⚠️ Server error. Check backend." }
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* 🔥 HEADER */}
      <h3 style={{ marginBottom: "10px" }}>🤖 UHI Assistant</h3>

      {/* 💬 MESSAGES */}
      <div className="chatbot-container">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`chat-bubble ${
              m.role === "user" ? "chat-user" : "chat-bot"
            }`}
          >
            {m.content}
          </div>
        ))}

        {/* 🔄 LOADING */}
        {loading && (
          <div className="chat-bubble chat-bot">
            typing...
          </div>
        )}
      </div>

      {/* ✏ INPUT */}
      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about heat, weather..."
        />
        <button onClick={sendMessage}>
          Send
        </button>
      </div>
    </>
  );
}