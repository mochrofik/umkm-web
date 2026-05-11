"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ChevronLeft } from "lucide-react";
import { postData } from "@/helper/apiHelper";

// Define interface untuk data form
interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  store_name: string;
  slug: string;
  address: string;
  description: string;
  phone_number: string;
  role: string;
  status: string;
}

export default function RegisterUMKM() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    store_name: "",
    slug: "",
    address: "",
    description: "",
    phone_number: "",
    role: "store",
    status: "verify",
  });

  const handleStoreNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const generatedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    setFormData({
      ...formData,
      store_name: value,
      slug: generatedSlug,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = `register`;

      const response = await postData(url, formData);

      if (response.success) {
        toast.success("Pendaftaran Berhasil!");
        router.push("/login");
      } else {
        const errorData = (await response.data) as any;
        toast.error(errorData.message || "Pendaftaran gagal");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border p-8">
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
        <h1 className="text-2xl font-bold text-gray-800">
          Daftar Partner UMKM
        </h1>

        <p className="text-gray-500 mb-8">
          Lengkapi data di bawah untuk mulai berjualan di Le melle.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bagian 1: Akun Pemilik */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-blue-600 border-b pb-2">
              Data Pemilik
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nama Lengkap
                </label>
                <input
                  required
                  type="text"
                  className="mt-1 w-full p-3 border border-gray-200 text-black rounded-xl  outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  required
                  type="email"
                  className="mt-1 w-full p-3 border border-gray-200 text-black rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password (Min. 8 Karakter)
              </label>
              <input
                required
                minLength={8}
                type="password"
                className="mt-1 w-full p-3 border border-gray-200 text-black rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          {/* Bagian 2: Data Toko */}
          <div className="space-y-4 pt-4">
            <h2 className="text-lg font-semibold text-blue-600 border-b pb-2">
              Detail Toko UMKM
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nama Toko
              </label>
              <input
                required
                type="text"
                className="mt-1 w-full p-3 border border-gray-200 text-black rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.store_name}
                onChange={handleStoreNameChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Slug URL (Otomatis)
              </label>
              <input
                readOnly
                type="text"
                className="mt-1 w-full p-3 border rounded-xl bg-gray-100 text-gray-500 outline-none"
                value={formData.slug}
                placeholder="nasi-goreng-pak-eko"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nomor HP / WhatsApp
              </label>
              <input
                type="text"
                className="mt-1 w-full p-3 border border-gray-200 text-black rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.phone_number}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Alamat Lengkap Toko
              </label>
              <textarea
                required
                rows={3}
                className="mt-1 w-full p-3 border border-gray-200 text-black rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.address}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Deskripsi Toko (Jualan apa saja?)
              </label>
              <textarea
                required
                rows={3}
                className="mt-1 w-full p-3 border border-gray-200 text-black rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.description}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg text-white transition shadow-lg ${
              loading
                ? "bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95"
            }`}
          >
            {loading ? "Sedang Mendaftar..." : "Daftar Sekarang"}
          </button>
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

        <button
          type="button"
          onClick={() =>
            toast.error("Fitur Google Login sedang dalam pengembangan")
          }
          className="w-full py-4 rounded-xl font-bold text-lg text-slate-700 bg-white border border-slate-200 flex items-center justify-center gap-3 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] shadow-sm group"
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
          <span>Daftar dengan Google</span>
        </button>

        <p className="mt-8 text-center text-slate-500 text-sm">
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
