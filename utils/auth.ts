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
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

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
  try {
    // First try to get the profile normally
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      // If error, check if this should be an NPC profile
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
        // If insert failed, try one more time to get the profile
        // (in case it was created by another concurrent request)
        const { data: retryData, error: retryError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (retryError) throw retryError;
        return retryData;
      }

      return npcData;
    }

    return data;
  } catch (error) {
    console.error("Error in getProfileById:", error);
    // Return a default NPC profile as fallback
    return {
      id,
      username: `NPC_${id.slice(0, 8)}`,
      is_npc: true,
      bitcoin_balance: 1000000,
      updated_at: new Date().toISOString(),
    };
  }
}