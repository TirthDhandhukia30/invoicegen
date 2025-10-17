import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function SupabaseAuth({ onSession, onInitializing, children }) {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const initialise = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (active) {
          setSession(currentSession);
          onSession?.(currentSession);
        }
      } finally {
        if (active) {
          setInitializing(false);
          onInitializing?.(false);
        }
      }
    };

    initialise();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      onSession?.(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [onSession, onInitializing]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (authError) throw authError;
    } catch (err) {
      setError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return null;
  }

  if (session) {
    return children ?? null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="relative w-[90%] max-w-[380px]">
        <div
          className="relative rounded-[24px] px-[26px] py-[28px] bg-card border border-border"
          style={{
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <div className="text-center mb-7">
            <div className="flex justify-center">
              <div className="font-bold text-xl text-foreground tracking-tighter">
                INVOICE<span className="font-light">GEN</span>
              </div>
            </div>
          </div>

          {error && (
            <div
              className={`mb-5 p-2.5 border rounded-xl text-[12px] ${
                error.includes("successfully") ||
                error.includes("Check your email")
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-[44px] bg-white text-[#0b0b0b] rounded-full font-semibold text-[14px] hover:-translate-y-[1px] active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6 flex items-center justify-center gap-2.5"
            style={{
              boxShadow:
                "inset 0 1px 2px rgba(0,0,0,0.1), 0 2px 8px rgba(255,255,255,0.1)",
            }}
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          <p className="text-center text-[11px] text-muted-foreground mt-6">
            Sign in with your Google account to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
