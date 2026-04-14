import React from 'react';
import { cn } from "../lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { Trade } from "../types";

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
  trades: Trade[];
  onDayClick?: (date: string) => void;
}

export default function MonthlyCalendar({ isDark, trades, onDayClick }: MonthlyCalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  // Process trade data for the current month
  const tradeData: Record<number, TradeDay> = {};
  const monthTrades = trades.filter(t => {
    const d = new Date(t.trade_date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  monthTrades.forEach(t => {
    const day = new Date(t.trade_date).getDate();
    if (!tradeData[day]) {
      tradeData[day] = { day, pnl: 0, trades: 0 };
    }
    tradeData[day].pnl += t.pnl_amount;
    tradeData[day].trades += 1;
  });

  // Process weekly data
  const weeklyData: WeeklyPnl[] = [];
  let currentWeekPnl = 0;
  let currentWeekTrades = 0;
  let weekCount = 1;

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const dayOfWeek = date.getDay();
    
    if (tradeData[i]) {
      currentWeekPnl += tradeData[i].pnl;
      currentWeekTrades += tradeData[i].trades;
    }

    if (dayOfWeek === 6 || i === daysInMonth) {
      weeklyData.push({ week: weekCount++, pnl: currentWeekPnl, trades: currentWeekTrades });
      currentWeekPnl = 0;
      currentWeekTrades = 0;
    }
  }

  const monthlyTotal = monthTrades.reduce((acc, t) => ({
    pnl: acc.pnl + t.pnl_amount,
    trades: acc.trades + 1
  }), { pnl: 0, trades: 0 });

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Generate calendar grid
  const calendarDays = [];
  
  // Previous month days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({ day: prevMonthLastDay - i, current: false });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, current: true });
  }
  
  // Next month days
  const remainingSlots = 42 - calendarDays.length;
  for (let i = 1; i <= remainingSlots; i++) {
    calendarDays.push({ day: i, current: false });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full mt-6">
      {/* Calendar Grid */}
      <div className={cn(
        "lg:col-span-8 rounded-xl border overflow-hidden",
        isDark ? "bg-[#0a0a0a] border-white/10" : "bg-white border-neutral-200 shadow-sm"
      )}>
        {/* Header */}
        <div className={cn(
          "p-3 flex justify-between items-center border-b",
          isDark ? "border-white/5" : "border-neutral-100"
        )}>
          <h3 className={cn("text-base font-bold tracking-tight", isDark ? "text-white" : "text-black")}>{monthName}</h3>
          <div className="flex gap-1.5">
            <button 
              onClick={handlePrevMonth}
              className={cn("p-1 rounded hover:bg-white/5 transition-colors", isDark ? "text-white/40" : "text-neutral-400")}
            >
              <ChevronUp size={14} />
            </button>
            <button 
              onClick={handleNextMonth}
              className={cn("p-1 rounded hover:bg-white/5 transition-colors", isDark ? "text-white/40" : "text-neutral-400")}
            >
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        {/* Weekdays */}
        <div className={cn("grid grid-cols-7 border-b", isDark ? "border-white/5" : "border-neutral-100")}>
          {weekdays.map(day => (
            <div key={day} className={cn(
              "py-2 text-center text-[8px] uppercase font-bold tracking-[0.2em]",
              isDark ? "text-white/30" : "text-neutral-400"
            )}>
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-0.5 p-0.5">
          {calendarDays.map((item, idx) => {
            const data = item.current ? tradeData[item.day] : null;
            const isProfit = data && data.pnl > 0;
            const isLoss = data && data.pnl < 0;

            return (
              <motion.div 
                key={idx} 
                whileHover={{ scale: 1.01, zIndex: 10 }}
                onClick={() => {
                  if (item.current && data && onDayClick) {
                    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${item.day.toString().padStart(2, '0')}`;
                    onDayClick(dateStr);
                  }
                }}
                className={cn(
                  "min-h-[80px] p-1.5 rounded-lg relative transition-all group border cursor-pointer",
                  isDark ? "bg-white/[0.02] border-white/5" : "bg-white border-neutral-100 shadow-sm",
                  !item.current && (isDark ? "opacity-5" : "opacity-10"),
                  isProfit && (isDark ? "bg-accent-green/10 border-accent-green/20" : "bg-accent-green/5 border-accent-green/10"),
                  isLoss && (isDark ? "bg-accent-red/10 border-accent-red/20" : "bg-accent-red/5 border-accent-red/10")
                )}
              >
                <span className={cn(
                  "text-[9px] font-bold",
                  isDark ? "text-white/30" : "text-neutral-400",
                  data && (isProfit ? "text-accent-green" : "text-accent-red")
                )}>
                  {item.day}
                </span>

                {data && (
                  <div className="mt-1 flex flex-col items-center justify-center h-full pb-3">
                    <p className={cn(
                      "text-xs font-black tracking-tighter",
                      isProfit ? "text-accent-green" : "text-accent-red"
                    )}>
                      {data.pnl > 0 ? `$${data.pnl.toFixed(0)}` : `-$${Math.abs(data.pnl).toFixed(0)}`}
                    </p>
                    <p className={cn("text-[7px] uppercase font-bold opacity-40", isDark ? "text-white" : "text-black")}>
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
      <div className="lg:col-span-4 space-y-3">
        <h3 className={cn("text-center font-bold text-[10px] mb-2 uppercase tracking-[0.2em]", isDark ? "text-white/60" : "text-neutral-500")}>
          Weekly Performance
        </h3>
        
        <div className="space-y-2">
          {weeklyData.map((week) => (
            <div 
              key={week.week}
              className={cn(
                "p-3 rounded-lg border flex justify-between items-center transition-all",
                week.pnl >= 0 
                  ? (isDark ? "bg-accent-green/5 border-accent-green/10" : "bg-accent-green/[0.03] border-accent-green/10")
                  : (isDark ? "bg-accent-red/5 border-accent-red/10" : "bg-accent-red/[0.03] border-accent-red/10")
              )}
            >
              <div>
                <p className={cn(
                  "text-[10px] font-bold uppercase tracking-wider",
                  week.pnl >= 0 ? "text-accent-green" : "text-accent-red"
                )}>
                  Week {week.week}
                </p>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-base font-black tracking-tight",
                  week.pnl >= 0 ? "text-accent-green" : "text-accent-red"
                )}>
                  {week.pnl >= 0 ? `$${week.pnl.toFixed(0)}` : `-$${Math.abs(week.pnl).toFixed(0)}`}
                </p>
                <p className={cn("text-[8px] font-bold opacity-40 uppercase tracking-widest", isDark ? "text-white" : "text-black")}>
                  {week.trades} Trades
                </p>
              </div>
            </div>
          ))}

          {/* Monthly Total */}
          <div className={cn(
            "p-4 rounded-lg border flex justify-between items-center mt-4",
            isDark ? "bg-accent-green/10 border-accent-green/30" : "bg-accent-green/5 border-accent-green/20"
          )}>
            <div>
              <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", "text-accent-green")}>
                Monthly Total
              </p>
            </div>
            <div className="text-right">
              <p className={cn("text-xl font-black tracking-tighter", "text-accent-green")}>
                ${monthlyTotal.pnl.toFixed(0)}
              </p>
              <p className={cn("text-[8px] font-bold opacity-60 uppercase tracking-widest", "text-accent-green")}>
                {monthlyTotal.trades} Trades
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
