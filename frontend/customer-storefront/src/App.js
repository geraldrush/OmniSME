import React, { useState, useEffect } from "react";
import axios from "axios";
import { Routes, Route, Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

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

const Icons = {
  bag: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M3 7h18l-1.5 12a2 2 0 0 1-2 1.8H6.5a2 2 0 0 1-2-1.8L3 7Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 7a3 3 0 0 1 6 0"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  user: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 20a8 8 0 0 1 16 0"
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
  search: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 21l-4.35-4.35"
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
};

const demoProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 299.99,
    store: "TechStore",
    store_id: "demo-techstore",
    store_slug: "techstore",
    category: "Electronics",
    rating: 4.8,
    reviews: 234,
  },
  {
    id: 2,
    name: "Phone Case",
    price: 49.99,
    store: "AccessoriesTown",
    store_id: "demo-accessoriestown",
    store_slug: "accessoriestown",
    category: "Electronics",
    rating: 4.5,
    reviews: 89,
  },
  {
    id: 3,
    name: "T-Shirt",
    price: 89.99,
    store: "FashionHub",
    store_id: "demo-fashionhub",
    store_slug: "fashionhub",
    category: "Clothing",
    rating: 4.6,
    reviews: 156,
  },
  {
    id: 4,
    name: "Coffee Beans",
    price: 29.99,
    store: "CoffeeShop",
    store_id: "demo-coffeeshop",
    store_slug: "coffeeshop",
    category: "Food & Beverages",
    rating: 4.9,
    reviews: 412,
  },
  {
    id: 5,
    name: "Face Cream",
    price: 199.99,
    store: "BeautyFirst",
    store_id: "demo-beautyfirst",
    store_slug: "beautyfirst",
    category: "Beauty",
    rating: 4.7,
    reviews: 203,
  },
  {
    id: 6,
    name: "Plant Pot",
    price: 39.99,
    store: "GardenHome",
    store_id: "demo-gardenhome",
    store_slug: "gardenhome",
    category: "Home & Garden",
    rating: 4.4,
    reviews: 67,
  },
];

const normalizeCategory = (value) => {
  const known = new Set([
    "Electronics",
    "Clothing",
    "Food & Beverages",
    "Beauty",
    "Home & Garden",
  ]);
  return known.has(value) ? value : "Other";
};

const normalizeStorefrontProduct = (product) => {
  const metadata =
    product && typeof product.metadata === "string"
      ? (() => {
          try {
            return JSON.parse(product.metadata);
          } catch (error) {
            return {};
          }
        })()
      : product?.metadata || {};
  const rating = Number(
    product?.rating ?? metadata?.rating ?? product?.metadata?.rating ?? 0,
  );
  const reviews = Number(
    product?.reviews ?? metadata?.reviews ?? product?.metadata?.reviews ?? 0,
  );

  return {
    id: product.id,
    name: product.name || product.product_name || "Untitled",
    price: Number(product.price) || 0,
    store: product.store || product.store_name || "SME Store",
    store_id: product.store_id || product.storeId || product.tenant_id || "demo-store",
    store_slug: product.store_slug || product.storeSlug || toSlug(product.store || product.store_name || "sme-store"),
    category: normalizeCategory(
      product.category ||
        product.category_name ||
        product.category_id ||
        product.categoryName ||
        "Other",
    ),
    rating: Number.isFinite(rating) ? rating : 0,
    reviews: Number.isFinite(reviews) ? reviews : 0,
  };
};

const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const formatCurrency = (amount) => `R${Number(amount || 0).toFixed(2)}`;

