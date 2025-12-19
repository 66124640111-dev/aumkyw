
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ScheduleGrid from './components/ScheduleGrid';
import StaffList from './components/StaffList';
import Overview from './components/Overview';
import Requests from './components/Requests'; 
import Reports from './components/Reports';
import Settings from './components/Settings';
import { ShiftType, Schedule, ShiftInfo, Staff, DayInfo } from './types';
import { MOCK_STAFF, SHIFT_DETAILS } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('schedule');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [staff, setStaff] = useState<Staff[]>(MOCK_STAFF);
  
  // Date State
  const [currentDate, setCurrentDate] = useState(new Date(2024, 5, 1)); // Default to June 2024

  // Persistent Schedules Store (Month Key: YYYY-MM)
  const [savedSchedules, setSavedSchedules] = useState<Record<string, Schedule>>({});

  // Listen for custom navigation events
  useEffect(() => {
    const handleNav = (e: any) => setActiveView(e.detail);
    window.addEventListener('navigate', handleNav);
    return () => window.removeEventListener('navigate', handleNav);
  }, []);

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days: DayInfo[] = [];
    const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
    
    while (date.getMonth() === month) {
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: thaiDays[date.getDay()],
        dayNum: date.getDate().toString().padStart(2, '0')
      });
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentDate]);

  // App Settings
  const [settings, setSettings] = useState({
    hospitalName: 'โรงพยาบาลเทพสตรี',
    department: 'แผนกฉุกเฉิน (Emergency Room)',
    adminPassword: 'admin123',
    rules: {
      senior: true,
      overwork: true,
      swap: true,
      aiMode: 'strict' as 'strict' | 'flexible'
    }
  });

  const [schedule, setSchedule] = useState<Schedule>(() => {
    const initial: Schedule = {};
    MOCK_STAFF.forEach(s => { initial[s.id] = {}; });
    return initial;
  });

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleUpdateDay = (index: number, newDateStr: string) => {
    const oldDate = daysInMonth[index].date;
    const dateObj = new Date(newDateStr);
    setSchedule(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(staffId => {
        if (next[staffId][oldDate]) {
          next[staffId][newDateStr] = { ...next[staffId][oldDate] };
          delete next[staffId][oldDate];
        }
      });
      return next;
    });
    setCurrentDate(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1));
  };

  const handleAddStaff = (newStaff: Staff) => {
    setStaff(prev => [...prev, newStaff]);
    setSchedule(prev => ({ ...prev, [newStaff.id]: {} }));
  };

  const handleUpdateStaff = (updatedStaff: Staff) => {
    setStaff(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
  };

  const handleDeleteStaff = (staffId: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบุคลากรท่านนี้?')) {
      setStaff(prev => prev.filter(s => s.id !== staffId));
      setSchedule(prev => {
        const next = { ...prev };
        delete next[staffId];
        return next;
      });
    }
  };

  const handleShiftUpdate = (staffId: string, date: string, shiftInfo: Partial<ShiftInfo>) => {
    setSchedule(prev => {
      const current = prev[staffId]?.[date] || { type: ShiftType.EMPTY };
      return {
        ...prev,
        [staffId]: {
          ...(prev[staffId] || {}),
          [date]: { ...current, ...shiftInfo }
        }
      };
    });
  };

  const handleGenerateMonthlySchedule = async (selectedDate: Date): Promise<Schedule> => {
    setIsAssigning(true);
    
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const datePtr = new Date(year, month, 1);
    const monthDays: string[] = [];
    while (datePtr.getMonth() === month) {
      monthDays.push(datePtr.toISOString().split('T')[0]);
      datePtr.setDate(datePtr.getDate() + 1);
    }

    const newSchedule: Schedule = {};
    staff.forEach(s => { newSchedule[s.id] = {}; });

    let staffCursor = 0;
    const shiftTypes = [ShiftType.MORNING, ShiftType.AFTERNOON, ShiftType.NIGHT];

    // Simple round-robin with constraints
    for (const dateStr of monthDays) {
      const currentDateObj = new Date(dateStr);
      const dayOfWeek = currentDateObj.getDay();
      const dayOfMonth = currentDateObj.getDate();

      for (const shiftType of shiftTypes) {
        let assigned = false;
        let attempts = 0;

        while (!assigned && attempts < staff.length) {
          const currentStaff = staff[staffCursor];
          
          // Check Constraints
          const isDateLeave = (currentStaff.unavailableDates || []).includes(dateStr);
          const isDayOfWeekBlocked = (currentStaff.unavailableDays || []).includes(dayOfWeek);
          const worksPreviously = (newSchedule[currentStaff.id][dateStr]); // Already assigned a shift today?

          // Priority logic (optional: give priority to those who said they are convenient)
          const isConvenient = (currentStaff.availableDaysInMonth || []).includes(dayOfMonth);

          if (!isDateLeave && !isDayOfWeekBlocked && !worksPreviously) {
            newSchedule[currentStaff.id][dateStr] = {
              type: shiftType,
              zone: 'กองการพยาบาล'
            };
            assigned = true;
          }
          
          staffCursor = (staffCursor + 1) % staff.length;
          attempts++;
        }
      }
    }

    await new Promise(r => setTimeout(r, 1800)); // Artificial thinking time
    setIsAssigning(false);
    return newSchedule;
  };

  const handleSaveToHistory = (monthKey: string, scheduleData: Schedule) => {
    setSavedSchedules(prev => ({
      ...prev,
      [monthKey]: scheduleData
    }));
    setSchedule(scheduleData);
    const [y, m] = monthKey.split('-').map(Number);
    setCurrentDate(new Date(y, m - 1, 1));
    alert(`บันทึกตารางเวรเดือน ${monthKey} สำเร็จ!`);
    setActiveView('schedule');
  };

  const stats = useMemo(() => {
    let assignedHours = 0;
    let conflicts = 0;
    Object.values(schedule).forEach(staffSchedule => {
      Object.values(staffSchedule).forEach(shift => {
        if ([ShiftType.MORNING, ShiftType.AFTERNOON, ShiftType.NIGHT].includes(shift.type)) {
          assignedHours += 8;
        }
        if (shift.isConflict) conflicts++;
      });
    });
    return { assignedHours, conflicts };
  }, [schedule]);

  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const viewTitles: Record<string, { main: string, sub: string }> = {
    schedule: { 
      main: "การจัดการตารางเวรรายเดือน", 
      sub: `${settings.department} - ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear() + 543}` 
    },
    staff: { main: "รายชื่อบุคลากร (Staff Directory)", sub: `จัดการข้อมูลพื้นฐานและสิทธิ์การเข้าถึง` },
    overview: { main: "ภาพรวมระบบ (System Overview)", sub: `สถิติและความพร้อมของ ${settings.hospitalName}` },
    requests: { main: "จัดตารางเวรอัตโนมัติ", sub: "สร้างตารางเวรใหม่ตามเงื่อนไขของบุคลากร" },
    reports: { main: "รายงานตารางเวรย้อนหลัง", sub: "ประวัติตารางเวรที่บันทึกเข้าสู่ระบบ" },
    settings: { main: "ตั้งค่าระบบ (Settings)", sub: "กำหนดค่าพื้นฐานและกฎการจัดเวร" },
  };

  return (
    <div className="flex h-screen bg-background-light text-text-primary-light font-sans">
      <Sidebar activeView={activeView} onNavigate={(v) => { setActiveView(v); setSearchTerm(''); }} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-surface-light border-b border-[#e5e7eb] px-6 py-4 flex-shrink-0 z-10">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-text-primary-light">{viewTitles[activeView]?.main}</h2>
                <p className="text-text-secondary-light text-sm mt-1">{viewTitles[activeView]?.sub}</p>
              </div>
              <div className="flex items-center gap-3">
                {['schedule', 'staff'].includes(activeView) && (
                  <div className="relative hidden sm:block">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary-light">
                      <span className="material-symbols-outlined text-[20px]">search</span>
                    </span>
                    <input 
                      className="pl-10 pr-4 py-2 rounded-lg bg-background-light border-none text-sm w-64 focus:ring-2 focus:ring-primary placeholder-text-secondary-light" 
                      placeholder="ค้นหาข้อมูล..." 
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                )}
                <button 
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
                  onClick={() => alert(`บันทึกสถานะเรียบร้อย!`)}
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>บันทึกสถานะ</span>
                </button>
              </div>
            </div>

            {activeView === 'schedule' && (
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
                  <div className="flex items-center bg-white border border-[#dbe1e6] rounded-lg p-1">
                    <button onClick={handlePrevMonth} className="p-1 rounded hover:bg-background-light text-text-secondary-light"><span className="material-symbols-outlined text-[20px]">chevron_left</span></button>
                    <span className="px-3 text-sm font-bold min-w-[140px] text-center">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear() + 543}
                    </span>
                    <button onClick={handleNextMonth} className="p-1 rounded hover:bg-background-light text-text-secondary-light"><span className="material-symbols-outlined text-[20px]">chevron_right</span></button>
                  </div>
                  <button onClick={() => setActiveView('requests')} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                    <span>จัดตารางใหม่</span>
                  </button>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-text-secondary-light">
                  {Object.values(ShiftType).filter(t => t !== ShiftType.EMPTY).map(t => (
                    <div key={t} className="flex items-center gap-1.5">
                      <span className="size-3 rounded-sm border" style={{ backgroundColor: SHIFT_DETAILS[t].bg, borderColor: SHIFT_DETAILS[t].border }}></span>
                      <span>{SHIFT_DETAILS[t].label.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {activeView === 'schedule' && (
          <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
            <StatCard label="ชั่วโมงเวรรวมเดือนนี้" value={`${stats.assignedHours.toLocaleString()}h`} change="+5%" color="accent-success" />
            <StatCard label="เป้าหมาย" value="1,300h" sub="Target" />
            <StatCard label="พนักงานที่ปฏิบัติงาน" value={`${staff.length}`} sub="Active" color="accent-success" />
            <StatCard label="จุดที่ต้องตรวจสอบ" value={stats.conflicts.toString()} sub="Conflicts" color="accent-error" border />
          </div>
        )}

        <div className="flex-1 overflow-auto px-6 pb-6 no-scrollbar pt-4">
          {activeView === 'schedule' && (
            <ScheduleGrid 
              schedule={schedule} 
              onShiftUpdate={handleShiftUpdate} 
              searchTerm={searchTerm} 
              staff={staff} 
              days={daysInMonth}
              onUpdateDay={handleUpdateDay}
              onAddStaff={() => setActiveView('staff')} 
            />
          )}
          {activeView === 'staff' && (
            <StaffList 
              searchTerm={searchTerm} 
              staff={staff} 
              onAddStaff={handleAddStaff} 
              onUpdateStaff={handleUpdateStaff}
              onDeleteStaff={handleDeleteStaff}
            />
          )}
          {activeView === 'overview' && <Overview settings={settings} schedule={schedule} staff={staff} />}
          {activeView === 'requests' && (
            <Requests 
              staff={staff} 
              isGenerating={isAssigning}
              onGenerate={handleGenerateMonthlySchedule} 
              onSave={handleSaveToHistory}
            />
          )}
          {activeView === 'reports' && (
            <Reports 
              savedSchedules={savedSchedules} 
              staff={staff} 
              monthNames={monthNames} 
            />
          )}
          {activeView === 'settings' && <Settings settings={settings} onUpdate={setSettings} />}
        </div>
      </main>
    </div>
  );
};

const StatCard: React.FC<{label: string, value: string, change?: string, sub?: string, color?: string, border?: boolean}> = ({label, value, change, sub, color, border}) => (
  <div className={`bg-surface-light p-4 rounded-xl border border-[#dbe1e6] shadow-sm flex flex-col relative overflow-hidden min-w-[140px]`}>
    {border && <div className={`absolute right-0 top-0 h-full w-1 bg-${color}`}></div>}
    <span className="text-[10px] text-text-secondary-light font-bold uppercase tracking-wider">{label}</span>
    <div className="flex items-baseline gap-2 mt-1">
      <span className="text-2xl font-bold text-text-primary-light">{value}</span>
      {change && <span className={`text-xs font-bold text-${color}`}>{change}</span>}
      {sub && <span className={`text-xs font-medium ${color ? `text-${color}` : 'text-text-secondary-light'}`}>{sub}</span>}
    </div>
  </div>
);

export default App;
