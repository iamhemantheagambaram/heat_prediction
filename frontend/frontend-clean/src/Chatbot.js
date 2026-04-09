import { useState } from "react";

function Chatbot() {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;

    console.log("User Message:", message);

    setMessage("");
  };

  return (
    <div className="card">
      <div className="chatbox">
        <p className="loading">
          Waiting for backend response...
        </p>
      </div>

      <div
  style={{
    position: "relative",
    marginTop: "10px",
    width: "100%",
  }}
>
  <input
    type="text"
    placeholder="Type your question..."
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        handleSend();
      }
    }}
    style={{
      width: "100%",
      boxSizing: "border-box",
      padding: "12px 45px 12px 12px",
      borderRadius: "10px",
      border: "1px solid #444",
      outline: "none",
      fontSize: "14px",
    }}
  />

  <button
    onClick={handleSend}
    style={{
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      border: "none",
      background: "transparent",
      color: "#4f46e5",
      fontSize: "20px",
      cursor: "pointer",
      padding: "0",
    }}
  >
    ➤
  </button>
</div>
    </div>
  );
}

export default Chatbot;