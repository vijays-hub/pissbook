"use client";

import { LoginConfig, loginSchema } from "@/lib/validations";
import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { login } from "./actions";
import { PasswordInput } from "@/components/PasswordInput";
import LoadingButton from "@/components/LoadingButton";

// ! Checkout Sign up form for some exposure on what's happening here!
export default function LoginForm() {
  const [error, setError] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginConfig>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginConfig) {
    // Clear all the errors
    setError(undefined);

    // Start the transition
    startTransition(async () => {
      const { error } = await login(data);

      // You will get the error only if the server action fails, since we are redirecting on success
      if (error) {
        setError(error);
      }
    });
  }

  return (
    <Form {...form}>
      {/* Show error, if any */}
      {error && <p className="text-destructive text-center">{error}</p>}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter your username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="Enter your password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <LoadingButton loading={isPending} type="submit" className="w-full">
          Login
        </LoadingButton>
      </form>
    </Form>
  );
}
