"use client";

import CustomerForm from "@/components/customer/CustomerForm";
import Loading from "@/components/Loading";
import ModalComponent from "@/components/Modal";
import Pagination from "@/components/Pagination";
import { deleteData, getData } from "@/helper/apiHelper";
import {
  CustomerData,
  CustomerFormData,
  CustomerResponse,
} from "@/types/customer";
import {
  Navigation,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, FormEvent, useEffect, ChangeEvent } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

// Definisi Interface untuk Data Form
const defaultFormData: CustomerFormData = {
  id: null,
  nik: "",
  name: "",
  email: "",
  password: "",
  role: "customer",
  status: "active",
  address: "",
  phone_number: "",
  latitude: "",
  longitude: "",
  gender: "",
  date_of_birth: "",
  postal_code: "",
};


interface StatusInfo {
  label: string;
  color: string;
}

const STATUS_MAP:Record<string, StatusInfo> = {
  active: {
    label :  "Aktif" ,
    color: "bg-green-100 text-green-700" ,
  },
  verify: {
    label: "Menunggu Verifikasi" ,
    color: "bg-blue-100 text-blue-700" ,
  },
  banned: {
    label: "Terblokir",
    color: "bg-red-100 text-red-700" ,
  },
};

const DEFAULT_STATUS = {
  label: "Inactive" ,
  color: "bg-gray-100 text-gray-700" ,
};