const toSlug = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const toAbsoluteUrl = (path) => {
  if (!path) {
    return "";
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const normalized = String(path).startsWith("/") ? path : `/${path}`;
  return `${window.location.origin}${normalized}`;
};

function Storefront() {
  const { slug: storeSlug } = useParams();
  const isStorePage = Boolean(storeSlug);
  const [activeStore, setActiveStore] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showCartModal, setShowCartModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("whatsapp");

  const [products, setProducts] = useState(demoProducts);

  const [cart, setCart] = useState([]);
  const [userInfo, setUserInfo] = useState({
    email: "",
    name: "",
    address: "",
    phone: "",
  });

  const categories = [
    { id: "all", name: "All Products", icon: Icons.bag },
    { id: "Electronics", name: "Electronics", icon: Icons.star },
    { id: "Clothing", name: "Clothing", icon: Icons.user },
    { id: "Food & Beverages", name: "Food & Beverages", icon: Icons.cart },
    { id: "Beauty", name: "Beauty", icon: Icons.star },
    { id: "Home & Garden", name: "Home & Garden", icon: Icons.bag },
    { id: "Other", name: "Other", icon: Icons.bag },
  ];

  useEffect(() => {
    let isActive = true;
    const loadProducts = async () => {
      try {
        const endpoint = storeSlug
          ? `/products?store_slug=${encodeURIComponent(storeSlug)}`
          : "/products";
        const response = await axiosInstance.get(endpoint);
        const apiProducts = Array.isArray(response.data?.products)
          ? response.data.products
          : [];
        const normalized = apiProducts.map(normalizeStorefrontProduct);
        if (isActive && normalized.length > 0) {
          setProducts(normalized);
        } else if (isActive && apiProducts.length === 0 && !storeSlug) {
          setProducts(demoProducts);
        }
      } catch (error) {
        if (isActive && !storeSlug) {
          setProducts(demoProducts);
        }
      }
    };

    loadProducts();
    return () => {
      isActive = false;
    };
  }, [storeSlug]);

  useEffect(() => {
    let isMounted = true;
    const loadActiveStore = async () => {
      if (!storeSlug) {
        setActiveStore(null);
        return;
      }
      try {
        const response = await axiosInstance.get(`/stores/by-slug/${storeSlug}`);
        if (isMounted) {
          setActiveStore(response.data?.store || null);
        }
      } catch (error) {
        if (isMounted) {
          setActiveStore(null);
        }
      }
    };
    loadActiveStore();
    return () => {
      isMounted = false;
    };
  }, [storeSlug]);

  const shopName = activeStore?.store_name || (isStorePage ? storeSlug : "SME Store");
  const shopLogo = toAbsoluteUrl(activeStore?.logo_url || "");
  const shopPath = isStorePage ? `/shop/${storeSlug}` : "/";
  const shopUrl = toAbsoluteUrl(shopPath);
  const pageTitle = isStorePage ? `${shopName} | SME Store` : "SME Store";
  const pageDescription = isStorePage
    ? `Shop products from ${shopName} on SME Store.`
    : "Discover amazing products from local businesses at great prices.";
  const availablePaymentMethods =
    activeStore?.payment_methods?.length > 0
      ? activeStore.payment_methods
      : ["payfast", "bank_transfer", "whatsapp"];
  const whatsappNumber = activeStore?.whatsapp_number || "27820000000";
  const bankDetails =
    activeStore?.bank_details ||
    "Bank: Demo Bank | Account: 1234567890 | Branch: 000000";

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
        full_name: name,
        email,
        password,
        user_type: "customer",
      });
      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
      }
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
        customerEmail: userInfo.email,
        customerPhone: userInfo.phone,
        payment_method: selectedPaymentMethod,
      };
      const orderResponse = await axiosInstance.post("/orders", orderData);
      const createdOrder = orderResponse.data?.order;
      const orderId = createdOrder?.id;
      const orderTotal = createdOrder?.total_amount ?? cartTotal + 50;

      const paymentResponse = await axiosInstance.post("/payments/initiate", {
        orderId,
        amount: orderTotal,
        method: selectedPaymentMethod,
        customerName: userInfo.name,
        whatsappNumber,
        bankDetails,
      });

      const action = paymentResponse.data?.action;
      if (action?.type === "redirect" && action?.url) {
        window.open(action.url, "_blank", "noopener,noreferrer");
      }

      if (selectedPaymentMethod === "bank_transfer") {
        alert(
          `Order placed. Complete payment via bank transfer:\n\n${action?.bank_details || bankDetails}`,
        );
      } else if (selectedPaymentMethod === "whatsapp") {
        alert("Order created. Continue completion on WhatsApp.");
      } else {
        alert("Order placed. Continue payment on PayFast.");
      }
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
    <div className="min-h-screen bg-gray-50 text-[15px] antialiased">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={shopUrl} />
        {shopLogo ? <meta property="og:image" content={shopLogo} /> : null}
      </Helmet>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center gap-2">
              <Icons.bag className="h-7 w-7 text-blue-600" aria-hidden="true" />
              {isStorePage ? (
                <Link to="/" className="text-xl sm:text-2xl font-semibold text-gray-900 hover:text-blue-700">
                  {activeStore?.store_name || "SME Store"}
                </Link>
              ) : (
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  SME Store
                </h1>
              )}
            </div>

            <div className="w-full sm:flex-1 sm:max-w-md sm:mx-6">
              <input
                type="text"
                placeholder="Search products, stores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    setIsLoggedIn(false);
                  }}
                  className="text-gray-600 hover:text-gray-900 text-sm inline-flex items-center gap-2"
                >
                  <Icons.user className="h-4 w-4" aria-hidden="true" />
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setAuthMode("login");
                  }}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm inline-flex items-center gap-2"
                >
                  <Icons.user className="h-4 w-4" aria-hidden="true" />
                  Sign In
                </button>
              )}

              <button
                onClick={() => setShowCartModal(true)}
                className="relative flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
              >
                <Icons.cart className="h-4 w-4" aria-hidden="true" />
                Cart
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
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap font-semibold transition ${
                    selectedCategory === cat.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">
            {isStorePage
              ? `Welcome to ${activeStore?.store_name || "this shop"}`
              : "Welcome to SME Store"}
          </h2>
          <p className="text-base sm:text-xl text-blue-100">
            {isStorePage
              ? "Discover products from this merchant"
              : "Discover amazing products from local businesses at great prices"}
          </p>
          <p className="text-blue-200 mt-2 text-sm sm:text-base">
            ✓ Direct from SMEs • ✓ Authentic Products • ✓ Best Prices
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
            {selectedCategory === "all"
              ? "All Products"
              : categories.find((c) => c.id === selectedCategory)?.name}
          </h3>
          <p className="text-gray-600 mt-1 text-sm">
            {filteredProducts.length} products available
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Icons.search
              className="h-12 w-12 text-gray-400 mx-auto mb-4"
              aria-hidden="true"
            />
            <p className="text-gray-600 text-base sm:text-xl">
              No products found. Try a different search or category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden group"
              >
                <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-48 flex items-center justify-center overflow-hidden group-hover:from-blue-200 group-hover:to-blue-300 transition">
                  <Icons.box className="h-12 w-12 text-gray-500" aria-hidden="true" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 flex-1">
                      {product.name}
                    </h4>
                    {product.reviews > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        <Icons.star
                          className="h-3 w-3 text-yellow-500"
                          aria-hidden="true"
                        />
                        {Number(product.rating).toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-1">
                    <Link
                      to={`/shop/${product.store_slug}`}
                      className="hover:text-blue-700 hover:underline"
                    >
                      {product.store}
                    </Link>
                  </p>
                  <p className="text-gray-500 text-xs mb-2">
                    {product.reviews > 0
                      ? `(${product.reviews} reviews)`
                      : "No reviews yet"}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center z-50">
          <div className="bg-white w-full sm:w-96 h-screen sm:h-auto rounded-t-2xl sm:rounded-2xl flex flex-col max-h-screen sm:max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h3 className="text-xl sm:text-2xl font-bold inline-flex items-center gap-2">
                <Icons.cart className="h-5 w-5" aria-hidden="true" />
                Your Cart
              </h3>
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
                    <p className="text-gray-500 text-base sm:text-lg">
                      Your cart is empty
                    </p>
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
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition text-sm sm:text-base"
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
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setAuthMode("login")}
                className={`flex-1 py-2 font-bold rounded-lg transition text-sm sm:text-base ${
                  authMode === "login"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode("signup")}
                className={`flex-1 py-2 font-bold rounded-lg transition text-sm sm:text-base ${
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
                <input
                  id="authPassword"
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition text-sm sm:text-base"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
                <input
                  id="authEmail"
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
                <input
                  id="authPassword"
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition text-sm sm:text-base"
                >
                  Create Account
                </button>
              </form>
            )}

            <button
              onClick={() => setShowAuthModal(false)}
              className="w-full mt-4 text-gray-600 hover:text-gray-900 font-semibold text-sm"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl max-h-screen overflow-y-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
              Checkout
            </h3>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20 text-sm"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <div className="space-y-2 rounded-lg border border-gray-300 p-3">
                  {availablePaymentMethods.includes("whatsapp") ? (
                    <label className="flex items-center gap-2 text-sm text-gray-800">
                      <input
                        type="checkbox"
                        checked={selectedPaymentMethod === "whatsapp"}
                        onChange={() => setSelectedPaymentMethod("whatsapp")}
                      />
                      WhatsApp Order
                    </label>
                  ) : null}
                  {availablePaymentMethods.includes("payfast") ? (
                    <label className="flex items-center gap-2 text-sm text-gray-800">
                      <input
                        type="checkbox"
                        checked={selectedPaymentMethod === "payfast"}
                        onChange={() => setSelectedPaymentMethod("payfast")}
                      />
                      PayFast
                    </label>
                  ) : null}
                  {availablePaymentMethods.includes("bank_transfer") ? (
                    <label className="flex items-center gap-2 text-sm text-gray-800">
                      <input
                        type="checkbox"
                        checked={selectedPaymentMethod === "bank_transfer"}
                        onChange={() => setSelectedPaymentMethod("bank_transfer")}
                      />
                      Bank Transfer
                    </label>
                  ) : null}
                </div>
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Storefront />} />
      <Route path="/shop/:slug" element={<Storefront />} />
    </Routes>
  );
}

export default App;
