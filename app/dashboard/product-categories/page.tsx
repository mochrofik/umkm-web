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
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import api from "@/utils/axios";
import axios from "axios";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import { deleteData, getData } from "@/helper/apiHelper";
import Pagination from "@/components/Pagination";

// Define Interface untuk Kategori
interface Category {
  id: number | string;
  name: string;
  description?: string;
  desciption?: string; // Menjaga typo dari data asli agar tidak error
  display_order: number | string;
  is_active: number | string;
}

// Define Interface untuk Form Data
interface CategoryFormData {
  name: string;
  description: string;
  display_order: number | string;
  is_active: number;
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
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    display_order: 1,
    is_active: 1,
  });
  const [processing, setProcessing] = useState<boolean>(false);
  const [filterKategori, setFilterKategori] = useState<string>("all");

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterKategori(e.target.value);
    setCurrentpage(1);
    fetchCategories(1, searchTerm, e.target.value);
  }

  const fetchCategories = async (page: number = 1, search: string = "", filter:string = "") => {
    try {
      setLoading(true);
      const response = await getData(
        `category/get-categories?limit=10&page=${page}&search=${search}&status=${filter}`,
      );

      if(response.success){
        const data = await response.data as any;
        setCategories(data.data.data || []);
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

  const filteredCategories = Array.isArray(categories)
    ? categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const payload: any = {
        name: formData.name,
        description: formData.description,
        display_order: Number(formData.display_order),
        is_active: Number(formData.is_active),
      };

      if (editingCategory) {
        payload.id = editingCategory.id;
      }

      const response = await api.post(
        `category/add-edit-menu-categories`,
        payload,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (response.status === 200 || response.status === 201) {
        fetchCategories(currentPage, searchTerm);
        closeModal();
        toast.success(response.data.message);
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Terjadi kesalahan sistem";
      toast.error(errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = (id: number | string) => {
    Swal.fire({
      title: "Konfirmasi Hapus",
      text: "Yakin hapus data kategori ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: "Memproses...",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });
          const response = await deleteData(
            `category/destroy-menu-categories/${id}`,
           router
          );

          const resData =  response;
          if (response && response.success) {
            Swal.fire({
              title: "Berhasil!",
              text: "Kategori telah dihapus.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            });

            fetchCategories(currentPage, searchTerm);
          } else {
            toast.error(resData.message ?? "Terjadi kesalahan saat hapus data kategori");
            Swal.close();
          }
        } catch (error) {
          toast.error("Terjadi kesalahan saat hapus data kategori");
          Swal.close();
        }
      }
    });
  };

  const openModal = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || "",
        description: category.description || category.desciption || "",
        display_order: category.display_order || 1,
        is_active: Number(category.is_active),
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        display_order: 1,
        is_active: 1,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: "",
      description: "",
      display_order: 1,
      is_active: 1,
    });
    setEditingCategory(null);
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentpage(1);
    fetchCategories(1, searchTerm);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Kategori</h1>
          <p className="text-slate-500 text-sm">Kelola kategori produk UMKM</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
        >
          <Plus size={18} />
          Tambah Kategori
        </button>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-row gap-2">
        <div className="w-full">
           <form onSubmit={handleSearch} className="mb-6">
              <div className="relative w-full">
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
        </div>
        <div className="w-full">
          <select 
            value={filterKategori}
            onChange={handleFilterChange}
            className="border w-full border-slate-200 rounded-lg outline-none  pl-2 pr-4 py-2">
            <option value="all">Semua</option>
            <option value="1">Aktif</option>
            <option value="0">Nonaktif</option>
          </select>
        </div>
      </div>

     

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
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
                  Deskripsi
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Order
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Status
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-slate-400"
                  >
                    <Loading fullPage={false} text="Memuat data..."></Loading>
                  </td>
                </tr>
              ) : filteredCategories.length > 0 ? (
                filteredCategories.map((cat, index) => {
                  const rowNumber = (currentPage - 1) * perPage + (index + 1);
                  return (
                    <tr
                      key={cat.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-slate-600">{rowNumber}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {cat.name}
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                        {cat.description || cat.desciption || "-"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">
                          #{cat.display_order}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {String(cat.is_active) === "1" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Non-Aktif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openModal(cat)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
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
                    colSpan={6}
                    className="px-6 py-10 text-center text-slate-400"
                  >
                    Data tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <Pagination
          currentPage={currentPage}
          lastPage={lastPage}
          loading={loading}
          setCurrentPrev={() => setCurrentpage((prev) => Math.max(prev - 1, 1))}
          setCurrentNext={() => setCurrentpage((prev) => Math.min(prev + 1, lastPage))}
          
          />
        </div>
      </div>

      {/* Modal Tambah/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
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
                {/* Nama Kategori */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="Contoh: Makanan"
                    value={formData.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="Jelaskan kategori ini..."
                    value={formData.description}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Urutan Tampilan */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Urutan (Order)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      value={formData.display_order}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setFormData({
                          ...formData,
                          display_order: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Status Aktif */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Status
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      value={formData.is_active}
                      name="is_active"
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        setFormData({
                          ...formData,
                          is_active: parseInt(e.target.value),
                        })
                      }
                    >
                      <option value={1}>Aktif</option>
                      <option value={0}>Non-Aktif</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 transition-all shadow-sm shadow-blue-200"
                >
                  {processing && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  {editingCategory ? "Simpan Perubahan" : "Tambah Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}