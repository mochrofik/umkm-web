"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Phone, Clock, ChevronLeft, Search } from "lucide-react";
import toast from "react-hot-toast";
import { Store, Product } from "@/types/stores";
import Loading from "@/components/Loading";
import { useCart } from "@/CartContext";
import { getData } from "@/helper/apiHelper";

interface StoreDetailResponse {
  success: boolean;
  message: string;
  data: Store;
}

export default function StoreDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const fetchStoreDetail = async () => {
    try {
      setLoading(true);
      const response = await getData(`get-store-by-slug/${slug}`);

      if (!response.success) {
        throw new Error("Gagal mengambil detail toko");
      }

      const data: StoreDetailResponse =
        (await response.data) as StoreDetailResponse;
      setStore(data.data);
    } catch (error) {
      console.error(error);
      toast.error("Toko tidak ditemukan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchStoreDetail();
    }
  }, [slug]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatRating = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 1,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "";
    return timeString.substring(0, 5); // Ambil HH:mm
  };

  const handleAddToCart = (product: Product) => {
    if (!store) return;

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.logo_url,
      store_id: store.id,
      store_name: store.name,
    });

    toast.success(`${product.name} ditambahkan ke keranjang`, {
      icon: "🛒",
      style: {
        borderRadius: "12px",
        background: "#333",
        color: "#fff",
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading fullPage={false} />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="text-red-500" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Toko Tidak Ditemukan
          </h1>
          <p className="text-gray-500 mb-8">
            Maaf, toko yang Anda cari tidak tersedia atau sudah tidak aktif.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all shadow-lg"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header / Banner Section */}
      <div className="relative h-[250px] sm:h-[350px] w-full overflow-hidden">
        {/* Banner Image */}
        <div className="absolute inset-0 bg-gray-900">
          <img
            src="/banner.png"
            alt="Store Banner"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        {/* Back Button */}
        <Link
          href="/"
          className="absolute top-6 left-6 z-[2] bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40 transition-all"
        >
          <ChevronLeft size={24} />
        </Link>

        {/* Store Info Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 flex flex-col sm:flex-row items-end sm:items-center gap-6 z-[1]">
          {/* Logo */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-white flex-shrink-0">
            <Image
              src={store.logo_url || "/default-store.png"}
              alt={store.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          {/* Text Info */}
          <div className="flex-1 text-white">
            <h1 className="text-3xl sm:text-4xl font-bold font-poppins mb-2 drop-shadow-md">
              {store.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm sm:text-base font-medium opacity-90">
              <div className="flex items-center gap-1.5 bg-yellow-400 text-black px-2.5 py-1 rounded-lg">
                <Star size={16} fill="currentColor" />
                <span>{formatRating(store.rating)}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">
                <MapPin size={16} />
                <span className="truncate max-w-[200px] sm:max-w-none">
                  {store.address}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {store.is_open == "1" || store.is_open === "true" ? (
                  <div className="flex items-center gap-1.5 bg-green-500/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-green-200 animate-pulse" />
                    <span>Buka</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-red-500/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-red-200" />
                    <span>Tutup</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">
                  <Clock size={16} />
                  <span>
                    {formatTime(store.open_at)} - {formatTime(store.close_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-[5]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Menu */}
          <div className="lg:col-span-2 space-y-10">
            {store.menu_categories && store.menu_categories.length > 0 ? (
              store.menu_categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 font-poppins">
                        {category.name}
                      </h2>
                      {category.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                      {category.products.length} Menu
                    </span>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {category.products.map((product) => (
                      <div
                        key={product.id}
                        className="p-6 flex gap-6 hover:bg-blue-50/30 transition-colors group"
                      >
                        {/* Product Image */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                          <Image
                            src={product.logo_url || "/default-product.png"}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            unoptimized
                          />
                          {product.rating && (
                            <div className="absolute bottom-1 right-1 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-0.5 shadow-sm">
                              <Star
                                size={10}
                                className="text-yellow-500"
                                fill="currentColor"
                              />
                              {formatRating(product.rating)}
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                              {product.description || "Tidak ada deskripsi."}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-blue-700 font-extrabold text-xl font-poppins">
                              {formatCurrency(product.price)}
                            </span>
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="bg-orange-500 hover:bg-orange-600 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95"
                            >
                              <span className="text-2xl font-bold">+</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300">
                <div className="text-gray-400 mb-4 flex justify-center">
                  <Search size={48} opacity={0.5} />
                </div>
                <h3 className="text-lg font-bold text-gray-700">
                  Belum ada menu
                </h3>
                <p className="text-gray-500">
                  Toko ini belum mengunggah menu makanan atau minuman.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Sidebar Info */}
          <div className="space-y-6">
            {/* Store Stats Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-6 text-lg">
                Informasi Toko
              </h3>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      Jam Operasional
                    </p>
                    <p className="text-sm text-gray-700 font-medium mt-0.5">
                      {store.open_at?.substring(0, 5)} -{" "}
                      {store.close_at?.substring(0, 5)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-green-50 p-2.5 rounded-xl text-green-600">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      Hubungi Toko
                    </p>
                    <p className="text-sm text-gray-700 font-medium mt-0.5">
                      {store.phone_number || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      Alamat
                    </p>
                    <p className="text-sm text-gray-700 font-medium mt-0.5 leading-relaxed">
                      {store.address}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 active:scale-[0.98]">
                  Cek Lokasi di Peta
                </button>
              </div>
            </div>

            {/* Promo / Info Card */}
            <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="font-bold text-lg mb-2">Punya Voucher?</h4>
                <p className="text-white/80 text-sm mb-4">
                  Gunakan voucher kamu untuk mendapatkan potongan harga di toko
                  ini.
                </p>
                <button className="bg-white text-orange-600 font-bold px-4 py-2 rounded-xl text-sm shadow-md group-hover:px-6 transition-all">
                  Lihat Voucher
                </button>
              </div>
              <div className="absolute -bottom-4 -right-4 opacity-20 group-hover:scale-110 transition-transform">
                <Star size={100} fill="white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
