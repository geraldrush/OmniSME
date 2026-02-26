import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showCartModal, setShowCartModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Wireless Headphones",
      price: 299.99,
      store: "TechStore",
      category: "Electronics",
      rating: 4.8,
      reviews: 234,
    },
    {
      id: 2,
      name: "Phone Case",
      price: 49.99,
      store: "AccessoriesTown",
      category: "Electronics",
      rating: 4.5,
      reviews: 89,
    },
    {
      id: 3,
      name: "T-Shirt",
      price: 89.99,
      store: "FashionHub",
      category: "Clothing",
      rating: 4.6,
      reviews: 156,
    },
    {
      id: 4,
      name: "Coffee Beans",
      price: 29.99,
      store: "CoffeeShop",
      category: "Food",
      rating: 4.9,
      reviews: 412,
    },
    {
      id: 5,
      name: "Face Cream",
      price: 199.99,
      store: "BeautyFirst",
      category: "Beauty",
      rating: 4.7,
      reviews: 203,
    },
    {
      id: 6,
      name: "Plant Pot",
      price: 39.99,
      store: "GardenHome",
      category: "Home",
      rating: 4.4,
      reviews: 67,
    },
  ]);

  const [cart, setCart] = useState([]);
  const [userInfo, setUserInfo] = useState({
    email: "",
    name: "",
    address: "",
    phone: "",
  });

  const categories = [
    { id: "all", name: "All Products", emoji: "🏪" },
    { id: "Electronics", name: "Electronics", emoji: "⚡" },
    { id: "Clothing", name: "Clothing", emoji: "👕" },
    { id: "Food", name: "Food & Beverages", emoji: "🍽️" },
    { id: "Beauty", name: "Beauty", emoji: "💄" },
    { id: "Home", name: "Home & Garden", emoji: "🏡" },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.store.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const handleUpdateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCart(
        cart.map((item) =>
          item.id === productId ? { ...item, quantity } : item,
        ),
      );
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const email = document.getElementById("authEmail")?.value;
      const password = document.getElementById("authPassword")?.value;
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      setIsLoggedIn(true);
      setShowAuthModal(false);
    } catch (error) {
      alert(
        "Login failed: " + (error.response?.data?.message || error.message),
      );
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const name = document.getElementById("authName")?.value;
      const email = document.getElementById("authEmail")?.value;
      const password = document.getElementById("authPassword")?.value;
      const response = await axiosInstance.post("/auth/signup", {
        name,
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      setIsLoggedIn(true);
      setShowAuthModal(false);
    } catch (error) {
      alert(
        "Signup failed: " + (error.response?.data?.message || error.message),
      );
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        items: cart,
        shippingAddress: userInfo.address,
        customerName: userInfo.name,
      };
      await axiosInstance.post("/orders", orderData);
      alert("Order placed successfully!");
      setCart([]);
      setShowCheckoutModal(false);
    } catch (error) {
      alert(
        "Checkout failed: " + (error.response?.data?.message || error.message),
      );
    }
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🛍️</span>
              <h1 className="text-2xl font-bold text-gray-900">SME Store</h1>
            </div>

            <div className="flex-1 max-w-md mx-6">
              <input
                type="text"
                placeholder="Search products, stores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    setIsLoggedIn(false);
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  👤 Sign Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setAuthMode("login");
                  }}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  👤 Sign In
                </button>
              )}

              <button
                onClick={() => setShowCartModal(true)}
                className="relative flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                🛒 Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex overflow-x-auto gap-2 pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-semibold transition ${
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.emoji} {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Welcome to SME Store</h2>
          <p className="text-xl text-blue-100">
            Discover amazing products from local businesses at great prices
          </p>
          <p className="text-blue-200 mt-2">
            ✓ Direct from SMEs • ✓ Authentic Products • ✓ Best Prices
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {selectedCategory === "all"
              ? "All Products"
              : categories.find((c) => c.id === selectedCategory)?.name}
          </h3>
          <p className="text-gray-600 mt-1">
            {filteredProducts.length} products available
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">🔍</span>
            <p className="text-gray-600 text-xl">
              No products found. Try a different search or category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden group"
              >
                <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-48 flex items-center justify-center overflow-hidden group-hover:from-blue-200 group-hover:to-blue-300 transition">
                  <span className="text-6xl">📦</span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-gray-900 flex-1">
                      {product.name}
                    </h4>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      ⭐ {product.rating}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{product.store}</p>
                  <p className="text-gray-500 text-xs mb-2">
                    ({product.reviews} reviews)
                  </p>

                  <div className="border-t border-gray-200 my-3"></div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-blue-600 font-bold text-lg">
                        R{product.price.toFixed(2)}
                      </p>
                      <p className="text-gray-500 text-xs line-through">
                        R{(product.price * 1.2).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart Modal */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="bg-white w-full md:w-96 h-screen md:h-auto rounded-t-2xl md:rounded-2xl flex flex-col max-h-screen md:max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold">🛒 Your Cart</h3>
              <button
                onClick={() => setShowCartModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Add products to get started!
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                        <p className="text-gray-600 text-sm">{item.store}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-600 font-bold">
                        R{(item.price * item.quantity).toFixed(2)}
                      </span>
                      <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                          className="px-2 py-1 text-gray-600 hover:text-gray-900"
                        >
                          −
                        </button>
                        <span className="px-3 font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                          className="px-2 py-1 text-gray-600 hover:text-gray-900"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-200 bg-white p-6 sticky bottom-0">
                <div className="mb-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-semibold">
                      R{cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Shipping:</span>
                    <span className="font-semibold">R50.00 (est.)</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2">
                    <span className="font-bold text-lg">Total:</span>
                    <span className="font-bold text-lg text-blue-600">
                      R{(cartTotal + 50).toFixed(2)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!isLoggedIn) {
                      setShowAuthModal(true);
                      setAuthMode("login");
                      return;
                    }
                    setShowCheckoutModal(true);
                    setShowCartModal(false);
                  }}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setAuthMode("login")}
                className={`flex-1 py-2 font-bold rounded-lg transition ${
                  authMode === "login"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode("signup")}
                className={`flex-1 py-2 font-bold rounded-lg transition ${
                  authMode === "signup"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Create Account
              </button>
            </div>

            {authMode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  id="authEmail"
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  id="authPassword"
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                >
                  Sign In
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <input
                  id="authName"
                  type="text"
                  placeholder="Full Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  id="authEmail"
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  id="authPassword"
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                >
                  Create Account
                </button>
              </form>
            )}

            <button
              onClick={() => setShowAuthModal(false)}
              className="w-full mt-4 text-gray-600 hover:text-gray-900 font-semibold"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl max-h-screen overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h3>
            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userInfo.name}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={userInfo.email}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={userInfo.phone}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address
                </label>
                <textarea
                  value={userInfo.address}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, address: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20"
                  required
                ></textarea>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-6">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span>R{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping:</span>
                    <span>R50.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span className="text-blue-600">
                      R{(cartTotal + 50).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
              >
                Complete Order
              </button>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="w-full bg-gray-300 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-400 transition"
              >
                Back to Cart
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
