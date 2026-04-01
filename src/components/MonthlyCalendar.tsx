import React from 'react';
import { cn } from "@/src/lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";
import { motion } from "motion/react";

interface TradeDay {
  day: number;
  pnl: number;
  trades: number;
}

interface WeeklyPnl {
  week: number;
  pnl: number;
  trades: number;
}

interface MonthlyCalendarProps {
  isDark: boolean;
}

export default function MonthlyCalendar({ isDark }: MonthlyCalendarProps) {
  // Mock data based on the image
  const monthName = "July 2025";
  const daysInMonth = 31;
  
  const tradeData: Record<number, TradeDay> = {
    4: { day: 4, pnl: 1983.06, trades: 1 },
    7: { day: 7, pnl: 824.00, trades: 1 },
    8: { day: 8, pnl: -388.17, trades: 1 },
    9: { day: 9, pnl: 1441.12, trades: 1 },
    14: { day: 14, pnl: -270.17, trades: 1 },
    15: { day: 15, pnl: 363.65, trades: 1 },
    16: { day: 16, pnl: -1101.30, trades: 1 },
    18: { day: 18, pnl: 440.52, trades: 1 },
    23: { day: 23, pnl: -478.47, trades: 1 },
    24: { day: 24, pnl: -1004.27, trades: 1 },
    28: { day: 28, pnl: -517.42, trades: 1 },
    29: { day: 29, pnl: 2332.14, trades: 1 },
    30: { day: 30, pnl: -898.93, trades: 1 },
    31: { day: 31, pnl: 1227.16, trades: 1 },
  };

  const weeklyData: WeeklyPnl[] = [
    { week: 1, pnl: 1983.06, trades: 1 },
    { week: 2, pnl: 1876.95, trades: 3 },
    { week: 3, pnl: -567.30, trades: 4 },
    { week: 4, pnl: -1482.74, trades: 2 },
    { week: 5, pnl: 915.79, trades: 3 },
  ];

  const monthlyTotal = { pnl: 2725.76, trades: 13 };

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Generate calendar grid
  const calendarDays = [];
  // Previous month days (mocking the image)
  for (let i = 29; i <= 30; i++) calendarDays.push({ day: i, current: false });
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push({ day: i, current: true });
  // Next month days
  for (let i = 1; i <= 9; i++) calendarDays.push({ day: i, current: false });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full mt-8">
      {/* Calendar Grid */}
      <div className={cn(
        "lg:col-span-8 rounded-xl border overflow-hidden",
        isDark ? "bg-[#121212] border-white/10" : "bg-white border-neutral-200"
      )}>
        {/* Header */}
        <div className={cn(
          "p-4 flex justify-between items-center border-b",
          isDark ? "border-white/5" : "border-neutral-100"
        )}>
          <h3 className={cn("text-lg font-bold", isDark ? "text-white" : "text-black")}>{monthName}</h3>
          <div className="flex gap-2">
            <button className={cn("p-1 rounded hover:bg-white/5", isDark ? "text-white/40" : "text-neutral-400")}>
              <ChevronUp size={18} />
            </button>
            <button className={cn("p-1 rounded hover:bg-white/5", isDark ? "text-white/40" : "text-neutral-400")}>
              <ChevronDown size={18} />
            </button>
          </div>
        </div>

        {/* Weekdays */}
        <div className={cn("grid grid-cols-7 border-b", isDark ? "border-white/5" : "border-neutral-100")}>
          {weekdays.map(day => (
            <div key={day} className={cn(
              "py-3 text-center text-[10px] uppercase font-bold tracking-widest",
              isDark ? "text-white/40" : "text-neutral-500"
            )}>
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 p-1">
          {calendarDays.map((item, idx) => {
            const data = item.current ? tradeData[item.day] : null;
            const isProfit = data && data.pnl > 0;
            const isLoss = data && data.pnl < 0;

            return (
              <motion.div 
                key={idx} 
                whileHover={{ scale: 1.02, zIndex: 10 }}
                className={cn(
                  "min-h-[100px] p-2 rounded-xl relative transition-all group border",
                  isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-neutral-100 shadow-sm",
                  !item.current && (isDark ? "opacity-10" : "opacity-20"),
                  isProfit && (isDark ? "bg-green-500/20 border-green-500/30" : "bg-green-50 border-green-200"),
                  isLoss && (isDark ? "bg-red-500/20 border-red-500/30" : "bg-red-50 border-red-200")
                )}
              >
                <span className={cn(
                  "text-[10px] font-bold",
                  isDark ? "text-white/40" : "text-neutral-500",
                  data && (isProfit ? (isDark ? "text-green-400" : "text-green-600") : (isDark ? "text-red-400" : "text-red-600"))
                )}>
                  {item.day}
                </span>

                {data && (
                  <div className="mt-2 flex flex-col items-center justify-center h-full pb-4">
                    <p className={cn(
                      "text-sm font-black tracking-tight",
                      isProfit ? (isDark ? "text-green-400" : "text-green-600") : (isDark ? "text-red-400" : "text-red-600")
                    )}>
                      {data.pnl > 0 ? `$${data.pnl.toFixed(2)}` : `-$${Math.abs(data.pnl).toFixed(2)}`}
                    </p>
                    <p className={cn("text-[8px] uppercase font-bold opacity-60", isDark ? "text-white" : "text-black")}>
                      {data.trades} trade{data.trades > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="lg:col-span-4 space-y-4">
        <h3 className={cn("text-center font-bold text-sm mb-4 uppercase tracking-widest", isDark ? "text-white" : "text-black")}>
          P&L By Week — {monthName}
        </h3>
        
        <div className="space-y-3">
          {weeklyData.map((week) => (
            <div 
              key={week.week}
              className={cn(
                "p-4 rounded-xl border flex justify-between items-center transition-all",
                week.pnl >= 0 
                  ? (isDark ? "bg-green-500/10 border-green-500/20" : "bg-green-50 border-green-200")
                  : (isDark ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-200")
              )}
            >
              <div>
                <p className={cn(
                  "text-xs font-bold",
                  week.pnl >= 0 ? (isDark ? "text-green-400" : "text-green-700") : (isDark ? "text-red-400" : "text-red-700")
                )}>
                  Week {week.week}
                </p>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-lg font-black tracking-tight",
                  week.pnl >= 0 ? (isDark ? "text-green-400" : "text-green-700") : (isDark ? "text-red-400" : "text-red-700")
                )}>
                  {week.pnl >= 0 ? `$${week.pnl.toFixed(2)}` : `-$${Math.abs(week.pnl).toFixed(2)}`}
                </p>
                <p className={cn("text-[9px] font-bold opacity-60", isDark ? "text-white" : "text-black")}>
                  {week.trades} Trade{week.trades > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          ))}

          {/* Monthly Total */}
          <div className={cn(
            "p-5 rounded-xl border flex justify-between items-center mt-6",
            isDark ? "bg-green-500/20 border-green-500/40" : "bg-green-100 border-green-300"
          )}>
            <div>
              <p className={cn("text-sm font-black uppercase tracking-widest", isDark ? "text-green-400" : "text-green-800")}>
                Monthly Total
              </p>
            </div>
            <div className="text-right">
              <p className={cn("text-2xl font-black tracking-tighter", isDark ? "text-green-400" : "text-green-800")}>
                ${monthlyTotal.pnl.toFixed(2)}
              </p>
              <p className={cn("text-[10px] font-bold opacity-60", isDark ? "text-green-400" : "text-green-800")}>
                {monthlyTotal.trades} Trades
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
