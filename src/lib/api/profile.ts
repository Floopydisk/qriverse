
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "./types";

// Function to fetch the current user's profile
export const fetchUserProfile = async (): Promise<UserProfile | null> => {
  const { data: session } = await supabase.auth.getSession();
  const user = session?.session?.user;

  if (!user) {
    console.error("No user session found.");
    return null;
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error.message);
      return null;
    }

    return {
      id: profile.id,
      email: user.email || '',
      full_name: profile.full_name || '',
      avatar_url: profile.avatar_url || '',
      updated_at: profile.updated_at || null,
      username: profile.username || '',
    };
  } catch (error) {
    console.error("Unexpected error fetching user profile:", error);
    return null;
  }
};

// Function to update the current user's profile
export const updateUserProfile = async (updates: { full_name?: string; avatar_url?: string; username?: string }): Promise<UserProfile | null> => {
  const { data: session } = await supabase.auth.getSession();
  const user = session?.session?.user;

  if (!user) {
    console.error("No user session found.");
    return null;
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select('*')
      .single();

    if (error) {
      console.error("Error updating user profile:", error.message);
      return null;
    }

    return {
      id: profile.id,
      email: user.email || '',
      full_name: profile.full_name || '',
      avatar_url: profile.avatar_url || '',
      updated_at: profile.updated_at || null,
      username: profile.username || '',
    };
  } catch (error) {
    console.error("Unexpected error updating user profile:", error);
    return null;
  }
};
