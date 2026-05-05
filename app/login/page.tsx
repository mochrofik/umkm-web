"use client";
import { useAuth } from "@/AuthContext";
import { getData, postData } from "@/helper/apiHelper";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginResponse {
  data: {
    user: any;
    role: string[];
    access_token: string;
  };
  message?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await postData(`login`, formData, router);
      if (response.success) {
        const data = (await response.data) as any;
        const role = data.data.role[0];

        login(data.data.user, role, data.data.access_token);

        if (role === "admin" || role === "store") {
          router.push("/dashboard");
        } else {
          router.push("/");
        }
      } else {
        const errorData = (await response.data) as any;
        toast.error(JSON.stringify(errorData.message));
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const loginGoogle = async () => {
    try {
      const response = await getData(`auth/google/login`);
      if (response.success) {
        const data = (await response.data) as any;
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <button
          onClick={() => router.replace("/")}
          className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors mb-8 group"
        >
          <ChevronLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-sm font-medium">Kembali</span>
        </button>

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">
            Le melle!
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Dukung UMKM daerahmu dengan rasa yang juara!
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email atau Nomor HP
            </label>
            <input
              type="text"
              value={formData.email}
              placeholder="Contoh: 08123456xxx"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full p-3 text-slate-900 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Kata Sandi
            </label>
            <input
              type="password"
              value={formData.password}
              placeholder="Masukkan kata sandi"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full p-3 text-slate-900 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Tombol Login Biru Modern */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg text-white transition-all shadow-md shadow-blue-200 ${
              loading
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
            }`}
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            {loading ? "Memproses..." : "Masuk Sekarang"}
          </button>
        </form>
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-slate-500 font-medium uppercase tracking-wider text-xs">
              Atau masuk lebih cepat
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loginGoogle()}
          className="cursor-pointer w-full py-4 rounded-xl font-bold text-lg text-slate-700 bg-white border border-slate-200 flex items-center justify-center gap-3 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] shadow-sm group"
        >
          <svg
            className="w-6 h-6 group-hover:scale-110 transition-transform"
            viewBox="0 0 24 24"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>Masuk dengan Google</span>
        </button>

        <div className="mt-8 text-center text-sm text-slate-500">
          Belum punya akun?
          <a
            href="/register-customer"
            className="ml-1 text-blue-600 font-bold hover:underline underline-offset-4"
          >
            registrasi
          </a>
          {/* <div className="px-2"> atau </div>
          <a
            href="/register"
            className="ml-1 text-blue-600 font-bold hover:underline underline-offset-4"
          >
            ingin berjualan?
          </a> */}
        </div>
      </div>
    </div>
  );
}
