
import { supabase } from "@/integrations/supabase/client";
import { Folder } from "./types";

// Function to fetch all folders for the current user
export const fetchUserFolders = async (): Promise<Folder[]> => {
  const { data: session } = await supabase.auth.getSession();
  const user = session?.session?.user;

  if (!user) {
    console.error("No user session found.");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching folders:", error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching folders:", error);
    return [];
  }
};

// Function to create a new folder
export const createFolder = async (name: string): Promise<Folder | null> => {
  const { data: session } = await supabase.auth.getSession();
  const user = session?.session?.user;

  if (!user) {
    console.error("No user session found.");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('folders')
      .insert([{ name: name, user_id: user.id }])
      .select('*')
      .single();

    if (error) {
      console.error("Error creating folder:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error creating folder:", error);
    return null;
  }
};

// Function to update an existing folder
export const updateFolder = async (id: string, name: string): Promise<Folder | null> => {
  try {
    const { data, error } = await supabase
      .from('folders')
      .update({ name: name })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error("Error updating folder:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error updating folder:", error);
    return null;
  }
};

// Function to delete a folder
export const deleteFolder = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting folder:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error deleting folder:", error);
    return false;
  }
};
