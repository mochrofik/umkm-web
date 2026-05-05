"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Phone,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import api from "@/utils/axios";
import Image from "next/image";
import Swal from "sweetalert2";
import { deleteData, getData } from "@/helper/apiHelper";
import getCroppedImg from "@/helper/cropImage/cropImage";
import Loading from "@/components/Loading";
import ImageCropper from "@/helper/cropImage/imageCropper";
import Pagination from "@/components/Pagination";
import { Store, StoreFormData, StoreResponse } from "@/types/stores";
import { DEFAULT_STATUS, STATUS_MAP } from "@/types/status";

// --- Interfaces ---


export default function StorePage() {
  const router = useRouter();
  const [stores, setDataStores] = useState<Store[]>([]);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [loading, setLoadingState] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastpage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  const initialFormData: StoreFormData = {
    name: "",
    id: null,
    store_name: "",
    email: "",
    password: "",
    role: "store",
    status: "verify",
    address: "",
    description: "",
    phone_number: "",
    latitude: "",
    longitude: "",
    open_at: "",
    close_at: "",
    slug: "",
  };

  const [formData, setFormData] = useState<StoreFormData>(initialFormData);
  const [processing, setProcessing] = useState<boolean>(false);
  const [selectedImg, setSelectedImage] = useState<File | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState<boolean>(false);

  const fetchStores = async (page: number = 1, search: string = "") => {
    try {
      setLoadingState(true);
      const url = process.env.NEXT_PUBLIC_SITE_URL;
      const response = await getData<StoreResponse>(
        `${url}api/store/get`,
        router,
        { page, search }
      );

      if (response && response.success && response.data) {
        setDataStores(response.data.data.data);
        setCurrentPage(response.data.data.current_page || 1);
        setLastpage(response.data.data.last_page || 1);
        setPerPage(response.data.data.per_page || 10);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengambil data toko");
    } finally {
      setLoadingState(false);
    }
  };

  const openModal = (store: Store | null = null) => {
    if (store) {
      setEditingStore(store);
      setFormData({
        address: store.address,
        close_at: store.close_at?.split(":").slice(0, 2).join(":") || "",
        open_at: store.open_at?.split(":").slice(0, 2).join(":") || "",
        description: store.description ?? "",
        email: store.user.email ?? "",
        id: store.user_id,
        latitude: store.latitude ?? "",
        longitude: store.longitude ?? "",
        name: store.user.name ?? "",
        password: "",
        phone_number: store.phone_number ?? "",
        role: "store",
        status: store.user.status,
        store_name: store.name,
        slug: store.slug,
      });
      setPreviewImg(store.logo_url ?? "");
    } else {
      setEditingStore(null);
      setFormData(initialFormData);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setFormData(initialFormData);
    setSelectedImage(null);
    setPreviewImg(null);
    setEditingStore(null);
    setIsModalOpen(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
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
      setSelectedImage(croppedImage);
      setShowCropper(false);
    }
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Konfirmasi Hapus",
      text: "Data toko yang dihapus akan masuk ke arsip (Soft Delete).",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    }).then(async (result:any) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: "Memproses...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
          });

          const token = localStorage.getItem("token");
          const url = process.env.NEXT_PUBLIC_SITE_URL;
          await deleteData(`${url}api/store/destroy/${id}`, router);
          
          Swal.fire({
            title: "Berhasil!",
            text: "Toko telah dihapus.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });

          fetchStores(currentPage, searchTerm);
        } catch (error) {
          toast.error("Terjadi kesalahan saat hapus data toko");
        }
      }
    });
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchStores(1, searchTerm);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation tidak didukung browser Anda");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData({
          ...formData,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => toast.error("Gagal mengambil lokasi: " + err.message),
      { enableHighAccuracy: true }
    );
  };

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
    setProcessing(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) payload.append(key, String(value));
      });

      if (selectedImg) {
        payload.append("logo", selectedImg);
      }

      const response = await api.post("store/add-edit", payload, {
        headers: {
          Accept: "application/json",
        },
      });

      if (response.status === 200 || response.status === 201) {
        fetchStores(currentPage, searchTerm);
        closeModal();
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat memproses data");
    } finally {
      setProcessing(false);
    }
  };

  const MapPicker = dynamic(() => import("@/components/MapPicker"), {
    ssr: false,
    loading: () => <div className="h-64 bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400">Memuat Peta...</div>,
  });

  useEffect(() => {
    fetchStores(currentPage, searchTerm);
  }, [currentPage]);

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-poppins">Data Toko</h1>
          <p className="text-slate-500 text-sm">Kelola Data Toko UMKM</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all font-bold"
        >
          <Plus size={18} />
          Tambah Toko
        </button>
      </div>

      {/* Search Section */}

      <div className="flex flex-row gap-4">
        <div className="w-full">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Cari toko & tekan Enter..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>

        </div>
        
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-poppins">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">No</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Toko</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Kontak</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-center">Lokasi</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <Loading fullPage={false} text="Memuat data toko..." />
                  </td>
                </tr>
              ) : stores.length > 0 ? (
                stores.map((store, index) => {
                  const rowNumber = (currentPage - 1) * perPage + (index + 1);
                  const googleMapsUrl = store.latitude && store.longitude
                    ? `https://www.google.com/maps?q=${store.latitude},${store.longitude}`
                    : `https://www.google.com/maps/search/${encodeURIComponent(store.name + " " + store.address)}`;

                  
                    const currentStatus = STATUS_MAP[store.user.status] || DEFAULT_STATUS;
                  
                    return (
                    <tr key={store.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-600 text-sm">{rowNumber}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Image
                            src={store.logo_url ?? "/public/file.svg"}
                            alt={store.name}
                            width={40}
                            height={40}
                            unoptimized
                            className="object-cover rounded-lg border border-slate-100 h-10 w-10"
                          />
                          <div>
                            <div className="font-bold text-slate-800 text-sm">{store.name}</div>
                            <div className="text-xs text-slate-500">{store.user.email}</div>
                            <div className="text-[11px] text-slate-500">⭐ {store.rating}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-green-700">
                          
                           {store.phone_number ? (
                          <a
                            href={`https://wa.me/${store.phone_number}`}
                            target="_blank"
                            className="flex items-center gap-1 hover:text-green-600"
                          >
                            <Phone size={14} /> {store.phone_number}
                          </a>
                        ) : (
                          "-"
                        )}
                          </div>
                        <div className="text-slate-400 text-xs truncate max-w-[150px]">{store.address}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-full transition-all">
                          <Navigation size={18} />
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <span
          className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${currentStatus.color}`}
        >
          {currentStatus.label} </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openModal(store)} className="p-2 cursor-pointer text-blue-400 hover:text-blue-600 rounded-lg"><Pencil size={18} /></button>
                          <button onClick={() => handleDelete(store.id)} className="p-2   cursor-pointer text-red-400 hover:text-red-600 rounded-lg"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">Data toko tidak ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
          currentPage={currentPage}
          lastPage={lastPage}
          loading={loading}
          setCurrentPrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          setCurrentNext={() => setCurrentPage((prev) => Math.min(prev + 1, lastPage))}
          />
        </div>
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-bold text-slate-800 font-poppins">
                {editingStore ? "Edit Toko" : "Tambah Toko Baru"}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[70vh]">
               <div className="p-6 space-y-4">
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Informasi Akun
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nama Pemilik
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Password{" "}
                      {editingStore && (
                        <span className="text-xs text-slate-400 font-normal">
                          (Kosongkan jika tidak ganti)
                        </span>
                      )}
                    </label>
                    <input
                      type="password"
                      required={!editingStore}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Status
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                      >
                        <option value="active">Active</option>
                        <option value="verify">Verify</option>
                        <option value="banned">Banned</option>
                      </select>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* --- DATA TOKO (Store Profile) --- */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Profil Toko
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nama Toko
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
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
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Icon Toko
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center overflow-hidden bg-slate-50">
                        {previewImg ? (
                          <img
                            src={previewImg}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-slate-400 text-[10px] text-center p-1">
                            No Icon
                          </span>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      No. Telepon (Opsional)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                      value={formData.phone_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone_number: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Alamat
                    </label>
                    <textarea
                      required
                      rows={2}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Deskripsi
                    </label>
                    <textarea
                      required
                      rows={2}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Jam Buka
                      </label>
                      <input
                        type="time"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                        value={formData.open_at}
                        onChange={(e) =>
                          setFormData({ ...formData, open_at: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Jam Tutup
                      </label>
                      <input
                        type="time"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                        value={formData.close_at}
                        onChange={(e) =>
                          setFormData({ ...formData, close_at: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Lokasi Toko (Pin Map)
                    </label>
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      <Navigation size={14} />
                      Gunakan Lokasi Saat Ini
                    </button>
                    <MapPicker
                      lat={Number(formData.latitude)}
                      lng={Number(formData.longitude) }
                      onChange={(lat, lng) => {
                        setFormData({
                          ...formData,
                          latitude: lat,
                          longitude: lng,
                        });
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                        value={formData.latitude}
                        onChange={(e) =>
                          setFormData({ ...formData, latitude: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                        value={formData.longitude}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            longitude: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3 border-t">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 font-bold">Batal</button>
                <button
                  type="submit"
                  disabled={processing}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {processing && <Loader2 size={16} className="animate-spin" />}
                  {editingStore ? "Update Toko" : "Simpan Toko"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cropper Overlay */}
      {showCropper && imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCropDone}
          onCancel={() => setShowCropper(false)}
        />
      )}
    </div>
  );
}