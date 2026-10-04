import axios from 'axios';
import {
  AdminUser,
  Employee,
  Shift,
  Attendance,
  DashboardData,
  ScanResult,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to outgoing requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor for 401 Unauthorized handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect if request was already login or public scan
      if (!error.config.url.includes('/auth/login') && !error.config.url.includes('/attendance/scan')) {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/kiosk') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// AUTH API
// ==========================================
export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      data: { token: string; admin: AdminUser };
    }>('/auth/login', credentials);
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get<{ success: boolean; data: AdminUser }>('/auth/me');
    return res.data;
  },
};

// ==========================================
// EMPLOYEES API
// ==========================================
export const employeeApi = {
  getAll: async (params?: { division?: string; search?: string; isActive?: boolean }) => {
    const res = await apiClient.get<{ success: boolean; data: Employee[] }>('/employees', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: Employee }>('/employees/' + id);
    return res.data;
  },
  create: async (data: Partial<Employee>) => {
    const res = await apiClient.post<{ success: boolean; message: string; data: Employee }>('/employees', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Employee>) => {
    const res = await apiClient.put<{ success: boolean; message: string; data: Employee }>('/employees/' + id, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>('/employees/' + id);
    return res.data;
  },
  getQrCode: async (id: string) => {
    const res = await apiClient.get<{
      success: boolean;
      data: {
        employeeId: string;
        employeeCode: string;
        employeeName: string;
        division: string;
        shiftName: string;
        qrToken: string;
        qrDataUrl: string;
      };
    }>('/employees/' + id + '/qr');
    return res.data;
  },
  regenerateQr: async (id: string) => {
    const res = await apiClient.post<{ success: boolean; message: string; data: { employee: Employee; qrDataUrl: string } }>(
      '/employees/' + id + '/regenerate-qr'
    );
    return res.data;
  },
};

// ==========================================
// SHIFTS API
// ==========================================
export const shiftApi = {
  getAll: async () => {
    const res = await apiClient.get<{ success: boolean; data: Shift[] }>('/shifts');
    return res.data;
  },
  create: async (data: Partial<Shift>) => {
    const res = await apiClient.post<{ success: boolean; message: string; data: Shift }>('/shifts', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Shift>) => {
    const res = await apiClient.put<{ success: boolean; message: string; data: Shift }>('/shifts/' + id, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>('/shifts/' + id);
    return res.data;
  },
};

// ==========================================
// ATTENDANCE & KIOSK SCAN API
// ==========================================
export const attendanceApi = {
  scanQr: async (qrToken: string) => {
    const res = await apiClient.post<ScanResult>('/attendance/scan', { qrToken });
    return res.data;
  },
  getToday: async () => {
    const res = await apiClient.get<{ success: boolean; data: Attendance[] }>('/attendance/today');
    return res.data;
  },
};

// ==========================================
// REPORTS & DASHBOARD API
// ==========================================
export const reportApi = {
  getDashboard: async () => {
    const res = await apiClient.get<{ success: boolean; data: DashboardData }>('/reports/dashboard');
    return res.data;
  },
  getRecap: async (params?: { startDate?: string; endDate?: string; division?: string; status?: string }) => {
    const res = await apiClient.get<{ success: boolean; total: number; data: any[] }>('/reports/recap', { params });
    return res.data;
  },
  downloadExcel: async (params?: { startDate?: string; endDate?: string; division?: string; status?: string }) => {
    const response = await apiClient.get('/reports/export/excel', {
      params,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rekap-absensi-konveksi-${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
  downloadPdf: async (params?: { startDate?: string; endDate?: string; division?: string; status?: string }) => {
    const response = await apiClient.get('/reports/export/pdf', {
      params,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `laporan-absensi-konveksi-${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
