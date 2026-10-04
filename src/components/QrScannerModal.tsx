import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, AlertCircle, RefreshCw, KeyRound } from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

// Audio beep effect using Web Audio API
const playBeep = (isSuccess: boolean = true) => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isSuccess ? 880 : 330, audioCtx.currentTime); // A5 for success, E4 for error
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
  } catch (e) {
    // Audio might be blocked before user interaction
  }
};

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    const scannerElementId = 'qr-reader-viewport';

    const initScanner = async () => {
      try {
        setScannerError(null);
        const devices = await Html5Qrcode.getCameras();

        if (!devices || devices.length === 0) {
          setScannerError('Kamera tidak ditemukan pada perangkat Anda.');
          return;
        }

        setCameras(devices);
        const chosenCamera = devices[0].id;
        setSelectedCameraId(chosenCamera);

        const html5QrCode = new Html5Qrcode(scannerElementId);
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          chosenCamera,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            playBeep(true);
            stopScanner();
            onScanSuccess(decodedText);
          },
          (_errorMessage) => {
            // Scanning in progress...
          }
        );

        setIsScanning(true);
      } catch (err: any) {
        console.error('Camera init error:', err);
        setScannerError(
          'Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan atau gunakan input manual token di bawah.'
        );
      }
    };

    // Small delay to ensure modal DOM is mounted
    const timer = setTimeout(() => {
      initScanner();
    }, 200);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen]);

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.error('Error stopping scanner:', e);
      }
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    playBeep(true);
    stopScanner();
    onScanSuccess(manualCode.trim());
    setManualCode('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-base">Pemindai QR Code Absensi</h3>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Container */}
        <div className="p-6 flex flex-col items-center">
          <div className="relative w-full max-w-[320px] aspect-square bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border-2 border-slate-800">
            <div id="qr-reader-viewport" className="w-full h-full" />

            {/* Target Viewfinder Overlay */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-56 h-56 border-2 border-emerald-400 rounded-2xl relative shadow-lg">
                  {/* Corner markers */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-500 rounded-tl-md" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-500 rounded-tr-md" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-500 rounded-bl-md" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-500 rounded-br-md" />
                  
                  {/* Laser Scan line */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse absolute top-1/2 -translate-y-1/2 shadow-sm shadow-emerald-400" />
                </div>
                <span className="text-[11px] font-semibold text-emerald-300 mt-4 bg-slate-900/80 px-3 py-1 rounded-full border border-emerald-500/30">
                  Arahkan QR Code Pegawai ke Dalam Kotak
                </span>
              </div>
            )}

            {scannerError && (
              <div className="p-4 text-center text-rose-300 flex flex-col items-center">
                <AlertCircle className="w-8 h-8 text-rose-400 mb-2" />
                <p className="text-xs text-rose-200">{scannerError}</p>
              </div>
            )}
          </div>

          {/* Camera switcher if multiple */}
          {cameras.length > 1 && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Kamera:</span>
              <select
                value={selectedCameraId}
                onChange={async (e) => {
                  setSelectedCameraId(e.target.value);
                  await stopScanner();
                  // Re-start with new camera
                }}
                className="text-xs bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700"
              >
                {cameras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label || `Kamera ${c.id.substring(0, 5)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Fallback Manual Code Input (Very helpful if camera permission denied or demo test) */}
          <div className="w-full mt-6 pt-5 border-t border-slate-100">
            <form onSubmit={handleManualSubmit} className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                <span>Input Manual Kode/Token QR (Alternatif):</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: KNV-KNV-001-A1B2"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition"
                >
                  Proses
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
