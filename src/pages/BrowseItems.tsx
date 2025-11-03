import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock data - replace with real data from backend
const mockItems = [
  {
    id: 1,
    building: "Engineering Block A",
    classroom: "Room 301",
    date: "2025-11-02",
    time: "14:30",
    description: "Black iPhone with cracked screen",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"
  },
  {
    id: 2,
    building: "Library",
    classroom: "Study Hall 2",
    date: "2025-11-01",
    time: "10:15",
    description: "Blue water bottle with stickers",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400"
  },
  {
    id: 3,
    building: "Science Building",
    classroom: "Lab 105",
    date: "2025-10-31",
    time: "16:45",
    description: "Grey backpack with laptop inside",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400"
  },
  {
    id: 4,
    building: "Engineering Block A",
    classroom: "Room 205",
    date: "2025-10-30",
    time: "11:20",
    description: "Red umbrella",
    image: "https://images.unsplash.com/photo-1534655882569-31e0d425c0f4?w=400"
  }
];

const BrowseItems = () => {
  const navigate = useNavigate();
  const [selectedBuilding, setSelectedBuilding] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");

  const buildings = ["all", "Engineering Block A", "Library", "Science Building"];

  const filteredItems = mockItems.filter(item => {
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
                    <img 
                      src={item.image} 
                      alt={item.description}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
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
                    <Button className="w-full" variant="secondary">
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
    </div>
  );
};

export default BrowseItems;
