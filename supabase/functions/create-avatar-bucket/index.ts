
// Create a storage bucket for avatars with proper RLS policies

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

serve(async (req) => {
  try {
    // Create a Supabase client with the admin key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if the avatars bucket exists
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();
      
    if (bucketError) {
      throw bucketError;
    }
    
    const avatarBucketExists = buckets.some(bucket => bucket.name === 'avatars');
    
    if (!avatarBucketExists) {
      // Create the avatars bucket
      const { error: createError } = await supabase
        .storage
        .createBucket('avatars', {
          public: true,
        });
        
      if (createError) {
        throw createError;
      }
      
      // Create RLS policies for the avatars bucket
      // Owners can read their own avatars
      const { error: readPolicyError } = await supabase
        .rpc('create_storage_policy', {
          bucket_name: 'avatars',
          policy_name: 'Avatar Read Policy',
          definition: 'true', // Public read access
          operation: 'SELECT'
        });
        
      if (readPolicyError) {
        throw readPolicyError;
      }
      
      // Only authenticated users can upload avatars
      const { error: insertPolicyError } = await supabase
        .rpc('create_storage_policy', {
          bucket_name: 'avatars',
          policy_name: 'Avatar Insert Policy',
          definition: '(storage.foldername(name))[1] = auth.uid()::text', 
          operation: 'INSERT'
        });
        
      if (insertPolicyError) {
        throw insertPolicyError;
      }
      
      // Only owners can update their avatars
      const { error: updatePolicyError } = await supabase
        .rpc('create_storage_policy', {
          bucket_name: 'avatars',
          policy_name: 'Avatar Update Policy',
          definition: '(storage.foldername(name))[1] = auth.uid()::text',
          operation: 'UPDATE'
        });
        
      if (updatePolicyError) {
        throw updatePolicyError;
      }
      
      // Only owners can delete their avatars
      const { error: deletePolicyError } = await supabase
        .rpc('create_storage_policy', {
          bucket_name: 'avatars',
          policy_name: 'Avatar Delete Policy',
          definition: '(storage.foldername(name))[1] = auth.uid()::text',
          operation: 'DELETE'
        });
        
      if (deletePolicyError) {
        throw deletePolicyError;
      }
    }
    
    return new Response(
      JSON.stringify({ 
        message: avatarBucketExists 
          ? "Avatars bucket already exists" 
          : "Avatars bucket created with policies" 
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
