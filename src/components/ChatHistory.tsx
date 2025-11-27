import { usePennyChat } from '@/hooks/usePennyChats';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ChatHistory = () => {
  const { 
    conversations, 
    currentConversationId, 
    startNewConversation, 
    loadConversation,
    deleteConversation 
  } = usePennyChat();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Button 
          onClick={startNewConversation} 
          className="w-full"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No chat history yet</p>
              <p className="text-xs mt-1">Start a conversation with Penny</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "group relative rounded-lg p-3 cursor-pointer transition-colors",
                  "hover:bg-accent/50",
                  currentConversationId === conv.id && "bg-accent"
                )}
                onClick={() => loadConversation(conv.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-foreground">
                      {conv.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
