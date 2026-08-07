"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/shared/validations/login.schema";
import { authService } from "@/shared/services/auth.service";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { setUser, setToken } = useAuthStore();

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data.email, data.password);
      
      if (response?.success && response?.data) {
        const { user: backendUser, token } = response.data;
        
        // Map backend user to frontend Zustand User interface
        const frontendUser = {
          ...backendUser,
          role: backendUser.roles?.[0]?.name || "Kasir",
        };

        setToken(token);
        setUser(frontendUser);
        
        // Set cookie for Next.js middleware
        // eslint-disable-next-line react-hooks/immutability
        document.cookie = `auth_token=${token}; path=/; max-age=86400`;

        toast.success("Berhasil login!");
        router.push("/dashboard");
      } else {
        toast.error("Format response tidak sesuai.");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gagal login, periksa email & password Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-700 p-8 sm:p-10 transition-all">
      <div className="mb-8 text-center sm:text-left">
        {/* Mobile Logo Only */}
        <div className="lg:hidden flex items-center justify-center sm:justify-start gap-2 mb-6">
          <div className="flex items-center justify-center w-8 h-8 bg-accent rounded-lg text-primary shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <span className="font-heading font-bold text-xl text-gray-900 dark:text-white">NEMU</span>
        </div>

        <h1 className="mb-2 font-bold font-heading text-gray-900 text-2xl dark:text-white">
          Login ke Akun Anda
        </h1>
        <p className="text-sm text-gray-500 font-body dark:text-gray-400 mb-6">
          Masukkan email dan password untuk melanjutkan ke dashboard.
        </p>

        {/* Demo Accounts - Premium Style */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50">
          <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Demo Access (Fast Login)</p>
          <div className="flex flex-wrap gap-2">
            {[
              { role: "Owner", email: "owner@nemuspace.test" },
              { role: "Admin", email: "admin@nemuspace.test" },
              { role: "Kasir", email: "kasir@nemuspace.test" },
              { role: "Dapur", email: "dapur@nemuspace.test" },
            ].map((demo) => (
              <button
                key={demo.role}
                type="button"
                onClick={() => {
                  setValue("email", demo.email, { shouldValidate: true });
                  setValue("password", "password", { shouldValidate: true });
                }}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:border-accent hover:text-accent dark:hover:border-accent dark:hover:text-accent transition-colors"
              >
                {demo.role}
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={isLoading} className="space-y-6">
          <div>
            <Label className="text-gray-700 dark:text-gray-300 font-medium mb-1.5 block">
              Email Address
            </Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="name@company.com"
                  type="email"
                  error={!!errors.email}
                  hint={errors.email?.message}
                  className="w-full transition-all focus:ring-2 focus:ring-accent/20"
                />
              )}
            />
          </div>
          
          <div>
            <Label className="text-gray-700 dark:text-gray-300 font-medium mb-1.5 block">
              Password
            </Label>
            <div className="relative">
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    error={!!errors.password}
                    hint={errors.password?.message}
                    className="w-full transition-all focus:ring-2 focus:ring-accent/20 pr-10"
                  />
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-10 -translate-y-1/2 right-3 top-[22px] p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? (
                  <EyeIcon className="fill-current w-5 h-5" />
                ) : (
                  <EyeCloseIcon className="fill-current w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox checked={isChecked} onChange={setIsChecked} />
              <span className="block font-medium text-gray-600 text-sm dark:text-gray-400 cursor-pointer select-none" onClick={() => setIsChecked(!isChecked)}>
                Ingat saya
              </span>
            </div>
            <Link
              href="/reset-password"
              className="text-sm font-medium text-accent hover:text-accent/80 transition-colors"
            >
              Lupa password?
            </Link>
          </div>

          <div className="pt-2">
            <Button
              className="w-full bg-accent text-primary hover:bg-accent/90 focus:ring-4 focus:ring-accent/20 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
              size="sm"
              disabled={isLoading}
              type="submit"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading ? "Memproses..." : "Masuk ke Dashboard"}
            </Button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
