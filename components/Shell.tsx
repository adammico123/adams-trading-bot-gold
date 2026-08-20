"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/paper", label: "Paper trading", code: "PT" },
  { href: "/live", label: "Live broker", code: "LB" },
  { href: "/funded", label: "Funded account", code: "FA" },
];

function useSimulatedGoldPrice() {
  const [price, setPrice] = useState(4579.3);
  const [prevPrice, setPrevPrice] = useState(4579.3);

  useEffect(() => {
    const id = setInterval(() => {
      setPrice((p) => {
        setPrevPrice(p);
        const drift = (Math.random() - 0.5) * 0.6;
        return Math.round((p + drift) * 10) / 10;
      });
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return { price, direction: price >= prevPrice ? "up" : "down" } as const;
}

function GoldTicker() {
  const { price, direction } = useSimulatedGoldPrice();
  return (
    <div className="flex items-center gap-3 font-mono text-sm">
      <span className="text-text-faint">XAU/USD</span>
      <span
        className={
          "tabular-nums " + (direction === "up" ? "text-up" : "text-down")
        }
      >
        {price.toFixed(1)}
      </span>
      <span
        className={
          "text-xs " + (direction === "up" ? "text-up" : "text-down")
        }
      >
        {direction === "up" ? "▲" : "▼"}
      </span>
    </div>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-bg text-text flex">
      <aside className="w-64 shrink-0 border-r border-line-soft flex flex-col">
        <div className="px-6 py-6 border-b border-line-soft">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gold pulse-dot" />
            <span className="text-xs tracking-widest text-text-faint uppercase">
              System online
            </span>
          </div>
          <h1 className="mt-3 text-lg leading-tight">
            Adam&apos;s Trading Bot
          </h1>
          <p className="text-sm text-gold font-mono mt-0.5">— Gold</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-colors " +
                  (active
                    ? "bg-surface-raised text-text border border-line"
                    : "text-text-dim hover:text-text hover:bg-surface")
                }
              >
                <span>{item.label}</span>
                <span className="font-mono text-xs text-text-faint">
                  {item.code}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-line-soft">
          <GoldTicker />
          <p className="text-xs text-text-faint mt-2">
            Simulated feed — connect a data source for live pricing.
          </p>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
