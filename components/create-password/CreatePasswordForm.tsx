"use client";

import { GoogleUser } from "@/types/google_user";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { registerFromGoogleService } from "@/service/auth.service";
import InputUI from "../ui/input/Input";
import ButtonUI from "../ui/button/Button";

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
    role: role ?? "customer",
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
      const response = await registerFromGoogleService(formData);

      if (response.success) {
        toast.success(response.message || "Pendaftaran berhasil");
        router.push("/login");
      } else {
        toast.error(response.message || "Pendaftaran gagal");
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
              <InputUI
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                label="Nama Lengkap"
                required
                minLength={3}
                placeholder="Nama Lengkap"
                type="text"
              />

              <InputUI
                value={formData.email}
                label="Email"
                required
                placeholder="Email"
                type="email"
                readOnly={true}
                disabled={true}
                onChange={(e) => {}}
              />
            </div>

            <InputUI
              value={formData.phone_number}
              onChange={(e) =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
              label="Nomor HP / WhatsApp"
              required
              minLength={10}
              placeholder="Nomor HP / WhatsApp"
              type="text"
            />

            <InputUI
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              label="Password (Min. 8 Karakter)"
              required
              minLength={8}
              placeholder="Password"
              type="password"
            />

            <InputUI
              value={formData.password_confirmation}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password_confirmation: e.target.value,
                })
              }
              label="Konfirmasi Password"
              required
              minLength={8}
              placeholder="Konfirmasi Password"
              type="password"
              confirmationPassword={formData.password}
            />
          </div>

          <ButtonUI type="submit" loading={loading}>
            {loading ? "Sedang Mendaftar..." : "Daftar Sekarang"}
          </ButtonUI>
        </form>
      </div>
    </div>
  );
}
