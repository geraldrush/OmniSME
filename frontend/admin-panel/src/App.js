import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`,
});

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
    storeName: "My Store",
    email: "owner@example.com",
  });
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category: "Electronics",
    price: "",
    stock: "",
  });

  // Fetch dashboard data
  useEffect(() => {
    if (isLoggedIn) {
      loadDashboardData();
    }
  }, [isLoggedIn]);

  const loadDashboardData = async () => {
    try {
      const response = await axiosInstance.get("/orders");
      setOrders(response.data || []);
      setDashboard({
        totalOrders: response.data?.length || 0,
        revenue:
          response.data?.reduce((sum, o) => sum + (o.total || 0), 0) || 0,
        products: 0,
        customers: 0,
      });
    } catch (error) {
      console.log("Dashboard data loaded (demo)");
    }
  };

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
    try {
      await axiosInstance.post("/products", newProduct);
      setNewProduct({
        name: "",
        description: "",
        category: "Electronics",
        price: "",
        stock: "",
      });
      setShowAddProductModal(false);
      setProducts([...products, { id: Date.now(), ...newProduct }]);
      setDashboard({ ...dashboard, products: dashboard.products + 1 });
    } catch (error) {
      alert(
        "Failed to add product: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setShowLoginModal(true);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axiosInstance.put(`/orders/${orderId}/status`, {
        status: newStatus,
      });
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
    } catch (error) {
      alert("Failed to update order");
    }
  };

  if (showLoginModal && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SME Store</h1>
          <p className="text-gray-600 mb-8">Login to manage your store</p>
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
          <p className="text-center text-gray-600 mt-4 text-sm">
            Demo: Use any email/password
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
          <h1 className="text-2xl font-bold">📦 SME Store</h1>
          <p className="text-gray-400 text-sm mt-1">{storeInfo.storeName}</p>
        </div>
        <nav className="space-y-2">
          {[
            { id: "dashboard", icon: "📊", label: "Dashboard" },
            { id: "products", icon: "📦", label: "Products" },
            { id: "orders", icon: "🛒", label: "Orders" },
            { id: "reviews", icon: "⭐", label: "Reviews & Ratings" },
            { id: "settings", icon: "⚙️", label: "Settings" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                activeTab === item.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
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
              {["dashboard", "products", "orders", "reviews", "settings"].find(
                (tab) => tab === activeTab,
              ) === "dashboard"
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
          {/* Dashboard */}
          {activeTab === "dashboard" && (
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
                    <span className="text-4xl">🛒</span>
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
                    <span className="text-4xl">💰</span>
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
                    <span className="text-4xl">📦</span>
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
                    <span className="text-4xl">⭐</span>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Recent Orders
                </h3>
                {orders.length === 0 ? (
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
                        {orders.slice(0, 5).map((order) => (
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
          {activeTab === "products" && (
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
                          className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                          Add Product
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
                  <p className="text-gray-500 text-lg mb-4">
                    📦 No products yet
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
                        <button className="flex-1 bg-red-600 text-white py-2 rounded text-sm hover:bg-red-700">
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
          {activeTab === "orders" && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Manage Orders
              </h3>
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-12">
                  No orders yet. Orders will appear here!
                </p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
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
          {activeTab === "reviews" && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Customer Reviews & Ratings
              </h3>
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">⭐ 4.8 / 5.0</p>
                <p className="text-gray-400 mt-2">243 total reviews</p>
                <div className="mt-6 space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="w-12">{"⭐".repeat(stars)}</span>
                      <div className="flex-1 bg-gray-200 h-2 rounded">
                        <div
                          className="bg-yellow-400 h-2 rounded"
                          style={{ width: `${Math.random() * 100}%` }}
                        ></div>
                      </div>
                      <span className="w-12 text-right text-gray-600">
                        {Math.floor(Math.random() * 50)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
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
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                    Save Settings
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Payment Methods
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    <span className="text-2xl">💳</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        PayFast Account
                      </p>
                      <p className="text-sm text-gray-500">
                        Connected and verified
                      </p>
                    </div>
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    <span className="text-2xl">🏦</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Bank Account</p>
                      <p className="text-sm text-gray-500">
                        •••• •••• •••• 1234
                      </p>
                    </div>
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
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
