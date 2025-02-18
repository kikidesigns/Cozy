import React, { useEffect, useState } from "react"
import { Text, View } from "react-native"
import GameScreen from "./app/index"
import { getProfile } from "./utils/auth"
import { supabase } from "./utils/supabase"

export default function App() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function authenticate() {
      // Check if a session exists
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // For testing purposes, auto-sign in with a test account.
        // In production, show a proper login UI.
        const { error } = await supabase.auth.signInWithPassword({
          email: "test@example.com",
          password: "password",
        });
        if (error) {
          console.error("Sign in error:", error);
          setLoading(false);
          return;
        }
      }
      try {
        const profileData = await getProfile();
        setProfile(profileData);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
      setLoading(false);
    }
    authenticate();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return <GameScreen profile={profile} />;
}
