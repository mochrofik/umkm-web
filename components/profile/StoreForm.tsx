"use client";

import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Navigation, User } from "lucide-react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";

import { getData } from "@/helper/apiHelper";
import getCroppedImg from "@/helper/cropImage/cropImage";
import ImageCropper from "@/helper/cropImage/imageCropper";
import Loading from "../Loading";

// --- Interfaces ---

interface CategoryOption {
  value: string | number;
  label: string;
}

interface StoreData {
  name: string;
  email: string;
  store_name: string;
  phone_number: string;
  address: string;
  description: string;
  open_at: string;
  close_at: string;
  latitude: number | string;
  longitude: number | string;
  categories: CategoryOption[];
  icon_new: any;
  is_open: string | boolean;
}

interface StoreFormProps {
  isLoadingButton: boolean;
  data: StoreData;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent) => void;
}

interface RawCategory {
  id: number | string;
  name: string;
}

export default function StoreForm({
  isLoadingButton,
  data,
  setFormData,
  onChange,
  onSubmit,
}: StoreFormProps) {
  const [selectedImg, setSelectedImage] = useState<File | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [kategoriTerpilih, setKategoriTerpilih] = useState<
    readonly CategoryOption[]
  >([]);

  // --- Functions ---

  const fetchCategories = async (page: number = 1, limit: number = 1000) => {
    setIsLoading(true);
    try {
      const response = await getData<any>(
        `categories-user?page=${page}&limit=${limit}`,
        // @ts-ignore (karena apiHelper kamu butuh router, namun di sini kita hanya fetch data global)
        null,
      );

      if (response && response.success) {
        const rawData: RawCategory[] = response.data.data.data;

        const formattedData: CategoryOption[] = rawData?.map((item) => ({
          value: item.id,
          label: item.name,
        }));

        if (formattedData) {
          setCategories(formattedData);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat mengambil data kategori");
    } finally {
      setIsLoading(false);
    }
  };

  const onChangeFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
      setSelectedImage(file);
    }
  };

  const handleCropDone = async (croppedPixels: any) => {
    if (imageToCrop) {
      const croppedImage = await getCroppedImg(imageToCrop, croppedPixels);
      setPreviewImg(URL.createObjectURL(croppedImage));

      setFormData((prev: any) => ({
        ...prev,
        icon_new: croppedImage,
      }));

      setShowCropper(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation tidak didukung oleh browser Anda");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData((prev: any) => ({
          ...prev,
          latitude: latitude,
          longitude: longitude,
        }));
      },
      (err) => {
        toast.error("Gagal mengambil lokasi: " + err.message);
      },
      { enableHighAccuracy: true },
    );
  };

  // --- Dynamic Imports ---

  const MapPicker = dynamic<any>(() => import("@/components/MapPicker"), {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400">
        Memuat Peta...
      </div>
    ),
  });

  const Select = dynamic<any>(() => import("react-select"), {
    ssr: false,
    loading: () => <p className="text-sm text-slate-400">Memuat data...</p>,
  });

  // --- Effects ---

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (data.categories) {
      setKategoriTerpilih(data.categories);
    }
  }, [data.categories]);

  return (
    <form onSubmit={onSubmit} className="p-6 space-y-8">
      {/* SEKSI IDENTITAS */}
      <section>
        <h2 className="text-lg font-semibold text-blue-600 mb-4 border-l-4 border-blue-600 pl-3">
          Identitas Pemilik
        </h2>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="md:col-span-1 space-y-4">
            <label className="block text-sm font-semibold text-slate-700 mb-4">
              Foto Profil
            </label>
            <div className="aspect-square w-40 mx-auto border-2 border-dashed border-slate-200 rounded-full flex flex-col items-center justify-center overflow-hidden bg-slate-50 group relative">
              {previewImg ? (
                <img
                  src={previewImg}
                  alt="Preview Avatar"
                  className="w-full h-full object-cover"
                />
              ) : data.icon_new && data.icon_new !== "" ? (
                <img
                  src={
                    typeof data.icon_new === "string"
                      ? data.icon_new
                      : URL.createObjectURL(data.icon_new)
                  }
                  alt="Preview Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4">
                  <User className="mx-auto text-slate-300 mb-2" size={40} />
                  <span className="text-xs text-slate-400">
                    Belum ada foto profil
                  </span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={onChangeFile}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-3 text-center">
              Rekomendasi ukuran 1:1 (Square) maks 2MB
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nama Pemilik
              </label>
              <input
                type="text"
                name="name"
                value={data.name}
                onChange={onChange}
                className="mt-1 block w-full rounded-md border-gray-300 border p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan nama lengkap"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={data.email}
                onChange={onChange}
                className="mt-1 block w-full rounded-md border-gray-300 border p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="email@contoh.com"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SEKSI PROFIL TOKO */}
      <section>
        <h2 className="text-lg font-semibold text-blue-600 mb-4 border-l-4 border-blue-600 pl-3">
          Profil Toko
        </h2>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          {/* Status Buka/Tutup Toggle */}
          <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${data.is_open == "1" || data.is_open === "true" ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
              />
              <div>
                <p className="text-sm font-bold text-slate-700">
                  Status Toko Saat Ini
                </p>
                <p className="text-xs text-slate-500">
                  {data.is_open == "1" || data.is_open === "true"
                    ? "Toko Anda sedang BUKA dan terlihat oleh pelanggan"
                    : "Toko Anda sedang TUTUP dan tidak menerima pesanan"}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={data.is_open == "1" || data.is_open === "true"}
                onChange={(e) => {
                  const newValue = e.target.checked ? "1" : "0";
                  setFormData((prev: any) => ({ ...prev, is_open: newValue }));
                }}
              />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Nama Toko
              </label>
              <input
                type="text"
                name="store_name"
                value={data.store_name}
                onChange={onChange}
                className="mt-1 block w-full rounded-md border-gray-300 border p-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori Toko (Bisa pilih lebih dari satu)
              </label>
              <Select
                isMulti
                isLoading={isLoading}
                instanceId="kategori-select"
                name="kategori"
                options={categories}
                className="basic-multi-select"
                placeholder="Pilih kategori..."
                value={kategoriTerpilih}
                onChange={(value: readonly CategoryOption[]) => {
                  const selectedValues = value ? [...value] : [];
                  setKategoriTerpilih(selectedValues);
                  setFormData((prev: any) => ({
                    ...prev,
                    categories: selectedValues,
                  }));
                }}
                noOptionsMessage={() => "Kategori tidak ditemukan"}
              />
              <p className="mt-1 text-xs text-gray-500 italic">
                *Pilih satu atau beberapa kategori yang sesuai dengan toko Anda.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                No. Telepon
              </label>
              <input
                type="text"
                name="phone_number"
                value={data.phone_number}
                onChange={onChange}
                className="mt-1 block w-full rounded-md border-gray-300 border p-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Alamat Lengkap
              </label>
              <textarea
                name="address"
                rows={2}
                value={data.address}
                onChange={onChange}
                className="mt-1 block w-full rounded-md border-gray-300 border p-2"
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Deskripsi Toko
              </label>
              <textarea
                name="description"
                rows={3}
                value={data.description}
                onChange={onChange}
                className="mt-1 block w-full rounded-md border-gray-300 border p-2"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Jam Buka
              </label>
              <input
                type="time"
                name="open_at"
                value={data.open_at}
                onChange={onChange}
                className="mt-1 block w-full rounded-md border-gray-300 border p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Jam Tutup
              </label>
              <input
                type="time"
                name="close_at"
                onChange={onChange}
                value={data.close_at}
                className="mt-1 block w-full rounded-md border-gray-300 border p-2"
              />
            </div>
          </div>
          <div className="mt-5">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Lokasi Toko (Pin Map)
            </label>
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold mb-2"
            >
              <Navigation size={14} />
              Gunakan Lokasi Saat Ini
            </button>
            <MapPicker
              lat={Number(data.latitude)}
              lng={Number(data.longitude)}
              onChange={(lat: number, lng: number) => {
                setFormData((prev: any) => ({
                  ...prev,
                  latitude: lat,
                  longitude: lng,
                }));
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                name="latitude"
                step="any"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                value={data.latitude}
                onChange={onChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                name="longitude"
                step="any"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                value={data.longitude}
                onChange={onChange}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-4">
        {isLoadingButton ? (
          <Loading fullPage={false} />
        ) : (
          <button
            type="submit"
            disabled={isLoadingButton}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            Simpan Perubahan
          </button>
        )}
      </div>

      {showCropper && imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCropDone}
          onCancel={() => setShowCropper(false)}
        />
      )}
    </form>
  );
}
