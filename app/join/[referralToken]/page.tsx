"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader2, UploadCloud } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function JoinReferralForm() {
  const { referralToken } = useParams<{ referralToken: string }>();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    policeStation: "",
    walletName: "",
    walletAddress: "",
    paymentScreenshot: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, paymentScreenshot: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!referralToken) {
      toast.error("Invalid referral link!");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value as any);
      });

      const res = await fetch(`/api/join/${referralToken}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success("🎉 Registration successful!");
        setForm({
          name: "",
          mobile: "",
          email: "",
          policeStation: "",
          walletName: "",
          walletAddress: "",
          paymentScreenshot: null,
        });
      } else {
        toast.error(data.message || "Something went wrong!");
      }
    } catch (err) {
      toast.error("Network error!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-slate-900 dark:to-slate-800 px-6 py-10">
      <ToastContainer position="top-right" autoClose={3000} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full "
      >
        <Card className="shadow-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded">
          <CardHeader className="text-center space-y-2 pb-0">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Join via Referral
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Referral Code:{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {referralToken}
              </span>
            </p>
          </CardHeader>

          <CardContent className="mt-4">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <Input
                    name="name"
                    placeholder="Enter your full name"
                    required
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mobile Number
                  </label>
                  <Input
                    name="mobile"
                    placeholder="Enter your mobile number"
                    type="tel"
                    required
                    value={form.mobile}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <Input
                    name="email"
                    placeholder="Enter your email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Police Station
                  </label>
                  <Input
                    name="policeStation"
                    placeholder="Enter your police station"
                    value={form.policeStation}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Wallet Name
                  </label>
                  <Input
                    name="walletName"
                    placeholder="Enter wallet name (e.g. Binance, Trust Wallet)"
                    value={form.walletName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Wallet Address
                  </label>
                  <Input
                    name="walletAddress"
                    placeholder="Enter wallet address"
                    value={form.walletAddress}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Screenshot
                  </label>
                  <label
                    htmlFor="paymentScreenshot"
                    className="flex items-center justify-between border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {form.paymentScreenshot?.name ||
                        "Click to upload payment screenshot"}
                    </span>
                    <UploadCloud className="w-5 h-5 text-blue-500" />
                  </label>
                  <input
                    id="paymentScreenshot"
                    name="paymentScreenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg transition-all py-2.5"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        Submitting...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
