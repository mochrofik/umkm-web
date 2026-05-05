"use client";

import { useAuth } from "@/AuthContext";
import { useCart } from "@/CartContext";
import {
  Home,
  ClipboardList,
  User,
  Search,
  UserRound,
  Bell,
  LogOut,
  Store,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, role, logout, loading } = useAuth();
  const { totalItems } = useCart();
  const pathname = usePathname();

  const [isNotificationOpen, setNotificationOpen] = useState<boolean>(false);
  const [isProfileOpen, setProfileOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<any[]>([
    {
      id: 1,
      title: "Pesanan Baru",
      message: "Anda menerima pesanan baru dari Pelanggan",
      time: "5 menit yang lalu",
      isRead: false,
    },
    {
      id: 2,
      title: "Stok Menipis",
      message: "Produk 'Sego Pecel' hampir habis",
      time: "1 jam yang lalu",
      isRead: false,
    },
    {
      id: 3,
      title: "Pembayaran Berhasil",
      message: "Pembayaran order #1234 diverifikasi",
      time: "2 jam yang lalu",
      isRead: true,
    },
    {
      id: 4,
      title: "Update Sistem",
      message: "Fitur notifikasi baru telah aktif",
      time: "1 hari yang lalu",
      isRead: true,
    },
  ]);

  const profileNavbar = (
    <div className="relative">
      <button
        onClick={() => {
          setProfileOpen(!isProfileOpen);
          setNotificationOpen(false);
        }}
        className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-all group"
      >
        <User size={22} className="group-hover:animate-ring" />
      </button>
      {isProfileOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in duration-150">
          {/* Header Profil */}
          <div className="p-5 border-b border-gray-50 bg-gradient-to-r from-blue-50/50 to-transparent">
            <p className="text-sm font-bold text-gray-900 leading-none">
              {user?.name ?? "User"}
            </p>
            <p className="text-xs text-gray-500 mt-1 truncate">
              {user?.email ?? "email@example.com"}
            </p>
          </div>

          <div className="p-2">
            {/* Link Profil */}
            <Link
              href="/profile"
              onClick={() => setProfileOpen(false)}
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all group"
            >
              <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-white transition-colors">
                <UserRound size={18} />
              </div>
              <span className="text-sm font-semibold">Profil Saya</span>
            </Link>

            <Link
              href="/register"
              onClick={() => setProfileOpen(false)}
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all group"
            >
              <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-white transition-colors">
                <Store size={18} />
              </div>
              <span className="text-sm font-semibold">Ingin Jualan?</span>
            </Link>

            <div className="my-2 border-t border-gray-50" />

            {/* Tombol Logout */}
            <button
              onClick={() => {
                logout();
                setProfileOpen(false);
              }}
              className="w-full flex items-center gap-2 p-2  rounded-xl hover:bg-red-50 text-red-500 transition-all group"
            >
              <div className="p-2 rounded-lg bg-red-50 group-hover:bg-white transition-colors">
                <LogOut size={18} />
              </div>
              <span className="text-sm font-bold">Keluar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Top Navbar */}
      <div className="bg-white p-4 sticky top-0 z-10 shadow-sm">
        <div className="flex flex-row gap-2">
          <div className="w-fit flex items-center">
            <Link href={"/"}>
              <img src={"/le_melleh.png"} width={30} height={30} alt="Logo" />
            </Link>
          </div>
          <div className="flex w-fit items-center px-2 text-blue-900 text-lg font-poppins font-bold italic">
            <Link href={"/"}>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-gray-900 tracking-tight leading-none">
                  Le<span className="text-[#4C8CE4]">melle</span>
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">
                  UMKM Marketplace
                </span>
              </div>
            </Link>
          </div>

          <div className="flex-1 max-w-md mx-auto hidden sm:block">
            <div className="w-full flex justify-end items-center bg-gray-100 border border-slate-200 rounded-full px-4 py-2">
              <Search className="text-blue-900" size={20} />
              <input
                type="text"
                placeholder="Mau makan apa hari ini?"
                className="font-poppins bg-transparent text-black ml-2 w-full outline-none text-sm"
              />
            </div>
          </div>

          <div className="flex items-center ml-auto gap-3">
            {!user && !loading && (
              <Link
                href="/login"
                className="font-poppins bg-blue-200 font-bold text-blue-700 hover:bg-blue-300 px-4 py-1.5 rounded-xl text-sm transition-colors"
              >
                Login
              </Link>
            )}

            {user && role && (
              <div className="mr-auto flex items-center">
                {/* Notification Bell */}

                <div className="relative">
                  <button
                    onClick={() => {
                      setNotificationOpen(!isNotificationOpen);
                      setProfileOpen(false);
                    }}
                    className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-all group"
                  >
                    <Bell size={22} className="group-hover:animate-ring" />
                    {notifications.filter((n) => !n.isRead).length > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {notifications.filter((n) => !n.isRead).length}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in duration-150">
                      <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0">
                        <h3 className="font-bold text-gray-900">Notifikasi</h3>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                          Terbaru
                        </span>
                      </div>
                      <div className="max-h-[350px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.slice(0, 5).map((notif) => (
                            <Link
                              key={notif.id}
                              href="/dashboard/notifications"
                              onClick={() => setNotificationOpen(false)}
                              className={`block p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!notif.isRead ? "bg-blue-50/30" : ""}`}
                            >
                              <div className="flex gap-3">
                                <div
                                  className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${!notif.isRead ? "bg-blue-500" : "bg-gray-300"}`}
                                />
                                <div className="space-y-1">
                                  <p
                                    className={`text-sm font-bold leading-none ${!notif.isRead ? "text-gray-900" : "text-gray-600"}`}
                                  >
                                    {notif.title}
                                  </p>
                                  <p className="text-xs text-gray-500 line-clamp-2">
                                    {notif.message}
                                  </p>
                                  <p className="text-[10px] text-gray-400 font-medium">
                                    {notif.time}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <p className="text-sm text-gray-400">
                              Tidak ada notifikasi
                            </p>
                          </div>
                        )}
                      </div>
                      <Link
                        href="/dashboard/notifications"
                        onClick={() => false}
                        className="block p-3 text-center text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors border-t border-gray-50"
                      >
                        Lihat Semua Notifikasi
                      </Link>
                    </div>
                  )}
                </div>

                {profileNavbar}
              </div>
            )}

            {user && role && role !== "customer" && (
              <Link href={"/dashboard"}>
                <span className="font-poppins bg-blue-200 font-bold text-blue-700 hover:bg-blue-300 px-4 py-1.5 rounded-xl text-sm transition-colors">
                  Dashboard
                </span>
              </Link>
            )}

            {user && role && role === "customer" && (
              <button
                onClick={logout}
                className="font-poppins bg-red-200 font-bold text-red-700 hover:bg-red-300 px-4 py-1.5 rounded-xl text-sm transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>{children}</main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-gray-100 flex justify-around py-3 pb-safe z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] rounded-t-[2.5rem]">
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 group transition-all duration-300 ${pathname === "/" ? "text-[#4C8CE4]" : "text-gray-400 hover:text-gray-600"}`}
        >
          <div
            className={`p-1.5 rounded-2xl transition-all duration-300 ${pathname === "/" ? "bg-blue-50 scale-110 shadow-sm" : "group-hover:bg-gray-50"}`}
          >
            <Home size={22} strokeWidth={pathname === "/" ? 2.5 : 2} />
          </div>
          <span
            className={`text-[10px] font-black uppercase tracking-[0.1em] transition-opacity ${pathname === "/" ? "opacity-100" : "opacity-60"}`}
          >
            Beranda
          </span>
        </Link>

        <Link
          href="/cart"
          className={`flex flex-col items-center gap-0.5 group relative transition-all duration-300 ${pathname === "/cart" ? "text-[#4C8CE4]" : "text-gray-400 hover:text-gray-600"}`}
        >
          <div
            className={`p-1.5 rounded-2xl transition-all duration-300 ${pathname === "/cart" ? "bg-blue-50 scale-110 shadow-sm" : "group-hover:bg-gray-50"}`}
          >
            <ClipboardList
              size={22}
              strokeWidth={pathname === "/cart" ? 2.5 : 2}
            />
          </div>
          {totalItems > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
              {totalItems}
            </span>
          )}
          <span
            className={`text-[10px] font-black uppercase tracking-[0.1em] transition-opacity ${pathname === "/cart" ? "opacity-100" : "opacity-60"}`}
          >
            Pesanan
          </span>
        </Link>

        <Link
          href="/dashboard/profile"
          className={`flex flex-col items-center gap-0.5 group transition-all duration-300 ${pathname === "/dashboard/profile" ? "text-[#4C8CE4]" : "text-gray-400 hover:text-gray-600"}`}
        >
          <div
            className={`p-1.5 rounded-2xl transition-all duration-300 ${pathname === "/dashboard/profile" ? "bg-blue-50 scale-110 shadow-sm" : "group-hover:bg-gray-50"}`}
          >
            <User
              size={22}
              strokeWidth={pathname === "/dashboard/profile" ? 2.5 : 2}
            />
          </div>
          <span
            className={`text-[10px] font-black uppercase tracking-[0.1em] transition-opacity ${pathname === "/dashboard/profile" ? "opacity-100" : "opacity-60"}`}
          >
            Profil
          </span>
        </Link>
      </div>
    </div>
  );
}
