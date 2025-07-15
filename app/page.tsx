"use client";
import { useState, useEffect } from "react";
import Auth from "@/components/auth";
import TaskManager from "@/components/task-manager";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [session, setSession] = useState<any>(null);

  const fetchSession = async () => {
    const currentSession = await supabase.auth.getSession();
    console.log("Current Session", currentSession);
    setSession(currentSession.data.session);
  };

  useEffect(() => {
    fetchSession();

    // How to switch between sessions when the user is logged in or not
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // This function cleans up your subscription to avoid memory leaks, this updates the page automatically without having to refresh the page manually.
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };
  return (
    <>
      <div className="flex flex-col gap-5 h-auto my-10 items-center justify-center">
        {session ? (
          <>
            {/* Display the user's email */}
            <TaskManager session={session} />
            <button
              className="text-white border-2 border-white p-2 cursor-pointer"
              onClick={logout}
            >
              Log Out
            </button>
          </>
        ) : (
          <Auth />
        )}
      </div>
    </>
  );
}
