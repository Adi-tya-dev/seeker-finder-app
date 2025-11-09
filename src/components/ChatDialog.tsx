import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Send, User, Check, CheckCheck } from "lucide-react";
import { messageSchema } from "@/lib/validationSchemas";

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read: boolean;
  read_at: string | null;
}

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  uploaderProfile: Profile;
  itemId: string;
  currentUserId: string;
}

const ChatDialog = ({ isOpen, onClose, uploaderProfile, itemId, currentUserId }: ChatDialogProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      initializeConversation();
      fetchCurrentUserProfile();
    }
  }, [isOpen, itemId, currentUserId]);

  const fetchCurrentUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUserId)
        .single();

      if (error) throw error;
      setCurrentUserProfile(data);
    } catch (error: any) {
      console.error('Error fetching current user profile:', error);
    }
  };

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      markMessagesAsRead();
      
      // Subscribe to new messages and updates
      const channel = supabase
        .channel(`conversation:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            setMessages(prev => [...prev, payload.new as Message]);
            // Mark new message as read if it's not from current user
            if (payload.new.sender_id !== currentUserId) {
              markMessagesAsRead();
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            setMessages(prev => 
              prev.map(msg => msg.id === payload.new.id ? payload.new as Message : msg)
            );
          }
        )
        .on('presence', { event: 'sync' }, () => {
          const presenceState = channel.presenceState();
          const otherUsers = Object.values(presenceState).flat().filter(
            (user: any) => user.user_id !== currentUserId
          );
          setOtherUserTyping(otherUsers.some((user: any) => user.typing));
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ user_id: currentUserId, typing: false });
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [conversationId, currentUserId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const initializeConversation = async () => {
    try {
      // Check if conversation exists
      const { data: existingConv, error: fetchError } = await supabase
        .from('conversations')
        .select('id')
        .eq('item_id', itemId)
        .eq('claimer_id', currentUserId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingConv) {
        setConversationId(existingConv.id);
      } else {
        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            item_id: itemId,
            claimer_id: currentUserId,
            uploader_id: uploaderProfile.id,
          })
          .select('id')
          .single();

        if (createError) throw createError;
        setConversationId(newConv.id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const markMessagesAsRead = async () => {
    if (!conversationId) return;
    
    try {
      await supabase.rpc('mark_messages_as_read', {
        p_conversation_id: conversationId,
        p_user_id: currentUserId
      });
    } catch (error: any) {
      console.error('Error marking messages as read:', error);
    }
  };

  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading messages",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTyping = async (typing: boolean) => {
    if (!conversationId) return;
    
    const channel = supabase.channel(`conversation:${conversationId}`);
    await channel.track({ user_id: currentUserId, typing });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || isLoading) return;

    setIsLoading(true);
    handleTyping(false);
    
    try {
      // Validate message content
      const validationResult = messageSchema.safeParse({
        content: newMessage.trim()
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: validationResult.data.content,
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set typing to true
    if (!isTyping && e.target.value) {
      setIsTyping(true);
      handleTyping(true);
    }
    
    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      handleTyping(false);
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {uploaderProfile.full_name?.[0] || uploaderProfile.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{uploaderProfile.full_name || "User"}</div>
              <div className="text-xs text-muted-foreground font-normal">
                {uploaderProfile.email}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Chat with the person who found this item
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4">
          <div ref={scrollRef} className="space-y-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.sender_id === currentUserId ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender_id !== currentUserId && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="text-xs">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-2xl px-4 py-2 max-w-[70%] break-words ${
                    message.sender_id === currentUserId
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <div className={`flex items-center gap-1 text-[10px] mt-1 ${
                    message.sender_id === currentUserId 
                      ? "text-primary-foreground/70" 
                      : "text-muted-foreground"
                  }`}>
                    <span>
                      {new Date(message.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    {message.sender_id === currentUserId && (
                      message.read ? (
                        <CheckCheck className="h-3 w-3" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )
                    )}
                  </div>
                </div>
                {message.sender_id === currentUserId && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {currentUserProfile?.full_name?.[0] || currentUserProfile?.email[0].toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {otherUserTyping && (
              <div className="flex gap-2 items-center">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2">
                  <div className="flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={sendMessage} className="flex gap-2 p-4 border-t bg-muted/30">
          <Input
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !newMessage.trim()}
            className="rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;
