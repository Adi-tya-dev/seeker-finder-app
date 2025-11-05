import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const RecoverItem = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const { error: insertError } = await supabase
        .from('items')
        .insert({
          uploader_id: user.id,
          building: formData.get('building') as string,
          classroom: formData.get('classroom') as string,
          date: formData.get('date') as string,
          time: formData.get('time') as string,
          description: formData.get('description') as string,
          category: formData.get('category') as string,
          status: 'available',
        });

      if (insertError) throw insertError;

      setSubmitted(true);
      toast({
        title: "Success",
        description: "Lost item reported successfully!",
      });

      setTimeout(() => {
        navigate('/browse-items');
      }, 2000);
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-md animate-scale-in">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Report Submitted!</h2>
          <p className="text-muted-foreground mb-6">
            Your lost item has been reported. We hope you find it soon!
          </p>
          <Button onClick={() => navigate('/browse-items')} className="w-full">
            Browse Items
          </Button>
        </Card>
      </div>
    );
  }

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

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Report Lost Item
            </h1>
            <p className="text-muted-foreground">
              Tell us what you lost and we'll help you find it
            </p>
          </div>

          <Card className="p-8 animate-scale-in">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="building">Building Name *</Label>
                <Input 
                  id="building" 
                  name="building"
                  placeholder="e.g., Engineering Block A"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="classroom">Last Known Location *</Label>
                <Input 
                  id="classroom" 
                  name="classroom"
                  placeholder="e.g., Room 301, Cafeteria"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date Lost *</Label>
                  <Input 
                    id="date" 
                    name="date"
                    type="date"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Approximate Time *</Label>
                  <Input 
                    id="time" 
                    name="time"
                    type="time"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Item Category *</Label>
                <Select name="category" required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="documents">Documents</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="books">Books & Stationery</SelectItem>
                    <SelectItem value="keys">Keys</SelectItem>
                    <SelectItem value="wallet">Wallet/Purse</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Item Description *</Label>
                <Textarea 
                  id="description" 
                  name="description"
                  placeholder="Describe the item in detail (color, brand, distinctive features...)"
                  className="min-h-24"
                  required
                />
              </div>

              <Button 
                type="submit" 
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Report Lost Item"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RecoverItem;
