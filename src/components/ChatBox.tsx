import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatHistory, Message } from '@/hooks/useChatHistory';

// ⭐ ADD: Penny props
interface ChatBoxProps {
  messages: any[];
  loading: boolean;
  sendMessage: (msg: string) => Promise<void>;
}

// ⭐ ADD props to component definition
export const ChatBox = ({ messages: pennyMessages, loading, sendMessage }: ChatBoxProps) => {
  const { currentMessages, addMessage, currentConversationId, startNewConversation } = useChatHistory();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Start a new conversation if none exists
  useEffect(() => {
    if (!currentConversationId) {
      startNewConversation();
    }
  }, [currentConversationId, startNewConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, pennyMessages]);

  // ⭐ REMOVE NOTHING — keep your original function,
  // but we no longer use this for Penny responses.
  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('event') || lowerMessage.includes('happening')) {
      return "There are several events happening this week! The Community Board meeting is tonight at 7 PM, and there's a new park opening ceremony on Saturday. Would you like more details about any of these?";
    } else if (lowerMessage.includes('weather')) {
      return "Today's weather is 72°F and partly cloudy - perfect for outdoor activities! The forecast shows mild temperatures continuing through the week.";
    } else if (lowerMessage.includes('park') || lowerMessage.includes('recreation')) {
      return "The new downtown park is opening this Saturday with a grand ceremony at 10 AM. It features playgrounds, walking trails, and a community garden. The park will be located at 5th Avenue and Main Street.";
    } else if (lowerMessage.includes('board') || lowerMessage.includes('meeting')) {
      return "The Community Board meeting is scheduled for tonight at 7:00 PM at City Hall. Topics include the new parking regulations and upcoming infrastructure projects. The meeting is open to all residents.";
    } else if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
      return "I can help you with:\n• Finding local events and activities\n• Community resources and services\n• Weather information\n• Public transportation updates\n• Community board information\n• City policies and regulations\n\nWhat would you like to know more about?";
    } else {
      return "That's a great question! I can help you find information about local events, community resources, weather, and city services. Could you tell me more specifically what you're looking for?";
    }
  };

  // ⭐ UPDATED: send user message to Penny instead of fake responses
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    addMessage(userMessage);     // Save in history
    const userInput = input;
    setInput('');
    setIsTyping(true);

    // ⭐ CALL PENNY instead of generateResponse
    await sendMessage(userInput);

    // typing indicator tied to real loading flag
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ⭐ DISPLAY Penny messages instead of simulated messages
  const mergedMessages = [
    ...currentMessages,
    ...pennyMessages.map((msg, idx) => ({
      id: "penny-" + idx,
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
      timestamp: new Date()
    }))
  ];

  return (
    <div className="flex flex-col h-[500px]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-muted/20 rounded-lg mb-4">
        {mergedMessages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex items-start space-x-3',
              message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            )}
          >
            <div className={cn(
              'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
              message.role === 'user' ? 'bg-primary' : 'bg-secondary'
            )}>
              {message.role === 'user' ? (
                <User className="h-4 w-4 text-primary-foreground" />
              ) : (
                <Bot className="h-4 w-4 text-secondary-foreground" />
              )}
            </div>
            <div
              className={cn(
                'flex-1 rounded-lg p-3 max-w-[80%]',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground ml-auto'
                  : 'bg-card'
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {(isTyping || loading) && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <Bot className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div className="bg-card rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex space-x-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask Penny anything..."
          className="flex-1"
        />
        <Button onClick={handleSend} size="icon" disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
