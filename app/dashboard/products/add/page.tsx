"use client";

import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Package, Tag, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/utils/axios";
import axios from "axios";
import Loading from "@/components/Loading";
import { getData } from "@/helper/apiHelper";
import getCroppedImg from "@/helper/cropImage/cropImage";
import ImageCropper from "@/helper/cropImage/imageCropper";
import { intToRP } from "@/helper/integerToRupiah";
import { RPtoInteger } from "@/helper/rupiahToInteger";
import Hashids from "hashids";

// --- Interfaces ---

interface Category {
  id: number | string;
  name: string;
}

interface TagDetail {
  tag_name: string;
}

interface FormDataState {
  name: string;
  price: string | number;
  description: string;
  stock: string | number;
  is_available: boolean;
  menu_category_id: string | number;
  tags: string[];
}

const hashids = new Hashids("id-product", 8);

export const decodeId = (hashedId: string): number | null => {
  const decoded = hashids.decode(hashedId);
  if (decoded.length === 0) return null;
  return Number(decoded[0]);
};

export default function AddProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const isEditMode = !!productId;

  const [fetching, setFetching] = useState<boolean>(isEditMode);
  const [categories, setCategories] = useState<Category[]>([]);
  const [processing, setProcessing] = useState<boolean>(false);

  // State Form
  const [formData, setFormData] = useState<FormDataState>({
    name: "",
    price: "",
    description: "",
    stock: "",
    is_available: true,
    menu_category_id: "",
    tags: [],
  });

  const [selectedImg, setSelectedImage] = useState<File | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState<boolean>(false);
  const [tagInput, setTagInput] = useState<string>("");

  useEffect(() => {
    const fetchDataInitial = async () => {
      try {
        const res = await getData(`category/get-categories`, router);

        if (res.success) {
          const data = (await res.data) as any;
          setCategories(data.data || []);
        }else{
          toast.error(res.message??"");
        }

        // Fetch Detail if Edit Mode
        if (isEditMode && productId) {
          const resEdit = await getData(
            `product/detail-product/${decodeId(productId)}`,
          );
          if (resEdit.success) {
            const dataEdit = resEdit.data as any;
            const p = dataEdit.data;

            const cleanPrice = parseInt(p.price);

            setFormData({
              name: p.name,
              price: cleanPrice,
              description: p.description || "",
              stock: p.stock || "",
              is_available: p.is_available === "1",
              menu_category_id: p.menu_category_id,
              tags: Array.isArray(p.tags)
                ? p.tags.map((t: string | TagDetail) =>
                    typeof t === "object" ? t.tag_name : t,
                  )
                : [],
            });

            if (p.image_url) {
              setPreviewImg(
                p.logo_url != null
                  ? p.logo_url
                  : `/api/storage/uploads/product/${p.image_url}`, // Use proxy for storage if needed, or stick to direct if CORS is ok for images
              );
            }
          }
        }
      } catch (error) {
        toast.error("Gagal mengambil data");
      } finally {
        setFetching(false);
      }
    };

    fetchDataInitial();
  }, [productId, isEditMode, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const payload = new FormData();

      payload.append("name", formData.name);
      payload.append("description", formData.description);
      payload.append("is_available", formData.is_available ? "1" : "0");
      payload.append("menu_category_id", String(formData.menu_category_id));
      payload.append("price", String(formData.price));
      payload.append("stock", String(formData.stock));

      // Kirim tags sebagai string yang dipisah koma atau sesuai kebutuhan API Anda
      payload.append("tags", formData.tags.join(","));

      if (isEditMode && productId) {
        payload.append("id", productId);
      }

      if (selectedImg) {
        payload.append("image", selectedImg);
      }

      await api.post(`product/add-edit`, payload);

      toast.success(
        isEditMode ? "Produk diperbarui!" : "Produk berhasil ditambahkan!",
      );
      router.push("/dashboard/products");
    } catch (error) {
      toast.error("Gagal menyimpan produk");
    } finally {
      setProcessing(false);
    }
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

  const addTag = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,/g, "");

      if (newTag && !formData.tags.includes(newTag)) {
        setFormData({
          ...formData,
          tags: [...formData.tags, newTag],
        });
      }
      setTagInput("");
    }

    if (e.key === "Backspace" && !tagInput && formData.tags.length > 0) {
      const updatedTags = [...formData.tags];
      updatedTags.pop();
      setFormData({ ...formData, tags: updatedTags });
    }
  };

  const removeTag = (indexToRemove: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, index) => index !== indexToRemove),
    });
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loading fullPage={false} text="Memuat data..."></Loading>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-slate-800">
            {isEditMode ? "Edit Produk" : "Tambah Produk Baru"}
          </h1>
          <p className="text-sm text-slate-500">
            Lengkapi detail produk toko Anda
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Kolom Kiri: Upload Gambar */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <label className="block text-sm font-semibold text-slate-700 mb-4">
              Foto Produk
            </label>
            <div className="aspect-square w-full border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center overflow-hidden bg-slate-50 group relative">
              {previewImg ? (
                <img
                  src={previewImg}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              ) : (
                <div className="text-center p-4">
                  <Package className="mx-auto text-slate-300 mb-2" size={40} />
                  <span className="text-xs text-slate-400">Belum ada foto</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-3 text-center">
              Rekomendasi ukuran 1:1 (Square) maks 2MB
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Detail Data */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nama Produk
              </label>
              <input
                type="text"
                required
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                placeholder="Contoh: Nasi Bebek Spesial"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kategori Menu
                </label>
                <select
                  required
                  className="w-full p-2.5 border rounded-lg outline-none"
                  value={formData.menu_category_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      menu_category_id: e.target.value,
                    })
                  }
                >
                  <option value="">Pilih Kategori</option>
                  {categories && categories.length > 0
                    ? categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))
                    : null}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Harga (Rp)
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-2.5 border rounded-lg outline-none"
                  placeholder="0"
                  value={intToRP(formData.price)}
                  onChange={(e) => {
                    const rawValue = RPtoInteger(e.target.value);
                    setFormData({ ...formData, price: rawValue });
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Deskripsi
              </label>
              <textarea
                rows={3}
                className="w-full p-2.5 border rounded-lg outline-none"
                placeholder="Ceritakan keunggulan produk ini..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Stok (Opsional)
                </label>
                <input
                  type="number"
                  min={0}
                  className="w-full p-2.5 border rounded-lg outline-none"
                  value={formData.stock}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    let numericValue = rawValue === "" ? 0 : parseInt(rawValue);
                    if (numericValue < 0) {
                      numericValue = 0;
                    }

                    setFormData({
                      ...formData,
                      stock: numericValue,
                      is_available: numericValue > 0,
                    });
                  }}
                />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <input
                  type="checkbox"
                  id="avail"
                  className="w-4 h-4 text-blue-600 rounded"
                  checked={formData.is_available}
                  onChange={(e) =>
                    setFormData({ ...formData, is_available: e.target.checked })
                  }
                />
                <label
                  htmlFor="avail"
                  className="text-sm font-medium text-slate-700 cursor-pointer"
                >
                  Tersedia di Menu
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tags
              </label>
              <div className="flex flex-wrap items-center gap-2 p-2 border rounded-lg bg-slate-50 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                <Tag size={18} className="text-slate-400 ml-1" />

                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-bold animate-in fade-in zoom-in duration-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}

                <input
                  type="text"
                  placeholder={
                    formData.tags.length === 0
                      ? "Promo, Pedas, Best Seller (pisahkan dengan koma)"
                      : ""
                  }
                  className="flex-1 bg-transparent outline-none text-sm min-w-[120px] py-1"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Tekan <b>Enter</b> atau <b>Koma</b> untuk menambah tag.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 text-slate-600 font-semibold hover:text-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={processing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-50 transition-all"
            >
              {processing ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              {isEditMode ? "Perbarui Produk" : "Simpan Produk"}
            </button>
          </div>
        </div>
      </form>

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
