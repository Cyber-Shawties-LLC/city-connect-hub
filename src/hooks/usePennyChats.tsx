import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { talkToPenny, PennyPayload, PennyResponse } from "../lib/api";

export interface PennyMessage {
  id: string;
  sender: "user" | "penny";
  text: string;
  timestamp: Date;
}

export interface PennyConversation {
  id: string;
  title: string;
  messages: PennyMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface PennyChatContextType {
  conversations: PennyConversation[];
  currentConversationId: string | null;
  currentMessages: PennyMessage[];
  loading: boolean;
  startNewConversation: () => void;
  loadConversation: (id: string) => void;
  sendMessage: (input: string, extra?: Partial<PennyPayload>) => Promise<void>;
  deleteConversation: (id: string) => void;
}

const PennyChatContext = createContext<PennyChatContextType | undefined>(undefined);

export const PennyChatProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<PennyConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('penny_chat_history');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Convert date strings back to Date objects
      const withDates = parsed.map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
      setConversations(withDates);
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('penny_chat_history', JSON.stringify(conversations));
    }
  }, [conversations]);

  const startNewConversation = () => {
    const newConv: PennyConversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [{
        id: '1',
        sender: 'penny',
        text: "Hi! I'm Penny, your civic assistant. I can help you find events, community resources, and answer questions about your city. What would you like to know?",
        timestamp: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setConversations(prev => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
  };

  const loadConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
    }
  };

  const sendMessage = async (input: string, extra?: Partial<PennyPayload>) => {
    // Get or create conversation ID
    let conversationId = currentConversationId;
    if (!conversationId) {
      conversationId = Date.now().toString();
      const newConv: PennyConversation = {
        id: conversationId,
        title: 'New Conversation',
        messages: [{
          id: '1',
          sender: 'penny',
          text: "Hi! I'm Penny, your civic assistant. I can help you find events, community resources, and answer questions about your city. What would you like to know?",
          timestamp: new Date()
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setConversations(prev => [newConv, ...prev]);
      setCurrentConversationId(conversationId);
    }

    const userMessage: PennyMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
      timestamp: new Date()
    };

    // Add user message to current conversation
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        const updatedMessages = [...conv.messages, userMessage];
        // Update title based on first user message
        let title = conv.title;
        if (title === 'New Conversation') {
          title = input.slice(0, 40) + (input.length > 40 ? '...' : '');
        }
        return {
          ...conv,
          messages: updatedMessages,
          title,
          updatedAt: new Date()
        };
      }
      return conv;
    }));

    setLoading(true);

    try {
      const payload: PennyPayload = { input, ...(extra || {}) };
      const result: PennyResponse = await talkToPenny(payload);

      const botReply =
        typeof result.response === "string"
          ? result.response
          : JSON.stringify(result.response, null, 2);

      const pennyMessage: PennyMessage = {
        id: (Date.now() + 1).toString(),
        sender: "penny",
        text: botReply,
        timestamp: new Date()
      };

      // Add Penny's response to current conversation
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: [...conv.messages, pennyMessage],
            updatedAt: new Date()
          };
        }
        return conv;
      }));
    } catch (error: any) {
      const errorMessage: PennyMessage = {
        id: (Date.now() + 1).toString(),
        sender: "penny",
        text: "Sorry, I'm having trouble right now 💛",
        timestamp: new Date()
      };

      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: [...conv.messages, errorMessage],
            updatedAt: new Date()
          };
        }
        return conv;
      }));
    }

    setLoading(false);
  };

  const currentMessages = conversations.find(c => c.id === currentConversationId)?.messages || [];

  return (
    <PennyChatContext.Provider value={{
      conversations,
      currentConversationId,
      currentMessages,
      loading,
      startNewConversation,
      loadConversation,
      sendMessage,
      deleteConversation
    }}>
      {children}
    </PennyChatContext.Provider>
  );
};

export const usePennyChat = () => {
  const context = useContext(PennyChatContext);
  if (!context) {
    throw new Error('usePennyChat must be used within PennyChatProvider');
  }
  return context;
};
