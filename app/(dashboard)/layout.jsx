"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function DashboardLayout({ children }) {
  const container = useRef(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".dashboard-content",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      );
    },
    { scope: container },
  );

  return (
    <div
      ref={container}
      className="flex h-screen w-full bg-slate-50 overflow-hidden"
    >
      <div className="w-64 h-full hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}
