
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Copy, Key, Trash2, Plus, Activity } from 'lucide-react';
import { createApiKey, fetchUserApiKeys, deleteApiKey, fetchApiUsage } from '@/lib/api/api-keys';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import DashboardSidebar from '@/components/DashboardSidebar';
import FloatingCircles from '@/components/FloatingCircles';
import HeaderAvatar from '@/components/ui/header-avatar';

const ApiManagement = () => {
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: apiKeys = [], isLoading: keysLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: fetchUserApiKeys,
  });

  const { data: apiUsage = [], isLoading: usageLoading } = useQuery({
    queryKey: ['api-usage'],
    queryFn: () => fetchApiUsage(),
  });

  const createKeyMutation = useMutation({
    mutationFn: (name: string) => createApiKey(name),
    onSuccess: (result) => {
      if (result) {
        setCreatedKey(result.key);
        toast({
          title: 'Success',
          description: 'API key created successfully',
        });
        queryClient.invalidateQueries({ queryKey: ['api-keys'] });
        setNewKeyName('');
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create API key',
        variant: 'destructive',
      });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: deleteApiKey,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'API key deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete API key',
        variant: 'destructive',
      });
    },
  });

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;
    createKeyMutation.mutate(newKeyName);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'API key copied to clipboard',
    });
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen flex flex-col w-full">
      <HeaderAvatar />
      <FloatingCircles />
      
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-background border-r border-border h-screen fixed top-0 left-0 transition-all duration-200 z-10`}>
        <DashboardSidebar 
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
        />
      </div>
      <div className={`flex-1 transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-8`}>

        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">API Management</h1>
            <p className="text-muted-foreground">Manage your API keys and monitor usage</p>
          </div>

          <Tabs defaultValue="keys" className="space-y-6">
            <TabsList>
              <TabsTrigger value="keys">API Keys</TabsTrigger>
              <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
              <TabsTrigger value="documentation">Documentation</TabsTrigger>
            </TabsList>

            <TabsContent value="keys" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your API Keys</h2>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create API Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New API Key</DialogTitle>
                      <DialogDescription>
                        Create a new API key to access the QR Labs API programmatically.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="keyName">Key Name</Label>
                        <Input
                          id="keyName"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          placeholder="e.g., Production API Key"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateKey} disabled={createKeyMutation.isPending}>
                        {createKeyMutation.isPending ? 'Creating...' : 'Create Key'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {createdKey && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-green-800">API Key Created Successfully</CardTitle>
                    <CardDescription>
                      Copy this key now - you won't be able to see it again!
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-black border rounded font-mono text-sm">
                        {createdKey}
                      </code>
                      <Button size="sm" onClick={() => copyToClipboard(createdKey)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setCreatedKey(null)}
                    >
                      I've saved this key
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                {keysLoading ? (
                  <div>Loading API keys...</div>
                ) : apiKeys.length === 0 ? (
                  <Card>
                    <CardContent className="text-center p-8">
                      <Key className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No API keys</h3>
                      <p className="text-muted-foreground">Create your first API key to get started</p>
                    </CardContent>
                  </Card>
                ) : (
                  apiKeys.map((key) => (
                    <Card key={key.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{key.name}</CardTitle>
                            <CardDescription>
                              Created {new Date(key.created_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={key.active ? "default" : "secondary"}>
                              {key.active ? "Active" : "Inactive"}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteKeyMutation.mutate(key.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Key:</span>
                            <code className="text-sm">{key.key_prefix}***</code>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Permissions:</span>
                            {key.permissions.map((permission) => (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Rate Limit:</span>
                            <span className="text-sm">{key.rate_limit} requests/hour</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="usage" className="space-y-6">
              <h2 className="text-xl font-semibold">API Usage Analytics</h2>
              <div className="grid gap-4">
                {usageLoading ? (
                  <div>Loading usage data...</div>
                ) : apiUsage.length === 0 ? (
                  <Card>
                    <CardContent className="text-center p-8">
                      <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No API usage yet</h3>
                      <p className="text-muted-foreground">Start making API calls to see usage analytics</p>
                    </CardContent>
                  </Card>
                ) : (
                  apiUsage.slice(0, 10).map((usage) => (
                    <Card key={usage.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{usage.method} {usage.endpoint}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(usage.created_at).toLocaleString()}
                            </div>
                          </div>
                          <Badge variant={usage.status_code < 400 ? "default" : "destructive"}>
                            {usage.status_code}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="documentation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Documentation</CardTitle>
                  <CardDescription>
                    Learn how to integrate with the QR Labs API
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Authentication</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Include your API key in the Authorization header:
                    </p>
                    <code className="block p-2 bg-muted rounded text-sm">
                      Authorization: Bearer YOUR_API_KEY
                    </code>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Base URL</h3>
                    <code className="block p-2 bg-muted rounded text-sm">
                      https://kienjbeckgfsajjxjqhs.supabase.co/functions/v1/
                    </code>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Available Endpoints</h3>
                    <div className="space-y-2">
                      <div className="p-2 bg-muted rounded">
                        <code className="text-sm">GET /qr-codes</code>
                        <span className="text-sm text-muted-foreground ml-2">List all QR codes</span>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <code className="text-sm">POST /qr-codes</code>
                        <span className="text-sm text-muted-foreground ml-2">Create a new QR code</span>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <code className="text-sm">GET /qr-codes/:id</code>
                        <span className="text-sm text-muted-foreground ml-2">Get QR code details</span>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <code className="text-sm">PUT /qr-codes/:id</code>
                        <span className="text-sm text-muted-foreground ml-2">Update QR code</span>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <code className="text-sm">DELETE /qr-codes/:id</code>
                        <span className="text-sm text-muted-foreground ml-2">Delete QR code</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ApiManagement;
