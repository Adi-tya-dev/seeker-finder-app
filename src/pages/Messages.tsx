import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, MessageCircle } from "lucide-react";
import ChatDialog from "@/components/ChatDialog";

interface Conversation {
  id: string;
  item_id: string;
  claimer_id: string;
  uploader_id: string;
  created_at: string;
  items: {
    description: string;
    building: string;
    classroom: string;
  };
  claimer_profile: {
    id: string;
    full_name: string;
    email: string;
  };
  uploader_profile: {
    id: string;
    full_name: string;
    email: string;
  };
  latest_message?: {
    content: string;
    created_at: string;
  };
}

const Messages = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        fetchConversations(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        fetchConversations(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchConversations = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          items (
            description,
            building,
            classroom
          ),
          claimer_profile:profiles!conversations_claimer_id_fkey (
            id,
            full_name,
            email
          ),
          uploader_profile:profiles!conversations_uploader_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .or(`claimer_id.eq.${userId},uploader_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch latest message for each conversation
      const conversationsWithMessages = await Promise.all(
        (data || []).map(async (conv) => {
          const { data: messages } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...conv,
            latest_message: messages || undefined,
          };
        })
      );

      setConversations(conversationsWithMessages);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getOtherUser = (conversation: Conversation) => {
    if (!user) return null;
    return conversation.claimer_id === user.id 
      ? conversation.uploader_profile 
      : conversation.claimer_profile;
  };

  const getItemInfo = (conversation: Conversation) => {
    return `${conversation.items.description} - ${conversation.items.building}, ${conversation.items.classroom}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              Your Messages
            </CardTitle>
            <CardDescription>
              View and manage your conversations about found items
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading conversations...</p>
            ) : conversations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No conversations yet. Start by claiming an item!
              </p>
            ) : (
              <div className="space-y-4">
                {conversations.map((conversation) => {
                  const otherUser = getOtherUser(conversation);
                  if (!otherUser) return null;

                  return (
                    <div
                      key={conversation.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <Avatar>
                        <AvatarFallback>
                          {otherUser.full_name?.charAt(0) || otherUser.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold truncate">
                            {otherUser.full_name || otherUser.email}
                          </h3>
                          {conversation.latest_message && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(conversation.latest_message.created_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate mb-1">
                          {getItemInfo(conversation)}
                        </p>
                        {conversation.latest_message && (
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.latest_message.content}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedConversation && user && (
        <ChatDialog
          isOpen={!!selectedConversation}
          onClose={() => setSelectedConversation(null)}
          uploaderProfile={
            selectedConversation.claimer_id === user.id
              ? selectedConversation.uploader_profile
              : selectedConversation.claimer_profile
          }
          currentUserId={user.id}
          itemId={selectedConversation.item_id}
        />
      )}
    </div>
  );
};

export default Messages;
