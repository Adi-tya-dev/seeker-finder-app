import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import ChatDialog from "@/components/ChatDialog";

interface Item {
  id: string;
  building: string;
  classroom: string;
  date: string;
  time: string;
  description: string;
  image_url: string | null;
  uploader_id: string;
  profiles: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

const BrowseItems = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [buildings, setBuildings] = useState<string[]>(["all"]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          profiles (
            id,
            full_name,
            email
          )
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setItems(data || []);

      // Extract unique buildings
      const uniqueBuildings = Array.from(new Set(data?.map(item => item.building) || []));
      setBuildings(['all', ...uniqueBuildings]);
    } catch (error: any) {
      toast({
        title: "Error loading items",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleClaimClick = (item: Item) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to claim items",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (user.id === item.uploader_id) {
      toast({
        title: "Cannot claim",
        description: "You cannot claim your own item",
        variant: "destructive",
      });
      return;
    }

    setSelectedItem(item);
    setIsChatOpen(true);
  };

  const filteredItems = items.filter(item => {
    const buildingMatch = selectedBuilding === "all" || item.building === selectedBuilding;
    const dateMatch = !selectedDate || item.date === selectedDate;
    return buildingMatch && dateMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-secondary to-blue-400 bg-clip-text text-transparent">
              Browse Lost Items
            </h1>
            <p className="text-muted-foreground">
              Search through found items to find what you're looking for
            </p>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-8 animate-scale-in">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="building">Filter by Building</Label>
                <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                  <SelectTrigger id="building">
                    <SelectValue placeholder="All Buildings" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map(building => (
                      <SelectItem key={building} value={building}>
                        {building === "all" ? "All Buildings" : building}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Filter by Date</Label>
                <Input 
                  id="date" 
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Items Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <Card 
                  key={item.id} 
                  className="overflow-hidden hover:shadow-xl transition-shadow duration-300 animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="aspect-video overflow-hidden bg-muted">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.description}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="font-semibold text-lg">{item.description}</p>
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
                    <Button 
                      className="w-full" 
                      variant="secondary"
                      onClick={() => handleClaimClick(item)}
                    >
                      Claim This Item
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No items found matching your filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedItem && user && (
        <ChatDialog
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          uploaderProfile={selectedItem.profiles}
          itemId={selectedItem.id}
          currentUserId={user.id}
        />
      )}
    </div>
  );
};

export default BrowseItems;
