import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export const metadata: Metadata = {
  title: "Claude-Fire | Waqa's Discipline Dashboard",
  description: "Personal discipline dashboard for Waqa — Fiji",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-[#020817] text-slate-200 antialiased">
        <div className="flex h-full">
          {/* Sidebar — hidden on mobile, fixed on desktop */}
          <Sidebar />

          {/* Main content area */}
          <div className="flex-1 flex flex-col min-h-full lg:ml-64">
            <TopBar />
            <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 lg:pb-6">
              {children}
            </main>
          </div>
        </div>

        {/* Mobile bottom navigation */}
        <MobileNav />
      </body>
    </html>
  );
}

function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0f172a] border-t border-slate-700 z-50">
      <div className="flex items-center justify-around py-2">
        {[
          { href: "/", icon: "🏠", label: "Home" },
          { href: "/tasks", icon: "✅", label: "Tasks" },
          { href: "/prayer", icon: "🙏", label: "Prayer" },
          { href: "/health", icon: "💧", label: "Health" },
          { href: "/analytics", icon: "📊", label: "Stats" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-slate-400 hover:text-amber-400 transition-colors"
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px]">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
