// app/join/[referralToken]/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, UserPlus, Lock, Phone, AlertCircle, CheckCircle } from "lucide-react";

export default function JoinReferralForm() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    mobile: "",
    password: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [referralToken, setReferralToken] = useState<string>("");
  const [validating, setValidating] = useState(true);
  const [referrerInfo, setReferrerInfo] = useState<{ name: string; mobile: string } | null>(null);
  
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const validateReferralLink = async () => {
      try {
        if (params?.referralToken) {
          const token = params.referralToken as string;
          setReferralToken(token);
          
          // Fetch referrer info
          const response = await fetch(`/api/users/referrer/${token}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setReferrerInfo(data.data);
            }
          }
          
          setValidating(false);
        } else {
          setMessage({ 
            type: "error", 
            text: "Invalid referral link. Missing referral token!" 
          });
          setValidating(false);
        }
      } catch (error) {
        console.error("Error validating referral:", error);
        setValidating(false);
      }
    };

    validateReferralLink();
  }, [params]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.mobile.match(/^\d{10}$/)) {
      setMessage({ type: "error", text: "Please enter a valid 10-digit mobile number" });
      return;
    }
    
    if (form.password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    
    if (form.password !== form.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      
      const response = await fetch(`/api/join/${referralToken}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ 
          type: "success", 
          text: "🎉 Registration successful! Redirecting to login..." 
        });
        
        // Clear form
        setForm({
          mobile: "",
          password: "",
          confirmPassword: ""
        });
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("Login");
        }, 2000);
      } else {
        setMessage({ type: "error", text: data.message || "Registration failed!" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error! Please try again." });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Validating referral link...</p>
        </div>
      </div>
    );
  }

  if (!referralToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-100 dark:from-slate-900 dark:to-slate-800 px-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Invalid Referral Link</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The referral link you used is invalid or has expired.</p>
          <a 
            href="/login" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-100 dark:from-slate-900 dark:to-slate-800 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-slate-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 bg-clip-text text-transparent mb-2">
              Join Network
            </h1>
            
            {referrerInfo && (
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border border-blue-100 dark:border-blue-800/30">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">You are joining under:</p>
                <p className="font-semibold text-gray-800 dark:text-white">{referrerInfo.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{referrerInfo.mobile}</p>
              </div>
            )}
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Register with just your mobile number
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              You can update other details later in your profile
            </p>
          </div>

          {/* Message Display */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg text-sm font-medium ${
                message.type === "success"
                  ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
              }`}
            >
              <div className="flex items-start gap-2">
                {message.type === "success" ? (
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Mobile Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">+91</span>
                </div>
                <input
                  name="mobile"
                  type="tel"
                  placeholder="10-digit mobile number"
                  required
                  value={form.mobile}
                  onChange={handleChange}
                  maxLength={10}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This will be your login ID
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password *
              </label>
              <input
                name="password"
                type="password"
                placeholder="Minimum 6 characters"
                required
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Confirm Password *
              </label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Join Network
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">
                  Additional Information
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  You can add your name, email, police station, and wallet details later in your profile settings after login.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <a href="Login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold">
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}