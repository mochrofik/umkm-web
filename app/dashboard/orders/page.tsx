"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Package, 
  MoreVertical,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  Loader2
} from "lucide-react";
import api from "@/utils/axios";
import toast from "react-hot-toast";
import { useAuth } from "@/AuthContext";

// --- Interfaces ---

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  subtotal: number;
  product: {
    id: number;
    name: string;
    logo_url?: string | null;
  };
}

interface Order {
  id: number;
  order_number: string;
  total_price: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  created_at: string;
  delivery_address: string;
  customer_id: number;
  customer: {
    id: number;
    phone_number: string;
    address: string;
    user: {
      id: number;
      name: string;
    }
  };
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const { token } = useAuth();

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await api.get(`order/incoming`, {
        params: {
          status: filterStatus,
          search: searchQuery
        }
      });
      
      if (response.data.success) {
        // Handle paginated response
        setOrders(response.data.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
      toast.error("Gagal mengambil data pesanan");
    } finally {
      setLoading(false);
    }
  }, [token, filterStatus, searchQuery]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOrders();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await api.post(`order/update-status/${orderId}`, {
        status: newStatus
      });
      
      if (response.data.success) {
        toast.success(`Pesanan berhasil di${newStatus === 'processing' ? 'terima' : newStatus === 'completed' ? 'selesaikan' : 'batalkan'}`);
        fetchOrders();
      }
    } catch (error) {
      console.error("Failed to update status", error);
      toast.error("Gagal memperbarui status pesanan");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "processing":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "cancelled":
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "Menunggu";
      case "processing": return "Diproses";
      case "completed": return "Selesai";
      case "cancelled": return "Dibatalkan";
      default: return status;
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-poppins min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pesanan Masuk</h1>
          <p className="text-slate-500 text-sm">Kelola dan pantau pesanan dari pelanggan Anda</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari ID atau nama..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => fetchOrders()}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {["all", "pending", "processing", "completed", "cancelled"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              filterStatus === status 
                ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"
            }`}
          >
            {status === "all" ? "Semua Pesanan" : getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Memuat data pesanan...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div 
                key={order.id} 
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                  expandedOrder === order.id ? "border-blue-300 shadow-lg" : "border-slate-200 hover:border-blue-200 shadow-sm"
                }`}
              >
                {/* Main Header Row */}
                <div 
                  className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer"
                  onClick={() => toggleExpand(order.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      order.status === 'pending' ? 'bg-amber-50 text-amber-500' :
                      order.status === 'processing' ? 'bg-blue-50 text-blue-500' :
                      order.status === 'completed' ? 'bg-emerald-50 text-emerald-500' :
                      'bg-rose-50 text-rose-500'
                    }`}>
                      <ShoppingBag size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{order.order_number}</h3>
                      <p className="text-xs text-slate-500">{formatDate(order.created_at)}</p>
                    </div>
                  </div>

                  <div className="hidden lg:block">
                    <div className="flex items-center gap-2 mb-1">
                      <User size={14} className="text-slate-400" />
                      <span className="text-sm font-semibold text-slate-700">{order.customer?.user?.name || "Pelanggan"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-slate-400" />
                      <span className="text-xs text-slate-500 truncate max-w-[200px]">{order.delivery_address || "Ambil di tempat"}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(order.total_price)}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(order.status)}`}>
                      {getStatusLabel(order.status).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                      <MoreVertical size={18} />
                    </button>
                    {expandedOrder === order.id ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedOrder === order.id && (
                  <div className="px-5 pb-5 border-t border-slate-50 animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-5">
                      {/* Items List */}
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <Package size={16} className="text-blue-500" />
                          Detail Menu
                        </h4>
                        <div className="space-y-3 bg-slate-50 rounded-xl p-4">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between py-2 border-b border-white last:border-0">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-xs font-bold text-blue-600 border border-slate-100">
                                  {item.quantity}x
                                </div>
                                <span className="text-sm font-medium text-slate-700">{item.product.name}</span>
                              </div>
                              <span className="text-sm font-bold text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          ))}
                          <div className="pt-2 flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-800">Total Pembayaran</span>
                            <span className="text-base font-bold text-blue-600">{formatCurrency(order.total_price)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Customer & Actions */}
                      <div className="flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <User size={16} className="text-blue-500" />
                            Informasi Pengiriman
                          </h4>
                          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                            <div className="flex items-start gap-3">
                              <MapPin size={16} className="text-rose-500 mt-1 shrink-0" />
                              <div>
                                <p className="text-sm font-bold text-slate-800">{order.customer?.user?.name || "Pelanggan"}</p>
                                <p className="text-xs text-slate-600 leading-relaxed">{order.delivery_address || "Alamat tidak tersedia"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                              <Phone size={16} className="text-emerald-500 shrink-0" />
                              <p className="text-sm font-medium text-slate-700">{order.customer?.phone_number || "-"}</p>
                              <a 
                                href={`tel:${order.customer?.phone_number}`}
                                className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors"
                              >
                                HUBUNGI
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 mt-6">
                          {order.status === "pending" && (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(order.id, "processing")}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 active:scale-95"
                              >
                                <CheckCircle2 size={18} /> Terima Pesanan
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(order.id, "cancelled")}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white text-rose-600 border border-rose-200 rounded-xl font-bold hover:bg-rose-50 transition-all active:scale-95"
                              >
                                <XCircle size={18} /> Tolak
                              </button>
                            </>
                          )}
                          {order.status === "processing" && (
                            <button 
                              onClick={() => handleUpdateStatus(order.id, "completed")}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 active:scale-95"
                            >
                              <CheckCircle2 size={18} /> Selesaikan Pesanan
                            </button>
                          )}
                          {(order.status === "completed" || order.status === "cancelled") && (
                            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-default">
                              <Eye size={18} /> Lihat Bukti Transaksi
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={40} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Tidak ada pesanan</h3>
              <p className="text-slate-500">Belum ada pesanan dengan status "{getStatusLabel(filterStatus)}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

