"use client";
import { useState, FormEvent, ChangeEvent } from "react";
import { supabase } from "@/lib/supabase";
const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check if we are trying to sign up or sign in
    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        console.error("Error signing up:", signUpError.message);
        return;
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        console.error("Error signing up:", signInError.message);
        return;
      }
    }
  };

  return (
    <div className="text-white max-w-[400px] mx-auto p-4 flex flex-col justify-center items-center w-full">
      <h1 className="text-2xl font-bold mb-4">
        {isSignUp ? "Sign Up" : "Sign In"}
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          className="p-2 rounded bg-gray-700 text-white"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          className="p-2 rounded bg-gray-700 text-white"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
        >
          {isSignUp ? "Sign Up" : "Log In"}
        </button>
      </form>
      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="mt-4 text-blue-400 hover:underline"
      >
        {isSignUp
          ? "Already have an account? Log In"
          : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
};

export default Auth;
