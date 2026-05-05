"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  role: string | null;
  token: string | null;
  loading: boolean;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  setRole: React.Dispatch<React.SetStateAction<string | null>>;
  login: (userData: User, userRole: string, userToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const router = useRouter();
  const pathname = usePathname();
  const getauth = async() => {
    console.log("running");
    setLoading(true);
    const savedRole = localStorage.getItem("role");
    const savedUser = localStorage.getItem("user");
    
    // Kita tidak lagi mengambil token dari localStorage karena sekarang ada di HttpOnly Cookie
    if (savedRole && savedUser) {
      const authPages = ["/login", "/register"];
      setRole(savedRole);
      // Token di set null di state karena kita tidak bisa membacanya dari JS, 
      // tapi Axios akan mengirimkannya via Cookie/Middleware
      setToken("HIDDEN_IN_COOKIE"); 
      
      try {
        const userObj: User = JSON.parse(savedUser);
        setUser(userObj);
      } catch (e) {
        console.error("Failed to parse user", e);
      }
      if (authPages.includes(pathname)) {
        router.push("/dashboard");
      }
    } else {
      const protectedPrefix = ["/dashboard"];
      const isProtected = protectedPrefix.some((path) => pathname.startsWith(path));

      if (isProtected) {
        logout();
        toast.error("Login terlebih dahulu");
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    console.log("authcontext running");
    getauth();
    const handleHistoryChange = () => {
    console.log("User klik Back atau Forward!");
    getauth()
  };

  window.addEventListener('popstate', handleHistoryChange);

  return () => {
    window.removeEventListener('popstate', handleHistoryChange);
  };
  }, [pathname]); // Tambahkan pathname sebagai dependency agar re-check saat pindah halaman

  const login = async (userData: User, userRole: string, userToken: string) => {
    try {
        // Simpan token ke HttpOnly Cookie via API route kita
        await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: userToken }),
        });

        // Simpan data non-sensitif di localStorage agar UI tetap cepat
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("role", userRole);

        setUser(userData);
        setRole(userRole);
        setToken("HIDDEN_IN_COOKIE");
    } catch (error) {
        console.error("Failed to set session", error);
        toast.error("Gagal memproses session");
    }
  };

  const logout = async () => {
    try {
        // Hapus token dari HttpOnly Cookie
        await fetch('/api/auth/session', { method: 'DELETE' });

        localStorage.removeItem("user");
        localStorage.removeItem("role");
        localStorage.removeItem("token"); // Cleanup just in case

        setUser(null);
        setRole(null);
        setToken(null);

        router.push("/login");
    } catch (error) {
        console.error("Logout error", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, role, token, setToken, setRole, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook dengan proteksi TypeScript
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};