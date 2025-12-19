
import React, { useState } from 'react';
import { SHIFT_DETAILS } from '../constants';
import { Schedule, ShiftType, Staff, ShiftInfo, DayInfo } from '../types';

interface ScheduleGridProps {
  schedule: Schedule;
  onShiftUpdate: (staffId: string, date: string, shift: Partial<ShiftInfo>) => void;
  searchTerm: string;
  staff: Staff[];
  days: DayInfo[];
  onUpdateDay: (index: number, newDate: string) => void;
  onAddStaff: () => void;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ schedule, onShiftUpdate, searchTerm, staff, days, onUpdateDay, onAddStaff }) => {
  const [editingCell, setEditingCell] = useState<{ staffId: string, date: string } | null>(null);
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null);
  const filteredStaff = staff.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleQuickCycle = (staffId: string, date: string, currentType: ShiftType) => {
    const nextMap: Record<ShiftType, ShiftType> = {
      [ShiftType.EMPTY]: ShiftType.MORNING,
      [ShiftType.MORNING]: ShiftType.AFTERNOON,
      [ShiftType.AFTERNOON]: ShiftType.NIGHT,
      [ShiftType.NIGHT]: ShiftType.OFF,
      [ShiftType.OFF]: ShiftType.EMPTY,
      [ShiftType.LEAVE]: ShiftType.EMPTY
    };
    onShiftUpdate(staffId, date, { type: nextMap[currentType] });
  };

  const isWeekend = (dayName: string) => dayName === 'ส.' || dayName === 'อา.';

  return (
    <div className="bg-surface-light rounded-xl border border-[#dbe1e6] shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto no-scrollbar">
        <div style={{ minWidth: `${250 + (days.length * 45)}px` }}>
          {/* Header Row */}
          <div 
            className="grid bg-background-light border-b border-[#dbe1e6]"
            style={{ gridTemplateColumns: `250px repeat(${days.length}, 45px)` }}
          >
            <div className="p-3 font-bold text-xs text-text-secondary-light sticky left-0 bg-background-light z-20 border-r border-[#dbe1e6] flex items-center">
              รายชื่อบุคลากร
            </div>
            {days.map((day, idx) => (
              <div 
                key={day.date} 
                className={`p-2 text-center border-r border-[#dbe1e6] cursor-pointer hover:bg-gray-100 transition-colors flex flex-col items-center justify-center ${isWeekend(day.dayName) ? 'bg-blue-50/50' : ''}`}
                onClick={() => setEditingDayIndex(idx)}
              >
                {editingDayIndex === idx ? (
                  <input 
                    autoFocus
                    type="date"
                    className="text-[10px] p-0.5 w-full border rounded border-primary bg-white"
                    defaultValue={day.date}
                    onBlur={(e) => {
                      onUpdateDay(idx, e.target.value);
                      setEditingDayIndex(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onUpdateDay(idx, (e.target as HTMLInputElement).value);
                        setEditingDayIndex(null);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <div className={`text-[10px] font-bold ${isWeekend(day.dayName) ? 'text-primary' : 'text-text-secondary-light'}`}>{day.dayName}</div>
                    <div className={`text-xs font-bold ${isWeekend(day.dayName) ? 'text-primary' : 'text-text-primary-light'}`}>{day.dayNum}</div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Staff Rows */}
          {filteredStaff.map((staffMember) => (
            <div 
              key={staffMember.id} 
              className="grid border-b border-[#e5e7eb] hover:bg-gray-50 group"
              style={{ gridTemplateColumns: `250px repeat(${days.length}, 45px)` }}
            >
              <div className="p-3 flex items-center gap-3 sticky left-0 bg-surface-light z-10 border-r border-[#dbe1e6] group-hover:bg-gray-50 transition-colors shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                <div className="size-8 rounded-full bg-cover bg-center border border-gray-200 shrink-0" style={{backgroundImage: `url("${staffMember.avatar}")`}}></div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-text-primary-light truncate">{staffMember.name}</span>
                  <span className="text-[10px] text-text-secondary-light truncate">{staffMember.role}</span>
                </div>
              </div>

              {days.map((day) => {
                const shift = schedule[staffMember.id]?.[day.date] || { type: ShiftType.EMPTY };
                const details = SHIFT_DETAILS[shift.type];
                const weekend = isWeekend(day.dayName);
                const isEditing = editingCell?.staffId === staffMember.id && editingCell?.date === day.date;

                return (
                  <div 
                    key={day.date} 
                    className={`p-0.5 border-r border-[#f0f3f4] h-14 relative cursor-pointer group/cell ${weekend ? 'bg-blue-50/10' : ''}`}
                    onDoubleClick={() => setEditingCell({ staffId: staffMember.id, date: day.date })}
                    onClick={() => !isEditing && handleQuickCycle(staffMember.id, day.date, shift.type)}
                  >
                    {shift.type !== ShiftType.EMPTY ? (
                      <div 
                        className={`h-full w-full rounded p-1 flex flex-col items-center justify-center hover:brightness-95 transition-all text-center ${shift.isConflict ? 'border-2 border-accent-error shadow-sm' : ''}`}
                        style={{ backgroundColor: details.bg, borderLeft: `3px solid ${details.border}` }}
                        title={shift.zone || details.label}
                      >
                        <span className="material-symbols-outlined text-[16px] mb-0.5" style={{ color: details.color }}>{details.icon}</span>
                        <span className="text-[9px] font-bold uppercase leading-none" style={{ color: details.color }}>
                          {shift.type === ShiftType.MORNING ? 'M' : 
                           shift.type === ShiftType.AFTERNOON ? 'A' : 
                           shift.type === ShiftType.NIGHT ? 'N' : 
                           shift.type === ShiftType.OFF ? 'OFF' : 'L'}
                        </span>
                      </div>
                    ) : (
                      <div className="h-full w-full border-2 border-dashed border-gray-50 rounded flex items-center justify-center opacity-0 group-hover/cell:opacity-100 hover:border-primary/50 hover:bg-primary/5 transition-all">
                        <span className="material-symbols-outlined text-gray-300 text-sm">add</span>
                      </div>
                    )}

                    {isEditing && (
                      <div className="absolute top-0 left-0 z-50 bg-white shadow-2xl rounded-lg p-3 border border-gray-200 min-w-[180px]" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-[10px] font-bold">แก้ไขเวร {day.dayNum}/{day.dayName}</h4>
                          <button onClick={() => setEditingCell(null)} className="material-symbols-outlined text-sm">close</button>
                        </div>
                        <div className="space-y-2">
                          <input 
                            type="text" 
                            className="w-full text-[10px] p-1 border rounded" 
                            placeholder="โซนทำงาน..." 
                            defaultValue={shift.zone || ''}
                            onBlur={(e) => onShiftUpdate(staffMember.id, day.date, { zone: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingCell(null)}
                          />
                          <div className="grid grid-cols-2 gap-1">
                            {Object.values(ShiftType).filter(t => t !== ShiftType.EMPTY).map(type => (
                              <button 
                                key={type}
                                onClick={() => {
                                  onShiftUpdate(staffMember.id, day.date, { type });
                                  setEditingCell(null);
                                }}
                                className={`text-[10px] p-1 rounded border transition-colors ${shift.type === type ? 'bg-primary text-white border-primary' : 'bg-gray-50 hover:bg-gray-100'}`}
                              >
                                {SHIFT_DETAILS[type].label.split(' ')[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 bg-background-light border-t border-[#e5e7eb] flex justify-between items-center sticky left-0 z-10">
        <div className="text-[10px] text-text-secondary-light font-medium italic">
          * ดับเบิลคลิกที่ช่องเพื่อแก้ไขรายละเอียดโซน
        </div>
        <button className="flex items-center gap-2 text-primary text-xs font-bold hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors" onClick={onAddStaff}>
          <span className="material-symbols-outlined text-sm">person_add</span>
          <span>จัดการรายชื่อบุคลากร</span>
        </button>
      </div>
    </div>
  );
};

export default ScheduleGrid;
