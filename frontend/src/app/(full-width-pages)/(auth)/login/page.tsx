import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | NEMU Space Management System",
  description: "Masuk ke dashboard operasional NEMU",
};

export default function SignIn() {
  return <SignInForm />;
}
