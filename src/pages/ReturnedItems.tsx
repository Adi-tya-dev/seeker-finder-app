import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Clock, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Item {
  id: string;
  building: string;
  classroom: string;
  date: string;
  time: string;
  description: string;
  image_url: string | null;
  status: string;
  category: string | null;
  created_at: string;
}

const ReturnedItems = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [returnedItems, setReturnedItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReturnedItems();
  }, []);

  const fetchReturnedItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('status', 'returned')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReturnedItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load returned items",
        variant: "destructive",
      });
      console.error('Error fetching returned items:', error);
    } finally {
      setIsLoading(false);
    }
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

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Recently Returned Items
            </h1>
            <p className="text-lg text-muted-foreground">
              Celebrating successful reunions - items that found their way back home
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading returned items...</p>
            </div>
          ) : returnedItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No returned items yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {returnedItems.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video overflow-hidden bg-muted">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.description}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <p className="font-semibold text-lg">{item.description}</p>
                    {item.category && (
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary inline-block">
                        {item.category}
                      </span>
                    )}
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{item.building} - {item.classroom}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{item.time}</span>
                      </div>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 inline-block">
                      ✓ Returned to Owner
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnedItems;
