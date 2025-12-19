
import { ShiftType, Staff, DayInfo } from './types';

export const MOCK_STAFF: Staff[] = [
  {
    id: '1',
    name: 'กานดา มีสุข (RN)',
    role: 'พยาบาลวิชาชีพ (Senior)',
    phone: '081-234-5678',
    department: 'แผนกฉุกเฉิน (ER)',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMCF-tHaGAkRxa5vppzTFPJf4Z3L3uZ0dxatw0w7yEBEiaUsSa9LlLtUfKEUzQyN89bxhsKCTe5rkfaWVXEfELO1tB26n9TsyXfa9qLvQ22T1iEweqeA_EmxgphMcypKH77gxGpmm0qHdwKXDbWzQe2o88u0G_sXACIjteLGCvnqgCbThJJco43FM4MTyRrR7ChtCv8lLkaDE5BHslEwR671-BDIbecdxhMwMvJiVAYOcCcUdgpy_gp8WaUS_225T9N2GMFgG8C7mM',
    isSenior: true,
    unavailableDates: [],
    availableDaysInMonth: [1, 5, 10, 15, 20],
    unavailableDays: [0] // Doesn't like Sundays
  },
  {
    id: '2',
    name: 'สมชาย ใจดี (PN)',
    role: 'พนักงานผู้ช่วย',
    phone: '089-987-6543',
    department: 'แผนกฉุกเฉิน (ER)',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3_UvviftLWRZngdpCxraabmVE2K__2LORQjn-BcQCylFtloRuU1BW1RB2DN-uxdLC4ogb8GGCj3vs2FNvPTVd85RWXk-le-tWVefVyOXoOBFe-ghU4DCAfnSNF-pem0ZMz5PoqJiDmWoh_kMRkn7_g74d5pQVFZbXMBC4cxNtBQBsBh3MM1yGJDH3IzwKZyZ9Pk5biWk9DlxG3YbyiqDrqgOjQ1CbNT9EiH5h1h4dculz4HjnTQ7FcPKrkY9oVerYX3zkKDzFjOtu',
    unavailableDates: ['2024-06-12'],
    availableDaysInMonth: [2, 4, 6, 8],
    unavailableDays: []
  },
  {
    id: '3',
    name: 'มาลี รักดี (RN)',
    role: 'พยาบาลวิชาชีพ',
    phone: '085-555-1234',
    department: 'แผนกผู้ป่วยนอก (OPD)',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfWP96gxmDmWuwXwO_IAnmDvr20-9n201o4AtpGfVXdje7PPEoVWArt7Xpa48LSPp6ugnTgEzHbSegb19QrejvDO0gKqTqdFXDwWJLVfmx7UO0kdoU3H_MPVTGTSJwJ3n6_036rfm3hHLCvP_Mlxd4ZNySMD5JQqOp9qBZuHRni6Jg6sDs3-59v799MZUlQms9Zjwc6pGe6I7VUjfK2US1of_mViImxkFa21fIidNZKAdKtjfZl-w81q4yi6-OsYYz42-CPrSy0xPV',
    unavailableDates: [],
    availableDaysInMonth: [10, 11, 12, 13, 14],
    unavailableDays: [6] // Doesn't like Saturdays
  }
];

export const DAYS: DayInfo[] = [
  { date: '2024-06-01', dayName: 'จันทร์', dayNum: '01' },
  { date: '2024-06-02', dayName: 'อังคาร', dayNum: '02' },
  { date: '2024-06-03', dayName: 'พุธ', dayNum: '03' },
  { date: '2024-06-04', dayName: 'พฤหัส', dayNum: '04' },
  { date: '2024-06-05', dayName: 'ศุกร์', dayNum: '05' },
  { date: '2024-06-06', dayName: 'เสาร์', dayNum: '06' },
  { date: '2024-06-07', dayName: 'อาทิตย์', dayNum: '07' },
];

export const SHIFT_DETAILS = {
  [ShiftType.MORNING]: { label: 'เช้า (M)', time: '08:00 - 16:00', icon: 'sunny', color: '#138eec', bg: '#e3f2fd', border: '#138eec' },
  [ShiftType.AFTERNOON]: { label: 'บ่าย (A)', time: '16:00 - 00:00', icon: 'wb_twilight', color: '#ef6c00', bg: '#fff3e0', border: '#ef6c00' },
  [ShiftType.NIGHT]: { label: 'ดึก (N)', time: '00:00 - 08:00', icon: 'bedtime', color: '#3f51b5', bg: '#e8eaf6', border: '#3f51b5' },
  [ShiftType.OFF]: { label: 'หยุด (Off)', time: '', icon: '', color: '#617889', bg: '#f6f7f8', border: '#dbe1e6' },
  [ShiftType.LEAVE]: { label: 'ลาพักร้อน', time: '', icon: '', color: '#617889', bg: '#f8fafc', border: '#dbe1e6' },
  [ShiftType.EMPTY]: { label: '', time: '', icon: '', color: '', bg: 'transparent', border: '' },
};
