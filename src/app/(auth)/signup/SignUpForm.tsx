"use client";

import { SignUpConfig, signupSchema } from "@/lib/validations";
import React, { useTransition } from "react";
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
import { signup } from "./actions";
import { PasswordInput } from "@/components/PasswordInput";
import LoadingButton from "@/components/LoadingButton";

/**
 * This is a client component and will be rendered from the client side.
 * This is needed since we would need to use JavaScript to handle form submission, by
 * button click or form submission, etc. And we might need to use window object or
 * other client side APIs.
 */
const SignUpForm = () => {
  // Error that is returned from the server
  const [error, setError] = React.useState<string | undefined>("");

  /**
   * Let's use useTransition to show a loading spinner when the
   * form is being submitted. Here, using a regular boolean state will
   * not work as expected, since the form submission is interacting
   * with the server actions, and the state change will not be accurate
   * since we are redirecting to another page inside the server action.
   *
   * ! More info: https://react.dev/reference/react/useTransition
   */
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignUpConfig>({
    // This is a zod resolver, which will validate the form data against the schema
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      name: "",
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: SignUpConfig) {
    // Clear all the errors
    setError(undefined);

    // Start the transition
    startTransition(async () => {
      const { error } = await signup(data);

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

      {/* Form */}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Name to be displayed on your profile"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  placeholder="Unique username matching your style!"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter email" {...field} />
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
                <PasswordInput placeholder="Enter password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <LoadingButton loading={isPending} type="submit" className="w-full">
          Sign Up
        </LoadingButton>
      </form>
    </Form>
  );
};

export default SignUpForm;
