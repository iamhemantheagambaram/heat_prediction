import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function UHIChatbot({ lat, lon }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Ask me about heat, weather, or safety 🌡" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [language, setLanguage] = useState("en");
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text = input) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        message: text,
        lat,
        lon,
        language
      });

      const reply = res.data.reply;

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: reply }
      ]);

      if (voiceEnabled) speak(reply);

    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "⚠️ Server error. Check backend." }
      ]);
    }

    setLoading(false);
  };

  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "ta" ? "ta-IN" : "en-US";

    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      sendMessage(voiceText);
    };

    recognition.start();
  };

  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = language === "ta" ? "ta-IN" : "en-US";
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="chat-container">

      {/* HEADER */}
      <div className="chat-header">
        <span>🤖 UHI Assistant</span>

        <div className="chat-controls">
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="ta">Tamil</option>
          </select>

          <button onClick={() => setVoiceEnabled(!voiceEnabled)}>
            {voiceEnabled ? "🔊" : "🔇"}
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="chat-body">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`chat-row ${m.role === "user" ? "user" : "bot"}`}
          >
            <div className="chat-bubble">
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-row bot">
            <div className="chat-bubble typing">Typing...</div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* INPUT */}
      <div className="chat-input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={
            language === "ta"
              ? "உங்கள் கேள்வியை கேளுங்கள்..."
              : "Ask about heat, weather..."
          }
        />

        <button onClick={() => sendMessage()}>➤</button>
        <button onClick={startVoice}>🎤</button>
      </div>

    </div>
  );
}