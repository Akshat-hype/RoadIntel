'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

type DashboardStats = {
  totalPotholes: number;
  high: number;
  medium: number;
  low: number;
};

export function SummaryCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    let socket: Socket | null = null;

    // ✅ Create socket ONLY on client
    socket = io("http://localhost:5000", {
      transports: ["websocket"]
    });

    socket.on("dashboard:update", (data: DashboardStats) => {
      setStats(data);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
    });

    return () => {
      socket?.disconnect();
    };
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, idx) => (
          <div
            key={idx}
            className="bg-card border border-border rounded-lg p-6 animate-pulse"
          >
            <div className="h-4 bg-muted rounded mb-4"></div>
            <div className="h-8 bg-muted rounded mb-3"></div>
            <div className="h-1 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Potholes',
      value: stats.totalPotholes,
      icon: AlertCircle,
      color: 'from-blue-500/20 to-cyan-500/20',
      textColor: 'text-cyan-400'
    },
    {
      title: 'High Severity',
      value: stats.high,
      icon: AlertTriangle,
      color: 'from-red-500/20 to-orange-500/20',
      textColor: 'text-orange-400'
    },
    {
      title: 'Medium Severity',
      value: stats.medium,
      icon: TrendingUp,
      color: 'from-yellow-500/20 to-amber-500/20',
      textColor: 'text-yellow-400'
    },
    {
      title: 'Low Severity',
      value: stats.low,
      icon: Zap,
      color: 'from-green-500/20 to-emerald-500/20',
      textColor: 'text-green-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`bg-gradient-to-br ${card.color} border border-border rounded-lg p-6 transition-all hover:scale-105`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground/80">
                {card.title}
              </h3>
              <Icon className={`w-5 h-5 ${card.textColor}`} />
            </div>
            <p className={`text-3xl font-bold ${card.textColor}`}>
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
