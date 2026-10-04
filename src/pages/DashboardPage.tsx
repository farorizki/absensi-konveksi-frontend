import React, { useState, useEffect } from 'react';
import { reportApi, attendanceApi } from '../services/api';
import { DashboardData, Attendance } from '../types';
import { QrScannerModal } from '../components/QrScannerModal';
import {
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  QrCode,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

const divisionLabels: Record<string, string> = {
  PENJAHIT: 'Divisi Penjahit',
  SABLON: 'Divisi Sablon',
  PEMOTONG_BAHAN: 'Divisi Pemotong Bahan',
  QC: 'Divisi Quality Control (QC)',
  PACKING: 'Divisi Packing',
};

const divisionColors: Record<string, { bg: string; bar: string; text: string }> = {
  PENJAHIT: { bg: 'bg-emerald-50', bar: 'bg-emerald-500', text: 'text-emerald-700' },
  SABLON: { bg: 'bg-purple-50', bar: 'bg-purple-500', text: 'text-purple-700' },
  PEMOTONG_BAHAN: { bg: 'bg-amber-50', bar: 'bg-amber-500', text: 'text-amber-700' },
  QC: { bg: 'bg-sky-50', bar: 'bg-sky-500', text: 'text-sky-700' },
  PACKING: { bg: 'bg-rose-50', bar: 'bg-rose-500', text: 'text-rose-700' },
};

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [todayAttendances, setTodayAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, todayRes] = await Promise.all([
        reportApi.getDashboard(),
        attendanceApi.getToday(),
      ]);
      setData(statsRes.data);
      setTodayAttendances(todayRes.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleScanSuccess = async (qrToken: string) => {
    try {
      const res = await attendanceApi.scanQr(qrToken);
      setIsScannerOpen(false);
      setScanFeedback(res.message);
      fetchDashboardData();
      setTimeout(() => setScanFeedback(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memproses pemindaian absensi.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-blue-900/10">
        <div>
          <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Dashboard Operasional Konveksi</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            Ringkasan Kehadiran Hari Ini
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            Pantau kehadiran pegawai secara real-time di seluruh divisi produksi garment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-800 hover:bg-blue-50 text-xs font-bold shadow-lg transition"
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>Scan QR Cepat</span>
          </button>

          <button
            onClick={fetchDashboardData}
            title="Muat Ulang Data"
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {scanFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white text-xs font-bold flex items-center justify-between shadow-lg shadow-emerald-500/20 animate-in fade-in">
          <span>{scanFeedback}</span>
          <button onClick={() => setScanFeedback(null)} className="opacity-75 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pegawai */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Pegawai
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {data?.summary.totalEmployees ?? 0}
            </div>
            <span className="text-[11px] text-slate-400">Terdaftar di 5 divisi</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Hadir Hari Ini */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Hadir Hari Ini
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {data?.summary.presentCount ?? 0}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold">
              {data?.summary.attendanceRate ?? 0}% Tingkat Kehadiran
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Tepat Waktu */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tepat Waktu
            </span>
            <div className="text-2xl font-black text-slate-800 mt-1">
              {data?.summary.onTimeCount ?? 0}
            </div>
            <span className="text-[11px] text-slate-400">Sesuai jam shift</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Terlambat */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Terlambat
            </span>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {data?.summary.lateCount ?? 0}
            </div>
            <span className="text-[11px] text-rose-500 font-semibold">
              Melebihi toleransi
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Section: Division Breakdown & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kehadiran per Divisi Konveksi */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Kehadiran per Divisi Kerja Konveksi
              </h3>
              <p className="text-xs text-slate-400">
                Statistik persentase kehadiran divisi produksi
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {data?.divisionStats.map((stat) => {
              const style = divisionColors[stat.division] || {
                bg: 'bg-slate-50',
                bar: 'bg-blue-600',
                text: 'text-slate-700',
              };

              return (
                <div key={stat.division} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">
                      {divisionLabels[stat.division] || stat.label}
                    </span>
                    <span className="font-mono text-slate-500">
                      <strong className={style.text}>{stat.presentCount}</strong> / {stat.totalEmployees} ({stat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${style.bar} transition-all duration-500`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Aktivitas Absensi Hari Ini */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  Log Kehadiran Terkini Hari Ini
                </h3>
                <p className="text-xs text-slate-400">Real-time scan masuk & pulang</p>
              </div>
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                {todayAttendances.length} Log
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {todayAttendances.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  Belum ada pegawai yang melakukan absensi hari ini.
                </div>
              ) : (
                todayAttendances.slice(0, 5).map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        {att.employee.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {att.employee.code} • {att.employee.division}
                      </div>
                    </div>

                    <div className="text-right space-y-0.5">
                      <div className="text-xs font-mono font-bold text-slate-700">
                        {att.clockIn}
                        {att.clockOut && ` - ${att.clockOut}`}
                      </div>
                      <span
                        className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          att.status === 'TEPAT_WAKTU'
                            ? 'bg-emerald-100 text-emerald-700'
                            : att.status === 'TERLAMBAT'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {att.status === 'TERLAMBAT' ? `Terlambat ${att.lateMinutes}m` : att.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating / Embedded Scanner Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
};
