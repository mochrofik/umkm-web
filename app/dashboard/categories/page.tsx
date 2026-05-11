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
} from "lucide-react";
import Swal, { SweetAlertResult } from "sweetalert2";
import toast from "react-hot-toast";
import Image from "next/image";
import axios from "axios";
import Loading from "@/components/Loading";
import getCroppedImg from "@/helper/cropImage/cropImage";
import { deleteData, getData, postData } from "@/helper/apiHelper";
import { useRouter } from "next/navigation";
import ImageCropper from "@/helper/cropImage/imageCropper";
import Pagination from "@/components/Pagination";

// --- Interfaces ---

interface Category {
  id: number;
  name: string;
  icon_url: string | null;
}

interface CategoryResponse {
  data: {
    data: Category[];
    current_page: number;
    last_page: number;
    per_page: number;
  };
}

interface FormDataState {
  name: string;
  id: number | null;
}

export default function CategoryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentpage] = useState<number>(1);
  const [lastPage, setLastpage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<FormDataState>({
    name: "",
    id: null,
  });
  const [processing, setProcessing] = useState<boolean>(false);

  const [selectedImg, setSelectedImage] = useState<File | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState<boolean>(false);

  const fetchCategories = async (page: number = 1, search: string = "") => {
    try {
      setLoading(true);
      const response = await getData<any>(
        `category/get?page=${page}&search=${search}&limit=${perPage}`,
        router,
      );

      if (response.success) {
        const data = (await response.data) as CategoryResponse;
        setCategories(data.data.data);
        setCurrentpage(data.data.current_page || 1);
        setLastpage(data.data.last_page || 1);
        setPerPage(data.data.per_page || 10);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengambil data kategori");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(currentPage, searchTerm);
  }, [currentPage]);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const payload = new FormData();
      payload.append("name", formData.name);

      if (selectedImg) {
        payload.append("icon", selectedImg);
      }

      if (editingCategory) {
        payload.append("id", editingCategory.id.toString());
      }

      const response = await postData("category/add-edit", payload);

      if (response.status === 200 || response.status === 201) {
        fetchCategories(currentPage, searchTerm);
        closeModal();
        toast.success(response.message || "Kategori berhasil disimpan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan data kategori");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data kategori yang dihapus akan masuk ke arsip (Soft Delete).",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    }).then(async (result: SweetAlertResult) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: "Memproses...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
          });

          await deleteData(`category/destroy/${id}`, router);

          Swal.fire({
            title: "Berhasil!",
            text: "Kategori telah dihapus.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });

          fetchCategories(currentPage, searchTerm);
        } catch (error) {
          toast.error("Terjadi kesalahan saat hapus data kategori");
        }
      }
    });
  };

  const openModal = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setPreviewImg(category.icon_url);
      setFormData({ name: category.name, id: category.id });
    } else {
      setEditingCategory(null);
      setPreviewImg(null);
      setSelectedImage(null);
      setFormData({ name: "", id: null });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", id: null });
    setEditingCategory(null);
    setPreviewImg(null);
    setSelectedImage(null);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setCurrentpage(1);
    fetchCategories(1, searchTerm);
  };

  return (
    <div className="p-6 font-poppins">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Kategori</h1>
          <p className="text-slate-500 text-sm">Kelola kategori produk UMKM</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all font-bold"
        >
          <Plus size={18} />
          Tambah Kategori
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative w-full md:w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Cari & tekan Enter..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>
      </form>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                No
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Nama Kategori
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Icon
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center">
                  <Loading fullPage={false} text="Memuat data kategori..." />
                </td>
              </tr>
            ) : categories?.length > 0 ? (
              categories.map((cat, index) => {
                const rowNumber = (currentPage - 1) * perPage + (index + 1);
                return (
                  <tr
                    key={cat.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-600">{rowNumber}</td>
                    <td className="px-6 py-4 font-medium text-slate-800 ">
                      {cat.name}
                    </td>
                    <td className=" py-4">
                      {cat.icon_url ? (
                        <Image
                          src={cat.icon_url}
                          alt={cat.name}
                          width={100}
                          height={100}
                          unoptimized={true}
                          className="object-cover rounded-md"
                        />
                      ) : (
                        <div className=" w-[30px] h-[30px] bg-gray-200" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openModal(cat)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-slate-400"
                >
                  Data tidak ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          lastPage={lastPage}
          loading={loading}
          setCurrentPrev={() => setCurrentpage((prev) => Math.max(prev - 1, 1))}
          setCurrentNext={() =>
            setCurrentpage((prev) => Math.min(prev + 1, lastPage))
          }
        />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-bold text-slate-800">
                {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Contoh: Makanan, Minuman"
                    value={formData.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Icon Kategori
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
                        <span className="text-slate-400 text-xs text-center">
                          No Icon
                        </span>
                      )}
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-slate-600 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {processing && <Loader2 size={16} className="animate-spin" />}
                  {editingCategory ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
