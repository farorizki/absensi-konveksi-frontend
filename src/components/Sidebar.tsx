import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Clock,
  FileSpreadsheet,
  QrCode,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employees', label: 'Pegawai Konveksi', icon: Users },
    { to: '/shifts', label: 'Jadwal Shift', icon: Clock },
    { to: '/reports', label: 'Rekap & Ekspor Laporan', icon: FileSpreadsheet },
    { to: '/kiosk', label: 'Kios Scanner QR', icon: QrCode, badge: 'Live' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Menu Utama Toko
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-700 animate-pulse">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Info Divisi Konveksi Widget */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg shadow-slate-900/10">
        <div className="flex items-center gap-2 mb-2 text-amber-400">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-bold tracking-wide uppercase">5 Divisi Toko</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          Penjahit, Sablon, Pemotong Bahan, QC, dan Packing terhubung otomatis.
        </p>
        <div className="flex flex-wrap gap-1">
          {['Penjahit', 'Sablon', 'Pemotong', 'QC', 'Packing'].map((d) => (
            <span key={d} className="px-2 py-0.5 rounded text-[10px] bg-slate-700/80 text-slate-200">
              {d}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
};
