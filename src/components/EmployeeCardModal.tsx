import React, { useState } from 'react';
import { Employee } from '../types';
import { employeeApi } from '../services/api';
import { X, Printer, Download, RefreshCw, Scissors, CheckCircle } from 'lucide-react';

interface EmployeeCardModalProps {
  employee: Employee | null;
  onClose: () => void;
  onEmployeeUpdated?: () => void;
}

const divisionColors: Record<string, string> = {
  PENJAHIT: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  SABLON: 'bg-purple-100 text-purple-800 border-purple-300',
  PEMOTONG_BAHAN: 'bg-amber-100 text-amber-800 border-amber-300',
  QC: 'bg-sky-100 text-sky-800 border-sky-300',
  PACKING: 'bg-rose-100 text-rose-800 border-rose-300',
};

export const EmployeeCardModal: React.FC<EmployeeCardModalProps> = ({
  employee,
  onClose,
  onEmployeeUpdated,
}) => {
  const [currentEmp, setCurrentEmp] = useState<Employee | null>(employee);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(employee?.qrDataUrl || null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  if (!employee) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR-${employee.code}-${employee.name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleRegenerateQr = async () => {
    if (!confirm(`Apakah Anda yakin ingin meregenerasi QR Code baru untuk ${employee.name}? Kartu QR lama tidak akan berfungsi lagi.`)) {
      return;
    }

    try {
      setIsRegenerating(true);
      const res = await employeeApi.regenerateQr(employee.id);
      setQrDataUrl(res.data.qrDataUrl);
      setCurrentEmp(res.data.employee);
      setNotice('QR Code baru berhasil dibuat!');
      setTimeout(() => setNotice(null), 3000);
      if (onEmployeeUpdated) onEmployeeUpdated();
    } catch (err: any) {
      alert('Gagal meregenerasi QR Code: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-base">Kartu Identitas Absensi QR</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {notice && (
          <div className="bg-emerald-50 text-emerald-700 text-xs px-6 py-2 flex items-center gap-1.5 border-b border-emerald-100 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{notice}</span>
          </div>
        )}

        {/* Printable Card Container */}
        <div className="p-6 flex flex-col items-center">
          <div
            id="printable-id-card"
            className="w-full max-w-[340px] rounded-2xl bg-gradient-to-b from-slate-900 via-slate-800 to-indigo-950 text-white p-5 shadow-xl border-2 border-slate-700 relative overflow-hidden"
          >
            {/* Background Decorative Circles */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-blue-500/10 blur-xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />

            {/* Garment Workshop Brand Header */}
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold tracking-wider uppercase text-blue-300">TOKO KONVEKSI</h4>
                  <p className="text-[10px] text-slate-400">Kartu Absensi Pegawai</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                {currentEmp?.code}
              </span>
            </div>

            {/* QR Code Presentation Box */}
            <div className="bg-white rounded-xl p-3 shadow-inner flex flex-col items-center justify-center mb-4">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code ${currentEmp?.name}`}
                  className="w-44 h-44 object-contain rounded-lg"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs">
                  Memuat QR...
                </div>
              )}
              <span className="text-[10px] text-slate-500 font-mono mt-1 font-semibold tracking-tight">
                {currentEmp?.qrCodeToken}
              </span>
            </div>

            {/* Employee Details */}
            <div className="text-center space-y-1.5">
              <h4 className="font-extrabold text-lg text-white tracking-wide">
                {currentEmp?.name}
              </h4>
              <div className="flex items-center justify-center gap-2">
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    divisionColors[currentEmp?.division || ''] || 'bg-slate-700 text-slate-200'
                  }`}
                >
                  Divisi: {currentEmp?.division.replace('_', ' ')}
                </span>
                <span className="text-[11px] text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                  {currentEmp?.shift?.name || 'Shift Pagi'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 pt-1">
                Tunjukkan QR Code ini pada kamera Kios Absensi saat datang & pulang.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handleRegenerateQr}
            disabled={isRegenerating}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-amber-600 px-3 py-2 rounded-lg hover:bg-slate-200/60 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>Regenerasi QR</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadQr}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 px-3.5 py-2 rounded-xl transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Unduh PNG</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition shadow-sm shadow-blue-500/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Kartu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
