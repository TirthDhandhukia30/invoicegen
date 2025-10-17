import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function SupabaseAuth({ onSession, onInitializing, children }) {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoTimeRemaining, setDemoTimeRemaining] = useState(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        setSession(session);
        if (onSession) onSession(session);
      })
      .finally(() => {
        if (mounted) setInitializing(false);
        if (onInitializing) onInitializing(false);
      });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (onSession) onSession(session);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [onSession, onInitializing]);

  // Timer effect for demo session
  useEffect(() => {
    if (demoTimeRemaining === null || demoTimeRemaining <= 0) return;

    const interval = setInterval(() => {
      setDemoTimeRemaining((prev) => {
        if (prev <= 1) {
          // Demo session expired
          setSession(null);
          if (onSession) onSession(null);
          setError("Demo session expired. Please login again.");
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [demoTimeRemaining, onSession]);

  const handleDemoLogin = async () => {
    setLoading(true);
    setError("");

    try {
      // Create demo session with 5-minute expiry
      const mockSession = {
        user: {
          id: "demo-user-id",
          email: "demo@invoicegen.app",
          user_metadata: { is_demo: true },
        },
        access_token: "demo-token",
        expires_at: Date.now() + 5 * 60 * 1000, // 5 minutes from now
      };

      setSession(mockSession);
      setDemoTimeRemaining(300); // 5 minutes in seconds

      if (onSession) onSession(mockSession);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (initializing) return null;
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#070607] relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.15]"
          style={{
            background:
              "radial-gradient(ellipse 800px 600px at 10% 10%, rgba(255,255,255,0.08) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.12]"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)",
          }}
        />

        <div className="relative w-[90%] max-w-[380px] z-10">
          <div
            className="relative rounded-[24px] px-[26px] py-[28px] overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(11,11,11,1) 100%)",
              backdropFilter: "blur(18px)",
              boxShadow:
                "0 12px 40px rgba(0,0,0,0.7), inset 1px 1px 0 rgba(255,255,255,0.06), inset -1px -1px 0 rgba(0,0,0,0.3)",
            }}
          >
            <div className="text-center mb-7">
              <div className="flex justify-center">
                <div className="font-bold text-xl text-white tracking-tighter">
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

            {demoTimeRemaining !== null && demoTimeRemaining > 0 && (
              <div className="mb-5 p-2.5 border rounded-xl text-[12px] bg-blue-500/10 border-blue-500/20 text-blue-400 text-center">
                Demo session: {Math.floor(demoTimeRemaining / 60)}:
                {String(demoTimeRemaining % 60).padStart(2, "0")} remaining
              </div>
            )}

            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full h-[44px] bg-white text-[#0b0b0b] rounded-full font-semibold text-[14px] hover:-translate-y-[1px] active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
              style={{
                boxShadow:
                  "inset 0 1px 2px rgba(0,0,0,0.1), 0 2px 8px rgba(255,255,255,0.1)",
              }}
            >
              {loading ? "Starting Demo..." : "Try Demo (5 min)"}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div
                  className="w-full border-t"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                ></div>
              </div>
              <div className="relative flex justify-center">
                <span
                  className="px-3 text-[10px] uppercase text-[#9e9e9e] tracking-wider"
                  style={{ background: "#0b0b0b" }}
                >
                  OR
                </span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-[42px] rounded-full font-medium text-[14px] text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.04)",
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
              Continue with Google
            </button>

            <p className="text-center text-[11px] text-[#9e9e9e] mt-6">
              Demo account provides temporary 5-minute access
            </p>
          </div>
        </div>
      </div>
    );
  }
  return children || null;
}
