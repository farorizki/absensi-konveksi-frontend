import React, { useState, useEffect } from 'react';
import { employeeApi, shiftApi } from '../services/api';
import { Employee, Shift, Division } from '../types';
import { EmployeeCardModal } from '../components/EmployeeCardModal';
import {
  Users,
  Plus,
  Search,
  QrCode,
  Edit2,
  Trash2,
  Phone,
  Clock,
  X,
  Sparkles,
} from 'lucide-react';

const divisions: { key: Division | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'Semua Divisi' },
  { key: 'PENJAHIT', label: 'Penjahit' },
  { key: 'SABLON', label: 'Sablon' },
  { key: 'PEMOTONG_BAHAN', label: 'Pemotong Bahan' },
  { key: 'QC', label: 'QC (Quality Control)' },
  { key: 'PACKING', label: 'Packing' },
];

const divisionBadges: Record<string, string> = {
  PENJAHIT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SABLON: 'bg-purple-50 text-purple-700 border-purple-200',
  PEMOTONG_BAHAN: 'bg-amber-50 text-amber-700 border-amber-200',
  QC: 'bg-sky-50 text-sky-700 border-sky-200',
  PACKING: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDivision, setSelectedDivision] = useState<Division | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [cardModalEmployee, setCardModalEmployee] = useState<Employee | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    division: 'PENJAHIT' as Division,
    phone: '',
    shiftId: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, shiftRes] = await Promise.all([
        employeeApi.getAll({
          division: selectedDivision === 'ALL' ? undefined : selectedDivision,
          search: searchQuery || undefined,
        }),
        shiftApi.getAll(),
      ]);
      setEmployees(empRes.data);
      setShifts(shiftRes.data);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDivision]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const openCreateModal = () => {
    setEditingEmployee(null);
    setFormData({
      code: '',
      name: '',
      division: 'PENJAHIT',
      phone: '',
      shiftId: shifts[0]?.id || '',
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      code: emp.code,
      name: emp.name,
      division: emp.division,
      phone: emp.phone || '',
      shiftId: emp.shiftId || '',
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await employeeApi.update(editingEmployee.id, formData);
      } else {
        await employeeApi.create(formData);
      }
      setIsFormModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan data pegawai.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus pegawai "${name}" dari sistem konveksi?`)) return;
    try {
      await employeeApi.delete(id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus pegawai.');
    }
  };

  const openIdCard = async (emp: Employee) => {
    try {
      const res = await employeeApi.getQrCode(emp.id);
      setCardModalEmployee({
        ...emp,
        qrDataUrl: res.data.qrDataUrl,
      });
    } catch (err) {
      setCardModalEmployee(emp);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span>Data Pegawai Toko Konveksi</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              {employees.length} Orang
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola data staf konveksi, divisi penjahit, sablon, dan cetak kartu QR Code.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pegawai Baru</span>
        </button>
      </div>

      {/* Filter Tabs Divisi */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {divisions.map((div) => (
          <button
            key={div.key}
            onClick={() => setSelectedDivision(div.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedDivision === div.key
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {div.label}
          </button>
        ))}
      </div>

      {/* Search Input Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau kode pegawai (misal: Siti, KNV-001)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition"
          >
            Cari
          </button>
        </form>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Nama Pegawai</th>
                <th className="py-3 px-4">Divisi Kerja</th>
                <th className="py-3 px-4">Shift</th>
                <th className="py-3 px-4">No. Telepon</th>
                <th className="py-3 px-4 text-center">Kartu QR</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Memuat data pegawai...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada data pegawai yang ditemukan.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {emp.code}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {emp.name}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          divisionBadges[emp.division] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {emp.division.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{emp.shift?.name || 'Reguler'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {emp.phone ? (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{emp.phone}</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => openIdCard(emp)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold border border-blue-200 transition"
                      >
                        <QrCode className="w-3.5 h-3.5 text-blue-600" />
                        <span>Cetak ID</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(emp)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Pegawai"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id, emp.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Pegawai"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal (Tambah / Edit Pegawai) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingEmployee ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kode Pegawai (Opsional - Kosongkan untuk auto-generate)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: KNV-006"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap Pegawai *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama pegawai konveksi"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Divisi Kerja *
                </label>
                <select
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value as Division })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="PENJAHIT">Penjahit</option>
                  <option value="SABLON">Sablon</option>
                  <option value="PEMOTONG_BAHAN">Pemotong Bahan</option>
                  <option value="QC">QC (Quality Control)</option>
                  <option value="PACKING">Packing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Jadwal Shift Kerja
                </label>
                <select
                  value={formData.shiftId}
                  onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="">Pilih Shift Kerja...</option>
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.startTime} - {s.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nomor HP / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-500/20"
                >
                  Simpan Pegawai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ID Card Print & View Modal */}
      <EmployeeCardModal
        employee={cardModalEmployee}
        onClose={() => setCardModalEmployee(null)}
        onEmployeeUpdated={fetchData}
      />
    </div>
  );
};
