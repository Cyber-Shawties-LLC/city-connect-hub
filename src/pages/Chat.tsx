import { useState, FormEvent } from "react";
import { usePennyChat } from "../hooks/usePennyChats";

export default function ChatPage() {
  const { currentMessages, loading, sendMessage } = usePennyChat();
  const [input, setInput] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    await sendMessage(input);
    setInput("");
  }

  return (
    <div className="chat-container">
      <h1>Penny Chatbot</h1>

      <div className="messages">
        {currentMessages.map((m, index) => (
          <div
            key={index}
            className={m.sender === "user" ? "user-message" : "bot-message"}
          >
            {m.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Penny anything..."
        />
        <button type="submit" disabled={loading}>
          {loading ? "Thinking..." : "Send"}
        </button>
      </form>
    </div>
  );
}
