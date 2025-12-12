"use client";
import React, { useEffect, useState } from "react";
import { 
  User, 
  Network, 
  Settings, 
  LogOut, 
  Edit2, 
  Save, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Users, 
  Mail, 
  Building2, 
  Share2, 
  Phone,
  Sun,
  Moon,
  DollarSign,
  Plus,
  Calendar,
  Trash2,
  AlertCircle,
  Eye,
  EyeOff,
  CreditCard,
  TrendingUp,
  Filter,
  Menu,
  ArrowLeft,
  FileText,
  Smartphone,
  Key
} from "lucide-react";
import { Numans } from "next/font/google";

// Type Definitions
interface Payment {
  _id: string;
  amount: number;
  screenshot: string;
  description?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface PaymentSummary {
  totalAmount: number;
  paymentCount: number;
  todayPayments: number;
  thisMonthPayments: number;
  lastPayment?: {
    amount: number;
    date: string;
    screenshot: string;
  };
}

interface UserData {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  policeStation?: string;
  walletName?: string;
  walletAddress?: string;
  paymentScreenshot?: string;
  secretKey?: string;
  referralToken?: string;
  parentId?: string;
  children?: UserNode[];
  payments?: Payment[];
  createdAt: string;
}

interface UserNode extends UserData {
  payments: Payment[];
  paymentSummary: PaymentSummary;
  children: UserNode[];
  level: number;
}

interface FormData {
  name: string;
  mobile: string;
  email: string;
  policeStation: string;
  walletName: string;
  walletAddress: string;
}

interface PaymentFormData {
  amount: string;
  description: string;
  screenshot: File | null;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hierarchyLoading, setHierarchyLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [hierarchyData, setHierarchyData] = useState<UserNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState<boolean>(false);
  const [showAddPayment, setShowAddPayment] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisMonth: 0
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showBackButton, setShowBackButton] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"hierarchy" | "list">("hierarchy");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    mobile: "",
    email: "",
    policeStation: "",
    walletName: "",
    walletAddress: "",
  });

  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    amount: "",
    description: "",
    screenshot: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token || !userData) {
      window.location.href = "/login";
      return;
    }

    try {
      const parsedUser: UserData = JSON.parse(userData);
      setUser(parsedUser);
      fetchUserDetails(parsedUser._id, token);
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.clear();
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    if (payments.length > 0) {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const todayPayments = payments
        .filter(p => new Date(p.createdAt) >= todayStart)
        .reduce((sum, p) => sum + p.amount, 0);
      const thisMonthPayments = payments
        .filter(p => new Date(p.createdAt) >= monthStart)
        .reduce((sum, p) => sum + p.amount, 0);
      
      setStats({
        total,
        today: todayPayments,
        thisMonth: thisMonthPayments
      });
    } else {
      setStats({
        total: 0,
        today: 0,
        thisMonth: 0
      });
    }
  }, [payments]);

  useEffect(() => {
    // Close mobile menu when changing tabs on mobile
    setIsMobileMenuOpen(false);
    
    // Show back button for certain tabs on mobile
    if (window.innerWidth < 768) {
      setShowBackButton(activeTab !== "profile");
    } else {
      setShowBackButton(false);
    }
  }, [activeTab]);

  // NEW: Add useEffect to fetch data when activeTab changes
  useEffect(() => {
    if (!user) return;
    
    // Fetch hierarchy data when hierarchy tab is active
    if (activeTab === "hierarchy" && !hierarchyData) {
      fetchHierarchy(user._id);
    }
    
    // Fetch payments when account tab is active
    if (activeTab === "account") {
      fetchPayments(user._id);
    }
  }, [activeTab, user]);

  const fetchUserDetails = async (userId: string, token: string): Promise<void> => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
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
        });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async (userId: string): Promise<void> => {
    if (!user) return;
    
    setPaymentsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/users/${userId}/payments`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setPayments(data.data);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const fetchHierarchy = async (userId: string): Promise<void> => {
    setHierarchyLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        return;
      }

      const hierarchyRes = await fetch(`/api/tree/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const hierarchyData = await hierarchyRes.json();

      if (hierarchyData.success) {
        const hierarchyWithPayments = await processHierarchyWithPayments(
          hierarchyData.data,
          token
        );

        setHierarchyData(hierarchyWithPayments);
        setExpandedNodes(new Set([hierarchyWithPayments._id]));
      }
    } catch (error) {
      console.error("Error fetching hierarchy:", error);
    } finally {
      setHierarchyLoading(false);
    }
  };

  // Fetch payments for each user in the hierarchy recursively
  const processHierarchyWithPayments = async (node: any, token: string): Promise<UserNode> => {
    try {
      // Fetch payments for this specific user
      const paymentsRes = await fetch(`/api/users/${node._id}/payments`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      let userPayments: Payment[] = [];
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        userPayments = paymentsData.success ? paymentsData.data : [];
      }
      
      // Calculate payment summary for this user
      const paymentSummary = calculateIndividualPaymentSummary(userPayments);
      
      // Process children recursively if they exist
      let children: UserNode[] = [];
      if (node.children && node.children.length > 0) {
        children = await Promise.all(
          node.children.map((child: any) => processHierarchyWithPayments(child, token))
        );
      }
      
      return {
        ...node,
        payments: userPayments,
        paymentSummary,
        children,
        level: node.level || 0
      };
    } catch (error) {
      console.error(`Error processing user ${node._id}:`, error);
      return {
        ...node,
        payments: [],
        paymentSummary: {
          totalAmount: 0,
          paymentCount: 0,
          todayPayments: 0,
          thisMonthPayments: 0
        },
        children: node.children || [],
        level: node.level || 0
      };
    }
  };

  // Calculate payment summary for a single user's payments
  const calculateIndividualPaymentSummary = (payments: Payment[]): PaymentSummary => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const todayPayments = payments
      .filter((p: Payment) => new Date(p.createdAt) >= todayStart)
      .reduce((sum: number, p: Payment) => sum + p.amount, 0);
    
    const thisMonthPayments = payments
      .filter((p: Payment) => new Date(p.createdAt) >= monthStart)
      .reduce((sum: number, p: Payment) => sum + p.amount, 0);
    
    const totalAmount = payments.reduce((sum: number, p: Payment) => sum + p.amount, 0);
    
    const lastPayment = payments.length > 0 
      ? {
          amount: payments[payments.length - 1].amount,
          date: payments[payments.length - 1].createdAt,
          screenshot: payments[payments.length - 1].screenshot
        }
      : undefined;

    return {
      totalAmount,
      paymentCount: payments.length,
      todayPayments,
      thisMonthPayments,
      lastPayment
    };
  };

  const handleAddPayment = async (): Promise<void> => {
    if (!user || !paymentForm.amount || !paymentForm.screenshot) {
      alert("Please fill all required fields!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      formDataToSend.append("amount", paymentForm.amount);
      formDataToSend.append("description", paymentForm.description);
      formDataToSend.append("screenshot", paymentForm.screenshot);

      const res = await fetch(`/api/users/${user._id}/payments`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formDataToSend,
      });

      const data = await res.json();
      if (data.success) {
        alert("Payment added successfully!");
        setPaymentForm({ amount: "", description: "", screenshot: null });
        setShowAddPayment(false);
        fetchPayments(user._id);
        if (hierarchyData) fetchHierarchy(user._id);
      } else {
        alert(data.message || "Error adding payment");
      }
    } catch (error) {
      console.error("Error adding payment:", error);
      alert("Error adding payment");
    }
  };

  const handleDeletePayment = async (paymentId: string): Promise<void> => {
    if (!user) return;
    
    if (!confirm("Are you sure you want to delete this payment?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/users/${user._id}/payments/${paymentId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (data.success) {
        alert("Payment deleted successfully!");
        fetchPayments(user._id);
        if (hierarchyData) fetchHierarchy(user._id);
      } else {
        alert(data.message || "Error deleting payment");
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      alert("Error deleting payment");
    }
  };

  const handleSaveProfile = async (): Promise<void> => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        localStorage.setItem("user", JSON.stringify(data.data));
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert(data.message || "Error updating profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    }
  };

  const handleUpdatePassword = async (): Promise<void> => {
    if (!user) return;

    setPasswordMessage({ type: "", text: "" });

    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordMessage({ type: "error", text: "All password fields are required!" });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match!" });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "New password must be at least 6 characters!" });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/users/${user._id}/password`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(passwordForm),
      });

      const data = await res.json();
      if (data.success) {
        setPasswordMessage({ type: "success", text: "Password updated successfully!" });
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        setTimeout(() => {
          setPasswordMessage({ type: "", text: "" });
        }, 3000);
      } else {
        setPasswordMessage({ type: "error", text: data.message || "Error updating password" });
      }
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordMessage({ type: "error", text: "Error updating password" });
    }
  };

  const handleDeleteAccount = async (): Promise<void> => {
    if (!user) return;
    
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone!")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/users/${user._id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (data.success) {
        alert("Account deleted successfully!");
        localStorage.clear();
        window.location.href = "/login";
      } else {
        alert(data.message || "Error deleting account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Error deleting account");
    }
  };

  const handleLogout = (): void => {
    localStorage.clear();
    window.location.href = "/Login";
  };

  const handleCopyLink = (): void => {
    if (!user) return;
    const shareLink = `${window.location.origin}/join/${user.mobile}`;
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const toggleNode = (nodeId: string): void => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getAvatarColor = (name: string): string => {
    const colors = [
      'bg-gradient-to-br from-purple-500 to-pink-500',
      'bg-gradient-to-br from-blue-500 to-cyan-500',
      'bg-gradient-to-br from-green-500 to-emerald-500',
      'bg-gradient-to-br from-orange-500 to-red-500',
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const getInitials = (name: string): string => {
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const filteredPayments = () => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    switch (paymentFilter) {
      case 'today':
        return payments.filter(payment => new Date(payment.createdAt) >= todayStart);
      case 'thisMonth':
        return payments.filter(payment => new Date(payment.createdAt) >= monthStart);
      case 'all':
      default:
        return payments;
    }
  };

  const flattenHierarchy = (node: UserNode, level: number = 0): UserNode[] => {
    const nodes = [{ ...node, level }];
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        nodes.push(...flattenHierarchy(child, level + 1));
      });
    }
    return nodes;
  };

  const renderHierarchyNode = (node: UserNode, level: number = 0): React.ReactElement => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node._id);
    const paymentSummary = node.paymentSummary || { 
      totalAmount: 0, 
      paymentCount: 0, 
      todayPayments: 0, 
      thisMonthPayments: 0 
    };
    const isMobile = window.innerWidth < 768;

    return (
      <div key={node._id} className="mb-3">
        <div
          className={`flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer border ${
            level === 0
              ? isDarkMode 
                ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-blue-500" 
                : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-400"
              : isDarkMode
                ? "bg-slate-800 hover:bg-slate-700 border-slate-700"
                : "bg-white hover:bg-gray-50 border-gray-200"
          }`}
          style={{ marginLeft: isMobile ? `${Math.min(level * 16, 64)}px` : `${level * 20}px` }}
          onClick={() => hasChildren && toggleNode(node._id)}
        >
          {/* Expand/Collapse Icon */}
          <div className="flex items-center gap-1 pt-0.5">
            {hasChildren ? (
              isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>
          
          {/* Avatar */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${getAvatarColor(node.name)}`}>
            {getInitials(node.name)}
          </div>
          
          {/* User Details - Main Section */}
          <div className="flex-1 min-w-0">
            {/* Name and YOU badge */}
            <div className="flex items-center gap-2 mb-3">
              <p className="font-bold text-base">{node.name}</p>
              {level === 0 && (
                <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">YOU</span>
              )}
            </div>
            
            {/* User Information - Properly labeled */}
            <div className="space-y-2 text-sm">
              {/* Mobile Number with label */}
              <div className="flex items-start gap-2">
                <Smartphone className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs opacity-75 mb-0.5">Mobile Number</div>
                  <div className="font-medium truncate">{node.mobile}</div>
                </div>
              </div>
              
              {/* Email with label */}
              {node.email && (
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs opacity-75 mb-0.5">Email Address</div>
                    <div className="font-medium truncate">{node.email}</div>
                  </div>
                </div>
              )}
              
              {/* Police Station with label */}
              {node.policeStation && (
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs opacity-75 mb-0.5">Police Station</div>
                    <div className="font-medium truncate">{node.policeStation}</div>
                  </div>
                </div>
              )}
              
              {/* Referral Token with label */}
              {node.referralToken && (
                <div className="flex items-start gap-2">
                  <Key className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs opacity-75 mb-0.5">Referral Token</div>
                    <div className="font-medium font-mono truncate text-xs">{node.referralToken}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Summary - Always show */}
            <div className={`mt-4 pt-3 border-t ${
              level === 0 
                ? 'border-white/30' 
                : isDarkMode ? 'border-slate-600' : 'border-gray-200'
            }`}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="flex flex-col items-center p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10">
                  <DollarSign className="w-4 h-4 text-blue-400 mb-1" />
                  <div className="text-xs opacity-75">Total</div>
                  <div className="font-bold text-sm">₹{paymentSummary.totalAmount}</div>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10">
                  <Calendar className="w-4 h-4 text-green-400 mb-1" />
                  <div className="text-xs opacity-75">Today</div>
                  <div className="font-bold text-sm">₹{paymentSummary.todayPayments}</div>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10">
                  <TrendingUp className="w-4 h-4 text-purple-400 mb-1" />
                  <div className="text-xs opacity-75">This Month</div>
                  <div className="font-bold text-sm">₹{paymentSummary.thisMonthPayments}</div>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-600/10">
                  <FileText className="w-4 h-4 text-yellow-400 mb-1" />
                  <div className="text-xs opacity-75">Count</div>
                  <div className="font-bold text-sm">{paymentSummary.paymentCount}</div>
                </div>
              </div>
              
              {paymentSummary.lastPayment && (
                <div className="mt-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="opacity-75">Last Payment:</div>
                    <div className="font-semibold">₹{paymentSummary.lastPayment.amount}</div>
                    <div className="opacity-75">
                      {new Date(paymentSummary.lastPayment.date).toLocaleDateString()}
                    </div>
                  </div>
                  {paymentSummary.lastPayment.screenshot && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(paymentSummary.lastPayment?.screenshot, '_blank');
                      }}
                      className="text-blue-400 hover:text-blue-300 text-xs"
                    >
                      View Proof
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Children count */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {hasChildren && (
              <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                level === 0 
                  ? 'bg-white/20 text-white'
                  : isDarkMode ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-100 text-blue-700'
              }`}>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span className="whitespace-nowrap">{node.children.length}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Children nodes */}
        {hasChildren && isExpanded && (
          <div className="mt-2 ml-4 md:ml-6 pl-4 border-l-2 border-dashed border-slate-600/30">
            {node.children.map((child) => renderHierarchyNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderListView = () => {
    if (!hierarchyData) return null;
    
    const allUsers = flattenHierarchy(hierarchyData);
    
    return (
      <div className={`rounded-xl overflow-hidden border ${isDarkMode ? 'border-slate-700 bg-slate-800/30' : 'border-gray-200 bg-gray-50'}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className={`text-left ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-100'}`}>
                <th className="p-4 text-sm font-semibold">Member Details</th>
                <th className="p-4 text-sm font-semibold">Contact Info</th>
                <th className="p-4 text-sm font-semibold hidden lg:table-cell">Station & Token</th>
                <th className="p-4 text-sm font-semibold">Payment Stats</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((userNode, index) => (
                <tr 
                  key={userNode._id} 
                  className={`border-t ${isDarkMode ? 'border-slate-700 hover:bg-slate-700/30' : 'border-gray-200 hover:bg-gray-100'}`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${getAvatarColor(userNode.name)}`}>
                        {getInitials(userNode.name)}
                      </div>
                      <div>
                        <div className="font-bold">{userNode.name}</div>
                        {index === 0 && (
                          <div className="mt-1 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold inline-block">YOU</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs opacity-75 mb-0.5">Mobile Number</div>
                        <div className="flex items-center gap-2 font-medium">
                          <Phone className="w-3 h-3" />
                          {userNode.mobile}
                        </div>
                      </div>
                      {userNode.email && (
                        <div>
                          <div className="text-xs opacity-75 mb-0.5">Email Address</div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[150px]">{userNode.email}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <div className="space-y-2">
                      {userNode.policeStation && (
                        <div>
                          <div className="text-xs opacity-75 mb-0.5">Police Station</div>
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="w-3 h-3" />
                            {userNode.policeStation}
                          </div>
                        </div>
                      )}
                      {userNode.referralToken && (
                        <div>
                          <div className="text-xs opacity-75 mb-0.5">Referral Token</div>
                          <div className="flex items-center gap-2 text-sm">
                            <Key className="w-3 h-3" />
                            <span className="font-mono truncate max-w-[120px]">{userNode.referralToken}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 rounded bg-gradient-to-br from-blue-500/10 to-blue-600/10">
                        <div className="text-xs opacity-75">Today</div>
                        <div className="font-bold text-green-600">₹{userNode.paymentSummary.todayPayments}</div>
                      </div>
                      <div className="text-center p-2 rounded bg-gradient-to-br from-purple-500/10 to-purple-600/10">
                        <div className="text-xs opacity-75">Month</div>
                        <div className="font-bold text-blue-600">₹{userNode.paymentSummary.thisMonthPayments}</div>
                      </div>
                      <div className="text-center p-2 rounded bg-gradient-to-br from-yellow-500/10 to-yellow-600/10">
                        <div className="text-xs opacity-75">Total</div>
                        <div className="font-bold">₹{userNode.paymentSummary.totalAmount}</div>
                      </div>
                    </div>
                    {userNode.paymentSummary.paymentCount > 0 && (
                      <div className="mt-2 text-center text-xs opacity-75">
                        {userNode.paymentSummary.paymentCount} payment{userNode.paymentSummary.paymentCount !== 1 ? 's' : ''}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
    { id: "account", label: "Payments", icon: <CreditCard className="w-5 h-5" /> },
    { id: "hierarchy", label: "Network", icon: <Network className="w-5 h-5" /> },
    { id: "sharelink", label: "Share", icon: <Share2 className="w-5 h-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-3"></div>
          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-white">Session Expired</h2>
          <p className="mb-4 text-gray-300">Please login again</p>
          <button 
            onClick={() => window.location.href = "/login"}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white' : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900'}`}>
      {/* Mobile Header */}
      <div className={`md:hidden sticky top-0 z-50 ${isDarkMode ? 'bg-slate-800/90 backdrop-blur-lg border-b border-slate-700' : 'bg-white/90 backdrop-blur-lg border-b border-gray-200'}`}>
        <div className="flex items-center justify-between p-4">
          {showBackButton ? (
            <button
              onClick={() => setActiveTab("profile")}
              className="p-2 rounded-lg hover:bg-gray-500/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getAvatarColor(user.name)}`}>
                {getInitials(user.name)}
              </div>
              <div>
                <h1 className="font-bold text-sm truncate">{user.name}</h1>
                <p className="text-xs opacity-75">Dashboard</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg hover:bg-gray-500/10"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-500/10"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        {!showBackButton && (
          <div className="flex overflow-x-auto px-4 pb-2 space-x-1 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? isDarkMode
                      ? "bg-blue-500 text-white"
                      : "bg-blue-500 text-white"
                    : isDarkMode
                    ? "bg-slate-700 text-gray-300"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className={`absolute right-0 top-0 h-full w-64 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-2xl`}>
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getAvatarColor(user.name)}`}>
                  {getInitials(user.name)}
                </div>
                <div>
                  <h2 className="font-bold">{user.name}</h2>
                  <p className="text-sm opacity-75">{user.mobile}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full p-3 rounded-lg ${
                    activeTab === tab.id
                      ? isDarkMode
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-blue-500/10 text-blue-600"
                      : isDarkMode
                      ? "hover:bg-slate-700"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
              
              <div className="pt-4 mt-4 border-t border-slate-700">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full p-3 rounded-lg text-red-500 hover:bg-red-500/10"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-screen">
        <div className={`w-20 ${isDarkMode ? 'bg-slate-800/50 backdrop-blur-lg border-slate-700' : 'bg-white/80 backdrop-blur-lg border-gray-200'} flex flex-col items-center py-6 space-y-8 border-r`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center space-y-2 transition-all group ${
                activeTab === tab.id 
                  ? isDarkMode 
                    ? "text-blue-400" 
                    : "text-blue-600"
                  : isDarkMode 
                    ? "text-gray-400 hover:text-blue-400" 
                    : "text-gray-600 hover:text-blue-500"
              }`}
            >
              <div className={`p-3 rounded-xl ${
                activeTab === tab.id
                  ? isDarkMode
                    ? "bg-blue-500/20"
                    : "bg-blue-500/10"
                  : "group-hover:bg-gray-500/10"
              }`}>
                {tab.icon}
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}

          <div className="mt-auto space-y-6">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`flex flex-col items-center ${isDarkMode ? 'text-gray-400 hover:text-yellow-400' : 'text-gray-600 hover:text-blue-500'}`}
            >
              <div className="p-3 rounded-xl bg-gray-500/10">
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </div>
              <span className="text-xs">{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>
            
            <button onClick={handleLogout} className={`flex flex-col items-center ${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-500'}`}>
              <div className="p-3 rounded-xl bg-gray-500/10">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="text-xs">Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content - Desktop */}
        <div className="flex-1 p-6 overflow-y-auto">
          {renderMainContent()}
        </div>
      </div>

      {/* Main Content - Mobile */}
      <div className="md:hidden p-4">
        {renderMainContent()}
      </div>
    </div>
  );

  function renderMainContent() {
    switch (activeTab) {
      case "profile":
        return renderProfileTab();
      case "account":
        return renderAccountTab();
      case "hierarchy":
        return renderHierarchyTab();
      case "sharelink":
        return renderShareLinkTab();
      case "settings":
        return renderSettingsTab();
      default:
        return renderProfileTab();
    }
  }

  function renderProfileTab() {
    return (
      <div className="space-y-6">
        {/* Mobile Profile Header */}
        <div className="md:hidden flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage your personal information</p>
          </div>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={handleSaveProfile}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 rounded-lg text-sm"
              >
                Save
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 text-white px-3 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Desktop Profile Header */}
        <div className="hidden md:flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold ${getAvatarColor(user!.name)}`}>
              {getInitials(user!.name)}
            </div>
            <div>
              <h1 className="text-3xl font-bold">Your Profile</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage your personal information</p>
            </div>
          </div>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-5 py-2.5 rounded-xl text-white transition-all shadow-lg">
              <Edit2 className="w-4 h-4" />Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button onClick={handleSaveProfile} className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-5 py-2.5 rounded-xl text-white transition-all">
                <Save className="w-4 h-4" />Save
              </button>
              <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 px-5 py-2.5 rounded-xl text-white transition-all">
                <X className="w-4 h-4" />Cancel
              </button>
            </div>
          )}
        </div>

        <div className={`rounded-2xl p-6 md:p-8 shadow-lg ${isDarkMode ? 'bg-slate-800/50 backdrop-blur-lg' : 'bg-white/80 backdrop-blur-lg'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {[
              { key: "name", label: "Full Name", value: formData.name },
              { key: "mobile", label: "Mobile Number", value: formData.mobile },
              { key: "email", label: "Email Address", value: formData.email },
              { key: "policeStation", label: "Police Station", value: formData.policeStation },
              { key: "walletName", label: "Wallet Name", value: formData.walletName },
              { key: "walletAddress", label: "Wallet Address", value: formData.walletAddress },
            ].map(({ key, label, value }) => (
              <div key={key} className="space-y-1 md:space-y-2">
                <label className={`block text-xs md:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {label}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className={`w-full rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base ${isDarkMode ? 'bg-slate-700/50 text-white border-slate-600 focus:border-blue-500' : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-500'} border`}
                  />
                ) : (
                  <div className={`px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl ${isDarkMode ? 'bg-slate-700/30' : 'bg-gray-50'}`}>
                    <p className={`text-sm md:text-base ${!value ? "text-gray-500 italic" : ""}`}>
                      {value || "Not provided"}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {user!.secretKey && (
            <div className="mt-6 md:mt-8 pt-6 border-t border-slate-700">
              <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Secret Key
              </label>
              <div className={`px-4 py-3 rounded-xl font-mono text-sm ${isDarkMode ? 'bg-slate-700/30' : 'bg-gray-50'}`}>
                {user!.secretKey}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderAccountTab() {
    return (
      <div className="space-y-6">
        {/* Mobile Header */}
        <div className="md:hidden space-y-4">
          <div>
            <h1 className="text-2xl font-bold">Payments</h1>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Track and manage payment history</p>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className={`px-3 py-1.5 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700/50 text-white border-slate-600' : 'bg-gray-50 text-gray-900 border-gray-300'} border`}
              >
                <option value="all">All Payments</option>
                <option value="today">Today's Payments</option>
                <option value="thisMonth">This Month's Payments</option>
              </select>
            </div>
            <button
              onClick={() => setShowAddPayment(!showAddPayment)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Add Payment
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Payment Dashboard</h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Track and manage your payment history</p>
          </div>
          <button
            onClick={() => setShowAddPayment(!showAddPayment)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-5 py-2.5 rounded-xl text-white shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Payment
          </button>
        </div>

        {/* Stats Cards - Updated to show only today, this month, and total */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[
            { 
              label: "Total Payments", 
              value: stats.total, 
              icon: DollarSign, 
              color: "blue",
              description: "All time payment total"
            },
            { 
              label: "Today's Payments", 
              value: stats.today, 
              icon: Calendar, 
              color: "green",
              description: "Payments made today"
            },
            { 
              label: "This Month", 
              value: stats.thisMonth, 
              icon: TrendingUp, 
              color: "purple",
              description: "Payments this month"
            }
          ].map((stat) => (
            <div key={stat.label} className={`p-6 rounded-2xl shadow-lg ${isDarkMode ? `bg-gradient-to-br from-${stat.color}-600/20 to-${stat.color}-700/20 border border-${stat.color}-500/20` : `bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 border border-${stat.color}-200`}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm md:text-base opacity-75 mb-1">{stat.label}</p>
                  <h3 className="text-2xl md:text-3xl font-bold">₹{stat.value}</h3>
                  <p className="text-xs opacity-60 mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-full ${isDarkMode ? `bg-${stat.color}-500/20` : `bg-${stat.color}-100`}`}>
                  <stat.icon className={`w-6 h-6 md:w-8 md:h-8 text-${stat.color}-500`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Payment Form */}
        {showAddPayment && (
          <div className={`rounded-xl md:rounded-2xl p-6 md:p-8 shadow-lg ${isDarkMode ? 'bg-slate-800/50 backdrop-blur-lg' : 'bg-white/80 backdrop-blur-lg'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg md:text-xl font-bold">Add New Payment</h3>
              <button
                onClick={() => {
                  setShowAddPayment(false);
                  setPaymentForm({ amount: "", description: "", screenshot: null });
                }}
                className="p-2 rounded-lg hover:bg-gray-500/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className={`w-full rounded-lg px-4 py-3 ${isDarkMode ? 'bg-slate-700/50 text-white border-slate-600' : 'bg-gray-50 text-gray-900 border-gray-300'} border`}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  className={`w-full rounded-lg px-4 py-3 ${isDarkMode ? 'bg-slate-700/50 text-white border-slate-600' : 'bg-gray-50 text-gray-900 border-gray-300'} border`}
                  placeholder="Payment description"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Payment Screenshot *
                </label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center ${isDarkMode ? 'border-slate-600' : 'border-gray-300'}`}>
                  {paymentForm.screenshot ? (
                    <div className="space-y-2">
                      <img
                        src={URL.createObjectURL(paymentForm.screenshot)}
                        alt="Preview"
                        className="mx-auto h-24 w-auto object-contain rounded-lg"
                      />
                      <p className="text-sm opacity-75 truncate">{paymentForm.screenshot.name}</p>
                      <button
                        onClick={() => setPaymentForm({ ...paymentForm, screenshot: null })}
                        className="text-sm text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <CreditCard className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <p className="text-sm mb-2">Upload payment proof</p>
                      <label className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer text-sm">
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setPaymentForm({ ...paymentForm, screenshot: e.target.files?.[0] || null })}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAddPayment}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg text-sm disabled:opacity-50"
                disabled={!paymentForm.amount || !paymentForm.screenshot}
              >
                Submit Payment
              </button>
              <button
                onClick={() => {
                  setShowAddPayment(false);
                  setPaymentForm({ amount: "", description: "", screenshot: null });
                }}
                className="px-4 py-3 rounded-lg border border-gray-500 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Payments List - UPDATED to remove status badges */}
        <div className={`rounded-xl md:rounded-2xl overflow-hidden shadow-lg ${isDarkMode ? 'bg-slate-800/50 backdrop-blur-lg' : 'bg-white/80 backdrop-blur-lg'}`}>
          <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg md:text-xl font-bold">Payment History</h3>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                <span>Filter by:</span>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className={`px-3 py-1 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700/50 text-white border-slate-600' : 'bg-gray-50 text-gray-900 border-gray-300'} border`}
                >
                  <option value="all">All Payments</option>
                  <option value="today">Today</option>
                  <option value="thisMonth">This Month</option>
                </select>
              </div>
            </div>
            
            {paymentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredPayments().length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  No payments found for selected filter
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPayments().map((payment) => {
                  const paymentDate = new Date(payment.createdAt);
                  const today = new Date();
                  const isToday = paymentDate.toDateString() === today.toDateString();
                  const isThisMonth = paymentDate.getMonth() === today.getMonth() && 
                                     paymentDate.getFullYear() === today.getFullYear();
                  
                  return (
                    <div key={payment._id} className={`p-4 rounded-xl border ${isDarkMode ? 'border-slate-700 bg-slate-700/30 hover:bg-slate-700/50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                            <DollarSign className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold">₹{payment.amount}</span>
                              {isToday && (
                                <span className="px-2 py-1 bg-green-500/20 text-green-600 text-xs rounded-full">
                                  Today
                                </span>
                              )}
                              {isThisMonth && !isToday && (
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-600 text-xs rounded-full">
                                  This Month
                                </span>
                              )}
                            </div>
                            {payment.description && (
                              <p className="text-sm opacity-75 mt-1">{payment.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => window.open(payment.screenshot, '_blank')}
                            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-200'}`}
                            title="View proof"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePayment(payment._id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                            title="Delete payment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm opacity-75">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{paymentDate.toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}</span>
                          <span className="mx-1">•</span>
                          <span>{paymentDate.toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                        <div className="text-xs px-2 py-1 rounded bg-gray-500/10">
                          ID: {payment._id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderHierarchyTab() {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Your Network</h1>
            <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              View all network members with complete details
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("hierarchy")}
              className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
                viewMode === "hierarchy"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                  : isDarkMode
                  ? "bg-slate-700 text-gray-300"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              <Network className="w-4 h-4" />
              <span>Tree View</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
                viewMode === "list"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                  : isDarkMode
                  ? "bg-slate-700 text-gray-300"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>List View</span>
            </button>
          </div>
        </div>

        {viewMode === "hierarchy" ? (
          <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-slate-800/50 backdrop-blur-lg' : 'bg-white/80 backdrop-blur-lg'}`}>
            {hierarchyLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : hierarchyData ? (
              <div className="space-y-3">
                {renderHierarchyNode(hierarchyData)}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Share your referral link to start building your network
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-slate-800/50 backdrop-blur-lg' : 'bg-white/80 backdrop-blur-lg'}`}>
            {hierarchyLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : hierarchyData ? (
              renderListView()
            ) : (
              <div className="text-center py-8">
                <Users className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Share your referral link to start building your network
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  function renderShareLinkTab() {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Share Referral</h1>
          <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Invite others to join your network</p>
        </div>
        
        <div className={`rounded-xl md:rounded-2xl p-6 md:p-8 ${isDarkMode ? 'bg-slate-800/50 backdrop-blur-lg' : 'bg-white/80 backdrop-blur-lg'}`}>
          <div className="mb-6">
            <h3 className="text-lg md:text-xl font-bold">Your Referral Link</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Share this link to grow your network
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={`${window.location.origin}/join/${user!.mobile}`}
                readOnly
                className={`w-full pr-32 pl-4 py-3 rounded-lg text-sm md:text-base ${isDarkMode ? 'bg-slate-700/50 text-white' : 'bg-gray-50 text-gray-900'} border ${isDarkMode ? 'border-slate-600' : 'border-gray-300'}`}
              />
              <button
                onClick={handleCopyLink}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-3 md:px-4 py-2 rounded-lg text-sm ${copied ? 'bg-green-600' : 'bg-blue-600'} text-white`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                When someone joins using your link, they will appear in your network hierarchy.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderSettingsTab() {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        
        <div className="space-y-6">
          {/* Password Update */}
          <div className={`rounded-xl md:rounded-2xl p-6 md:p-8 ${isDarkMode ? 'bg-slate-800/50 backdrop-blur-lg' : 'bg-white/80 backdrop-blur-lg'}`}>
            <div className="mb-6">
              <h3 className="text-lg md:text-xl font-bold">Update Password</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Change your account password</p>
            </div>

            {passwordMessage.text && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                passwordMessage.type === "success" 
                  ? "bg-green-500/10 text-green-300 border border-green-500/20"
                  : "bg-red-500/10 text-red-300 border border-red-500/20"
              }`}>
                {passwordMessage.text}
              </div>
            )}

            <div className="space-y-4">
              {[
                { label: "Current Password", key: "current" },
                { label: "New Password", key: "new" },
                { label: "Confirm Password", key: "confirm" }
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {label}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword[key as keyof typeof showPassword] ? "text" : "password"}
                      value={passwordForm[key as keyof PasswordFormData]}
                      onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                      className={`w-full rounded-lg px-4 py-3 pr-12 ${isDarkMode ? 'bg-slate-700/50 text-white border-slate-600' : 'bg-gray-50 text-gray-900 border-gray-300'} border`}
                      placeholder={`Enter ${label.toLowerCase()}`}
                    />
                    <button
                      onClick={() => setShowPassword({ ...showPassword, [key]: !showPassword[key as keyof typeof showPassword] })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword[key as keyof typeof showPassword] ? 
                        <EyeOff className="w-4 h-4 text-gray-400" /> : 
                        <Eye className="w-4 h-4 text-gray-400" />
                      }
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                onClick={handleUpdatePassword}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg mt-2"
              >
                Update Password
              </button>
            </div>
          </div>

          {/* Account Deletion */}
          <div className={`rounded-xl md:rounded-2xl p-6 md:p-8 border ${isDarkMode ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
            <div className="mb-4">
              <h3 className="text-lg md:text-xl font-bold text-red-500">Delete Account</h3>
              <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
                Permanent account deletion
              </p>
            </div>

            <div className="space-y-4">
              <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
                Once deleted, all your data will be permanently removed.
              </p>
              
              {!showDeleteConfirm ? (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              ) : (
                <div className="space-y-4">
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-100 border border-red-200'}`}>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                      Are you absolutely sure? This cannot be undone!
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={handleDeleteAccount}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-lg"
                    >
                      Yes, Delete
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-3 rounded-lg border border-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}