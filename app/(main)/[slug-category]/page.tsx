"use client";

import Loading from "@/components/Loading";
import CardStoreByCategory from "@/components/main/CardStoreByCategory";
import { getData } from "@/helper/apiHelper";
import { getCurrentLocation, LocationData } from "@/helper/locationHelper";
import { Store } from "@/types/stores";
import { ChevronLeft, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function CategoryPage() {
  const pathName = usePathname();
  const [isLoading, setLoadingState] = useState(false);
  const pathSegments = pathName.split("/").filter((item) => item !== "");

  const categoryTitle = pathSegments
    .map((s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(" / ");

  const [dataLocation, setDataLocation] = useState<LocationData>();
  const [storeData, setStoreData] = useState<Store[]>([]);

  const fetchData = async (lat?: number, lng?: number) => {
    setLoadingState(true);
    try {
      let endpoint = `get-store-by-category?category=${pathName.replaceAll("/", "")}`;
      if (lat && lng) {
        endpoint += `&lat=${lat}&lng=${lng}`;
      }
      const response = await getData(endpoint);

      if (response.status == 200) {
        const data = (await response.data) as Store[];
        setStoreData(data);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoadingState(false);
    }
  };

  const handleLocationClick = async (): Promise<LocationData | undefined> => {
    try {
      const data: LocationData = await getCurrentLocation();
      setDataLocation(data);
      return data;
    } catch (error: any) {
      // silently ignore location errors on this page
      return undefined;
    }
  };

  useEffect(() => {
    const init = async () => {
      const location = await handleLocationClick();
      await fetchData(location?.latitude, location?.longitude);
    };
    init();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Banner Section */}
      <div className="relative h-[200px] sm:h-[280px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gray-900">
          <img
            src="/banner.png"
            alt="Category Banner"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        {/* Back Button */}
        <Link
          href="/"
          className="absolute top-6 left-6 z-[2] bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40 transition-all"
        >
          <ChevronLeft size={24} />
        </Link>

        {/* Category Title Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 z-[1]">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="flex list-none p-0 text-sm text-white/70">
              <li className="flex items-center">
                <Link href="/" className="hover:text-white transition-colors">
                  Beranda
                </Link>
                <span className="mx-2">/</span>
              </li>
              {pathSegments.map((segment, index) => {
                const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
                const isLast = index === pathSegments.length - 1;
                const title = segment
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase());

                return (
                  <li key={href} className="flex items-center">
                    {isLast ? (
                      <span className="text-white font-semibold">{title}</span>
                    ) : (
                      <>
                        <Link
                          href={href}
                          className="hover:text-white transition-colors"
                        >
                          {title}
                        </Link>
                        <span className="mx-2">/</span>
                      </>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-bold font-poppins text-white drop-shadow-md">
            {categoryTitle}
          </h1>
          <p className="text-white/70 text-sm sm:text-base mt-2">
            Temukan UMKM terbaik untuk kategori ini
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 relative z-[5]">
        {/* Result count badge */}
        {!isLoading && storeData.length > 0 && (
          <div className="mb-6">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full uppercase tracking-wider shadow-sm">
              {storeData.length} Toko Ditemukan
            </span>
          </div>
        )}

        <section>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loading fullPage={false} />
            </div>
          ) : storeData && storeData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {storeData.map((item) => (
                <CardStoreByCategory key={item.id} data={item} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 shadow-sm">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="text-slate-300" size={40} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                UMKM Tidak Ditemukan
              </h3>
              <p className="text-slate-500 text-center max-w-xs mx-auto mt-2">
                Sepertinya belum ada toko di kategori ini
                {dataLocation?.city
                  ? ` untuk wilayah ${dataLocation.city} dan sekitarnya.`
                  : "."}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all shadow-lg"
              >
                Coba Segarkan Halaman
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
