export type Division = 'PENJAHIT' | 'SABLON' | 'PEMOTONG_BAHAN' | 'QC' | 'PACKING';

export type AttendanceStatus = 'TEPAT_WAKTU' | 'TERLAMBAT' | 'PULANG_AWAL';

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  lateGraceMinutes: number;
  isActive: boolean;
  _count?: {
    employees: number;
  };
}

export interface Employee {
  id: string;
  code: string;
  name: string;
  division: Division;
  phone?: string;
  qrCodeToken: string;
  shiftId?: string | null;
  shift?: Shift | null;
  isActive: boolean;
  createdAt: string;
  qrDataUrl?: string;
}

export interface Attendance {
  id: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  status: AttendanceStatus;
  lateMinutes: number;
  workDurationFormatted?: string | null;
  workDuration?: string | null;
  employee: {
    id?: string;
    code: string;
    name: string;
    division: Division;
    shiftName?: string;
  };
}

export interface DivisionStat {
  division: Division;
  label: string;
  totalEmployees: number;
  presentCount: number;
  percentage: number;
}

export interface DashboardSummary {
  totalEmployees: number;
  presentCount: number;
  onTimeCount: number;
  lateCount: number;
  earlyLeaveCount: number;
  absentCount: number;
  attendanceRate: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  divisionStats: DivisionStat[];
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: string;
}

export interface ScanResult {
  type: 'CLOCK_IN' | 'CLOCK_OUT';
  message: string;
  data: {
    employee: {
      code: string;
      name: string;
      division: Division;
      shift: string;
    };
    attendance: {
      id: string;
      clockIn: string;
      clockOut?: string;
      status: AttendanceStatus;
      lateMinutes?: number;
      durationFormatted?: string;
    };
  };
}
