import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function SupabaseAuth({ onSession, onInitializing, children }) {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
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
        {/* Light beam overlay - top-left angled gradient */}
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

        {/* Glass Card */}
        <div className="relative w-[90%] max-w-[380px] z-10">
          {/* Card with embossed glass effect */}
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
            {/* Header with logo */}
            <div className="text-center mb-7">
              {/* InvoiceGen Logo */}
              <div className="flex justify-center">
                <div className="font-bold text-xl text-white tracking-tighter">
                  INVOICE<span className="font-light">GEN</span>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-5 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[12px]">
                {error}
              </div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-3.5">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full h-[42px] px-4 rounded-full text-white text-[14px] placeholder-[#9a9a9a] focus:outline-none focus:ring-1 focus:ring-white/30 transition-all disabled:opacity-50"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
                  }}
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full h-[42px] px-4 pr-12 rounded-full text-white text-[14px] placeholder-[#9a9a9a] focus:outline-none focus:ring-1 focus:ring-white/30 transition-all disabled:opacity-50"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9a9a9a] hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-[12px] text-[#9e9e9e] hover:text-white transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Primary Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[44px] bg-white text-[#0b0b0b] rounded-full font-semibold text-[14px] hover:-translate-y-[1px] active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-5"
                style={{
                  boxShadow:
                    "inset 0 1px 2px rgba(0,0,0,0.1), 0 2px 8px rgba(255,255,255,0.1)",
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Divider */}
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

            {/* Google Sign In */}
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

            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-[12px] text-[#9e9e9e]">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="text-[#cbd5ff] hover:underline transition-all"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return children || null;
}
