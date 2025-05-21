
import { supabase } from "@/integrations/supabase/client";

// Define the Barcode interface
export interface BarcodeData {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  value: string;
  type: string;
}

// Function to fetch all barcodes for the current user
export const fetchUserBarcodes = async (): Promise<BarcodeData[]> => {
  const { data: session } = await supabase.auth.getSession();
  const user = session?.session?.user;

  if (!user) {
    console.error("No user session found.");
    return [];
  }

  try {
    // Fetch barcodes
    const { data: barcodes, error } = await supabase
      .from('barcodes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching barcodes:", error.message);
      return [];
    }

    return barcodes || [];
  } catch (error) {
    console.error("Unexpected error fetching barcodes:", error);
    return [];
  }
};

// Function to create a new barcode
export const createBarcode = async (barcodeData: Omit<BarcodeData, 'id' | 'created_at' | 'user_id'>): Promise<BarcodeData | null> => {
  const { data: session } = await supabase.auth.getSession();
  const user = session?.session?.user;

  if (!user) {
    console.error("No user session found.");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('barcodes')
      .insert([{
        name: barcodeData.name,
        value: barcodeData.value,
        type: barcodeData.type,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating barcode:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error creating barcode:", error);
    return null;
  }
};

// Function to delete a barcode
export const deleteBarcode = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('barcodes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting barcode:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error deleting barcode:", error);
    return false;
  }
};

// Function to update a barcode
export const updateBarcode = async (id: string, updates: Partial<Omit<BarcodeData, 'id' | 'created_at' | 'user_id'>>): Promise<BarcodeData | null> => {
  try {
    const { data, error } = await supabase
      .from('barcodes')
      .update({
        name: updates.name,
        value: updates.value,
        type: updates.type
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating barcode:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error updating barcode:", error);
    return null;
  }
};
