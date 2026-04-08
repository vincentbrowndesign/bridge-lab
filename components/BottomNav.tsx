"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/capture", label: "Capture" },
  { href: "/review", label: "Review" },
  { href: "/library", label: "Library" },
  { href: "/share", label: "Share" },
];

type BottomNavProps = {
  disabled?: boolean;
};

export default function BottomNav({ disabled = false }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className={`bottomNav ${disabled ? "disabled" : ""}`}>
      {items.map((item) => {
        const active = pathname === item.href;

        if (disabled) {
          return (
            <div
              key={item.href}
              className={`bottomNavItem ${active ? "active" : ""} disabledItem`}
            >
              {item.label}
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`bottomNavItem ${active ? "active" : ""}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}