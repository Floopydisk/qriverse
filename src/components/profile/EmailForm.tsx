
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmailFormProps {
  initialEmail: string;
}

export default function EmailForm({ initialEmail }: EmailFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const { toast } = useToast();

  const handleUpdateEmail = async () => {
    try {
      const { error } = await supabase.auth.updateUser({ 
        email: email 
      });
      
      if (error) throw error;
      
      toast({
        title: "Email Update Initiated",
        description: "Please check your new email for a confirmation link"
      });
      
    } catch (error: any) {
      console.error("Error updating email:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update email",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Address</CardTitle>
        <CardDescription>Update your email address</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpdateEmail}>Update Email</Button>
      </CardFooter>
    </Card>
  );
}
