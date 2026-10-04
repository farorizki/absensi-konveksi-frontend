import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { attendanceApi } from '../services/api';
import { Attendance, ScanResult } from '../types';
import { Link } from 'react-router-dom';
import {
  Scissors,
  Camera,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  UserCheck,
  RefreshCw,
  LogOut,
  Maximize,
} from 'lucide-react';

const playChime = (success: boolean) => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(success ? 523.25 : 220, audioCtx.currentTime); // C5 or A3
    if (success) {
      osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.3); // G5
    }
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    // Audio context may be restricted before gesture
  }
};

export const KioskPage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recentAttendances, setRecentAttendances] = useState<Attendance[]>([]);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef(false);

  // Digital Clock updates every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's attendances
  const loadTodayAttendances = async () => {
    try {
      const res = await attendanceApi.getToday();
      setRecentAttendances(res.data);
    } catch (err) {
      console.error('Failed to load today attendances:', err);
    }
  };

  useEffect(() => {
    loadTodayAttendances();
  }, []);

  // Initialize Camera Scanner for Kiosk
  useEffect(() => {
    const elementId = 'kiosk-qr-reader';

    const startCamera = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (!devices || devices.length === 0) {
          setErrorMessage('Tidak ada kamera yang terdeteksi.');
          return;
        }

        const scanner = new Html5Qrcode(elementId);
        html5QrCodeRef.current = scanner;

        await scanner.start(
          devices[0].id,
          {
            fps: 12,
            qrbox: { width: 280, height: 280 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (!isScanningRef.current) {
              handleScan(decodedText);
            }
          },
          () => {}
        );

        setIsCameraActive(true);
      } catch (err: any) {
        console.error('Kiosk camera error:', err);
        setErrorMessage('Kamera Kios belum aktif atau izin kamera diblokir.');
      }
    };

    const timeout = setTimeout(() => {
      startCamera();
    }, 400);

    return () => {
      clearTimeout(timeout);
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().then(() => html5QrCodeRef.current?.clear()).catch(() => {});
      }
    };
  }, []);

  const handleScan = async (qrToken: string) => {
    if (isScanningRef.current || isProcessing) return;
    isScanningRef.current = true;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await attendanceApi.scanQr(qrToken);
      setScanResult(res);
      playChime(true);

      // Trigger Confetti effect
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });

      // Refresh today's list
      loadTodayAttendances();

      // Clear result popup after 4 seconds
      setTimeout(() => {
        setScanResult(null);
        isScanningRef.current = false;
        setIsProcessing(false);
      }, 4000);
    } catch (err: any) {
      playChime(false);
      const msg = err.response?.data?.message || err.message || 'Gagal memproses QR Code.';
      setErrorMessage(msg);

      setTimeout(() => {
        setErrorMessage(null);
        isScanningRef.current = false;
        setIsProcessing(false);
      }, 3500);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Top Bar Kios */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg sm:text-xl text-white tracking-tight flex items-center gap-2">
              <span>KIOS ABSENSI TOKO KONVEKSI</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live Terminal
              </span>
            </h1>
            <p className="text-xs text-slate-400">Pindai Kartu QR Pegawai untuk Absen Masuk & Pulang</p>
          </div>
        </div>

        {/* Live Digital Clock & Controls */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="font-mono text-xl sm:text-2xl font-black text-blue-400">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-xs text-slate-400 font-medium capitalize">
              {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Layar Penuh"
          >
            <Maximize className="w-4 h-4" />
          </button>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-600/30"
          >
            <span>Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main Kiosk Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Live Scanner Box */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className="w-full max-w-md bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-2xl relative">
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800/60">
                <Sparkles className="w-3.5 h-3.5" />
                Arahkan Kartu QR ke Kamera
              </span>
            </div>

            {/* Camera Viewport */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black border-2 border-slate-800 shadow-inner flex items-center justify-center">
              <div id="kiosk-qr-reader" className="w-full h-full" />

              {/* Viewfinder Target Graphic */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-64 h-64 border-2 border-blue-400/80 rounded-2xl relative shadow-lg">
                  {/* Corner Markers */}
                  <div className="absolute -top-1 -left-1 w-7 h-7 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-7 h-7 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-7 h-7 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />

                  {/* Horizontal animated scanning laser */}
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-pulse shadow-md shadow-cyan-400/50" />
                </div>
              </div>

              {/* Scanning status banner */}
              {isProcessing && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20">
                  <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mb-3" />
                  <p className="font-bold text-sm tracking-wide">Memverifikasi Data Pegawai...</p>
                </div>
              )}
            </div>

            {/* Quick Manual Code Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualCode.trim()) {
                  handleScan(manualCode.trim());
                  setManualCode('');
                }
              }}
              className="mt-4 flex gap-2"
            >
              <input
                type="text"
                placeholder="Input Kode Pegawai (contoh: KNV-001)"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
              >
                Scan Manual
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Scan Feedback / Status Cards & Today's Stream */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Active Result Card */}
          {scanResult ? (
            <div
              className={`p-6 rounded-3xl border shadow-2xl transition-all duration-300 animate-in zoom-in-95 ${
                scanResult.type === 'CLOCK_IN'
                  ? scanResult.data.attendance.status === 'TERLAMBAT'
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                    : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-blue-950/40 border-blue-500/50 text-blue-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                {scanResult.type === 'CLOCK_IN' ? (
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                    <UserCheck className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-slate-950 font-bold">
                    <LogOut className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h3 className="font-extrabold text-xl text-white">
                    {scanResult.type === 'CLOCK_IN' ? 'ABSEN MASUK' : 'ABSEN PULANG'}
                  </h3>
                  <span className="text-xs font-mono font-semibold">
                    {scanResult.data.employee.code} • Divisi {scanResult.data.employee.division}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/10 mb-3 space-y-1">
                <div className="text-lg font-bold text-white">
                  {scanResult.data.employee.name}
                </div>
                <p className="text-xs opacity-90 leading-relaxed">
                  {scanResult.message}
                </p>
                {scanResult.data.attendance.durationFormatted && (
                  <div className="mt-2 text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>Total Jam Kerja: {scanResult.data.attendance.durationFormatted}</span>
                  </div>
                )}
              </div>

              <div className="text-[11px] opacity-70 text-right">
                Otomatis kembali dalam beberapa detik...
              </div>
            </div>
          ) : errorMessage ? (
            <div className="p-5 rounded-3xl bg-rose-950/40 border border-rose-500/50 text-rose-200 shadow-xl flex items-start gap-3 animate-in shake">
              <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-white">Gagal Memproses</h4>
                <p className="text-xs text-rose-300 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-center py-10">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                <Camera className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Menunggu Kartu QR</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Kios siap membaca QR Code pegawai toko konveksi secara instan.
              </p>
            </div>
          )}

          {/* Today's Stream List */}
          <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Aktivitas Kehadiran Hari Ini</span>
              </h4>
              <span className="text-xs font-mono font-bold text-blue-400">
                {recentAttendances.length} Terdata
              </span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {recentAttendances.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  Belum ada pegawai yang melakukan absensi hari ini.
                </div>
              ) : (
                recentAttendances.slice(0, 6).map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 transition"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{att.employee.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {att.employee.code} • {att.employee.division}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-emerald-400">
                        Masuk: {att.clockIn}
                      </div>
                      {att.clockOut && (
                        <div className="text-[10px] font-mono text-cyan-400">
                          Pulang: {att.clockOut}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-600">
        Sistem Absensi Berbasis Web Toko Konveksi • Otomatis & Terintegrasi
      </footer>
    </div>
  );
};
