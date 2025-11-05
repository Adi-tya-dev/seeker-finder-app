import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Package, CheckCircle, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Stats {
  totalUsers: number;
  totalItems: number;
  availableItems: number;
  returnedItems: number;
}

interface Item {
  id: string;
  description: string;
  building: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string;
  };
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalItems: 0, availableItems: 0, returnedItems: 0 });
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      // Check if user has admin role
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error || !roles) {
        toast({
          title: "Access Denied",
          description: "You don't have admin permissions",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setIsAdmin(true);
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const [itemsRes, usersRes] = await Promise.all([
        supabase.from('items').select('status', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' })
      ]);

      const availableCount = itemsRes.data?.filter(i => i.status === 'available').length || 0;
      const returnedCount = itemsRes.data?.filter(i => i.status === 'returned').length || 0;

      setStats({
        totalUsers: usersRes.count || 0,
        totalItems: itemsRes.count || 0,
        availableItems: availableCount,
        returnedItems: returnedCount,
      });

      // Fetch items
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select(`
          id,
          description,
          building,
          status,
          created_at,
          profiles (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;
      setItems(itemsData || []);

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteItemId) return;

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', deleteItemId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item deleted successfully",
      });

      setDeleteItemId(null);
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Admin Dashboard
          </h1>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-3xl font-bold">{stats.totalItems}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-3xl font-bold">{stats.availableItems}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Returned</p>
                  <p className="text-3xl font-bold">{stats.returnedItems}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="items" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>

            <TabsContent value="items">
              <Card className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Building</TableHead>
                      <TableHead>Uploader</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell>{item.building}</TableCell>
                        <TableCell>{item.profiles.full_name || item.profiles.email}</TableCell>
                        <TableCell>
                          <Badge variant={item.status === 'returned' ? 'default' : 'secondary'}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteItemId(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.full_name || 'Not set'}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AlertDialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
