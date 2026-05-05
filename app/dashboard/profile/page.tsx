"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import Loading from "@/components/Loading";
import StoreForm from "@/components/profile/StoreForm";
import { getData } from "@/helper/apiHelper";
import api from "@/utils/axios";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/AuthContext";

// --- Interfaces ---

interface CategoryOption {
  value: number | string;
  label: string;
}

interface StoreFormData {
  name: string;
  id: number | string | null;
  store_name: string;
  email: string;
  password?: string;
  role: string;
  status: string;
  address: string;
  description: string;
  phone_number: string;
  latitude: string | number;
  longitude: string | number;
  open_at: string;
  close_at: string;
  slug: string;
  icon: string;
  icon_new: any; // Bisa berupa string URL atau objek File dari cropper
  categories: CategoryOption[];
  is_open: string | boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const { role } = useAuth();
  const [loading, setLoadingState] = useState<boolean>(true);
  const [loadingSave, setLoadingSave] = useState<boolean>(false);

  const [formDataStore, setFormDataStore] = useState<StoreFormData>({
    name: "",
    id: null,
    store_name: "",
    email: "",
    password: "",
    role: "",
    status: "",
    address: "",
    description: "",
    phone_number: "",
    latitude: "",
    longitude: "",
    open_at: "",
    close_at: "",
    slug: "",
    icon: "",
    icon_new: "",
    categories: [],
    is_open: "1",
  });

  const getProfile = async () => {
    try {
      setLoadingState(true);
      // Gunakan path relatif agar melewati proxy Next.js dan middleware
      const response = await getData<any>(`get-profile`, router);

      if (response && response.success && response.data?.data) {
        const profile = response.data.data;

        console.log(profile);

        if (profile.role === "store") {
          const store = profile.get_store ?? null;
          console.log("store.store_categories", store.store_categories);

          if (store.store_categories == null) {
            toast.error("Lengkapi data kategori toko terlebih dahulu");
          }
          const storeCategories = store.store_categories ?? [];

          const formattedCategories: CategoryOption[] = storeCategories?.map(
            (item: any) => ({
              value: item.category_id,
              label: item.categories.name,
            }),
          );

          setFormDataStore({
            id: profile.id,
            name: profile.name ?? "",
            email: profile.email ?? "",
            store_name: store.name || "",
            phone_number: store.phone_number || "",
            address: store.address || "",
            description: store.description || "",
            open_at: store.open_at?.split(":").slice(0, 2).join(":") ?? "",
            close_at: store.close_at?.split(":").slice(0, 2).join(":") ?? "",
            role: profile.role,
            status: profile.status,
            latitude: store.latitude ?? "",
            longitude: store.longitude ?? "",
            slug: store.slug || "",
            icon: store.logo_url || "",
            icon_new: store.logo_url || "",
            categories: formattedCategories ?? [],
            is_open: store.is_open ?? "1",
          });
        }
      }
    } catch (error) {
      console.error("err ", error);
      toast.error("Gagal memuat profil");
    } finally {
      setLoadingState(false);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormDataStore((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    setLoadingSave(true);
    e.preventDefault();
    const payload = new FormData();

    // Pastikan ID tidak null sebelum append
    if (formDataStore.id)
      payload.append("id_user", formDataStore.id.toString());

    payload.append("name", formDataStore.name);
    payload.append("description", formDataStore.description);
    payload.append("address", formDataStore.address);
    payload.append("phone_number", formDataStore.phone_number);
    payload.append("email", formDataStore.email);
    payload.append("role", formDataStore.role);
    payload.append("open_at", formDataStore.open_at);
    payload.append("close_at", formDataStore.close_at);
    payload.append("store_name", formDataStore.store_name);
    payload.append("latitude", formDataStore.latitude.toString());
    payload.append("longitude", formDataStore.longitude.toString());
    payload.append("is_open", formDataStore.is_open.toString());

    // Append array kategori untuk backend Laravel
    formDataStore.categories.forEach((item) => {
      payload.append("categories[]", item.value.toString());
    });

    if (formDataStore.icon_new instanceof File) {
      payload.append("icon", formDataStore.icon_new);
    }

    try {
      const result = await api.post(`update-profile`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (result.status === 201 || result.status === 200) {
        toast.success(result.data.message || "Profil berhasil diperbarui");
        // Reload untuk sinkronisasi state global/konteks jika diperlukan
        window.location.reload();
      } else {
        toast.error(result.data.message || "Gagal memperbarui profil");
      }
    } catch (error) {
      console.error("err ", error);
      toast.error("Terjadi kesalahan saat memperbarui profil");
    } finally {
      setLoadingSave(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <div className="p-6 max-w-12xl mx-auto font-poppins">
      {/* Header Navigasi */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Profile</h1>
          <p className="text-sm text-gray-500">
            Kelola informasi identitas dan toko Anda
          </p>
        </div>
      </div>

      {loading ? (
        <Loading fullPage={false} text="Memuat data profil..." />
      ) : role === "store" ? (
        <StoreForm
          isLoadingButton={loadingSave}
          data={formDataStore}
          onChange={handleChange}
          onSubmit={handleSubmit}
          setFormData={setFormDataStore}
        />
      ) : (
        <div className="bg-white p-10 rounded-xl border border-dashed border-slate-200 text-center text-slate-400">
          Informasi profil tidak tersedia untuk role Anda.
        </div>
      )}
    </div>
  );
}
