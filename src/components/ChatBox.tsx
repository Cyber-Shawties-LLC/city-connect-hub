import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePennyChat } from '@/hooks/usePennyChats';
import { GradioEmbed } from './GradioEmbed';

export const ChatBox = () => {
  const { currentMessages, loading, sendMessage, currentConversationId, startNewConversation } = usePennyChat();
  const [input, setInput] = useState('');
  const [useFallback, setUseFallback] = useState(false);
  const [apiErrorCount, setApiErrorCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Start a new conversation if none exists
  useEffect(() => {
    if (!currentConversationId) {
      startNewConversation();
    }
  }, [currentConversationId, startNewConversation]);

  // Monitor for API errors and switch to fallback after 2 failures
  useEffect(() => {
    const lastMessage = currentMessages[currentMessages.length - 1];
    if (lastMessage && lastMessage.sender === 'penny' && 
        (lastMessage.text.includes('endpoint not found') || 
         lastMessage.text.includes('Unable to connect') ||
         lastMessage.text.includes('API Error'))) {
      setApiErrorCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 2 && !useFallback) {
          setUseFallback(true);
        }
        return newCount;
      });
    }
  }, [currentMessages, useFallback]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userInput = input;
    setInput('');
    await sendMessage(userInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Show fallback if API fails multiple times
  if (useFallback) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Using embedded chat interface
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                API connection unavailable. Using direct interface.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setUseFallback(false);
              setApiErrorCount(0);
            }}
          >
            Try API Again
          </Button>
        </div>
        <GradioEmbed />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-muted/20 rounded-lg mb-4">
        {currentMessages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex items-start space-x-3',
              message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            )}
          >
            <div className={cn(
              'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
              message.sender === 'user' ? 'bg-primary' : 'bg-secondary'
            )}>
              {message.sender === 'user' ? (
                <User className="h-4 w-4 text-primary-foreground" />
              ) : (
                <Bot className="h-4 w-4 text-secondary-foreground" />
              )}
            </div>
            <div
              className={cn(
                'flex-1 rounded-lg p-3 max-w-[80%]',
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground ml-auto'
                  : 'bg-card'
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
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
