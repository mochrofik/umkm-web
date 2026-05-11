"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CreatePasswordForm from "@/components/create-password/CreatePasswordForm";
import { GoogleUser } from "@/types/google_user";
import toast from "react-hot-toast";
import { useAuth } from "@/AuthContext";
import { googleCallbackService } from "@/service/auth.service";

export default function GoogleCallback() {
  const router = useRouter();
  const { login } = useAuth();

  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const searchParams = useSearchParams();
      const code = searchParams.get("code");
      const role = localStorage.getItem("pending_role");

      if (code) {
        try {
          const response = await googleCallbackService(code, role);

          if (response.success && response.data) {
            const resData = response.data; // Body dari Laravel
            localStorage.removeItem("pending_role");

            if (resData.success) {
              const payload = resData.data;

              if (payload.create_password) {
                setGoogleUser(payload);
              } else {
                login(payload.user, payload.role, payload.access_token);

                if (payload.role === "admin" || payload.role === "store") {
                  router.push("/dashboard");
                } else if (payload.role != null) {
                  router.push("/");
                } else {
                  toast.error("Role tidak dikenali");
                  router.push("/login");
                }
              }
            } else {
              toast.error(resData.message || "Gagal memproses data Google");
              router.push("/login");
            }
          } else {
            toast.error(response.message || "Terjadi kesalahan koneksi");
            router.push("/login");
          }
        } catch (error) {
          console.error("Login gagal", error);
          toast.error("Registrasi Google Gagal");
          router.push("/login");
        }
      }
    };

    handleCallback();
  }, [router]);

  if (googleUser?.create_password && googleUser.role !== undefined) {
    return (
      <CreatePasswordForm google_user={googleUser} role={googleUser.role} />
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">
          Sedang memproses login, mohon tunggu...
        </p>
      </div>
    </div>
  );
}
