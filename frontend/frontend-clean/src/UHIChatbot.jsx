import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function UHIChatbot({ lat, lon }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Ask me about heat, weather, or safety 🌡" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 NEW STATES
  const [language, setLanguage] = useState("en"); // en / ta
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const chatEndRef = useRef(null);

  // 🔥 AUTO SCROLL
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
        language // 🔥 send language
      });

      const reply = res.data.reply;

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: reply }
      ]);

      // 🔊 Speak ONLY if enabled
      if (voiceEnabled) speak(reply);

    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "⚠️ Server error. Check backend." }
      ]);
    }

    setLoading(false);
  };

  // 🎤 VOICE INPUT (ONLY WHEN BUTTON CLICKED)
  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice not supported");
      return;
    }

    const recognition = new SpeechRecognition();

    // 🔥 LANGUAGE BASED INPUT
    recognition.lang = language === "ta" ? "ta-IN" : "en-US";

    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      sendMessage(voiceText);
    };

    recognition.start();
  };

  // 🔊 TEXT TO SPEECH
  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);

    // 🔥 LANGUAGE BASED OUTPUT
    speech.lang = language === "ta" ? "ta-IN" : "en-US";

    window.speechSynthesis.speak(speech);
  };

  return (
    <>
      {/* 🔥 HEADER */}
      <h3 style={{ marginBottom: "10px" }}>🤖 UHI Assistant</h3>

      {/* 🌐 LANGUAGE + VOICE TOGGLE */}
      <div style={{ marginBottom: "10px" }}>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="ta">Tamil</option>
        </select>

        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          style={{ marginLeft: "10px" }}
        >
          {voiceEnabled ? "🔊 Voice ON" : "🔇 Voice OFF"}
        </button>
      </div>

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

        {loading && (
          <div className="chat-bubble chat-bot">
            typing...
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ✏ INPUT */}
      <div className="chat-input">
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

        <button onClick={() => sendMessage()}>
          Send
        </button>

        {/* 🎤 VOICE BUTTON */}
        <button onClick={startVoice} style={{ marginLeft: "5px" }}>
          🎤
        </button>
      </div>
    </>
  );
}