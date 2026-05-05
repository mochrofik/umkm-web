import { AxiosResponse, AxiosError } from "axios";
import api from "../utils/axios"; 
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * Interface untuk struktur response API agar konsisten
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  status?: number;
  message?: string;
  errors?: any;
}

/**
 * Handler utama untuk memproses semua request axios
 */
const requestHandler = async <T>(
  request: Promise<AxiosResponse<T>>,
  router?: AppRouterInstance
): Promise<ApiResponse<T>> => {
  try {
    const response = await request;

    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    const err = error as AxiosError<any>;
    
    // Auto-logout jika unauthorized
    if (err.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        
        // Hapus juga cookie via API session
        fetch('/api/auth/session', { method: 'DELETE' }).catch(() => {});
      }

      if(router && typeof window !== "undefined"){
        router.push("/login");
      }
    }

    return {
      success: false,
      status: err.response?.status,
      message: err.response?.data?.message || "Terjadi kesalahan pada server",
      errors: err.response?.data?.errors || null,
    };
  }
};

/**
 * Fungsi pembantu (Helper) yang akan dipanggil di komponen
 */
export const getData = <T>(url: string, router?: AppRouterInstance, params: object = {}) => {
  return requestHandler<T>(api.get(url, { params }), router);
};

export const postData = <T>(url: string, data: object, router: AppRouterInstance) => {
  return requestHandler<T>(api.post(url, data), router);
};

export const updateData = <T>(url: string, data: object, router: AppRouterInstance) => {
  return requestHandler<T>(api.put(url, data), router);
};

export const deleteData = <T>(url: string, router: AppRouterInstance) => {
  return requestHandler<T>(api.delete(url), router);
};