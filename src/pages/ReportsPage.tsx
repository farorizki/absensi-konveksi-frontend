import React, { useState, useEffect } from 'react';
import { reportApi } from '../services/api';
import { Division, AttendanceStatus } from '../types';
import {
  FileSpreadsheet,
  FileText,
  Filter,
  Download,
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const fetchRecap = async () => {
    try {
      setLoading(true);
      const res = await reportApi.getRecap({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        division: selectedDivision || undefined,
        status: selectedStatus || undefined,
      });
      setRecords(res.data);
    } catch (err) {
      console.error('Failed to load recap:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecap();
  }, []);

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecap();
  };

  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      await reportApi.downloadExcel({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        division: selectedDivision || undefined,
        status: selectedStatus || undefined,
      });
    } catch (err: any) {
      alert('Gagal mengekspor Excel: ' + (err.response?.data?.message || err.message));
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setExportingPdf(true);
      await reportApi.downloadPdf({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        division: selectedDivision || undefined,
        status: selectedStatus || undefined,
      });
    } catch (err: any) {
      alert('Gagal mengekspor PDF: ' + (err.response?.data?.message || err.message));
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Rekapitulasi & Laporan Absensi Pegawai
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Filter kehadiran toko konveksi berdasarkan tanggal, divisi, dan ekspor ke Excel atau PDF.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            disabled={exportingExcel}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{exportingExcel ? 'Mengunduh...' : 'Ekspor Excel (.xlsx)'}</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            <span>{exportingPdf ? 'Mengunduh...' : 'Ekspor PDF'}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar Box */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <form onSubmit={handleApplyFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Dari Tanggal
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Sampai Tanggal
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Divisi Konveksi
            </label>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            >
              <option value="">Semua Divisi</option>
              <option value="PENJAHIT">Penjahit</option>
              <option value="SABLON">Sablon</option>
              <option value="PEMOTONG_BAHAN">Pemotong Bahan</option>
              <option value="QC">QC</option>
              <option value="PACKING">Packing</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Status Kehadiran
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            >
              <option value="">Semua Status</option>
              <option value="TEPAT_WAKTU">Tepat Waktu</option>
              <option value="TERLAMBAT">Terlambat</option>
              <option value="PULANG_AWAL">Pulang Awal</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Terapkan Filter</span>
            </button>
          </div>
        </form>
      </div>

      {/* Recap Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <span>Hasil Rekapitulasi</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {records.length} Baris Data
            </span>
          </h3>

          <button
            onClick={fetchRecap}
            title="Muat Ulang"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Nama Pegawai</th>
                <th className="py-3 px-4">Divisi</th>
                <th className="py-3 px-4">Shift</th>
                <th className="py-3 px-4 text-center">Masuk</th>
                <th className="py-3 px-4 text-center">Pulang</th>
                <th className="py-3 px-4 text-center">Durasi Kerja</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Memuat data rekapitulasi...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Tidak ada catatan absensi yang sesuai dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                records.map((rec, index) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono text-slate-400">{index + 1}</td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">{rec.date}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{rec.employeeCode}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{rec.employeeName}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-700">
                        {rec.division.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{rec.shiftName}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700 text-center">
                      {rec.clockIn}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700 text-center">
                      {rec.clockOut || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 text-center">
                      {rec.workDuration}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          rec.status === 'TEPAT_WAKTU'
                            ? 'bg-emerald-100 text-emerald-700'
                            : rec.status === 'TERLAMBAT'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {rec.status === 'TERLAMBAT'
                          ? `Terlambat (${rec.lateMinutes}m)`
                          : rec.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
