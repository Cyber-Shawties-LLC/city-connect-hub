import { useState } from "react";
import { talkToPenny, PennyPayload, PennyResponse } from "../lib/api";

export function usePennyChat() {
  const [messages, setMessages] = useState<
    { sender: "user" | "penny"; text: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage(input: string, extra?: Partial<PennyPayload>) {
    setLoading(true);

    // add user message to chat
    setMessages(prev => [...prev, { sender: "user", text: input }]);

    try {
      const payload: PennyPayload = { input, ...(extra || {}) };
      const result: PennyResponse = await talkToPenny(payload);

      const botReply =
        typeof result.response === "string"
          ? result.response
          : JSON.stringify(result.response, null, 2);

      setMessages(prev => [...prev, { sender: "penny", text: botReply }]);
    } catch (error: any) {
      setMessages(prev => [
        ...prev,
        { sender: "penny", text: "Sorry, I'm having trouble right now 💛" },
      ]);
    }

    setLoading(false);
  }

  return { messages, loading, sendMessage };
}
