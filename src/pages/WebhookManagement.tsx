
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Webhook, Globe, Plus, Trash2, Settings, Zap } from 'lucide-react';
import { createWebhook, fetchUserWebhooks, updateWebhook, deleteWebhook, fetchWebhookDeliveries } from '@/lib/api/webhooks';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import DashboardSidebar from '@/components/DashboardSidebar';
import FloatingCircles from '@/components/FloatingCircles';

const WebhookManagement = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showZapierDialog, setShowZapierDialog] = useState(false);
  const [webhookForm, setWebhookForm] = useState({
    name: '',
    url: '',
    events: ['qr_scan']
  });
  const [zapierUrl, setZapierUrl] = useState('');
  const [isLoadingZapier, setIsLoadingZapier] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: fetchUserWebhooks,
  });

  const createWebhookMutation = useMutation({
    mutationFn: ({ name, url, events }: { name: string; url: string; events: string[] }) => 
      createWebhook(name, url, events),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Webhook created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setShowCreateDialog(false);
      setWebhookForm({ name: '', url: '', events: ['qr_scan'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create webhook',
        variant: 'destructive',
      });
    },
  });

  const updateWebhookMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateWebhook(id, updates),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Webhook updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: deleteWebhook,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Webhook deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });

  const handleCreateWebhook = () => {
    if (!webhookForm.name.trim() || !webhookForm.url.trim()) return;
    createWebhookMutation.mutate(webhookForm);
  };

  const toggleWebhook = (id: string, active: boolean) => {
    updateWebhookMutation.mutate({ id, updates: { active } });
  };

  const handleZapierTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!zapierUrl) {
      toast({
        title: "Error",
        description: "Please enter your Zapier webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingZapier(true);

    try {
      const response = await fetch(zapierUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
          event_type: 'test_trigger',
          data: {
            message: 'Test webhook from QR Labs'
          }
        }),
      });

      toast({
        title: "Request Sent",
        description: "The request was sent to Zapier. Please check your Zap's history to confirm it was triggered.",
      });
    } catch (error) {
      console.error("Error triggering webhook:", error);
      toast({
        title: "Error",
        description: "Failed to trigger the Zapier webhook. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingZapier(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <FloatingCircles />
      <DashboardSidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Webhook Management</h1>
            <p className="text-muted-foreground">Configure webhooks and integrations for real-time notifications</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  Custom Webhooks
                </CardTitle>
                <CardDescription>
                  Set up custom webhook endpoints to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Webhook
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Webhook</DialogTitle>
                      <DialogDescription>
                        Configure a webhook endpoint to receive real-time notifications
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="webhookName">Webhook Name</Label>
                        <Input
                          id="webhookName"
                          value={webhookForm.name}
                          onChange={(e) => setWebhookForm({...webhookForm, name: e.target.value})}
                          placeholder="e.g., Production Webhook"
                        />
                      </div>
                      <div>
                        <Label htmlFor="webhookUrl">Webhook URL</Label>
                        <Input
                          id="webhookUrl"
                          value={webhookForm.url}
                          onChange={(e) => setWebhookForm({...webhookForm, url: e.target.value})}
                          placeholder="https://your-app.com/webhooks/qr-scan"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateWebhook} disabled={createWebhookMutation.isPending}>
                        {createWebhookMutation.isPending ? 'Creating...' : 'Create Webhook'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Zapier Integration
                </CardTitle>
                <CardDescription>
                  Connect with Zapier to automate workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={showZapierDialog} onOpenChange={setShowZapierDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Zap className="mr-2 h-4 w-4" />
                      Test Zapier Hook
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Test Zapier Webhook</DialogTitle>
                      <DialogDescription>
                        Enter your Zapier webhook URL to test the integration
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleZapierTrigger} className="space-y-4">
                      <div>
                        <Label htmlFor="zapierUrl">Zapier Webhook URL</Label>
                        <Textarea
                          id="zapierUrl"
                          value={zapierUrl}
                          onChange={(e) => setZapierUrl(e.target.value)}
                          placeholder="https://hooks.zapier.com/hooks/catch/..."
                          rows={3}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowZapierDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isLoadingZapier}>
                          {isLoadingZapier ? 'Sending...' : 'Test Webhook'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Active Webhooks</h2>
            
            {isLoading ? (
              <div>Loading webhooks...</div>
            ) : webhooks.length === 0 ? (
              <Card>
                <CardContent className="text-center p-8">
                  <Globe className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No webhooks configured</h3>
                  <p className="text-muted-foreground">Create your first webhook to receive real-time notifications</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {webhooks.map((webhook) => (
                  <Card key={webhook.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{webhook.name}</CardTitle>
                          <CardDescription>{webhook.url}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={webhook.active}
                            onCheckedChange={(checked) => toggleWebhook(webhook.id, checked)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteWebhookMutation.mutate(webhook.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Events:</span>
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Status:</span>
                          <Badge variant={webhook.active ? "default" : "secondary"}>
                            {webhook.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Created:</span>
                          <span className="text-sm">{new Date(webhook.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookManagement;
