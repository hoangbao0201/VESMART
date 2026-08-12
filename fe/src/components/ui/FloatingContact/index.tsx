"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Phone } from "lucide-react";
import IconZalo from "@/components/icons/IconZalo";
import { SITE_CONFIG, sitePhoneTelHref } from "@/configs/site.config";
import { cn } from "@/lib/utils/cn";

type ContactFabProps = {
  href: string;
  label: string;
  pulseClass: string;
  bgClass: string;
  external?: boolean;
  children: ReactNode;
};

const ContactFab = ({
  href,
  label,
  pulseClass,
  bgClass,
  external,
  children,
}: ContactFabProps) => {
  const className = cn(
    "relative flex size-[70px] items-center justify-center",
  );

  const inner = (
    <>
      <span
        className={cn(
          "absolute left-1 top-1 size-[60px] rounded-full opacity-70 animate-contact-pulse",
          pulseClass,
        )}
        aria-hidden
      />
      <span
        className={cn(
          "relative z-10 flex size-11 items-center justify-center overflow-hidden rounded-full shadow-md animate-contact-shake",
          bgClass,
        )}
      >
        {children}
      </span>
      <span className="sr-only">{label}</span>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={label}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={className} aria-label={label}>
      {inner}
    </Link>
  );
};

const FloatingContact = () => {
  return (
    <div className="fixed bottom-3 left-3 z-40 flex flex-col items-center">
      <ContactFab
        href={SITE_CONFIG.zalo}
        label="Liên hệ Zalo"
        pulseClass="bg-sky-400"
        bgClass="bg-sky-400"
        external
      >
        <IconZalo className="size-8" aria-hidden />
      </ContactFab>
      <ContactFab
        href={SITE_CONFIG.facebook}
        label="Liên hệ Facebook"
        pulseClass="bg-blue-600"
        bgClass="bg-blue-600"
        external
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 320 512"
          className="size-5 fill-white"
          aria-hidden
        >
          <path d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z" />
        </svg>
      </ContactFab>
      <ContactFab
        href={sitePhoneTelHref()}
        label={`Gọi ${SITE_CONFIG.phone}`}
        pulseClass="bg-green-500"
        bgClass="bg-green-500"
        external
      >
        <Phone className="size-5 text-white" aria-hidden />
      </ContactFab>
      <span className="mt-1 rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
        Liên hệ
      </span>
    </div>
  );
};

export default FloatingContact;
