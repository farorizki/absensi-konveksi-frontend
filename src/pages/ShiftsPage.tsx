import React, { useState, useEffect } from 'react';
import { shiftApi } from '../services/api';
import { Shift } from '../types';
import { Clock, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

export const ShiftsPage: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    startTime: '08:00',
    endTime: '16:00',
    lateGraceMinutes: 15,
  });

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const res = await shiftApi.getAll();
      setShifts(res.data);
    } catch (err) {
      console.error('Failed to load shifts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const openCreateModal = () => {
    setEditingShift(null);
    setFormData({
      name: '',
      startTime: '08:00',
      endTime: '16:00',
      lateGraceMinutes: 15,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (shift: Shift) => {
    setEditingShift(shift);
    setFormData({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      lateGraceMinutes: shift.lateGraceMinutes,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingShift) {
        await shiftApi.update(editingShift.id, formData);
      } else {
        await shiftApi.create(formData);
      }
      setIsModalOpen(false);
      fetchShifts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan shift.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus shift "${name}"? Pegawai terkait akan diubah menjadi jadwal reguler.`)) return;
    try {
      await shiftApi.delete(id);
      fetchShifts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus shift.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Pengaturan Shift Kerja Toko Konveksi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Atur jam mulai kerja, jam pulang, dan batas toleransi keterlambatan scan absensi.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Shift Baru</span>
        </button>
      </div>

      {/* Shifts Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-8 text-center text-xs text-slate-400">
            Memuat jadwal shift...
          </div>
        ) : shifts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            Belum ada jadwal shift yang dibuat.
          </div>
        ) : (
          shifts.map((shift) => (
            <div
              key={shift.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-blue-300 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {shift._count?.employees ?? 0} Pegawai
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-base mb-1">
                  {shift.name}
                </h3>

                <div className="space-y-2 mt-4 text-xs text-slate-600">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-400">Jam Mulai (Clock-In)</span>
                    <span className="font-mono font-bold text-slate-800">{shift.startTime}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-400">Jam Selesai (Clock-Out)</span>
                    <span className="font-mono font-bold text-slate-800">{shift.endTime}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-400">Toleransi Terlambat</span>
                    <span className="font-semibold text-amber-600">{shift.lateGraceMinutes} Menit</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end gap-1">
                <button
                  onClick={() => openEditModal(shift)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Edit Shift"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(shift.id, shift.name)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Hapus Shift"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Shift Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingShift ? 'Edit Jadwal Shift' : 'Tambah Shift Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Shift *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Shift Pagi (Produksi)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Jam Mulai (HH:mm)
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Jam Selesai (HH:mm)
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Toleransi Terlambat (Menit)
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  required
                  value={formData.lateGraceMinutes}
                  onChange={(e) => setFormData({ ...formData, lateGraceMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-500/20"
                >
                  Simpan Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
