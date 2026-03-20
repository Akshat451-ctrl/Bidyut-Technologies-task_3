import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

const INPUT = "w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all placeholder-gray-400";

export default function ProfilePage({ onClose }) {
  const { user, logout, updateProfile, changePassword } = useAuth();

  const [activeTab, setActiveTab]   = useState("profile");
  const [editing, setEditing]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [saveMsg, setSaveMsg]       = useState("");
  const [error, setError]           = useState("");
  const [showAuth, setShowAuth]     = useState(!user);

  const [form, setForm] = useState({
    name:    user?.name    || "",
    phone:   user?.phone   || "",
    address: {
      street:  user?.address?.street  || "",
      city:    user?.address?.city    || "",
      state:   user?.address?.state   || "",
      pincode: user?.address?.pincode || "",
    },
  });

  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwMsg, setPwMsg]   = useState("");
  const [pwErr, setPwErr]   = useState("");

  const initials = user ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";

  const handleSave = async () => {
    setSaving(true); setError(""); setSaveMsg("");
    try {
      await updateProfile(form);
      setSaveMsg("✅ Profile updated successfully!");
      setEditing(false);
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally { setSaving(false); }
  };

  const handlePwChange = async (e) => {
    e.preventDefault();
    setPwErr(""); setPwMsg("");
    if (pwForm.newPw !== pwForm.confirm) return setPwErr("Passwords do not match");
    if (pwForm.newPw.length < 6) return setPwErr("Min 6 characters required");
    try {
      await changePassword(pwForm.current, pwForm.newPw);
      setPwMsg("✅ Password changed successfully!");
      setPwForm({ current: "", newPw: "", confirm: "" });
    } catch (err) {
      setPwErr(err.response?.data?.message || "Failed to change password");
    }
  };

  const TABS = ["profile", "orders", "security"];
  const ORDERS = [
    { id: "#FH1023", item: "Classic White Oxford Shirt", status: "Delivered", date: "12 Mar 2026", price: "₹1,299", img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=60&h=60&fit=crop" },
    { id: "#FH1019", item: "Slim Fit Mid-Rise Blue Jeans", status: "Shipped", date: "10 Mar 2026", price: "₹1,899", img: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=60&h=60&fit=crop" },
    { id: "#FH1014", item: "Floral Wrap Midi Dress", status: "Processing", date: "8 Mar 2026", price: "₹1,999", img: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=60&h=60&fit=crop" },
  ];
  const STATUS_CLS = { Delivered: "text-green-600 bg-green-50 dark:bg-green-500/10 dark:text-green-400", Shipped: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400", Processing: "text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400" };

  return (
    <>
      <div className="fixed inset-0 z-50 flex">
        <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />

        <div className="w-full max-w-md bg-white dark:bg-gray-950 h-full overflow-y-auto shadow-2xl flex flex-col">

          {/* Header gradient */}
          <div className="bg-gradient-to-br from-orange-500 to-pink-600 px-5 pt-10 pb-6 relative shrink-0">
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition-colors">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white truncate">{user.name}</h2>
                  <p className="text-white/75 text-sm truncate">{user.email}</p>
                  <span className="inline-flex items-center gap-1 mt-1 bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    ✨ Premium Member
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-white font-bold text-lg mb-1">Welcome to FabricHub</p>
                <p className="text-white/70 text-sm mb-4">Sign in to view your profile & orders</p>
                <button onClick={() => setShowAuth(true)}
                  className="bg-white text-orange-600 font-bold px-6 py-2.5 rounded-xl hover:bg-orange-50 transition-colors cursor-pointer text-sm">
                  Sign In / Register
                </button>
              </div>
            )}

            {user && (
              <div className="grid grid-cols-3 gap-2.5 mt-5">
                {[["3", "Orders"], ["5", "Wishlist"], ["2", "Reviews"]].map(([n, l]) => (
                  <div key={l} className="bg-white/15 rounded-xl p-2.5 text-center">
                    <p className="text-xl font-black text-white">{n}</p>
                    <p className="text-[11px] text-white/70">{l}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {user && (
            <>
              {/* Tabs */}
              <div className="flex border-b border-gray-100 dark:border-gray-800 px-5 shrink-0">
                {TABS.map((t) => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer capitalize
                      ${activeTab === t
                        ? "border-orange-500 text-orange-600 dark:text-orange-400"
                        : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      }`}
                  >
                    {t === "profile" ? "👤 Profile" : t === "orders" ? "📦 Orders" : "🔒 Security"}
                  </button>
                ))}
              </div>

              {/* ── PROFILE TAB ── */}
              {activeTab === "profile" && (
                <div className="flex-1 px-5 py-5 space-y-5">
                  {saveMsg && <div className="px-4 py-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-xl text-sm text-green-600 dark:text-green-400 font-medium">{saveMsg}</div>}
                  {error && <div className="px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-sm text-red-600 dark:text-red-400 font-medium">{error}</div>}

                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">Personal Info</h3>
                    {!editing
                      ? <button onClick={() => setEditing(true)} className="text-xs font-bold text-orange-500 hover:text-orange-600 bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-lg cursor-pointer transition-colors">✏️ Edit</button>
                      : <div className="flex gap-2">
                          <button onClick={() => { setEditing(false); setError(""); }} className="text-xs font-bold text-gray-400 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">Cancel</button>
                          <button onClick={handleSave} disabled={saving} className="text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg cursor-pointer transition-colors disabled:opacity-60">
                            {saving ? "Saving..." : "💾 Save"}
                          </button>
                        </div>
                    }
                  </div>

                  <div className="space-y-3.5">
                    {[
                      { label: "Full Name", key: "name", type: "text", placeholder: "Your name", icon: "👤", top: true },
                      { label: "Phone Number", key: "phone", type: "tel", placeholder: "+91 9876543210", icon: "📱", top: true },
                    ].map(({ label, key, type, placeholder, icon }) => (
                      <div key={key}>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{icon}</span>
                          <input type={type} placeholder={placeholder} disabled={!editing}
                            value={key === "name" ? form.name : form.phone}
                            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                            className={`${INPUT} pl-10 ${!editing ? "opacity-70 cursor-not-allowed" : ""}`}
                          />
                        </div>
                      </div>
                    ))}

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Email</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📧</span>
                        <input type="email" value={user.email} disabled className={`${INPUT} pl-10 opacity-50 cursor-not-allowed`} />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">Email cannot be changed</p>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-3">📍 Delivery Address</h3>
                    <div className="space-y-2.5">
                      <input type="text" placeholder="Street / House No." disabled={!editing}
                        value={form.address.street}
                        onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })}
                        className={`${INPUT} ${!editing ? "opacity-70 cursor-not-allowed" : ""}`}
                      />
                      <div className="grid grid-cols-2 gap-2.5">
                        {[["city","City"],["state","State"],["pincode","Pincode"]].slice(0,2).map(([k,pl]) => (
                          <input key={k} type="text" placeholder={pl} disabled={!editing}
                            value={form.address[k]}
                            onChange={(e) => setForm({ ...form, address: { ...form.address, [k]: e.target.value } })}
                            className={`${INPUT} ${!editing ? "opacity-70 cursor-not-allowed" : ""}`}
                          />
                        ))}
                      </div>
                      <input type="text" placeholder="Pincode" disabled={!editing}
                        value={form.address.pincode}
                        onChange={(e) => setForm({ ...form, address: { ...form.address, pincode: e.target.value } })}
                        className={`${INPUT} ${!editing ? "opacity-70 cursor-not-allowed" : ""}`}
                      />
                    </div>
                  </div>

                  {/* Logout */}
                  <button onClick={() => { logout(); onClose(); }}
                    className="w-full py-3 rounded-xl border border-red-200 dark:border-red-500/30 text-red-500 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer">
                    Sign Out
                  </button>
                </div>
              )}

              {/* ── ORDERS TAB ── */}
              {activeTab === "orders" && (
                <div className="flex-1 px-5 py-5 space-y-3">
                  {ORDERS.map((o) => (
                    <div key={o.id} className="flex gap-3 p-3.5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-500/30 transition-all cursor-pointer">
                      <img src={o.img} alt={o.item} onError={(e) => e.target.src = "https://placehold.co/48"} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs text-gray-400">{o.id} · {o.date}</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{o.item}</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{o.price}</p>
                          </div>
                          <span className={`text-[11px] font-bold px-2 py-1 rounded-lg shrink-0 ${STATUS_CLS[o.status]}`}>{o.status}</span>
                        </div>
                        <button className="mt-2 text-xs font-semibold text-orange-500 hover:text-orange-600 cursor-pointer">Track Order →</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── SECURITY TAB ── */}
              {activeTab === "security" && (
                <div className="flex-1 px-5 py-5">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-4">Change Password</h3>
                  {pwErr && <div className="mb-3 px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-sm text-red-600 dark:text-red-400">{pwErr}</div>}
                  {pwMsg && <div className="mb-3 px-4 py-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-xl text-sm text-green-600 dark:text-green-400">{pwMsg}</div>}
                  <form onSubmit={handlePwChange} className="space-y-3.5">
                    {[
                      ["Current Password","current","🔒"],
                      ["New Password","newPw","🔑"],
                      ["Confirm New Password","confirm","✅"],
                    ].map(([label, key, icon]) => (
                      <div key={key}>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{icon}</span>
                          <input type="password" required placeholder="••••••••"
                            value={pwForm[key]}
                            onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                            className={`${INPUT} pl-10`}
                          />
                        </div>
                      </div>
                    ))}
                    <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 rounded-xl cursor-pointer hover:opacity-90 transition-opacity mt-2">
                      Update Password
                    </button>
                  </form>

                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Account Security</h4>
                    {[["Two-Factor Auth", "Not enabled", false], ["Login Alerts", "Enabled", true], ["Active Sessions", "1 device", true]].map(([l, v, ok]) => (
                      <div key={l} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{l}</span>
                        <span className={`text-xs font-semibold ${ok ? "text-green-500" : "text-orange-500"}`}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showAuth && !user && <AuthModal onClose={() => { setShowAuth(false); if (!user) onClose(); }} />}
    </>
  );
}
