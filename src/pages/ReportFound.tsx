import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Upload, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ReportFound = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Here you would typically send the data to your backend
    console.log({
      building: formData.get('building'),
      classroom: formData.get('classroom'),
      date: formData.get('date'),
      time: formData.get('time'),
      description: formData.get('description'),
      image: image
    });

    setSubmitted(true);
    toast.success("Item reported successfully!");
    
    setTimeout(() => {
      navigate('/browse-items');
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-md animate-scale-in">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
          <p className="text-muted-foreground mb-6">
            Your found item has been reported successfully. Someone will be very happy to find it!
          </p>
          <Button onClick={() => navigate('/browse-items')} className="w-full">
            View All Items
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
              Report Found Item
            </h1>
            <p className="text-muted-foreground">
              Help someone reunite with their belongings by providing details
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
                <Label htmlFor="classroom">Classroom/Location Number *</Label>
                <Input 
                  id="classroom" 
                  name="classroom"
                  placeholder="e.g., Room 301"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date Found *</Label>
                  <Input 
                    id="date" 
                    name="date"
                    type="date"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time Found *</Label>
                  <Input 
                    id="time" 
                    name="time"
                    type="time"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Item Description</Label>
                <Textarea 
                  id="description" 
                  name="description"
                  placeholder="Describe the item (color, brand, distinctive features...)"
                  className="min-h-24"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Upload Image *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    required
                  />
                  <label htmlFor="image" className="cursor-pointer">
                    {preview ? (
                      <div className="space-y-4">
                        <img 
                          src={preview} 
                          alt="Preview" 
                          className="max-h-48 mx-auto rounded-lg object-cover"
                        />
                        <p className="text-sm text-muted-foreground">Click to change image</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload an image of the item
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                Submit Report
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportFound;
