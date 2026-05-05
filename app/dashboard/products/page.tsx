"use client";

import React, { useState, useEffect, FormEvent } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Swal, { SweetAlertResult } from "sweetalert2";
import Link from "next/link";
import Loading from "@/components/Loading";
import { deleteData, getData } from "@/helper/apiHelper";
import Pagination from "@/components/Pagination";
import Hashids from "hashids";

// --- Interfaces ---

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: string | number;
  stock: number | string | null;
  is_available: boolean | number;
  image_url?: string;
  logo_url: string; // Berdasarkan kode asli kamu yang memanggil logo_url di src Image
  category?: Category;
}

interface ProductResponse {
  data: {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
  };
}

const hashids = new Hashids("id-product", 8); // Salt bebas

export const encodeId = (id: number) => hashids.encode(id);

export default function ProductPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [currentPage, setCurrentpage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [filterKategori, setFilterKategori] = useState<string>("all");

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterKategori(e.target.value);
    setCurrentpage(1);
    fetchData(1, searchTerm, e.target.value);
  };

  const fetchData = async (page: number = 1, search: string = "", filterKategori: string ="") => {
    try {
      setLoading(true);
      const resProd = await getData(
        `product/get-product?page=${page}&search=${search}&limit=${perPage}&status=${filterKategori}`,
        router,
      );
      if (resProd.success) {
        const dataProd: ProductResponse = resProd.data as ProductResponse;

        setProducts(dataProd.data.data);
        setLastPage(dataProd.data.last_page);
        setCurrentpage(dataProd.data.current_page || 1);
        setPerPage(dataProd.data.per_page || 10);
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, searchTerm);
  }, [currentPage]);

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Konfirmasi Hapus",
      text: "Yakin ingin hapus data produk ?",
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
            didOpen: () => {
              Swal.showLoading();
            },
          });

          await deleteData(`product/destroy/${id}`, router);

          Swal.fire({
            title: "Berhasil!",
            text: "produk telah dihapus.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });

          fetchData(currentPage, searchTerm);
        } catch (error) {
          toast.error("Terjadi kesalahan saat hapus data produk");
        }
      }
    });
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setCurrentpage(1);
    fetchData(1, searchTerm, filterKategori);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-poppins">
            Menu Produk
          </h1>
          <p className="text-slate-500 text-sm">
            Kelola daftar makanan & minuman toko Anda
          </p>
        </div>
        <Link
          href="/dashboard/products/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex gap-2 items-center hover:bg-blue-700 transition-all font-bold"
        >
          <Plus size={18} /> Tambah Produk
        </Link>
      </div>

      {/* Search & Stats */}

      <div className="flex flex-row gap-4">
        <div className="w-full">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative w-full md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Cari & tekan Enter..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
            <option value="1">Tersedia</option>
            <option value="0">Habis</option>
          </select>
        </div>
      </div>

      {/* List Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left font-poppins">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold">No</th>
              <th className="px-6 py-4 text-sm font-semibold">Produk</th>
              <th className="px-6 py-4 text-sm font-semibold">Kategori</th>
              <th className="px-6 py-4 text-sm font-semibold">Harga</th>
              <th className="px-6 py-4 text-sm font-semibold">Stok</th>
              <th className="px-6 py-4 text-sm font-semibold">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center">
                  <Loading fullPage={false} text="Memuat data..."></Loading>
                </td>
              </tr>
            ) : products.length > 0 ? (
              products.map((item, index) => {
                const rowNumber = (currentPage - 1) * perPage + (index + 1);
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {rowNumber}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden relative border">
                          {item.logo_url ? (
                            <Image
                              src={item.logo_url}
                              alt={item.name}
                              fill
                              unoptimized={true}
                              className="object-cover"
                            />
                          ) : (
                            <div
                              className="w-full h-full 
                      bg-slate-100 flex 
                      items-center justify-center text-slate-400 font-bold text-xs uppercase"
                            >
                              {item.name.substring(0, 2)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-slate-400 italic">
                            ID: #{item.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Layers size={14} /> {item.category?.name || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-blue-600">
                      Rp {Number(item.price).toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {item.stock || "∞"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          item.is_available == true
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                      {item.is_available == true ? "Tersedia" : "Habis"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/products/add?id=${encodeId(item.id)}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center"
                          title="Edit Produk"
                        >
                          <Pencil size={18} />
                        </Link>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                          title="Hapus Produk"
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
                  colSpan={7}
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
          setCurrentNext={() =>
            setCurrentpage((prev) => Math.min(prev + 1, lastPage))
          }
        />
      </div>
    </div>
  );
}
