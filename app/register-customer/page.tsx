"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ChevronLeft } from "lucide-react";
import { getData, postData } from "@/helper/apiHelper";
import InputUI from "@/components/ui/input/Input";
import ButtonUI from "@/components/ui/button/Button";
import Google from "next-auth/providers/google";
import GoogleLogo from "@/components/ui/logo/google/Google";

// Define interface untuk data form
interface RegisterCustomerFormData {
  name: string;
  email: string;
  password: string;
  phone_number: string;
  role: string;
  status: string;
}

export default function RegisterCustomer() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState<RegisterCustomerFormData>({
    name: "",
    email: "",
    password: "",
    phone_number: "",
    role: "customer",
    status: "verify",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await postData(`register-customer`, formData);
      if (response.success) {
        toast.success("Pendaftaran Berhasil!");
        router.push("/login");
      } else {
        toast.error(response.message || "Pendaftaran gagal");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  const loginGoogle = async () => {
    setLoading(true);
    try {
      const url = `auth/google/customer`;

      const response = await getData(url);

      const data = (await response.data) as any;
      localStorage.setItem("pending_role", data.role);
      window.location.href = data.url;
    } catch (e) {
      console.log(e);
      toast.error("Pendaftaran Gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border p-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors mb-8 group"
        >
          <ChevronLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-sm font-medium">Kembali</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Daftar Sebagai Pelanggan UMKM
        </h1>

        <p className="text-gray-500 mb-8">Lengkapi data di bawah</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bagian 1: Akun Pemilik */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-blue-600 border-b pb-2">
              Data Pribadi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputUI
                label="Nama Lengkap"
                required
                minLength={3}
                placeholder="Nama Lengkap"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <InputUI
                label="Email"
                required
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <InputUI
              label="Nomor HP / WhatsApp"
              required
              minLength={10}
              placeholder="Nomor HP / WhatsApp"
              type="text"
              value={formData.phone_number}
              onChange={(e) =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
            />

            <InputUI
              label="Password (Min. 8 Karakter)"
              required
              minLength={8}
              placeholder="Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <ButtonUI type="submit" loading={loading}>
            {loading ? "Sedang Mendaftar..." : "Daftar Sekarang"}
          </ButtonUI>
        </form>
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-slate-500 font-medium uppercase tracking-wider text-xs">
              Atau daftar lebih cepat
            </span>
          </div>
        </div>

        <ButtonUI
          type="button"
          onClick={() => loginGoogle()}
          loading={loading}
          bgColor="bg-slate-50"
          textColor="text-black"
          hoverBgColor="bg-white"
          hoverTextColor="text-black"
        >
          <GoogleLogo />
          <span>Daftar dengan Google</span>
        </ButtonUI>

        <p className="mt-8 text-center text-slate-500">
          Sudah punya akun?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-blue-600 font-bold hover:underline"
          >
            Masuk Sekarang
          </button>
        </p>
      </div>
    </div>
  );
}
