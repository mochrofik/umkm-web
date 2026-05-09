"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import Loading from "@/components/Loading";
import { getData } from "@/helper/apiHelper";
import api from "@/utils/axios";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Hash,
  Camera,
  Save,
  Search,
  X,
  Smartphone,
  ShieldCheck,
  Code,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/AuthContext";

interface ProfileResponse {
  id: number | string | null;
  name: string;
  email: string;
  phone_number: string;
  nik: string;
  gender: string;
  date_of_birth: string;
  address: string;
  postal_code: string;
  avatar_url: string;
  avatar_new: any; // File object
}

export default function CustomerProfilePage() {
  const router = useRouter();
  const { role, user: authUser, logout } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingSave, setLoadingSave] = useState<boolean>(false);

  // Phone Modal State
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [otpStep, setOtpStep] = useState(1);
  const [newPhone, setNewPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");

  // Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailOtpStep, setEmailOtpStep] = useState(1);
  const [newEmail, setNewEmail] = useState("");
  const [emailOtpCode, setEmailOtpCode] = useState("");

  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const maskPhone = (phone: string) => {
    if (!phone) return "-";
    if (phone.length < 8) return phone;
    return `${phone.substring(0, 4)}*********${phone.substring(phone.length - 3)}`;
  };

  const maskEmail = (email: string) => {
    if (!email) return "-";
    const [user, domain] = email.split("@");
    if (!domain) return email;
    return `${user.substring(0, 1)}*********@${domain}`;
  };

  const [formData, setFormData] = useState<ProfileResponse>({
    id: null,
    name: "",
    email: "",
    phone_number: "",
    nik: "",
    gender: "",
    date_of_birth: "",
    address: "",
    postal_code: "",
    avatar_url: "",
    avatar_new: null,
  });

  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getData<any>(`get-profile`, router);

      if (response && response.success && response.data?.data) {
        const profile = response.data.data;
        const store = profile.get_store ?? {};

        setFormData({
          id: profile.id,
          name: profile.name ?? "",
          email: profile.email ?? "",
          phone_number: profile.phone_number ?? "",
          nik: profile.nik ?? "",
          gender: profile.gender ?? "",
          date_of_birth: profile.date_of_birth ?? "",
          address: profile.address ?? "",
          postal_code: profile.postal_code ?? "",
          avatar_url: profile.avatar_url ?? "",
          avatar_new: null,
        });

        if (profile.avatar_url) {
          setPreviewAvatar(profile.avatar_url);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Gagal memuat profil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, avatar_new: file }));
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoadingSave(true);

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("nik", formData.nik);
      payload.append("gender", formData.gender);
      payload.append("date_of_birth", formData.date_of_birth);
      payload.append("address", formData.address);
      payload.append("postal_code", formData.postal_code);
      payload.append("role", "customer");

      if (formData.avatar_new) {
        payload.append("avatar", formData.avatar_new);
      }

      const response = await api.post("update-user", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Profil berhasil diperbarui");
        // Optionally update global state or just re-fetch
        fetchProfile();
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      setLoadingSave(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading fullPage={false} text="Memuat profil Anda..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-10 px-4 py-10">
      <div className="max-w-12xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-500 hover:text-blue-600 hover:border-blue-100 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2md font-black text-gray-900 tracking-tight">
              Profil Pengguna
            </h1>
            <p className="text-sm text-gray-500 font-small">
              Kelola informasi pribadi Anda
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Sisi Kiri: Avatar & Info Dasar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-   h-32 bg-gradient-to-br from-blue-500 to-blue-600 opacity-10"></div>

              <div className="relative mb-6">
                <div className="w-20 h-32 mx-auto rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-gray-100 group relative">
                  {previewAvatar ? (
                    <img
                      src={previewAvatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                      <User size={48} />
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="text-white" size={24} />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900">
                {formData.name || "User Name"}
              </h3>
              <p className="text-sm text-gray-500 font-medium">
                {formData.email}
              </p>

              <div className="mt-6 pt-6 border-t border-gray-50">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest">
                  Pelanggan Tetap
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                <CreditCard size={18} className="text-blue-500" />
                Status Akun
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">NIK Terverifikasi</span>
                  <span
                    className={
                      formData.nik
                        ? "text-green-500 font-bold"
                        : "text-amber-500 font-bold"
                    }
                  >
                    {formData.nik ? "Sudah" : "Belum"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Terdaftar Sejak</span>
                  <span className="text-gray-900 font-bold">Mei 2024</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Form Data */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-8 pb-4 border-b border-gray-50 flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <User size={20} className="text-blue-600" />
                </div>
                Informasi Pribadi
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nama */}
                <div className="flex-1 max-w-md ">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                    Nama Lengkap
                  </label>
                  <div className="w-full flex  py-3.5 justify-end items-center bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-semibold text-gray-900 px-4 py-2">
                    <User className="text-gray-400" size={18} />
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      minLength={3}
                      className="
                      font-poppins bg-gray-50 text-gray-900 ml-2 w-full outline-none text-sm"
                      placeholder="Nama Anda"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex-1 max-w-md">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                    Alamat Email
                  </label>
                  <div className="w-full flex py-3.5 items-center bg-gray-100 border-none rounded-2xl px-4 justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="text-gray-400" size={18} />
                      <span className="font-poppins text-gray-900 text-sm font-semibold">
                        {maskEmail(formData.email)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEmailModalOpen(true);
                        setEmailOtpStep(1);
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Ubah
                    </button>
                  </div>
                </div>

                {/* Nomor HP */}
                <div className="flex-1 max-w-md">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                    Nomor Telepon
                  </label>
                  <div className="w-full flex py-3.5 items-center bg-gray-100 border-none rounded-2xl px-4 justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="text-gray-400" size={18} />
                      <span className="font-poppins text-gray-900 text-sm font-semibold">
                        {maskPhone(formData.phone_number)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPhoneModalOpen(true);
                        setOtpStep(1);
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Ubah
                    </button>
                  </div>
                </div>

                {/* NIK */}
                <div className="flex-1 max-w-md">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                    NIK (KTP)
                  </label>
                  <div className="w-full flex py-3.5 items-center bg-gray-100 border-none rounded-2xl focus-within:ring-2 focus-within:ring-blue-500 transition-all px-4">
                    <Hash className="text-gray-400" size={18} />
                    <input
                      name="nik"
                      value={formData.nik}
                      onChange={handleChange}
                      className="font-poppins bg-transparent text-gray-900 ml-3 w-full outline-none text-sm font-semibold"
                      placeholder="16 digit NIK"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="flex-1 max-w-md">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                    Jenis Kelamin
                  </label>
                  <div className="w-full flex py-3.5 items-center bg-gray-100 border-none rounded-2xl focus-within:ring-2 focus-within:ring-blue-500 transition-all px-4">
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="font-poppins bg-transparent text-gray-900 w-full outline-none text-sm font-semibold appearance-none cursor-pointer"
                    >
                      <option value="">Pilih Gender</option>
                      <option value="male">Laki-laki</option>
                      <option value="female">Perempuan</option>
                    </select>
                  </div>
                </div>

                {/* Tanggal Lahir */}
                <div className="flex-1 max-w-md">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                    Tanggal Lahir
                  </label>
                  <div className="w-full flex py-3.5 items-center bg-gray-100 border-none rounded-2xl focus-within:ring-2 focus-within:ring-blue-500 transition-all px-4">
                    <Calendar className="text-gray-400" size={18} />
                    <input
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className="font-poppins bg-transparent text-gray-900 ml-2 w-full outline-none text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-12 flex justify-end mt-8">
                <button
                  type="submit"
                  disabled={loadingSave}
                  className="flex items-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loadingSave ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Save size={20} />
                  )}
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Modal Ubah Nomor HP */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            {/* Dekorasi Background */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50"></div>

            <div className="relative">
              <div className="flex justify-between items-center mb-6">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <Smartphone className="text-blue-600" size={24} />
                </div>
                <button
                  onClick={() => setIsPhoneModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>

              {otpStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">
                      Verifikasi Nomor Lama
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Untuk keamanan, kami akan mengirimkan kode OTP ke nomor
                      Anda yang saat ini terdaftar:{" "}
                      <span className="font-bold text-gray-900">
                        {maskPhone(formData.phone_number)}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsSendingOtp(true);
                      // Mock API Call
                      setTimeout(() => {
                        setIsSendingOtp(false);
                        setOtpStep(2);
                        toast.success("OTP berhasil dikirim ke nomor lama");
                      }, 1500);
                    }}
                    disabled={isSendingOtp}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    {isSendingOtp ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>Kirim Kode OTP</>
                    )}
                  </button>
                </div>
              )}

              {otpStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">
                      Nomor Baru
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Masukkan nomor WhatsApp baru dan kode otp yang sudah
                      dikirim
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Kode OTP
                    </label>
                    <div className="flex items-center bg-gray-50 rounded-2xl px-4 py-4 group focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                      <Code
                        className="text-gray-400 group-focus-within:text-blue-500 transition-colors"
                        size={18}
                      />
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="bg-transparent ml-2 w-full outline-none font-bold text-gray-900"
                        placeholder="kode OTP"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Nomor WhatsApp Baru
                    </label>
                    <div className="flex items-center bg-gray-50 rounded-2xl px-4 py-4 group focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                      <Phone
                        className="text-gray-400 group-focus-within:text-blue-500 transition-colors"
                        size={18}
                      />
                      <input
                        type="text"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="bg-transparent ml-2 w-full outline-none font-bold text-gray-900"
                        placeholder="Contoh: 081234567890"
                      />
                    </div>
                  </div>

                  <button
                    disabled={isSendingOtp}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all"
                  >
                    Lanjutkan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Modal Ubah Email */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50"></div>

            <div className="relative">
              <div className="flex justify-between items-center mb-6">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <Mail className="text-blue-600" size={24} />
                </div>
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>

              {emailOtpStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">
                      Verifikasi Email Lama
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Untuk keamanan, kami akan mengirimkan kode OTP ke email
                      Anda yang saat ini terdaftar:{" "}
                      <span className="font-bold text-gray-900">
                        {maskEmail(formData.email)}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsSendingOtp(true);
                      setTimeout(() => {
                        setIsSendingOtp(false);
                        setEmailOtpStep(2);
                        toast.success("OTP berhasil dikirim ke email lama");
                      }, 1500);
                    }}
                    disabled={isSendingOtp}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    {isSendingOtp ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>Kirim Kode OTP</>
                    )}
                  </button>
                </div>
              )}

              {emailOtpStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">
                      Email Baru
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Masukkan alamat email baru dan kode OTP yang sudah dikirim
                      ke email lama.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Kode OTP (Email Lama)
                    </label>
                    <div className="flex items-center bg-gray-50 rounded-2xl px-4 py-4 group focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                      <Code
                        className="text-gray-400 group-focus-within:text-blue-500 transition-colors"
                        size={18}
                      />
                      <input
                        type="text"
                        value={emailOtpCode}
                        onChange={(e) => setEmailOtpCode(e.target.value)}
                        className="bg-transparent ml-2 w-full outline-none font-bold text-gray-900"
                        placeholder="kode OTP"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Alamat Email Baru
                    </label>
                    <div className="flex items-center bg-gray-50 rounded-2xl px-4 py-4 group focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                      <Mail
                        className="text-gray-400 group-focus-within:text-blue-500 transition-colors"
                        size={18}
                      />
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="bg-transparent ml-2 w-full outline-none font-bold text-gray-900"
                        placeholder="emailbaru@example.com"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!newEmail || !emailOtpCode)
                        return toast.error("Lengkapi data");
                      setIsSendingOtp(true);
                      setTimeout(() => {
                        setIsSendingOtp(false);
                        setFormData({ ...formData, email: newEmail });
                        setIsEmailModalOpen(false);
                        toast.success(
                          "Email berhasil diperbarui sementara. Klik Simpan Perubahan.",
                        );
                      }, 1500);
                    }}
                    disabled={isSendingOtp}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all"
                  >
                    Verifikasi & Selesai
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
