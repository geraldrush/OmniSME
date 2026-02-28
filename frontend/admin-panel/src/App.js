import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`,
});

const Icons = {
  store: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M3 7h18l-2 10a2 2 0 0 1-2 1.6H7a2 2 0 0 1-2-1.6L3 7Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 7l1.2-3h11.6L19 7"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 21v-6h6v6"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  chart: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M4 20h16"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 16v-6"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 16V8"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 16v-3"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  box: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M3 7.5 12 3l9 4.5-9 4.5-9-4.5Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 12v9"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 7.5v9L12 21l-9-4.5v-9"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  cart: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M3 5h2l2.4 10.5a2 2 0 0 0 2 1.5h7.9a2 2 0 0 0 2-1.6L20 8H7.2"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  star: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="m12 2 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20l1.2-6.5L2.5 8.9l6.6-.9L12 2Z" />
    </svg>
  ),
  settings: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.4 15a7.8 7.8 0 0 0 .1-6l-2 .7a6 6 0 0 0-1.2-1.2l.7-2a7.8 7.8 0 0 0-6-.1l.7 2a6 6 0 0 0-1.2 1.2l-2-.7a7.8 7.8 0 0 0-.1 6l2-.7a6 6 0 0 0 1.2 1.2l-.7 2a7.8 7.8 0 0 0 6 .1l-.7-2a6 6 0 0 0 1.2-1.2Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  money: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M3 7h18v10H3z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 12h.01M17 12h.01M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  check: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M5 12l4 4 10-10"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  card: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        strokeWidth="1.6"
      />
      <path d="M3 10h18" strokeWidth="1.6" />
    </svg>
  ),
  bank: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M3 10h18M5 10v8M9 10v8M15 10v8M19 10v8M3 18h18M12 4l9 5H3l9-5Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

// Add JWT token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(!isLoggedIn);
  const [authMode, setAuthMode] = useState("login");
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [merchantShopLink, setMerchantShopLink] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminOverview, setAdminOverview] = useState({
    merchants: 0,
    users: 0,
    orders: 0,
    payments: 0,
    revenue: 0,
  });
  const [adminMerchants, setAdminMerchants] = useState([]);
  const [adminServices, setAdminServices] = useState([]);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);

  // Data states
  const [dashboard, setDashboard] = useState({
    totalOrders: 0,
    revenue: 0,
    products: 0,
    customers: 0,
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [storeInfo, setStoreInfo] = useState({
    storeId: "",
    storeSlug: "",
    storeName: "My Store",
    email: "owner@example.com",
    paymentMethods: ["whatsapp", "payfast", "bank_transfer"],
    whatsappNumber: "",
    bankDetails: "",
  });
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category: "Electronics",
    price: "",
    stock: "",
  });
  const reviewBreakdown = [
    { stars: 5, count: 160 },
    { stars: 4, count: 48 },
    { stars: 3, count: 22 },
    { stars: 2, count: 9 },
    { stars: 1, count: 4 },
  ];
  const totalReviews = reviewBreakdown.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  // Fetch dashboard data
  useEffect(() => {
    if (isLoggedIn) {
      loadDashboardData();
      loadProducts();
    }
  }, [isLoggedIn]);

  const loadDashboardData = async () => {
    try {
      const response = await axiosInstance.get("/orders");
      const ordersList = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.orders)
          ? response.data.orders
          : [];
      setOrders(ordersList);
      setDashboard({
        totalOrders: ordersList.length,
        revenue:
          ordersList.reduce((sum, o) => sum + (Number(o.total) || 0), 0) || 0,
        products: 0,
        customers: 0,
      });
    } catch (error) {
      console.log("Dashboard data loaded (demo)");
    }
  };

  const loadProducts = async () => {
    try {
      const response = await axiosInstance.get("/products?limit=200");
      const apiProducts = Array.isArray(response.data?.products)
        ? response.data.products
        : [];
      const normalized = apiProducts.map((product) => ({
        id: product.id,
        name: product.name || product.product_name || "Untitled",
        description: product.description || "",
        category: product.category || product.category_name || "Other",
        price: product.price ?? "",
        stock: product.stock ?? product.quantity_in_stock ?? "",
      }));
      setProducts(normalized);
    } catch (error) {
      console.log("Products loaded (demo)");
    }
  };

  const loadSuperAdminData = async () => {
    try {
      setIsLoadingAdmin(true);
      const [overviewResponse, merchantsResponse, systemResponse] =
        await Promise.all([
          axiosInstance.get("/admin/overview"),
          axiosInstance.get("/admin/merchants"),
          axiosInstance.get("/admin/system"),
        ]);

      setAdminOverview(overviewResponse.data?.overview || adminOverview);
      setAdminMerchants(
        Array.isArray(merchantsResponse.data?.merchants)
          ? merchantsResponse.data.merchants
          : [],
      );
      setAdminServices(
        Array.isArray(systemResponse.data?.services)
          ? systemResponse.data.services
          : [],
      );
    } catch (error) {
      alert(
        "Failed to load super admin data: " +
          (error.response?.data?.error || error.message),
      );
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn || !storeInfo.storeId) {
      return;
    }

    const loadStoreSettings = async () => {
      try {
        const response = await axiosInstance.get(`/stores/by-id/${storeInfo.storeId}`);
        const store = response.data?.store;
        if (store) {
          setStoreInfo((prev) => ({
            ...prev,
            storeName: store.store_name || prev.storeName,
            storeSlug: store.store_slug || prev.storeSlug,
            paymentMethods: store.payment_methods?.length
              ? store.payment_methods
              : prev.paymentMethods,
            whatsappNumber: store.whatsapp_number || "",
            bankDetails:
              typeof store.bank_details === "string"
                ? store.bank_details
                : JSON.stringify(store.bank_details || ""),
          }));

          if (store.store_slug) {
            setMerchantShopLink(`${API_URL}/shop/${store.store_slug}`);
          }
        }
      } catch (error) {
        console.log("Store settings load skipped");
      }
    };

    loadStoreSettings();
  }, [isLoggedIn, storeInfo.storeId]);

  useEffect(() => {
    if (!isLoggedIn || !isSuperAdmin || activeTab !== "super-admin") {
      return;
    }
    loadSuperAdminData();
  }, [isLoggedIn, isSuperAdmin, activeTab]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const email = document.getElementById("loginEmail")?.value;
      const password = document.getElementById("loginPassword")?.value;
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      const userType = response.data?.user?.user_type;
      const superAdmin = userType === "admin";
      setIsSuperAdmin(superAdmin);
      setActiveTab(superAdmin ? "super-admin" : "dashboard");
      const store = response.data?.store;
      if (store && !superAdmin) {
        setStoreInfo((prev) => ({
          ...prev,
          storeId: store.id || prev.storeId,
          storeSlug: store.store_slug || prev.storeSlug,
          storeName: store.store_name || prev.storeName,
          email,
        }));
        if (store.store_slug) {
          setMerchantShopLink(`${API_URL}/shop/${store.store_slug}`);
        }
      }
      setIsLoggedIn(true);
      setShowLoginModal(false);
      loadDashboardData();
    } catch (error) {
      alert(
        "Login failed: " + (error.response?.data?.message || error.message),
      );
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (isSavingProduct) {
      return;
    }
    try {
      setIsSavingProduct(true);
      const response = await axiosInstance.post("/products", newProduct);
      const createdProduct = response.data?.product
        ? { ...newProduct, ...response.data.product }
        : { id: Date.now(), ...newProduct };
      setNewProduct({
        name: "",
        description: "",
        category: "Electronics",
        price: "",
        stock: "",
      });
      setShowAddProductModal(false);
      setProducts([...products, createdProduct]);
      setDashboard({ ...dashboard, products: dashboard.products + 1 });
    } catch (error) {
      alert(
        "Failed to add product: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleMerchantSignup = async (e) => {
    e.preventDefault();
    try {
      const name = document.getElementById("signupName")?.value;
      const businessName = document.getElementById("signupBusinessName")?.value;
      const email = document.getElementById("signupEmail")?.value;
      const password = document.getElementById("signupPassword")?.value;
      const businessRegistration = document.getElementById(
        "signupBusinessRegistration",
      )?.value;

      const response = await axiosInstance.post("/auth/signup", {
        name,
        full_name: name,
        email,
        password,
        user_type: "sme_owner",
        businessName,
        businessRegistration,
      });

      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
      }

      setIsSuperAdmin(false);

      const createdStoreName = response.data?.store?.store_name || businessName || "My Store";
      const createdStoreId = response.data?.store?.id || "";
      const createdStoreSlug = response.data?.store?.store_slug || "";
      const shopPath = response.data?.links?.shop || response.data?.store?.shop_url || "";
      setStoreInfo((prev) => ({
        ...prev,
        storeId: createdStoreId,
        storeSlug: createdStoreSlug,
        storeName: createdStoreName,
        email,
      }));
      setMerchantShopLink(shopPath ? `${API_URL}${shopPath}` : "");

      setIsLoggedIn(true);
      setShowLoginModal(false);
      loadDashboardData();
    } catch (error) {
      alert(
        "Signup failed: " + (error.response?.data?.message || error.message),
      );
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!productId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );
    if (!confirmed) {
      return;
    }

    try {
      await axiosInstance.delete(`/products/${productId}`);
      setProducts(products.filter((product) => product.id !== productId));
      setDashboard((prev) => ({
        ...prev,
        products: Math.max(0, prev.products - 1),
      }));
    } catch (error) {
      alert(
        "Failed to delete product: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setIsSuperAdmin(false);
    setActiveTab("dashboard");
    setShowLoginModal(true);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axiosInstance.put(`/orders/${orderId}/status`, {
        status: newStatus,
      });
      setOrders((prev) =>
        Array.isArray(prev)
          ? prev.map((o) =>
              o.id === orderId ? { ...o, status: newStatus } : o,
            )
          : prev,
      );
    } catch (error) {
      alert("Failed to update order");
    }
  };

  const handleStoreSettingsSave = async () => {
    if (!storeInfo.storeId) {
      alert("Store ID missing. Sign in again as merchant.");
      return;
    }
    try {
      const response = await axiosInstance.patch(
        `/stores/${storeInfo.storeId}/settings`,
        {
          payment_methods: storeInfo.paymentMethods,
          whatsapp_number: storeInfo.whatsappNumber,
          bank_details: storeInfo.bankDetails,
        },
      );

      const updated = response.data?.store;
      if (updated) {
        setStoreInfo((prev) => ({
          ...prev,
          storeName: updated.store_name || prev.storeName,
          storeSlug: updated.store_slug || prev.storeSlug,
          paymentMethods: updated.payment_methods || prev.paymentMethods,
          whatsappNumber: updated.whatsapp_number || "",
          bankDetails:
            typeof updated.bank_details === "string"
              ? updated.bank_details
              : JSON.stringify(updated.bank_details || ""),
        }));
      }
      alert("Store settings saved.");
    } catch (error) {
      alert(
        "Failed to save settings: " +
          (error.response?.data?.error || error.message),
      );
    }
  };

  const safeOrders = Array.isArray(orders) ? orders : [];

  if (showLoginModal && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SME Store</h1>
          <p className="text-gray-600 mb-6">Sign in or create your merchant store</p>
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                authMode === "login"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("signup")}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                authMode === "signup"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Merchant Sign Up
            </button>
          </div>

          {authMode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="loginEmail"
                  type="email"
                  placeholder="owner@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="loginPassword"
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleMerchantSignup} className="space-y-4">
              <input
                id="signupName"
                type="text"
                placeholder="Your full name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <input
                id="signupBusinessName"
                type="text"
                placeholder="Business name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <input
                id="signupEmail"
                type="email"
                placeholder="business@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <input
                id="signupPassword"
                type="password"
                placeholder="Create password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <input
                id="signupBusinessRegistration"
                type="text"
                placeholder="Business registration (optional)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Create Merchant Account
              </button>
            </form>
          )}

          <p className="text-center text-gray-600 mt-4 text-sm">
            Demo environment: signup returns placeholder auth token.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 w-64 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 shadow-lg">
        <div className="mb-8">
          <h1 className="text-2xl font-bold inline-flex items-center gap-2">
            <Icons.store className="h-6 w-6 text-blue-400" aria-hidden="true" />
            SME Store
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {isSuperAdmin ? "Platform Super Admin" : storeInfo.storeName}
          </p>
          {merchantShopLink && !isSuperAdmin ? (
            <a
              href={merchantShopLink}
              target="_blank"
              rel="noreferrer"
              className="text-blue-300 text-xs mt-2 inline-block hover:text-blue-200"
            >
              View public shop
            </a>
          ) : null}
        </div>
        <nav className="space-y-2">
          {[
            ...(isSuperAdmin
              ? [{ id: "super-admin", icon: Icons.chart, label: "Super Admin" }]
              : []),
            { id: "dashboard", icon: Icons.chart, label: "Dashboard" },
            ...(!isSuperAdmin
              ? [
                  { id: "products", icon: Icons.box, label: "Products" },
                  { id: "orders", icon: Icons.cart, label: "Orders" },
                  { id: "reviews", icon: Icons.star, label: "Reviews & Ratings" },
                  { id: "settings", icon: Icons.settings, label: "Settings" },
                ]
              : []),
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition inline-flex items-center gap-3 ${
                  activeTab === item.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="w-full mt-8 px-4 py-3 bg-red-600 rounded-lg text-white hover:bg-red-700 transition"
        >
          Sign Out
        </button>
      </aside>

      <div className="ml-64 min-h-screen">
        {/* Top Header */}
        <header className="bg-white shadow">
          <div className="px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {["super-admin", "dashboard", "products", "orders", "reviews", "settings"].find(
                (tab) => tab === activeTab,
              ) === "super-admin"
                ? "Super Admin Dashboard"
                : activeTab === "dashboard"
                ? "Dashboard"
                : activeTab === "products"
                  ? "Products"
                  : activeTab === "orders"
                    ? "Orders"
                    : activeTab === "reviews"
                      ? "Reviews & Ratings"
                      : "Settings"}
            </h2>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {activeTab === "super-admin" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Platform Overview</h3>
                <button
                  onClick={loadSuperAdminData}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                >
                  Refresh
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl shadow p-4">
                  <p className="text-gray-500 text-sm">Merchants</p>
                  <p className="text-3xl font-bold text-gray-900">{adminOverview.merchants}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                  <p className="text-gray-500 text-sm">Users</p>
                  <p className="text-3xl font-bold text-gray-900">{adminOverview.users}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                  <p className="text-gray-500 text-sm">Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{adminOverview.orders}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                  <p className="text-gray-500 text-sm">Payments</p>
                  <p className="text-3xl font-bold text-gray-900">{adminOverview.payments}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                  <p className="text-gray-500 text-sm">Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">
                    R{Number(adminOverview.revenue || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">System Health</h3>
                {isLoadingAdmin ? (
                  <p className="text-gray-500">Loading system status...</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {adminServices.map((service) => (
                      <div
                        key={service.service}
                        className="border border-gray-200 rounded-lg p-3 flex items-center justify-between"
                      >
                        <span className="font-medium text-gray-800">{service.service}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            service.status === "up"
                              ? "bg-green-100 text-green-700"
                              : service.status === "degraded"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {service.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Merchants</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Store</th>
                        <th className="px-4 py-2 text-left">Slug</th>
                        <th className="px-4 py-2 text-left">Orders</th>
                        <th className="px-4 py-2 text-left">Revenue</th>
                        <th className="px-4 py-2 text-left">Products</th>
                        <th className="px-4 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminMerchants.map((merchant) => (
                        <tr key={merchant.id} className="border-b">
                          <td className="px-4 py-2">{merchant.store_name}</td>
                          <td className="px-4 py-2 text-gray-600">{merchant.store_slug}</td>
                          <td className="px-4 py-2">{merchant.orders_count}</td>
                          <td className="px-4 py-2">R{Number(merchant.revenue || 0).toFixed(2)}</td>
                          <td className="px-4 py-2">{merchant.products_count}</td>
                          <td className="px-4 py-2">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                merchant.is_active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {merchant.is_active ? "active" : "inactive"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard */}
          {activeTab === "dashboard" && !isSuperAdmin && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-blue-100 text-sm">Total Orders</p>
                      <p className="text-4xl font-bold mt-2">
                        {dashboard.totalOrders}
                      </p>
                      <p className="text-blue-100 text-xs mt-2">
                        +12% this month
                      </p>
                    </div>
                    <Icons.cart className="h-10 w-10" aria-hidden="true" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-green-100 text-sm">Revenue</p>
                      <p className="text-4xl font-bold mt-2">
                        R{dashboard.revenue.toFixed(2)}
                      </p>
                      <p className="text-green-100 text-xs mt-2">
                        +8% from last month
                      </p>
                    </div>
                    <Icons.money className="h-10 w-10" aria-hidden="true" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-purple-100 text-sm">Products</p>
                      <p className="text-4xl font-bold mt-2">
                        {dashboard.products}
                      </p>
                      <p className="text-purple-100 text-xs mt-2">
                        Active listings
                      </p>
                    </div>
                    <Icons.box className="h-10 w-10" aria-hidden="true" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-orange-100 text-sm">Store Rating</p>
                      <p className="text-4xl font-bold mt-2">4.8★</p>
                      <p className="text-orange-100 text-xs mt-2">
                        From 243 reviews
                      </p>
                    </div>
                    <Icons.star className="h-10 w-10 text-yellow-200" aria-hidden="true" />
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Recent Orders
                </h3>
                {safeOrders.length === 0 ? (
                  <p className="text-gray-500">
                    No orders yet. Check back soon!
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left">Order ID</th>
                          <th className="px-4 py-2 text-left">Customer</th>
                          <th className="px-4 py-2 text-left">Total</th>
                          <th className="px-4 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {safeOrders.slice(0, 5).map((order) => (
                          <tr
                            key={order.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="px-4 py-2 font-mono text-blue-600">
                              #{order.id}
                            </td>
                            <td className="px-4 py-2">
                              {order.customerName || "Guest"}
                            </td>
                            <td className="px-4 py-2">
                              R{(order.total || 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  order.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : order.status === "confirmed"
                                      ? "bg-blue-100 text-blue-800"
                                      : order.status === "shipped"
                                        ? "bg-purple-100 text-purple-800"
                                        : "bg-green-100 text-green-800"
                                }`}
                              >
                                {order.status || "pending"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Products Manager */}
          {activeTab === "products" && !isSuperAdmin && (
            <div className="space-y-6">
              <button
                onClick={() => setShowAddProductModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                + Add New Product
              </button>

              {showAddProductModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-2xl">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      Add New Product
                    </h3>
                    <form onSubmit={handleAddProduct} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Product Name"
                          value={newProduct.name}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              name: e.target.value,
                            })
                          }
                          className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <select
                          value={newProduct.category}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              category: e.target.value,
                            })
                          }
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option>Electronics</option>
                          <option>Clothing</option>
                          <option>Food & Beverages</option>
                          <option>Beauty</option>
                          <option>Home & Garden</option>
                        </select>
                        <input
                          type="number"
                          placeholder="Price (R)"
                          value={newProduct.price}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              price: e.target.value,
                            })
                          }
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Stock Quantity"
                          value={newProduct.stock}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              stock: e.target.value,
                            })
                          }
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <textarea
                        placeholder="Product Description"
                        value={newProduct.description}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24"
                      />
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={isSavingProduct}
                          className={`flex-1 py-2 rounded-lg font-semibold transition ${
                            isSavingProduct
                              ? "bg-blue-300 text-white cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {isSavingProduct ? "Adding..." : "Add Product"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddProductModal(false)}
                          className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {products.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <p className="text-gray-500 text-lg mb-4 inline-flex items-center justify-center gap-2">
                    <Icons.box className="h-5 w-5" aria-hidden="true" />
                    No products yet
                  </p>
                  <p className="text-gray-400">
                    Create your first product to start selling!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg shadow-lg p-4"
                    >
                      <div className="bg-gray-200 h-32 rounded-lg mb-3"></div>
                      <h4 className="font-bold text-gray-900">
                        {product.name}
                      </h4>
                      <p className="text-gray-600 text-sm mt-1">
                        {product.category}
                      </p>
                      <p className="text-blue-600 font-bold text-lg mt-2">
                        R{product.price}
                      </p>
                      <p className="text-gray-500 text-sm">
                        Stock: {product.stock}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button className="flex-1 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="flex-1 bg-red-600 text-white py-2 rounded text-sm hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders Management */}
          {activeTab === "orders" && !isSuperAdmin && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Manage Orders
              </h3>
              {safeOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-12">
                  No orders yet. Orders will appear here!
                </p>
              ) : (
                <div className="space-y-4">
                  {safeOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-gray-900">
                            Order #{order.id}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {order.customerName || "Guest"}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "confirmed"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "shipped"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-green-100 text-green-800"
                          }`}
                        >
                          {order.status || "pending"}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">
                        Total:{" "}
                        <span className="font-bold text-lg">
                          R{(order.total || 0).toFixed(2)}
                        </span>
                      </p>
                      <div className="flex gap-2">
                        {["pending", "confirmed", "shipped", "delivered"].map(
                          (status) => (
                            <button
                              key={status}
                              onClick={() =>
                                updateOrderStatus(order.id, status)
                              }
                              className={`px-3 py-1 rounded text-sm font-semibold transition ${
                                order.status === status
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews & Ratings */}
          {activeTab === "reviews" && !isSuperAdmin && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Customer Reviews & Ratings
              </h3>
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg inline-flex items-center gap-2">
                  <Icons.star className="h-4 w-4 text-yellow-400" aria-hidden="true" />
                  4.8 / 5.0
                </p>
                <p className="text-gray-400 mt-2">
                  {totalReviews} total reviews
                </p>
                <div className="mt-6 space-y-2">
                  {reviewBreakdown.map((item) => (
                    <div key={item.stars} className="flex items-center gap-3">
                      <span className="w-12 inline-flex">
                        {Array.from({ length: item.stars }).map((_, idx) => (
                          <Icons.star
                            key={`${item.stars}-${idx}`}
                            className="h-3 w-3 text-yellow-400"
                            aria-hidden="true"
                          />
                        ))}
                      </span>
                      <div className="flex-1 bg-gray-200 h-2 rounded">
                        <div
                          className="bg-yellow-400 h-2 rounded"
                          style={{
                            width: `${
                              totalReviews > 0
                                ? (item.count / totalReviews) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="w-12 text-right text-gray-600">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && !isSuperAdmin && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Store Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={storeInfo.storeName}
                      onChange={(e) =>
                        setStoreInfo({
                          ...storeInfo,
                          storeName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={storeInfo.email}
                      onChange={(e) =>
                        setStoreInfo({ ...storeInfo, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <button
                    onClick={handleStoreSettingsSave}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Save Settings
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Payment Methods
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2 rounded-lg border border-gray-200 p-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={storeInfo.paymentMethods.includes("whatsapp")}
                        onChange={(e) =>
                          setStoreInfo((prev) => ({
                            ...prev,
                            paymentMethods: e.target.checked
                              ? [...new Set([...prev.paymentMethods, "whatsapp"])]
                              : prev.paymentMethods.filter((m) => m !== "whatsapp"),
                          }))
                        }
                      />
                      WhatsApp Orders
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={storeInfo.paymentMethods.includes("payfast")}
                        onChange={(e) =>
                          setStoreInfo((prev) => ({
                            ...prev,
                            paymentMethods: e.target.checked
                              ? [...new Set([...prev.paymentMethods, "payfast"])]
                              : prev.paymentMethods.filter((m) => m !== "payfast"),
                          }))
                        }
                      />
                      PayFast
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={storeInfo.paymentMethods.includes("bank_transfer")}
                        onChange={(e) =>
                          setStoreInfo((prev) => ({
                            ...prev,
                            paymentMethods: e.target.checked
                              ? [...new Set([...prev.paymentMethods, "bank_transfer"])]
                              : prev.paymentMethods.filter((m) => m !== "bank_transfer"),
                          }))
                        }
                      />
                      Bank Transfer
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={storeInfo.whatsappNumber}
                      onChange={(e) =>
                        setStoreInfo({
                          ...storeInfo,
                          whatsappNumber: e.target.value,
                        })
                      }
                      placeholder="2782..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Details
                    </label>
                    <textarea
                      value={storeInfo.bankDetails}
                      onChange={(e) =>
                        setStoreInfo({
                          ...storeInfo,
                          bankDetails: e.target.value,
                        })
                      }
                      placeholder="Bank, account, branch, reference instructions"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24"
                    />
                  </div>

                  <button
                    onClick={handleStoreSettingsSave}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    Save Payment Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
