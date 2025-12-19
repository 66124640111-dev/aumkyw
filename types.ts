
export enum ShiftType {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  NIGHT = 'NIGHT',
  OFF = 'OFF',
  LEAVE = 'LEAVE',
  EMPTY = 'EMPTY'
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  department: string;
  avatar: string;
  isSenior?: boolean;
  warnings?: string[];
  unavailableDates: string[]; // Specific ISO dates for leave/unavailable
  availableDaysInMonth: number[]; // 1-31 specific day numbers preferred
  unavailableDays: number[];  // 0-6 (Sun-Sat)
}

export interface ShiftInfo {
  type: ShiftType;
  startTime?: string;
  endTime?: string;
  zone?: string;
  isConflict?: boolean;
  conflictReason?: string;
}

export type Schedule = Record<string, Record<string, ShiftInfo>>;

export interface DayInfo {
  date: string;
  dayName: string;
  dayNum: string;
}
