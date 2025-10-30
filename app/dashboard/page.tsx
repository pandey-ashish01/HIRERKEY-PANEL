"use client";
import React, { useState, useEffect, ReactElement } from "react";
import { 
  User, 
  Network, 
  Settings, 
  LogOut, 
  Edit2, 
  Save, 
  X, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  Users, 
  Mail, 
  Wallet, 
  Building2, 
  Share2, 
  Copy, 
  Check,
  Phone,
  CheckCircle,
  Image as ImageIcon,
  Sun,
  Moon
} from "lucide-react";

interface UserData {
  _id: string;
  id?: string;
  name: string;
  mobile: string;
  email?: string;
  policeStation?: string;
  walletName?: string;
  walletAddress?: string;
  paymentScreenshot?: string;
  children?: UserData[];
}

interface FormData {
  name: string;
  mobile: string;
  email: string;
  policeStation: string;
  walletName: string;
  walletAddress: string;
  paymentScreenshot: File | null;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hierarchyLoading, setHierarchyLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [hierarchyData, setHierarchyData] = useState<UserData | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    mobile: "",
    email: "",
    policeStation: "",
    walletName: "",
    walletAddress: "",
    paymentScreenshot: null,
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser: UserData = JSON.parse(userData);
      setUser(parsedUser);
      fetchUserDetails(parsedUser.id || parsedUser._id);
    } else {
      window.location.href = "/login";
    }
  }, []);

  const fetchUserDetails = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`);
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        setFormData({
          name: data.data.name,
          mobile: data.data.mobile,
          email: data.data.email || "",
          policeStation: data.data.policeStation || "",
          walletName: data.data.walletName || "",
          walletAddress: data.data.walletAddress || "",
          paymentScreenshot: null,
        });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFullHierarchy = async (userId: string) => {
    setHierarchyLoading(true);
    try {
      const res = await fetch(`/api/tree/${userId}`);
      const data = await res.json();
      if (data.success) {
        setHierarchyData(data.data);
        setExpandedNodes(new Set([data.data._id]));
      }
    } catch (error) {
      console.error("Error fetching hierarchy:", error);
    } finally {
      setHierarchyLoading(false);
    }
  };

  const getAvatarColor = (name: string): string => {
    const colors = [
      'bg-gradient-to-br from-purple-500 to-pink-500',
      'bg-gradient-to-br from-blue-500 to-cyan-500',
      'bg-gradient-to-br from-green-500 to-emerald-500',
      'bg-gradient-to-br from-orange-500 to-red-500',
      'bg-gradient-to-br from-indigo-500 to-purple-500',
      'bg-gradient-to-br from-pink-500 to-rose-500',
      'bg-gradient-to-br from-teal-500 to-green-500',
      'bg-gradient-to-br from-yellow-500 to-orange-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitials = (name: string): string => {
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        name: user.name,
        mobile: user.mobile,
        email: user.email || "",
        policeStation: user.policeStation || "",
        walletName: user.walletName || "",
        walletAddress: user.walletAddress || "",
        paymentScreenshot: null,
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("mobile", formData.mobile);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("policeStation", formData.policeStation);
      formDataToSend.append("walletName", formData.walletName);
      formDataToSend.append("walletAddress", formData.walletAddress);
      if (formData.paymentScreenshot) {
        formDataToSend.append("paymentScreenshot", formData.paymentScreenshot);
      }

      const res = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        body: formDataToSend,
      });

      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        setIsEditing(false);
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        alert("Account deleted successfully");
        localStorage.removeItem("user");
        window.location.href = "/Login";
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Error deleting account");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/Login";
  };

  const handleCopyLink = () => {
    if (!user) return;
    const shareLink = `${window.location.origin}/join/${user.mobile}`;
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const countTotalReferrals = (node: UserData): number => {
    if (!node || !node.children || node.children.length === 0) return 0;
    
    let count = node.children.length;
    node.children.forEach(child => {
      count += countTotalReferrals(child);
    });
    return count;
  };

  const renderHierarchyNode = (node: UserData, level: number = 0): ReactElement => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node._id);
    const totalReferrals = countTotalReferrals(node);

    return (
      <div key={node._id} className="mb-3">
        <div
          className={`flex items-center gap-4 p-4 rounded transition-all cursor-pointer shadow-md hover:shadow-lg ${
            level === 0
              ? isDarkMode 
                ? "bg-linear-to-r from-blue-600 via-blue-700 to-indigo-700 text-white" 
                : "bg-linear-to-r from-blue-500 via-blue-600 to-indigo-600 text-white"
              : isDarkMode
                ? "bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white"
                : "bg-white hover:bg-gray-50 border border-gray-200 text-gray-900"
          }`}
          style={{ marginLeft: `${level * 24}px` }}
          onClick={() => hasChildren && toggleNode(node._id)}
        >
          <div className="flex items-center gap-2 min-w-5">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )
            ) : (
              <div className={`w-4 h-4 rounded border-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} opacity-30`} />
            )}
          </div>
          
          <div className="shrink-0">
            {/* Profile image remains circular - only this one stays rounded-full */}
            <div className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white text-sm font-bold ${getAvatarColor(node.name)}`}>
              {getInitials(node.name)}
            </div>
          </div>
          
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
  {/* LEFT: MAIN CONTENT */}
  <div className="flex-1 min-w-0">
    <div className="flex items-center gap-2 mb-1">
      <p className="font-bold text-base truncate">{node.name}</p>
      {level === 0 && (
        <span className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          YOU
        </span>
      )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs opacity-90">
      <div className="flex items-center gap-1">
        <Phone className="w-3 h-3 shrink-0" />
        <span className="font-medium">{node.mobile}</span>
      </div>

      {node.email && (
        <div className="flex items-center gap-1 truncate">
          <Mail className="w-3 h-3 shrink-0" />
          <span className="truncate">{node.email}</span>
        </div>
      )}

      {node.policeStation && (
        <div className="flex items-center gap-1 truncate">
          <Building2 className="w-3 h-3 shrink-0" />
          <span className="truncate">{node.policeStation}</span>
        </div>
      )}

      {node.walletName && (
        <div className="flex items-center gap-1 truncate">
          <Wallet className="w-3 h-3 shrink-0" />
          <span className="truncate">{node.walletName}</span>
        </div>
      )}
    </div>

    {node.walletAddress && (
      <div
        className={`mt-1 text-xs opacity-75 font-mono truncate flex items-center gap-1 ${
          isDarkMode ? "text-blue-300" : "text-blue-600"
        }`}
      >
        <Wallet className="w-3 h-3 shrink-0" />
        {node.walletAddress}
      </div>
    )}
  </div>

  {/* RIGHT: PAYMENT IMAGE / FALLBACK */}
  {node.paymentScreenshot ? (
    <div
      className={`mt-2 sm:mt-0 sm:ml-3 pt-2 sm:pt-0 ${
        level === 0
          ? isDarkMode
            ? "border-t sm:border-t-0 sm:border-l border-white/20"
            : "border-t sm:border-t-0 sm:border-l border-white/40"
          : isDarkMode
          ? "border-t sm:border-t-0 sm:border-l border-slate-600"
          : "border-t sm:border-t-0 sm:border-l border-gray-200"
      } sm:pl-3 flex flex-col items-center sm:items-end`}
    >
      <p className="text-xs opacity-75 mb-1 flex items-center gap-1">
        <ImageIcon className="w-3 h-3" />
        Payment Screenshot:
      </p>
     <img
  src={node.paymentScreenshot}
  alt={`${node.name} payment`}
  className={`w-24 h-24 object-cover rounded shadow-md cursor-pointer hover:scale-105 transition-transform ${
    isDarkMode ? 'border border-slate-600' : 'border border-gray-300'
  }`}
  onClick={(e) => {
    e.stopPropagation();
    window.open(node.paymentScreenshot, '_blank');
  }}
  onError={(e) => {
  const target = e.target as HTMLImageElement;
  target.src = "/images/fallback.png";
  target.onerror = null;
}}

/>

    </div>
  ) : (
    <div
      className={`mt-2 sm:mt-0 sm:ml-3 pt-2 sm:pt-0 ${
        level === 0
          ? isDarkMode
            ? "border-t sm:border-t-0 sm:border-l border-white/20"
            : "border-t sm:border-t-0 sm:border-l border-white/40"
          : isDarkMode
          ? "border-t sm:border-t-0 sm:border-l border-slate-600"
          : "border-t sm:border-t-0 sm:border-l border-gray-200"
      } sm:pl-3 flex flex-col items-center sm:items-end`}
    >
      <p className="text-xs opacity-75 mb-1 flex items-center gap-1">
        <ImageIcon className="w-3 h-3" />
        Payment Screenshot:
      </p>
      <div
        className={`w-24 h-24 flex items-center justify-center text-xs rounded-md ${
          isDarkMode
            ? "bg-slate-800 border border-slate-600 text-gray-400"
            : "bg-gray-100 border border-gray-300 text-gray-500"
        }`}
      >
        No Image
      </div>
    </div>
  )}
</div>

          
          <div className="flex items-center gap-2 shrink-0">
            {hasChildren && (
              <div className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                level === 0 
                  ? 'bg-white/20 text-white' 
                  : isDarkMode 
                    ? 'bg-blue-900/50 text-blue-200' 
                    : 'bg-blue-100 text-blue-700'
              }`}>
                <Users className="w-3 h-3" />
                {node.children!.length}
              </div>
            )}
            {level === 0 && totalReferrals > 0 && (
              <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                Total: {totalReferrals}
              </div>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-2">
            {node.children!.map((child) => renderHierarchyNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    { id: "hierarchy", label: "Hierarchy", icon: <Network className="w-4 h-4" /> },
    { id: "sharelink", label: "Share Link", icon: <Share2 className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-3"></div>
          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`w-16 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} flex flex-col items-center py-4 space-y-6 border-r`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === "hierarchy" && !hierarchyData && user) {
                fetchFullHierarchy(user._id);
              }
            }}
            className={`flex flex-col items-center space-y-1 transition-all ${
              activeTab === tab.id 
                ? "text-blue-500" 
                : isDarkMode 
                  ? "text-gray-400 hover:text-blue-400" 
                  : "text-gray-600 hover:text-blue-500"
            }`}
          >
            {tab.icon}
            <span className="text-[10px] text-center">{tab.label}</span>
          </button>
        ))}

        <div className="mt-auto space-y-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`flex flex-col items-center ${isDarkMode ? 'text-gray-400 hover:text-yellow-400' : 'text-gray-600 hover:text-blue-500'} transition-all`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="text-[10px]">{isDarkMode ? 'Light' : 'Dark'}</span>
          </button>
          
          <button
            onClick={handleLogout}
            className={`flex flex-col items-center ${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-500'} transition-all`}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-[10px]">Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === "profile" && user && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {/* Profile image remains circular - only this one stays rounded-full */}
                  <div className={`w-16 h-16 rounded-full border-4 border-blue-500 shadow-lg flex items-center justify-center text-white text-xl font-bold ${getAvatarColor(user.name)}`}>
                    {getInitials(user.name)}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full flex items-center justify-center ${isDarkMode ? 'border-4 border-slate-900' : 'border-4 border-gray-50'}`}>
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-1 bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Your Profile
                  </h1>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage your personal information</p>
                </div>
              </div>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-all shadow text-white text-sm"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-all shadow text-white text-sm"
                  >
                    <Save className="w-3 h-3" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition-all text-white text-sm ${
                      isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-400 hover:bg-gray-500'
                    }`}
                  >
                    <X className="w-3 h-3" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* COMPACT LAYOUT: Two-column design */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - All Details */}
              <div className={`lg:col-span-2 rounded p-6 shadow border ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          isDarkMode 
                            ? 'bg-slate-700 border border-slate-600 text-white' 
                            : 'bg-gray-50 border border-gray-300 text-gray-900'
                        }`}
                        placeholder="Enter your name"
                      />
                    ) : (
                      <p className={`font-medium text-sm px-3 py-2 rounded ${
                        isDarkMode ? 'bg-slate-700/50 text-white' : 'bg-gray-100 text-gray-900'
                      }`}>{user.name}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Mobile Number</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        className={`w-full rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          isDarkMode 
                            ? 'bg-slate-700 border border-slate-600 text-white' 
                            : 'bg-gray-50 border border-gray-300 text-gray-900'
                        }`}
                        placeholder="Enter mobile number"
                      />
                    ) : (
                      <p className={`font-medium text-sm px-3 py-2 rounded ${
                        isDarkMode ? 'bg-slate-700/50 text-white' : 'bg-gray-100 text-gray-900'
                      }`}>{user.mobile}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Email Address</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          isDarkMode 
                            ? 'bg-slate-700 border border-slate-600 text-white' 
                            : 'bg-gray-50 border border-gray-300 text-gray-900'
                        }`}
                        placeholder="Enter email"
                      />
                    ) : (
                      <p className={`font-medium text-sm px-3 py-2 rounded ${
                        isDarkMode ? 'bg-slate-700/50 text-white' : 'bg-gray-100 text-gray-900'
                      }`}>{user.email || "Not provided"}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Police Station</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.policeStation}
                        onChange={(e) => setFormData({ ...formData, policeStation: e.target.value })}
                        className={`w-full rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          isDarkMode 
                            ? 'bg-slate-700 border border-slate-600 text-white' 
                            : 'bg-gray-50 border border-gray-300 text-gray-900'
                        }`}
                        placeholder="Enter police station"
                      />
                    ) : (
                      <p className={`font-medium text-sm px-3 py-2 rounded ${
                        isDarkMode ? 'bg-slate-700/50 text-white' : 'bg-gray-100 text-gray-900'
                      }`}>{user.policeStation || "Not provided"}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Wallet Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.walletName}
                        onChange={(e) => setFormData({ ...formData, walletName: e.target.value })}
                        className={`w-full rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          isDarkMode 
                            ? 'bg-slate-700 border border-slate-600 text-white' 
                            : 'bg-gray-50 border border-gray-300 text-gray-900'
                        }`}
                        placeholder="Enter wallet name"
                      />
                    ) : (
                      <p className={`font-medium text-sm px-3 py-2 rounded ${
                        isDarkMode ? 'bg-slate-700/50 text-white' : 'bg-gray-100 text-gray-900'
                      }`}>{user.walletName || "Not provided"}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Wallet Address</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.walletAddress}
                        onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                        className={`w-full rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          isDarkMode 
                            ? 'bg-slate-700 border border-slate-600 text-white' 
                            : 'bg-gray-50 border border-gray-300 text-gray-900'
                        }`}
                        placeholder="Enter wallet address"
                      />
                    ) : (
                      <p className={`font-medium text-sm px-3 py-2 rounded break-all ${
                        isDarkMode ? 'bg-slate-700/50 text-white' : 'bg-gray-100 text-gray-900'
                      }`}>
                        {user.walletAddress || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                      Update Payment Screenshot (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData({ ...formData, paymentScreenshot: e.target.files?.[0] || null })
                      }
                      className={`w-full rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer ${
                        isDarkMode 
                          ? 'bg-slate-700 border border-slate-600 text-white' 
                          : 'bg-gray-50 border border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Right Column - Payment Screenshot */}
              <div className={`rounded p-6 shadow border h-fit ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Payment Verification
                </h2>
                
                {user.paymentScreenshot ? (
                  <div className="text-center">
                    <p className={`mb-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Your payment screenshot</p>
                    <img
                      src={user.paymentScreenshot}
                      alt="Payment"
                      className={`w-full max-w-xs mx-auto object-cover rounded shadow cursor-pointer hover:scale-105 transition-transform ${
                        isDarkMode ? 'border border-slate-600' : 'border border-gray-300'
                      }`}
                      onClick={() => window.open(user.paymentScreenshot, '_blank')}
                    />
                    <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Click image to view full size
                    </p>
                  </div>
                ) : (
                  <div className={`text-center py-8 rounded border-2 border-dashed ${
                    isDarkMode ? 'border-slate-600 text-gray-400' : 'border-gray-300 text-gray-500'
                  }`}>
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm mb-1">No Payment Screenshot</p>
                    <p className="text-xs">Upload a payment screenshot for verification</p>
                  </div>
                )}
                
                {!isEditing && user.paymentScreenshot && (
                  <button
                    onClick={handleEdit}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-all shadow text-white text-sm"
                  >
                    <Edit2 className="w-3 h-3" />
                    Update Payment Screenshot
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "hierarchy" && (
          <div>
            <div className="mb-4">
              <h1 className="text-2xl font-bold mb-1">Your Referral Network</h1>
              <p className={isDarkMode ? "text-gray-400 text-sm" : "text-gray-600 text-sm"}>View your complete downline structure with full details</p>
            </div>
            
            <div className={`rounded p-4 shadow border ${
              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}>
              {hierarchyLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-500 mb-3"></div>
                  <p className={isDarkMode ? "text-gray-400 text-sm" : "text-gray-600 text-sm"}>Loading your network tree...</p>
                </div>
              ) : hierarchyData ? (
                <div className="space-y-2">
                  {renderHierarchyNode(hierarchyData)}
                </div>
              ) : (
                <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Network className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No hierarchy data available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "sharelink" && user && (
          <div>
            <div className="mb-4">
              <h1 className="text-2xl font-bold mb-1 bg-linear-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Your Referral Link
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Share this link to invite others to join your network</p>
            </div>
            
            <div className={`rounded p-6 shadow border ${
              isDarkMode 
                ? 'bg-linear-to-br from-slate-800 to-slate-900 border-slate-700/50' 
                : 'bg-linear-to-br from-white to-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-linear-to-br from-green-500 to-blue-500 rounded shadow">
                  <Share2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-1">Share & Grow Your Network</h2>
                  <p className={isDarkMode ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>Copy your unique referral link and share it anywhere</p>
                </div>
              </div>

              <div className={`rounded p-4 border ${
                isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-100 border-gray-300'
              }`}>
                <label className={`block text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Your Referral Link</label>
                <div className="flex gap-2">
                  <div className={`flex-1 rounded px-3 py-2 text-sm font-mono overflow-x-auto ${
                    isDarkMode 
                      ? 'bg-slate-800 border border-slate-600 text-blue-300' 
                      : 'bg-white border border-gray-300 text-blue-600'
                  }`}>
                    {`${window.location.origin}/join/${user.mobile}`}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition-all font-semibold shadow text-sm ${
                      copied
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className={`rounded p-4 ${
                  isDarkMode 
                    ? 'bg-linear-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30' 
                    : 'bg-linear-to-br from-purple-100 to-pink-100 border border-purple-300'
                }`}>
                  <div className="text-2xl mb-1">📲</div>
                  <h3 className="font-bold mb-1 text-sm">WhatsApp</h3>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Share via WhatsApp message</p>
                </div>
                
                <div className={`rounded p-4 ${
                  isDarkMode 
                    ? 'bg-linear-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30' 
                    : 'bg-linear-to-br from-blue-100 to-cyan-100 border border-blue-300'
                }`}>
                  <div className="text-2xl mb-1">✉️</div>
                  <h3 className="font-bold mb-1 text-sm">Email</h3>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Send via email to contacts</p>
                </div>
                
                <div className={`rounded p-4 ${
                  isDarkMode 
                    ? 'bg-linear-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30' 
                    : 'bg-linear-to-br from-green-100 to-emerald-100 border border-green-300'
                }`}>
                  <div className="text-2xl mb-1">📱</div>
                  <h3 className="font-bold mb-1 text-sm">Social Media</h3>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Post on social platforms</p>
                </div>
              </div>

              <div className={`mt-4 rounded p-4 ${
                isDarkMode 
                  ? 'bg-blue-900/30 border border-blue-500/30' 
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                <h3 className="font-bold text-sm mb-1 flex items-center gap-1">
                  <span className="text-lg">💡</span>
                  Quick Tip
                </h3>
                <p className={isDarkMode ? 'text-gray-300 text-xs' : 'text-gray-700 text-xs'}>
                  Anyone who signs up using your referral link will automatically become part of your network. 
                  The more people you invite, the larger your network grows!
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div>
            <div className="mb-4">
              <h1 className="text-2xl font-bold mb-1">Account Settings</h1>
              <p className={isDarkMode ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>Manage your account preferences</p>
            </div>
            
            <div className={`rounded p-6 shadow border ${
              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}>
              <div className={`border rounded p-6 ${
                isDarkMode 
                  ? 'border-red-600 bg-red-950/20' 
                  : 'border-red-500 bg-red-50'
              }`}>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-red-600 rounded">
                    <Trash2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-500 mb-2">Danger Zone</h3>
                    <p className={`mb-4 leading-relaxed text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Once you delete your account, there is no going back. All your data, including your referral network connections, will be permanently removed. Please be absolutely certain before proceeding.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded transition-all font-semibold shadow hover:shadow-red-500/50 text-white text-sm"
                    >
                      Delete My Account Permanently
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}