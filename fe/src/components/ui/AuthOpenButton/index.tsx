"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useAuthModal, type AuthModalTab } from "@/hooks/useAuthModal";
import { cn } from "@/lib/utils/cn";

type AuthOpenButtonProps = {
  tab?: AuthModalTab;
  next?: string;
  children: ReactNode;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "onClick" | "children" | "className">;

const AuthOpenButton = ({
  tab = "login",
  next,
  children,
  className,
  ...rest
}: AuthOpenButtonProps) => {
  const { openAuth } = useAuthModal();

  return (
    <button
      type="button"
      className={cn(className)}
      onClick={() => openAuth({ tab, next })}
      {...rest}
    >
      {children}
    </button>
  );
};

export default AuthOpenButton;
