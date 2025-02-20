import { Database } from "../types/supabase"
import { supabase } from "./supabase"

export type AuthError = {
  message: string
}

export async function signUp({ email, password }: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signIn({ email, password }: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getProfile() {
  console.log("getProfile: Attempting to get user");
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  console.log("getProfile: Got user, fetching profile", user.id);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return data
}

export async function updateProfile({
  username,
  website,
  avatar_url,
}: {
  username?: string
  website?: string
  avatar_url?: string
}) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      username,
      website,
      avatar_url,
      updated_at: new Date().toISOString(),
    })

  if (error) throw error
  return data
}

export async function getProfileById(id: string) {
  console.log("getProfileById: Starting for ID", id);
  try {
    // First try to get the profile normally
    console.log("getProfileById: Attempting initial profile fetch");
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.log("getProfileById: Initial fetch failed", error);
      // If error, check if this should be an NPC profile
      console.log("getProfileById: Attempting to create NPC profile");
      const { data: npcData, error: npcError } = await supabase
        .from("profiles")
        .insert({
          id,
          username: `NPC_${id.slice(0, 8)}`,
          is_npc: true,
          bitcoin_balance: 1000000, // Default 1M sats for NPCs
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (npcError) {
        console.log("getProfileById: NPC creation failed", npcError);
        // If insert failed, try one more time to get the profile
        // (in case it was created by another concurrent request)
        console.log("getProfileById: Attempting final profile fetch");
        const { data: retryData, error: retryError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (retryError) {
          console.log("getProfileById: Final fetch failed", retryError);
          throw retryError;
        }
        console.log("getProfileById: Final fetch succeeded", retryData);
        return retryData;
      }

      console.log("getProfileById: NPC creation succeeded", npcData);
      return npcData;
    }

    console.log("getProfileById: Initial fetch succeeded", data);
    return data;
  } catch (error) {
    console.log("getProfileById: Caught error", error);
    // Return a default NPC profile as fallback
    const defaultProfile = {
      id,
      username: `NPC_${id.slice(0, 8)}`,
      is_npc: true,
      bitcoin_balance: 1000000,
      updated_at: new Date().toISOString(),
    };
    console.log("getProfileById: Returning default profile", defaultProfile);
    return defaultProfile;
  }
}

// Add a helper function to check Supabase connection
export async function checkSupabaseConnection() {
  console.log("Checking Supabase connection...");
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);
    
    if (error) {
      console.error("Supabase connection test failed:", error);
      return false;
    }
    
    console.log("Supabase connection test succeeded:", data);
    return true;
  } catch (error) {
    console.error("Supabase connection test threw error:", error);
    return false;
  }
}