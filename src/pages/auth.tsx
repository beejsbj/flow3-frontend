import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useUserStore } from "@/stores/user";

const formSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().optional(),
    isSignUp: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.isSignUp && data.name !== undefined) {
        return data.name.length >= 2;
      }
      if (data.isSignUp && data.confirmPassword !== undefined) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: (ctx) => {
        if (ctx.path.includes("name"))
          return "Name must be at least 2 characters";
        return "Passwords don't match";
      },
      path: (ctx) => {
        if (ctx.path.includes("name")) return ["name"];
        return ["confirmPassword"];
      },
    }
  );

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const login = useUserStore((state) => state.login);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      isSignUp: false,
    },
  });

  useEffect(() => {
    form.setValue("isSignUp", isSignUp);
  }, [isSignUp, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("onSubmit", values);

    // For testing, use dummy data on signup

    const dummy = {
      id: "dummy-id-123",
      email: values.email,
      name: values.name || "John Doe",
      avatarUrl: null,
    };

    if (isSignUp) {
      console.log("signup", values);
      login(dummy, "dummy-token-123");
    } else {
      console.log("signin", values);
      login(dummy, "dummy-token-123");
    }

    // Navigate after login
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="booming-voice">
            {isSignUp ? "Create an account" : "Welcome back"}
          </h1>
          <p className="whisper-voice">
            {isSignUp
              ? "Enter your details to sign up"
              : "Enter your credentials to sign in"}
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 border-black rounded-md"
          >
            {isSignUp && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="example@email.com" {...field} />
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
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isSignUp && (
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="w-full">
              {isSignUp ? "Sign up" : "Sign in"}
            </Button>
          </form>
        </Form>

        <div className="text-center space-y-2">
          {!isSignUp && (
            <Button variant="link" className="calm-voice">
              Forgot your password?
            </Button>
          )}
          <div>
            <Button
              variant="link"
              className="calm-voice"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
