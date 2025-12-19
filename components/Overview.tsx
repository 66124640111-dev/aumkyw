
import React, { useMemo } from 'react';
import { Schedule, Staff, ShiftType } from '../types';
import { SHIFT_DETAILS } from '../constants';

interface OverviewProps {
  settings: {
    hospitalName: string;
    department: string;
    rules: {
      aiMode: string;
    };
  };
  schedule: Schedule;
  staff: Staff[];
}

const Overview: React.FC<OverviewProps> = ({ settings, schedule, staff }) => {
  // 1. Staff Statistics
  const seniorsCount = useMemo(() => staff.filter(s => s.isSenior).length, [staff]);
  const regularCount = useMemo(() => staff.length - seniorsCount, [staff, seniorsCount]);

  // 2. Staff per Department (Bar Chart Data)
  const staffByDept = useMemo(() => {
    const counts: Record<string, number> = {};
    staff.forEach(s => {
      counts[s.department] = (counts[s.department] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [staff]);

  const maxDeptCount = Math.max(...staffByDept.map(d => d.count), 1);

  // 3. Shift Type Distribution (Morning vs Afternoon vs Night)
  const shiftTypeStats = useMemo(() => {
    const counts = {
      [ShiftType.MORNING]: 0,
      [ShiftType.AFTERNOON]: 0,
      [ShiftType.NIGHT]: 0
    };
    Object.values(schedule).forEach(staffSchedule => {
      Object.values(staffSchedule).forEach(shift => {
        if (shift.type === ShiftType.MORNING) counts[ShiftType.MORNING]++;
        if (shift.type === ShiftType.AFTERNOON) counts[ShiftType.AFTERNOON]++;
        if (shift.type === ShiftType.NIGHT) counts[ShiftType.NIGHT]++;
      });
    });
    return counts;
  }, [schedule]);

  const totalShifts = shiftTypeStats[ShiftType.MORNING] + shiftTypeStats[ShiftType.AFTERNOON] + shiftTypeStats[ShiftType.NIGHT] || 1;

  // 4. Daily Shift Volume (Weekly view)
  const dailyDistribution = useMemo(() => {
    const dailyCounts: Record<string, number> = {};
    Object.values(schedule).forEach(staffSchedule => {
      Object.entries(staffSchedule).forEach(([date, shift]) => {
        if (shift.type !== ShiftType.EMPTY && shift.type !== ShiftType.OFF) {
          dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        }
      });
    });
    const dates = Object.keys(dailyCounts).sort().slice(0, 7);
    return dates.map(date => ({
      label: new Date(date).toLocaleDateString('th-TH', { weekday: 'short' }),
      count: dailyCounts[date]
    }));
  }, [schedule]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Stats Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Chart 1: Staff per Department */}
          <div className="bg-surface-light p-6 rounded-2xl border border-[#dbe1e6] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-text-primary-light">จำนวนพยาบาลแยกตามแผนก</h3>
                <p className="text-[10px] text-text-secondary-light">สัดส่วนบุคลากรในแต่ละหน่วยงานของโรงพยาบาล</p>
              </div>
              <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">bar_chart</span>
            </div>
            <div className="space-y-4">
              {staffByDept.map((dept) => (
                <div key={dept.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-text-primary-light">{dept.name}</span>
                    <span className="text-primary">{dept.count} ท่าน</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-1000 ease-out" 
                      style={{ width: `${(dept.count / maxDeptCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {staffByDept.length === 0 && <p className="text-xs text-center py-4 text-text-secondary-light italic">ไม่มีข้อมูลแผนก</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 2: Shift Coverage Breakdown */}
            <div className="bg-surface-light p-6 rounded-2xl border border-[#dbe1e6] shadow-sm">
              <h4 className="text-xs font-bold text-text-secondary-light uppercase tracking-widest mb-4">ปริมาณกะงานแยกตามประเภท</h4>
              <div className="flex items-end justify-between h-40 gap-4 pt-4 px-2">
                {[ShiftType.MORNING, ShiftType.AFTERNOON, ShiftType.NIGHT].map(type => {
                  const count = shiftTypeStats[type];
                  const percentage = (count / totalShifts) * 100;
                  const details = SHIFT_DETAILS[type];
                  return (
                    <div key={type} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gray-50 rounded-lg relative flex items-end h-full overflow-hidden">
                        <div 
                          className="w-full transition-all duration-1000 ease-in-out" 
                          style={{ height: `${percentage}%`, backgroundColor: details.color }}
                        ></div>
                        <div className="absolute inset-x-0 bottom-2 text-center text-[10px] font-black text-white mix-blend-difference">
                          {Math.round(percentage)}%
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-text-secondary-light">{details.label.split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 3: Seniority Ratio */}
            <div className="bg-surface-light p-6 rounded-2xl border border-[#dbe1e6] shadow-sm">
              <h4 className="text-xs font-bold text-text-secondary-light uppercase tracking-widest mb-4">สัดส่วนพยาบาลวิชาชีพ</h4>
              <div className="flex items-center justify-center h-40 relative">
                {/* Simple CSS Donut representation */}
                <div className="size-32 rounded-full border-[12px] border-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-black text-text-primary-light">{Math.round((seniorsCount / (staff.length || 1)) * 100)}%</p>
                    <p className="text-[9px] font-bold text-primary uppercase">Senior RN</p>
                  </div>
                </div>
                {/* Legend */}
                <div className="absolute bottom-0 flex gap-4 text-[10px] font-bold">
                  <div className="flex items-center gap-1">
                    <span className="size-2 bg-primary rounded-full"></span>
                    <span className="text-text-secondary-light">Senior: {seniorsCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="size-2 bg-gray-300 rounded-full"></span>
                    <span className="text-text-secondary-light">Regular: {regularCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Column */}
        <div className="space-y-6">
          <div className="bg-surface-light p-6 rounded-2xl border border-[#dbe1e6] shadow-sm h-full">
            <h3 className="font-bold text-text-primary-light mb-6 flex items-center justify-between">
              ข้อมูลระบบ
              <span className="material-symbols-outlined text-text-secondary-light">settings_heart</span>
            </h3>
            <div className="space-y-6">
              <InfoRow icon="home" color="bg-blue-500" label="โรงพยาบาล" value={settings.hospitalName} />
              <InfoRow icon="medical_information" color="bg-green-500" label="แผนกหลัก" value={settings.department} />
              <InfoRow icon="psychology_alt" color="bg-orange-500" label="โหมดประมวลผล" value={settings.rules.aiMode === 'strict' ? 'Strict Logic' : 'Flexible Bias'} />
              <InfoRow icon="group" color="bg-indigo-500" label="พนักงานเข้าระบบ" value={`${staff.length} ท่าน`} />
              
              <div className="pt-6 border-t border-gray-100">
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">สถานะการทำงาน</span>
                  </div>
                  <p className="text-[11px] text-text-secondary-light leading-relaxed">
                    ระบบพร้อมใช้งาน ข้อมูลการจัดเวรถูกบันทึกล่าสุดเมื่อ {new Date().toLocaleDateString('th-TH')} แดชบอร์ดอัปเดตแบบ Real-time ตามความเคลื่อนไหวของข้อมูล
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const InfoRow: React.FC<{icon: string, color: string, label: string, value: string}> = ({icon, color, label, value}) => (
  <div className="flex items-center gap-4">
    <div className={`size-10 ${color} text-white rounded-xl flex items-center justify-center shrink-0`}>
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-text-secondary-light font-bold uppercase tracking-tight">{label}</p>
      <p className="text-sm font-bold text-text-primary-light truncate">{value}</p>
    </div>
  </div>
);

export default Overview;
