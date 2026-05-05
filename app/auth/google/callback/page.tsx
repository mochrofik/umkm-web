"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import CreatePasswordForm from "@/components/create-password/CreatePasswordForm";
import { GoogleUser } from "@/types/google_user";
import toast from "react-hot-toast";
import { useAuth } from "@/AuthContext";

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [googleUser, setGoogleUser] = useState<GoogleUser>();

  useEffect(() => {
    const code = searchParams.get("code");
    const role = localStorage.getItem("pending_role");
    const url = `${process.env.NEXT_PUBLIC_SITE_URL}api/auth/google/callback`;

    if (code) {
      // Kirim code yang didapat dari Google ke Laravel API
      axios
        .post(url, { code, role })
        .then((res) => {
          localStorage.removeItem("pending_role");

          setGoogleUser(res.data.data);

          if (res.data.data.create_password) {
          } else {
            login(
              res.data.data.user,
              res.data.data.role,
              res.data.data.access_token,
            );

            if (
              res.data.data.role === "admin" ||
              res.data.data.role === "store"
            ) {
              router.push("/dashboard");
            } else {
              if (res.data.data.role != null) {
                router.push("/");
              } else {
                toast.error(
                  "Anda tidak memiliki akun harap registrasi terlebih dahulu",
                );
              }
            }
          }
        })
        .catch((err) => {
          toast.error("Registrasi Google Gagal");
          router.push("/login");
          console.error("Login gagal", err);
        });
    }
  }, []);

  if (googleUser?.create_password && googleUser.role !== undefined) {
    return (
      <>
        <CreatePasswordForm
          google_user={googleUser!}
          role={googleUser?.role ?? "customer"}
        />
      </>
    );
  }
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Sedang memproses login, mohon tunggu...</p>
    </div>
  );
}
