"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { Loader2, User } from "lucide-react";
import ImageCropper from "@/helper/cropImage/imageCropper";
import getCroppedImg from "@/helper/cropImage/cropImage";
import { postData } from "@/helper/apiHelper";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CustomerFormData } from "@/types/customer";

interface Props {
  initialData: CustomerFormData;
  isEditing: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CustomerForm({
  initialData,
  isEditing,
  onSuccess,
  onCancel,
}: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<CustomerFormData>(initialData);
  const [processing, setProcessing] = useState(false);

  // Image States
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  const onChangeFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
      setSelectedFile(file);
    }
  };

  const handleCropDone = async (croppedPixels: any) => {
    if (imageToCrop) {
      const croppedImage = await getCroppedImg(imageToCrop, croppedPixels);
      setPreviewImg(URL.createObjectURL(croppedImage));
      setSelectedFile(croppedImage); // Simpan hasil crop
      setShowCropper(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const formPayload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formPayload.append(key, value.toString());
        }
      });

      if (selectedFile) {
        console.log(selectedFile);

        formPayload.append("avatar", selectedFile);
      }

      const response = await postData(`customer/add-edit`, formPayload, router);

      if (response.success) {
        toast.success("Data berhasil disimpan");
        onSuccess();
      } else {
        toast.error(response.message || "Gagal menyimpan data");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <form className="overflow-y-auto max-h-[70vh]" onSubmit={handleSubmit}>
        <div className="p-6 space-y-4">
          {/* Bagian Foto Profil */}
          <div className="md:col-span-1 space-y-4">
            <div className="aspect-square w-40 mx-auto border-2 border-dashed border-slate-200 rounded-full flex flex-col items-center justify-center overflow-hidden bg-slate-50 group relative">
              {previewImg ? (
                <img
                  src={previewImg}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} className="text-slate-300" />
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

          {/* Bagian Input Group */}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nama
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
              value={formData.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password{" "}
              {isEditing && (
                <span className="text-xs text-slate-400 font-normal">
                  (Kosongkan jika tidak ganti)
                </span>
              )}
            </label>
            <input
              type="password"
              required={!isEditing}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
              value={formData.password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="active">Active</option>
                <option value="verify">Verify</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Jenis Kelamin
              </label>
              <select
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                value={formData.gender}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="male">Laki-laki</option>
                <option value="female">perempuan</option>
              </select>
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
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3 border-t">
          <button
            type="button"
            onClick={onCancel}
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
            {isEditing ? "Perbarui" : "Simpan"}
          </button>
        </div>
      </form>

      {showCropper && imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCropDone}
          onCancel={() => setShowCropper(false)}
        />
      )}
    </>
  );
}
