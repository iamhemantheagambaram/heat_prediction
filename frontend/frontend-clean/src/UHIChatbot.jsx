import { useState } from "react";
import axios from "axios";

export default function UHIChatbot({ lat, lon }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Ask me about heat, weather, or safety 🌡" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        message: input,
        lat: lat,
        lon: lon
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
    <div style={styles.container}>
      <div style={styles.messages}>
        {messages.map((m, i) => (
          <div key={i} style={m.role === "user" ? styles.user : styles.bot}>
            {m.content}
          </div>
        ))}
      </div>

      <div style={styles.inputRow}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask something..."
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.button}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    bottom: 10,
    right: 10,
    width: "300px",
    background: "#1e1e1e",
    color: "white",
    padding: "10px",
    borderRadius: "10px"
  },
  messages: {
    maxHeight: "250px",
    overflowY: "auto",
    marginBottom: "10px"
  },
  user: {
    textAlign: "right",
    margin: "5px",
    color: "#00ffcc"
  },
  bot: {
    textAlign: "left",
    margin: "5px"
  },
  inputRow: {
    display: "flex"
  },
  input: {
    flex: 1,
    padding: "5px"
  },
  button: {
    marginLeft: "5px"
  }
};