"use client";

import { GoogleUser } from "@/types/google_user";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface CreatePasswordFormProps {
  google_user: GoogleUser;
  role: string;
}

export default function CreatePasswordForm({
  google_user,
  role,
}: CreatePasswordFormProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const [formData, setFormData] = useState<any>({
    google_id: google_user.google_id,
    role: role,
    name: google_user.name,
    email: google_user.email,
    phone_number: "",
    password: "",
    password_confirmation: "",
    status: "active",
  });

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = process.env.NEXT_PUBLIC_SITE_URL;
      const response = await axios.post(
        `${url}api/register-from-google`,
        formData,
      );
      console.log(response.data);

      if (response.status === 200) {
        toast.success(response.data.message);
        router.push("/login");
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border p-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Daftar Sebagai Pelanggan UMKM
        </h1>

        <p className="text-gray-500 mb-8">Lengkapi data di bawah</p>

        <form onSubmit={submitForm} className="space-y-6">
          {/* Bagian 1: Akun Pemilik */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-blue-600 border-b pb-2">
              Data Pribadi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nama Lengkap
                </label>
                <input
                  required
                  type="text"
                  minLength={3}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 w-full p-3 border border-gray-200 text-black rounded-xl  outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  required
                  type="email"
                  readOnly
                  value={formData.email}
                  className="mt-1 w-full p-3 border border-gray-200 text-black rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nomor HP / WhatsApp
              </label>
              <input
                type="text"
                required
                minLength={10}
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                className="mt-1 w-full p-3 border border-gray-200 text-black rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password (Min. 8 Karakter)
              </label>
              <input
                required
                minLength={8}
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="mt-1 w-full p-3 border border-gray-200 text-black rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Konfirmasi Password
              </label>
              <input
                required
                minLength={8}
                type="password"
                value={formData.password_confirmation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password_confirmation: e.target.value,
                  })
                }
                className={`mt-1 w-full p-3 border rounded-xl outline-none focus:ring-2 transition-all ${
                  formData.password_confirmation &&
                  formData.password !== formData.password_confirmation
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:ring-blue-500"
                } text-black`}
              />
              {formData.password_confirmation &&
                formData.password !== formData.password_confirmation && (
                  <p className="text-red-500 text-xs mt-1 animate-pulse">
                    * Password tidak cocok
                  </p>
                )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={` cursor-pointer w-full py-4 rounded-xl font-bold text-lg text-white transition shadow-lg ${
              loading
                ? "bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95"
            }`}
          >
            {loading ? "Sedang Mendaftar..." : "Daftar Sekarang"}
          </button>
        </form>
      </div>
    </div>
  );
}
