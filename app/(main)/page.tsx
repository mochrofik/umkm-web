"use client";

import { useAuth } from "@/AuthContext";
import CardStore from "@/components/main/CardStore";
import { getData } from "@/helper/apiHelper";
import { Store } from "@/types/stores";
import api from "@/utils/axios";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

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

interface NearbyResponse {
  data: Store[];
}

interface OSMResponse {
  display_name: string;
}

export default function HomePage() {
  const [currentPage, setCurrentpage] = useState<number>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingSet, setLoading] = useState<boolean>(true);

  // Sesuaikan interface user/role sesuai dengan AuthContext Anda
  const { user, role, logout, loading } = useAuth();

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [currentLocation, setCurrentLocation] =
    useState<string>("Masukkan lokasimu");
  const [storeNearby, setStoreNearBy] = useState<Store[]>([]);

  const fetchCategories = async (
    page: number = 1,
    limit: number = 10,
  ): Promise<void> => {
    try {
      setLoading(true);
      const response = await getData(
        `categories-user?page=${page}&limit=${limit}`,
      );

      if (!response.status) throw new Error("Gagal fetch");

      const data: CategoryResponse = response.data as CategoryResponse;

      setCategories(data.data.data);
      setCurrentpage(data.data.current_page || 1);
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengambil data kategori");
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = (): void => {
    if (!navigator.geolocation) {
      toast.error("Geolocation tidak didukung oleh browser Anda");
      return;
    }

    const getLocationNameOSM = async (
      lat: number,
      lng: number,
    ): Promise<void> => {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;

      try {
        const response = await fetch(url, {
          headers: {
            "Accept-Language": "id",
          },
        });
        const data: OSMResponse = await response.json();
        setCurrentLocation(data.display_name);
        localStorage.setItem("user_location", data.display_name);
      } catch (error) {
        console.error(error);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (pos: GeolocationPosition) => {
        const { latitude, longitude } = pos.coords;

        setLatitude(latitude);
        setLongitude(longitude);
        localStorage.setItem("user_lat", latitude.toString());
        localStorage.setItem("user_lng", longitude.toString());
        getLocationNameOSM(latitude, longitude);
      },
      (err: GeolocationPositionError) => {
        toast.error("Gagal mengambil lokasi: " + err.message);
      },
      { enableHighAccuracy: true },
    );
  };

  const searchNearby = async (
    lat: number | null,
    lng: number | null,
  ): Promise<void> => {
    if (lat === null || lng === null) {
      toast.error("Lokasi tidak ditemukan");
    } else {
      setLoading(true);
      try {
        const response = await getData(`get-nearby?lat=${lat}&lng=${lng}`);

        if (response.status === 200) {
          const data: NearbyResponse = (await response.data) as NearbyResponse;
          setStoreNearBy(data.data);
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchCategories(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const savedLat = localStorage.getItem("user_lat");
    const savedLng = localStorage.getItem("user_lng");
    const savedLoc = localStorage.getItem("user_location");

    if (savedLat && savedLng && savedLoc) {
      const lat = parseFloat(savedLat);
      const lng = parseFloat(savedLng);
      setLatitude(lat);
      setLongitude(lng);
      setCurrentLocation(savedLoc);
      searchNearby(lat, lng);
    }
  }, []);

  const formatter = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  });

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="relative h-[230px] sm:h-[300px] flex items-center justify-center bg-gray-900 overflow-hidden">
        <img
          src={"/banner.png"}
          className="w-full h-full object-cover"
          alt="Banner"
        />
      </div>

      <div className="max-w-xl mx-auto mt-10">
        <h1 className="text-2xl font-bold text-center font-poppins text-gray-800">
          Pilih Kategori Yang Kamu Ingin?
        </h1>
      </div>

      {/* Kategori Grid */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-5 bg-white mt-2">
        {categories.map((cat) => {
          const createSlug = (text: string) => {
            return text
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9 -]/g, "")
              .replace(/\s+/g, "-")
              .replace(/-+/g, "-");
          };

          return (
            <Link key={cat.id} href={`/${createSlug(cat.name)}`}>
              <div
                key={cat.id}
                className="flex flex-col items-center cursor-pointer"
              >
                <div className="bg-orange-100 w-35 h-35 rounded-2xl flex items-center justify-center text-2xl mb-1">
                  {cat.icon_url ? (
                    <Image
                      src={cat.icon_url}
                      alt={cat.name}
                      width={300}
                      height={300}
                      unoptimized={true}
                      className="object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-[30px] h-[30px] bg-gray-200" />
                  )}
                </div>
                <span className="text-m font-bold text-gray-600 font-poppins">
                  {cat.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Lokasi */}
      <div className="mx-auto max-w-xl text-center text-poppins text-black">
        Cari UMKM Terdekat
      </div>
      <div className="mt-10 max-w-xl mx-auto bg-white rounded-[2rem] shadow-sm border p-8">
        <label className="font-poppins block text-gray-700 text-sm font-medium mb-2 ml-1">
          Lokasi saya saat ini
        </label>

        <div className="flex flex-col sm:flex-row gap-4 items-center max-w-xl">
          <div className="relative flex-1 min-w-0 w-full group">
            <button className="w-full flex items-center justify-between border border-gray-300 rounded-full px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all bg-white">
              <div className="flex items-center gap-3 overflow-hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-500 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-poppins text-gray-800 font-medium truncate">
                  {currentLocation}
                </span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>

            <div className="absolute left-0 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <ul className="py-2">
                <li
                  onClick={handleGetCurrentLocation}
                  className="font-poppins px-4 py-3 hover:bg-green-50 cursor-pointer flex items-center gap-3 text-green-600 font-semibold border-b border-gray-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 8a4 4 0 110 8 4 4 0 010-8zm0 2a2 2 0 100 4 2 2 0 000-4z" />
                    <path
                      fillRule="evenodd"
                      d="M12 2a.75.75 0 01.75.75v1.594a8.504 8.504 0 017.406 7.406h1.594a.75.75 0 010 1.5h-1.594a8.504 8.504 0 01-7.406 7.406v1.594a.75.75 0 01-1.5 0v-1.594a8.504 8.504 0 01-7.406-7.406H2.25a.75.75 0 010-1.5h1.594A8.504 8.504 0 0111.25 4.344V2.75A.75.75 0 0112 2zm6.994 10a7.002 7.002 0 00-6.244-6.244v1.244a.75.75 0 01-1.5 0V5.756a7.002 7.002 0 00-6.244 6.244h1.244a.75.75 0 010 1.5H5.756a7.002 7.002 0 006.244 6.244v-1.244a.75.75 0 011.5 0v1.244a7.002 7.002 0 006.244-6.244h-1.244a.75.75 0 010-1.5h1.244z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Gunakan Lokasi Saat Ini
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => searchNearby(latitude, longitude)}
            className="font-poppins cursor-pointer bg-[#4C8CE4] hover:bg-blue-700 text-white font-bold py-3.5 px-10 rounded-full transition-colors w-full sm:w-auto text-lg shadow-md"
          >
            Cari
          </button>
        </div>
      </div>

      {/* List UMKM Terdekat */}
      {storeNearby.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col gap-1">
              <h2 className="font-poppins font-bold text-2xl text-gray-900">
                UMKM Terdekat
              </h2>
              <p className="text-gray-500 text-sm font-poppins">
                Temukan layanan terbaik di sekitar lokasimu
              </p>
            </div>
            <div className="h-px flex-1 bg-gray-200 mx-6 hidden sm:block" />
          </div>

          <div className="grid grid-cols-1 gap-6">
            {storeNearby.map((item) => (
              <CardStore data={item} key={item.id} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
