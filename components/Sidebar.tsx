"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Vault,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Vault", href: "/vault", icon: BookOpen },
  { label: "Recipients", href: "/recipients", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6 border-b border-[#2a3d2e]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Vault className="w-5 h-5 text-[#B89B5E]" />
          <span
            className="text-[#F5F3EF] font-semibold tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem" }}
          >
            Legacy Vault
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                active
                  ? "bg-[#B89B5E]/20 text-[#B89B5E] font-medium"
                  : "text-[#a0b0a4] hover:bg-[#2a3d2e] hover:text-[#F5F3EF]"
              }`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-[#2a3d2e]">
        <div className="px-3 py-2 mb-2">
          <p
            className="text-[#F5F3EF] text-sm font-medium truncate"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {user?.fullName ||
              user?.firstName ||
              user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
              "—"}
          </p>
          <p
            className="text-[#a0b0a4] text-xs truncate"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {user?.emailAddresses?.[0]?.emailAddress}
          </p>
        </div>
        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-[#a0b0a4] hover:bg-[#2a3d2e] hover:text-[#F5F3EF] transition-all duration-150"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-[#1F2E23] border-b border-[#2a3d2e]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Vault className="w-5 h-5 text-[#B89B5E]" />
          <span
            className="text-[#F5F3EF] font-semibold tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem" }}
          >
            Legacy Vault
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-[#a0b0a4] hover:bg-[#2a3d2e] hover:text-[#F5F3EF] transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" aria-modal="true" role="dialog">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full bg-[#1F2E23] shadow-2xl flex flex-col animate-slide-in-left">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#a0b0a4] hover:bg-[#2a3d2e] hover:text-[#F5F3EF] transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 lg:left-0 bg-[#1F2E23] border-r border-[#2a3d2e] z-40">
        <SidebarContent />
      </aside>

      {/* Mobile topbar spacer */}
      <div className="lg:hidden h-[53px]" />

      <style jsx global>{`
        @keyframes slide-in-left {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
    </>
  );
}
