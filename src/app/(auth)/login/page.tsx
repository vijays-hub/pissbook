import Link from "next/link";
import LoginForm from "./LoginForm";
import login_illustration from "@/assets/login-image.jpg";
import Image from "next/image";

export default function Page() {
  return (
    <main className="flex h-screen items-center justify-center p-5">
      <div className="flex h-full max-h-[40rem] w-full max-w-[64rem] overflow-hidden rounded-2xl bg-card shadow-2xl">
        <div className="w-full space-y-10 overflow-y-auto p-10 md:w-1/2">
          <h1 className="text-center text-3xl font-bold">Login to Pissbook</h1>

          <div className="space-y-5">
            <LoginForm />

            <Link href="/signup" className="block text-center hover:underline">
              Pissing for the first time?{" "}
              <span className="text-primary">Sign Up</span>
            </Link>
          </div>
        </div>

        <Image
          src={login_illustration}
          alt="Login illustration"
          className="w-1/2 hidden md:block object-cover"
        />
      </div>
    </main>
  );
}
