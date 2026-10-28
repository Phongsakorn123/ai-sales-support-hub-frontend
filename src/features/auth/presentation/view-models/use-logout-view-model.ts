"use client";

import { APP_ROUTES } from "@/navigation/app-routes";

import { useRouter } from "next/navigation";
import { useDependencies } from "@/di/dependency-provider";

export function useLogoutViewModel() {
  const router = useRouter();
  const { auth } = useDependencies();
  return {
    logout: () => {
      auth.logout();
      router.replace(APP_ROUTES.login);
    },
  };
}
