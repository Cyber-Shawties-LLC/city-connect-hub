import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatHistoryContextType {
  conversations: Conversation[];
  currentConversationId: string | null;
  currentMessages: Message[];
  startNewConversation: () => void;
  loadConversation: (id: string) => void;
  addMessage: (message: Message) => void;
  deleteConversation: (id: string) => void;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

export const ChatHistoryProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('chat_history');
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
      localStorage.setItem('chat_history', JSON.stringify(conversations));
    }
  }, [conversations]);

  const startNewConversation = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [{
        id: '1',
        role: 'assistant',
        content: "Hi! I'm Penny, your civic assistant. I can help you find events, community resources, and answer questions about your city. What would you like to know?",
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

  const addMessage = (message: Message) => {
    if (!currentConversationId) {
      startNewConversation();
      return;
    }

    setConversations(prev => prev.map(conv => {
      if (conv.id === currentConversationId) {
        const updatedMessages = [...conv.messages, message];
        // Update title based on first user message
        let title = conv.title;
        if (title === 'New Conversation' && message.role === 'user') {
          title = message.content.slice(0, 40) + (message.content.length > 40 ? '...' : '');
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
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
    }
  };

  const currentMessages = conversations.find(c => c.id === currentConversationId)?.messages || [];

  return (
    <ChatHistoryContext.Provider value={{
      conversations,
      currentConversationId,
      currentMessages,
      startNewConversation,
      loadConversation,
      addMessage,
      deleteConversation
    }}>
      {children}
    </ChatHistoryContext.Provider>
  );
};

export const useChatHistory = () => {
  const context = useContext(ChatHistoryContext);
  if (!context) {
    throw new Error('useChatHistory must be used within ChatHistoryProvider');
  }
  return context;
};
