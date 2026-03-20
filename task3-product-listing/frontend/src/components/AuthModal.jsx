import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ onClose, defaultTab = "login" }) {
  const [tab, setTab]         = useState(defaultTab);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const { login, register }   = useAuth();

  // Login form
  const [loginData, setLoginData]   = useState({ email: "", password: "" });
  // Register form
  const [regData, setRegData]       = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass]     = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(loginData.email, loginData.password);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (regData.password !== regData.confirm)
      return setError("Passwords do not match");
    if (regData.password.length < 6)
      return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      await register(regData.name, regData.email, regData.password);
      setSuccess("Account created! Welcome to FabricHub 🎉");
      setTimeout(onClose, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-950 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" style={{ animation: "slideDown 0.25s ease" }}>

        {/* Top decoration */}
        <div className="h-1.5 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500" />

        {/* Close btn */}
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center cursor-pointer transition-colors z-10">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-7">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-black text-base shadow-md">F</div>
            <span className="font-display font-black text-2xl">Fabric<span className="text-orange-500">Hub</span></span>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-900 rounded-2xl p-1 mb-6">
            {["login", "register"].map((t) => (
              <button key={t} onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer capitalize
                  ${tab === t
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
              >
                {t === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Error / Success */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl flex items-center gap-2.5">
              <span className="text-red-500 text-lg shrink-0">⚠️</span>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 px-4 py-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-xl flex items-center gap-2.5">
              <span className="text-xl shrink-0">✅</span>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">{success}</p>
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📧</span>
                  <input type="email" required placeholder="you@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔒</span>
                  <input type={showPass ? "text" : "password"} required placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all placeholder-gray-400"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer text-sm">
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
                <p className="text-right mt-1.5">
                  <button type="button" className="text-xs text-orange-500 font-semibold hover:text-orange-600 cursor-pointer">Forgot password?</button>
                </p>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-3.5 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer shadow-lg shadow-orange-500/25 disabled:opacity-60 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2">
                {loading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Signing in...</> : "Sign In →"}
              </button>

              <div className="relative flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                <span className="text-xs text-gray-400 shrink-0">or continue with</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[["G", "Google", "#4285F4"], ["f", "Facebook", "#1877F2"]].map(([icon, name, color]) => (
                  <button key={name} type="button"
                    className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors">
                    <span className="font-black text-base" style={{ color }}>{icon}</span> {name}
                  </button>
                ))}
              </div>

              <p className="text-center text-sm text-gray-500">
                New here?{" "}
                <button type="button" onClick={() => setTab("register")} className="text-orange-500 font-bold hover:text-orange-600 cursor-pointer">Create account</button>
              </p>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Full Name</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">👤</span>
                  <input type="text" required placeholder="Your full name"
                    value={regData.name}
                    onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📧</span>
                  <input type="email" required placeholder="you@email.com"
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Password</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔒</span>
                    <input type={showPass ? "text" : "password"} required placeholder="Min 6 chars"
                      value={regData.password}
                      onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all placeholder-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Confirm</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">✅</span>
                    <input type={showPass ? "text" : "password"} required placeholder="Repeat"
                      value={regData.confirm}
                      onChange={(e) => setRegData({ ...regData, confirm: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" required className="mt-0.5 w-4 h-4 accent-orange-500 shrink-0" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  I agree to the <span className="text-orange-500 font-semibold">Terms of Service</span> and <span className="text-orange-500 font-semibold">Privacy Policy</span>
                </span>
              </label>

              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-3.5 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer shadow-lg shadow-orange-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creating account...</> : "Create Account 🎉"}
              </button>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <button type="button" onClick={() => setTab("login")} className="text-orange-500 font-bold hover:text-orange-600 cursor-pointer">Sign in</button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
