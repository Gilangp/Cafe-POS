"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/shared/validations/login.schema";
import { authService } from "@/shared/services/auth.service";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      await authService.login(data.email, data.password);
      toast.success("Berhasil login!");
      router.push("/dashboard"); // or '/' based on your setup, using dashboard as example
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gagal login, periksa email & password Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-accent dark:text-gray-400 dark:hover:text-accent"
        >
          <ChevronLeftIcon />
          Kembali ke Beranda
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-bold font-heading text-primary text-title-sm dark:text-white/90 sm:text-title-md">
              Login ke Sistem
            </h1>
            <p className="text-sm text-gray-500 font-body dark:text-gray-400">
              Masukkan email dan password untuk masuk ke dashboard operasional NEMU.
            </p>
          </div>
          <div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="info@gmail.com"
                        type="email"
                        error={!!errors.email}
                        hint={errors.email?.message}
                      />
                    )}
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Masukkan password Anda"
                          error={!!errors.password}
                          hint={errors.password?.message}
                        />
                      )}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-[22px]"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Ingat saya
                    </span>
                  </div>
                  <Link
                    href="/reset-password"
                    className="text-sm text-accent hover:text-accent/80 dark:text-accent"
                  >
                    Lupa password?
                  </Link>
                </div>
                <div>
                  <Button
                    className="w-full bg-accent text-primary hover:bg-accent/90 font-bold"
                    size="sm"
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Login"}
                  </Button>
                </div>
              </div>
            </form>


          </div>
        </div>
      </div>
    </div>
  );
}
