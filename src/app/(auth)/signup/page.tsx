import { Metadata } from "next";
import signup_illustration from "@/assets/signup-image.jpg";
import Image from "next/image";
import Link from "next/link";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
  title: "Sign Up",
};

/**
 * Just an FYI that anything without "use client" is a Server component and is rendered
 * from the server. That's how Next.js works. If you want to render something from the client,
 * you need to use "use client" declarative.
 */
export default function Page() {
  return (
    <main className="flex h-screen items-center justify-center p-5">
      {/* For bg-card, it picks the color we set in globals.css... Same for others in the app. Look for the corresponding variable there. */}
      <div className="flex h-full max-h-[40rem] w-full max-w=[64rem] rounded-2xl overflow-hidden bg-card shadow-2xl">
        <div className="md:w-1/2 w-full space-y-10 overflow-auto p-10">
          <div className="space-y-1 text-center">
            <h1 className="text-3xl font-bold">Sign up to Pissbook</h1>

            <p className="text-muted-foreground">
              A place where you can piss all <span className="italic">you</span>{" "}
              can; wherever you can.
            </p>
          </div>

          <div className="space-y-5">
            {/* Client Component */}
            <SignUpForm />

            <Link href={"/login"} className="block text-center hover:underline">
              Pissed here before? <span className="text-primary">Log in</span>
            </Link>
          </div>
        </div>

        <Image
          src={signup_illustration}
          alt="Signup illustration"
          className="w-1/2 hidden md:block object-cover"
        />
      </div>
    </main>
  );
}