export default function CustomerPage() {
  const router = useRouter();
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerFormData>(defaultFormData);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setEditing] = useState<boolean>(false);
  const [isLoading, setLoadingState] = useState<boolean>(false);

  const [currentPage, setCurrentpage] = useState<number>(1);
  const [lastPage, setLastpage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);

  const [customerData, setDataCustomer] = useState<CustomerData[]>([]);
  const [filterKategori, setFilterKategori] = useState<string>("");

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setFilterKategori(newValue);
    fetchData(1, searchTerm, newValue);
    setCurrentpage(1);
  }

  const handleAdd = () => {
    setSelectedCustomer(defaultFormData);
    setEditing(false);
    setIsModalOpen(true);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setCurrentpage(1);
    fetchData(1, searchTerm);
  };

  const handleEdit = (customer: CustomerData) => {
    setSelectedCustomer({
      id: customer.user_id ?? null,
      nik: customer.nik ?? "",
      name: customer.user?.name ?? "",
      email: customer.user.email ?? "",
      role: customer.user.role ?? "",
      status: customer.user.status ?? "",
      address: customer.address ?? "",
      phone_number: customer.phone_number ?? "",
      latitude: customer.latitude ?? "",
      longitude: customer.longitude ?? "",
      date_of_birth: customer.date_of_birth ?? "",
      postal_code: customer.postal_code ?? "",
      gender: customer.gender ?? "",
    });

    setEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: "Konfirmasi Hapus",
      text: "Data pelanggan yang dihapus akan masuk hilang.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        setLoadingState(true);
        try {
          const response = await deleteData(
            `customer/destroy/${id}`,
            router,
          );
          if (response.success) {
            toast.success("Data berhasil dihapus");
            setCurrentpage(1);
            fetchData(1, "");
          } else {
            toast.error(response.message || "Gagal menghapus data pelanggan");
          }
        } catch (error) {
          toast.error("Terjadi kesalahan saat menghapus data pelanggan");
        } finally {
          setLoadingState(false);
        }
      }
    });
  };

  const fetchData = async (page: Number = 1, search: string = "", filterKategori: string = "") => {
    setLoadingState(true);
    try {
      const response = await getData<CustomerResponse>(
        `customer/get`,
        router,
        {
          page: page,
          search: search,
          limit: 10,
          status: filterKategori ,
        },
      );

      if (response.success && response.data) {
        setDataCustomer(response.data.data.data);

        setCurrentpage(response.data.data.current_page || 1);
        setLastpage(response.data.data.last_page || 1);
        setPerPage(response.data.data.per_page || 10);
      } else {
        toast.error(response.message || "Gagal mengambil data pelanggan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengambil data pelanggan");
    } finally {
      setLoadingState(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, "");
  }, [currentPage]);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Pelanggan</h1>
          <p className="text-slate-500 text-sm">Kelola Data Pelanggan</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
        >
          <Plus size={18} /> Tambah Pelanggan
        </button>
      </div>

      <div className="flex flex-row gap-4">
        <div className="w-full">
          <form className="mb-6" onSubmit={handleSearch}>
            <div className="relative w-full md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2"
                size={18}
              />

              <input
                type="text"
                value={searchTerm}
                placeholder="Cari & tekan enter...."
                className="w-full border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20
            pl-10 pr-4 py-2"
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
            <option value="active">Aktif</option>
            <option value="verify">Menunggu Verifikasi</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  No
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Pelanggan
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  NIK
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  No. Telp
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Alamat
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-center">
                  Lokasi
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Status
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-center text-slate-600">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-10">
                    <Loading
                      fullPage={false}
                      size=""
                      color="blue"
                      text="Memuat data pelanggan..."
                    />
                  </td>
                </tr>
              ) : customerData.length > 0 ? (
                customerData.map((customer, index) => {
                  const rowNumber = (currentPage - 1) * perPage + (index + 1);

                  // Perbaikan template literal Google Maps
                  const googleMapsUrl =
                    customer.latitude && customer.longitude
                      ? `https://www.google.com/maps?q=${customer.latitude},${customer.longitude}`
                      : `https://www.google.com/maps/search/${encodeURIComponent(customer.user?.name + " " + customer.address)}`;

                  // Path avatar dari backend
                  const avatarUrl = customer.avatar_url
                    ? `${customer.avatar_url}`
                    : null;

                    const statusKey = customer.user?.status;
  const currentStatus = STATUS_MAP[statusKey] || DEFAULT_STATUS;

                  return (
                    <tr
                      key={customer.id}
                      className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      {/* NO */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {rowNumber}
                      </td>

                      {/* PELANGGAN (Avatar + Nama + Email) */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={customer.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-500">
                                <User size={20} />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">
                              {customer.user?.name || customer.name}
                            </span>
                            <span className="text-xs text-slate-400">
                              {customer.user?.email}
                            </span>
                            <span
                              className={` flex-1 w-fit px-2 py-1 text-center rounded-full text-xs ${customer.gender === "male" ? "bg-blue-50 text-blue-600" : "bg-pink-50 text-pink-600"}`}
                            >
                              {customer.gender === "male"
                                ? "Laki-laki"
                                : "Perempuan"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* NIK */}
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                        {customer.nik || "-"}
                      </td>

                      {/* PHONE NUMBER */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {customer.phone_number ? (
                          <a
                            href={`https://wa.me/${customer.phone_number}`}
                            target="_blank"
                            className="flex items-center gap-1 hover:text-green-600"
                          >
                            <Phone size={14} /> {customer.phone_number}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>

                      {/* ALAMAT */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <p className="line-clamp-2 max-w-[200px]">
                          {customer.address}
                        </p>
                      </td>

                      {/* LOKASI */}
                      <td className="px-6 py-4 text-sm text-center">
                         <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-full transition-all">
                                                  <Navigation size={18} />
                                                </a>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4 text-sm">

                        <span
          className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${currentStatus.color}`}
        >
          {currentStatus.label}
        </span>
                        
                      </td>

                      {/* AKSI */}
                      <td className="px-6 py-4 text-sm text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => handleEdit(customer)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
                    colSpan={9}
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
            loading={isLoading}
            setCurrentPrev={() =>
              setCurrentpage((prev) => Math.max(prev - 1, 1))
            }
            setCurrentNext={() =>
              setCurrentpage((prev) => Math.min(prev + 1, lastPage))
            }
          />
        </div>
      </div>

      {isModalOpen && (
        <ModalComponent
          isOpen={isModalOpen}
          onClose={closeModal}
          title={"Akun Pelanggan"}
        >
          <CustomerForm
            initialData={isEditing ? selectedCustomer : defaultFormData}
            isEditing={isEditing}
            onCancel={closeModal}
            onSuccess={() => {
              closeModal();
              setCurrentpage(1);
              fetchData(1, "");
            }}
          />
        </ModalComponent>
      )}
    </div>
  );
}
