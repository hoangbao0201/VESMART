"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { ApiClientError } from "@/lib/api/client";
import { getGoogleClientId, loadGoogleIdentity } from "@/lib/google";
import { cn } from "@/lib/utils/cn";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

const registerSchema = z
  .object({
    fullName: z.string().max(150).optional(),
    username: z
      .string()
      .min(3, "Username tối thiểu 3 ký tự")
      .max(50, "Username tối đa 50 ký tự")
      .regex(/^[a-zA-Z0-9_]+$/, "Chỉ dùng chữ, số và gạch dưới"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string().min(6, "Xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const inputClassName =
  "h-11 w-full rounded-[12px] border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

const AuthModal = () => {
  const router = useRouter();
  const { open, tab, nextPath, closeAuth, setTab } = useAuthModal();
  const { login, register: registerUser, loginWithGoogle } = useAuth();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!open) {
      loginForm.reset();
      registerForm.reset();
      setGoogleError(null);
      setGoogleLoading(false);
    }
  }, [open, loginForm, registerForm]);

  useEffect(() => {
    if (!open) return;
    const clientId = getGoogleClientId();
    if (!clientId || !googleBtnRef.current) {
      setGoogleReady(false);
      return;
    }

    let cancelled = false;
    setGoogleReady(false);

    void loadGoogleIdentity()
      .then((gid) => {
        if (cancelled || !googleBtnRef.current) return;
        googleBtnRef.current.innerHTML = "";
        gid.initialize({
          client_id: clientId,
          callback: (response) => {
            void (async () => {
              setGoogleLoading(true);
              setGoogleError(null);
              try {
                await loginWithGoogle(response.credential);
                closeAuth();
                router.push(nextPath);
                router.refresh();
              } catch (error) {
                setGoogleError(
                  error instanceof ApiClientError
                    ? error.message
                    : "Đăng nhập Google thất bại. Thử lại sau.",
                );
              } finally {
                setGoogleLoading(false);
              }
            })();
          },
        });
        gid.renderButton(googleBtnRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: tab === "register" ? "signup_with" : "signin_with",
          shape: "rectangular",
          width: 352,
          locale: "vi",
        });
        setGoogleReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setGoogleReady(false);
          setGoogleError("Không tải được Google Sign-In.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, tab, loginWithGoogle, closeAuth, router, nextPath]);

  const onLogin = loginForm.handleSubmit(async (values) => {
    try {
      await login({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
      closeAuth();
      router.push(nextPath);
      router.refresh();
    } catch (error) {
      loginForm.setError("root", {
        message:
          error instanceof ApiClientError
            ? error.message
            : "Đăng nhập thất bại. Kiểm tra email/mật khẩu.",
      });
    }
  });

  const onRegister = registerForm.handleSubmit(async (values) => {
    try {
      await registerUser({
        email: values.email.trim().toLowerCase(),
        username: values.username.trim(),
        password: values.password,
        fullName: values.fullName?.trim() || undefined,
      });
      closeAuth();
      router.push(nextPath);
      router.refresh();
    } catch (error) {
      registerForm.setError("root", {
        message:
          error instanceof ApiClientError
            ? error.message
            : "Đăng ký thất bại. Thử lại sau.",
      });
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) closeAuth();
      }}
    >
      <DialogContent
        title={tab === "login" ? "Đăng nhập" : "Đăng ký"}
        className="w-[min(420px,calc(100%-2rem))]"
      >
        <div className="mb-5 rounded-[12px] bg-secondary p-1">
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              className={cn(
                "rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors",
                tab === "login"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setTab("login")}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              className={cn(
                "rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors",
                tab === "register"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setTab("register")}
            >
              Đăng ký
            </button>
          </div>
        </div>

        {tab === "login" ? (
          <form onSubmit={(e) => void onLogin(e)} className="space-y-4" noValidate>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Email</span>
              <input
                type="email"
                autoComplete="email"
                {...loginForm.register("email")}
                className={inputClassName}
              />
              {loginForm.formState.errors.email ? (
                <span className="text-xs text-destructive">
                  {loginForm.formState.errors.email.message}
                </span>
              ) : null}
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Mật khẩu</span>
              <input
                type="password"
                autoComplete="current-password"
                {...loginForm.register("password")}
                className={inputClassName}
              />
              {loginForm.formState.errors.password ? (
                <span className="text-xs text-destructive">
                  {loginForm.formState.errors.password.message}
                </span>
              ) : null}
            </label>
            {loginForm.formState.errors.root?.message ? (
              <p className="text-sm text-destructive">
                {loginForm.formState.errors.root.message}
              </p>
            ) : null}
            <Button
              type="submit"
              className="w-full"
              disabled={loginForm.formState.isSubmitting || googleLoading}
            >
              {loginForm.formState.isSubmitting ? "Đang đăng nhập…" : "Đăng nhập"}
            </Button>
          </form>
        ) : (
          <form onSubmit={(e) => void onRegister(e)} className="space-y-4" noValidate>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Họ tên</span>
              <input
                type="text"
                autoComplete="name"
                {...registerForm.register("fullName")}
                className={inputClassName}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Username</span>
              <input
                type="text"
                autoComplete="username"
                {...registerForm.register("username")}
                className={inputClassName}
              />
              {registerForm.formState.errors.username ? (
                <span className="text-xs text-destructive">
                  {registerForm.formState.errors.username.message}
                </span>
              ) : null}
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Email</span>
              <input
                type="email"
                autoComplete="email"
                {...registerForm.register("email")}
                className={inputClassName}
              />
              {registerForm.formState.errors.email ? (
                <span className="text-xs text-destructive">
                  {registerForm.formState.errors.email.message}
                </span>
              ) : null}
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Mật khẩu</span>
              <input
                type="password"
                autoComplete="new-password"
                {...registerForm.register("password")}
                className={inputClassName}
              />
              {registerForm.formState.errors.password ? (
                <span className="text-xs text-destructive">
                  {registerForm.formState.errors.password.message}
                </span>
              ) : null}
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Xác nhận mật khẩu</span>
              <input
                type="password"
                autoComplete="new-password"
                {...registerForm.register("confirmPassword")}
                className={inputClassName}
              />
              {registerForm.formState.errors.confirmPassword ? (
                <span className="text-xs text-destructive">
                  {registerForm.formState.errors.confirmPassword.message}
                </span>
              ) : null}
            </label>
            {registerForm.formState.errors.root?.message ? (
              <p className="text-sm text-destructive">
                {registerForm.formState.errors.root.message}
              </p>
            ) : null}
            <Button
              type="submit"
              className="w-full"
              disabled={registerForm.formState.isSubmitting || googleLoading}
            >
              {registerForm.formState.isSubmitting ? "Đang tạo tài khoản…" : "Tạo tài khoản"}
            </Button>
          </form>
        )}

        {getGoogleClientId() ? (
          <div className="mt-5 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">Hoặc</span>
              </div>
            </div>
            <div className="flex min-h-11 w-full justify-center">
              <div
                ref={googleBtnRef}
                className={cn(
                  "w-full overflow-hidden [&_iframe]:!w-full",
                  googleLoading ? "pointer-events-none opacity-60" : null,
                  !googleReady ? "hidden" : null,
                )}
              />
              {!googleReady ? (
                <Button type="button" variant="outline" className="w-full" disabled>
                  Đang tải Google…
                </Button>
              ) : null}
            </div>
            {googleError ? <p className="text-sm text-destructive">{googleError}</p> : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
