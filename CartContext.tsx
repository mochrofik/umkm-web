"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import api from "@/utils/axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export interface CartItem {
  id: string | number;
  product_id?: string | number; // Added to help mapping
  name: string;
  price: number;
  quantity: number;
  image_url?: string | null;
  store_id: string | number;
  store_name: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (id: string | number) => Promise<void>;
  updateQuantity: (id: string | number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: (deliveryAddress: string, notes?: string) => Promise<boolean>;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token, role } = useAuth();
  const router = useRouter();

  const fetchCart = useCallback(async () => {
    if (!token || role !== "customer") return;

    setLoading(true);
    try {
      const response = await api.get(`cart`);
      if (response.data.success) {
        const items = response.data.data.items.map((item: any) => ({
          id: item.id, // Database item ID
          product_id: item.product_id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image_url: item.product.logo_url,
          store_id: item.product.store_id,
          store_name: item.product.store?.name || "Toko",
        }));
        setCart(items);
      }
    } catch (error) {
      console.error("Failed to fetch cart from API", error);
      toast.error("Gagal sinkronisasi keranjang");
    } finally {
      setLoading(false);
    }
  }, [token, role]);

  useEffect(() => {
    const syncLocalStorageToApi = async () => {
      const savedCart = localStorage.getItem("cart");
      if (savedCart && token && role === "customer") {
        try {
          const localItems: CartItem[] = JSON.parse(savedCart);
          if (localItems.length > 0) {
            for (const item of localItems) {
              await api.post(`cart/add`, {
                product_id: item.product_id || item.id,
                quantity: item.quantity,
              });
            }
            localStorage.removeItem("cart");
          }
        } catch (e) {
          console.error("Failed to sync local cart to API", e);
        }
      }
      fetchCart();
    };

    if (token && role === "customer") {
      syncLocalStorageToApi();
    } else {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error("Failed to parse cart from localStorage", e);
        }
      } else {
        setCart([]);
      }
    }
    setIsInitialized(true);
  }, [token, role, fetchCart]);

  useEffect(() => {
    if (isInitialized && (!token || role !== "customer")) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isInitialized, token, role]);

  const addToCart = async (item: CartItem) => {
    if (token && role === "customer") {
      try {
        const response = await api.post(`cart/add`, {
          product_id: item.product_id || item.id, // Frontend uses product.id for adding
          quantity: item.quantity,
        });

        if (response.data.success) {
          fetchCart(); // Refresh to get correct IDs from DB
        }
      } catch (error) {
        console.error("Failed to add to cart via API", error);
        toast.error("Gagal menambahkan ke keranjang");
      }
    } else {
      setCart((prevCart) => {
        const existingItem = prevCart.find((i) => i.id === item.id);
        if (existingItem) {
          return prevCart.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i,
          );
        }
        return [...prevCart, item];
      });
    }
  };

  const removeFromCart = async (id: string | number) => {
    if (token && role === "customer") {
      try {
        const response = await api.delete(`cart/remove/${id}`);
        if (response.data.success) {
          setCart((prevCart) => prevCart.filter((item) => item.id !== id));
        }
      } catch (error) {
        console.error("Failed to remove from cart via API", error);
        toast.error("Gagal menghapus produk");
      }
    } else {
      setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    }
  };

  const updateQuantity = async (id: string | number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }

    if (token && role === "customer") {
      try {
        const response = await api.put(`cart/update/${id}`, {
          quantity,
        });
        if (response.data.success) {
          setCart((prevCart) =>
            prevCart.map((item) =>
              item.id === id ? { ...item, quantity } : item,
            ),
          );
        }
      } catch (error) {
        console.error("Failed to update cart via API", error);
        toast.error("Gagal memperbarui jumlah");
      }
    } else {
      setCart((prevCart) =>
        prevCart.map((item) => (item.id === id ? { ...item, quantity } : item)),
      );
    }
  };

  const clearCart = async () => {
    if (token && role === "customer") {
      try {
        const response = await api.delete(`cart/clear`);
        if (response.data.success) {
          setCart([]);
        }
      } catch (error) {
        console.error("Failed to clear cart via API", error);
        toast.error("Gagal mengosongkan keranjang");
      }
    } else {
      setCart([]);
    }
  };

  const checkout = async (deliveryAddress: string, notes: string = "") => {
    if (!token || role !== "customer") {
      toast.error("Silakan login sebagai pelanggan untuk memesan");
      router.push("/login");
      return false;
    }

    if (cart.length === 0) return false;

    setLoading(true);
    try {
      // Group items by store_id
      const storeGroups: { [key: string]: any[] } = {};
      cart.forEach((item) => {
        if (!storeGroups[item.store_id]) {
          storeGroups[item.store_id] = [];
        }
        storeGroups[item.store_id].push({
          product_id: item.product_id || item.id,
          quantity: item.quantity,
        });
      });

      // Send checkout request for each store
      const checkoutPromises = Object.keys(storeGroups).map((storeId) => {
        return api.post(`order-customer/checkout`, {
          store_id: storeId,
          items: storeGroups[storeId],
          delivery_address: deliveryAddress,
          notes: notes,
          payment_method: "cash", // Default for now
        });
      });

      await Promise.all(checkoutPromises);

      toast.success("Pesanan berhasil dibuat!");
      await clearCart();
      router.push("/"); // Redirect to customer orders page
      return true;
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.response?.data?.message || "Gagal membuat pesanan");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + Number(item.quantity), 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        checkout,
        totalItems,
        totalPrice,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
