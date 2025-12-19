
import React, { useState, useMemo } from 'react';
import { Staff, Schedule, ShiftType } from '../types';
import { SHIFT_DETAILS } from '../constants';

interface RequestsProps {
  staff: Staff[];
  isGenerating: boolean;
  onGenerate: (selectedDate: Date) => Promise<Schedule>;
  onSave: (monthKey: string, schedule: Schedule) => void;
}

const Requests: React.FC<RequestsProps> = ({ staff, isGenerating, onGenerate, onSave }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [previewSchedule, setPreviewSchedule] = useState<Schedule | null>(null);

  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const handleGenerate = async () => {
    const date = new Date(selectedYear, selectedMonth, 1);
    const result = await onGenerate(date);
    setPreviewSchedule(result);
  };

  const handleSave = () => {
    if (!previewSchedule) return;
    const monthKey = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}`;
    onSave(monthKey, previewSchedule);
  };

  // Generate date range for the preview calendar
  const previewDates = useMemo(() => {
    const dates = [];
    const date = new Date(selectedYear, selectedMonth, 1);
    const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
    while (date.getMonth() === selectedMonth) {
      dates.push({
        full: date.toISOString().split('T')[0],
        num: date.getDate(),
        name: thaiDays[date.getDay()],
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
      date.setDate(date.getDate() + 1);
    }
    return dates;
  }, [selectedMonth, selectedYear]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Configuration Header */}
      <div className="bg-surface-light rounded-2xl border border-[#dbe1e6] shadow-sm overflow-hidden p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4 max-w-lg">
            <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
            </div>
            <div>
              <h3 className="text-2xl font-black text-text-primary-light">สร้างตารางเวรอัตโนมัติ</h3>
              <p className="text-text-secondary-light text-sm leading-relaxed">
                ระบบจะคำนวณเวรให้บุคลากรทั้ง {staff.length} ท่าน โดยพิจารณาจากวันลาและวันไม่สะดวกรายบุคคลที่ระบุไว้ในฐานข้อมูล
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary-light uppercase tracking-widest">เดือน</label>
              <select 
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(parseInt(e.target.value));
                  setPreviewSchedule(null);
                }}
                className="rounded-xl border-[#dbe1e6] text-sm focus:ring-primary py-2.5 px-4 min-w-[140px]"
              >
                {monthNames.map((name, i) => (
                  <option key={i} value={i}>{name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary-light uppercase tracking-widest">ปี พ.ศ.</label>
              <select 
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(parseInt(e.target.value));
                  setPreviewSchedule(null);
                }}
                className="rounded-xl border-[#dbe1e6] text-sm focus:ring-primary py-2.5 px-4 min-w-[100px]"
              >
                <option value={2024}>2567</option>
                <option value={2025}>2568</option>
              </select>
            </div>
            
            <button 
              disabled={isGenerating}
              onClick={handleGenerate}
              className={`h-[42px] px-8 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${
                isGenerating 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                : 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20 hover:-translate-y-0.5'
              }`}
            >
              {isGenerating ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                  <span>กำลังประมวลผล...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                  <span>เริ่มจัดตาราง</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {previewSchedule && !isGenerating && (
        <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-8 bg-accent-success/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-accent-success text-[18px]">done</span>
              </div>
              <div>
                <h4 className="font-bold text-text-primary-light">ตัวอย่างตารางเวร: {monthNames[selectedMonth]}</h4>
                <p className="text-[11px] text-text-secondary-light">ตรวจสอบความถูกต้องก่อนกดบันทึกเข้าสู่ฐานข้อมูลหลัก</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setPreviewSchedule(null)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-text-secondary-light hover:bg-gray-100 transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleSave}
                className="px-8 py-2.5 rounded-xl bg-accent-success text-white text-sm font-bold shadow-lg shadow-accent-success/20 hover:brightness-95 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                ยืนยันและบันทึกตาราง
              </button>
            </div>
          </div>

          {/* Large Preview Calendar Grid */}
          <div className="bg-surface-light rounded-2xl border border-[#dbe1e6] shadow-sm overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50/50 sticky top-0 z-10 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-left font-bold text-[10px] text-text-secondary-light uppercase tracking-widest min-w-[200px] border-r border-gray-200 sticky left-0 bg-gray-50 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                      บุคลากร
                    </th>
                    {previewDates.map(date => (
                      <th key={date.full} className={`p-2 text-center min-w-[40px] border-r border-gray-100 ${date.isWeekend ? 'bg-blue-50/50' : ''}`}>
                        <div className={`text-[9px] font-black ${date.isWeekend ? 'text-primary' : 'text-text-secondary-light'}`}>{date.name}</div>
                        <div className={`text-xs font-black ${date.isWeekend ? 'text-primary' : 'text-text-primary-light'}`}>{date.num}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {staff.map(nurse => (
                    <tr key={nurse.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="p-3 border-r border-gray-100 sticky left-0 bg-white z-10 flex items-center gap-3 shadow-[2px_0_5px_rgba(0,0,0,0.02)] group-hover:bg-gray-50">
                        <img src={nurse.avatar} className="size-8 rounded-lg object-cover" alt="" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-text-primary-light truncate">{nurse.name}</p>
                          <p className="text-[9px] text-text-secondary-light truncate uppercase tracking-tighter">{nurse.role.split(' ')[0]}</p>
                        </div>
                      </td>
                      {previewDates.map(date => {
                        const shift = previewSchedule[nurse.id]?.[date.full];
                        const isUnavailable = (nurse.unavailableDates || []).includes(date.full) || 
                                              (nurse.unavailableDays || []).includes(new Date(date.full).getDay());
                        
                        return (
                          <td key={date.full} className={`p-1 border-r border-gray-100 text-center ${date.isWeekend ? 'bg-blue-50/5' : ''}`}>
                            {shift ? (
                              <div 
                                className={`size-8 rounded-lg flex items-center justify-center mx-auto text-[10px] font-black shadow-sm ${isUnavailable ? 'ring-2 ring-accent-error ring-offset-1' : ''}`}
                                style={{ backgroundColor: SHIFT_DETAILS[shift.type].bg, color: SHIFT_DETAILS[shift.type].color }}
                                title={`${SHIFT_DETAILS[shift.type].label}${isUnavailable ? ' (ติดเงื่อนไขลา)' : ''}`}
                              >
                                {shift.type === ShiftType.MORNING ? 'M' : 
                                 shift.type === ShiftType.AFTERNOON ? 'A' : 
                                 shift.type === ShiftType.NIGHT ? 'N' : 'O'}
                              </div>
                            ) : (
                              <div className="size-8 mx-auto flex items-center justify-center opacity-10">
                                <span className="text-[10px] font-black text-gray-300">-</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold text-text-secondary-light">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5"><span className="size-2 bg-primary rounded-full"></span>M = เช้า</span>
                <span className="flex items-center gap-1.5"><span className="size-2 bg-orange-500 rounded-full"></span>A = บ่าย</span>
                <span className="flex items-center gap-1.5"><span className="size-2 bg-indigo-600 rounded-full"></span>N = ดึก</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px] text-accent-error">error</span>
                <span>วงกลมสีแดงกะพริบแจ้งเตือนเมื่อ AI จัดกะทับซ้อนกับวันลาที่พยาบาลระบุ</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State / Initial View */}
      {!previewSchedule && !isGenerating && (
        <div className="bg-surface-light p-20 rounded-2xl border border-[#dbe1e6] border-dashed text-center space-y-4">
          <div className="size-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-5xl text-gray-200">calendar_add_on</span>
          </div>
          <div className="space-y-2 max-w-sm mx-auto">
            <h4 className="text-xl font-bold text-text-primary-light">ระบุเดือนและปีเพื่อเริ่มงาน</h4>
            <p className="text-sm text-text-secondary-light">เลือกระยะเวลาที่ต้องการ และระบบจะดึงข้อมูลพยาบาลทั้งหมด {staff.length} ท่านมาจัดกะให้โดยอัตโนมัติ</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
