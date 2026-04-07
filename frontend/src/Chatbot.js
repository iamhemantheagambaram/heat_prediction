function Chatbot() {
  return (
    <div className="card">
      <h3>🤖 AI Chatbot</h3>
      <div className="chatbox">
        <p className="loading">
          Waiting for backend response...
        </p>
      </div>
      <input placeholder="Type your question..." />
    </div>
  );
}

export default Chatbot;