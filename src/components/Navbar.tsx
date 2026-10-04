import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { QrCode, LogOut, Scissors, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-tight flex items-center gap-1.5">
              <span>Sistem Absensi Toko Konveksi</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">Garment & Textile Workshop Management</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Quick link to Kiosk Scanner */}
          <Link
            to="/kiosk"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-sm font-semibold transition"
          >
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Buka Kios Absensi</span>
            <span className="sm:hidden">Kios QR</span>
          </Link>

          {admin ? (
            <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-bold text-slate-700">{admin.name}</span>
                <span className="text-xs text-slate-400 capitalize">{admin.role.toLowerCase().replace('_', ' ')}</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <User className="w-5 h-5" />
              </div>
              <button
                onClick={handleLogout}
                title="Keluar"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
            >
              Login Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
