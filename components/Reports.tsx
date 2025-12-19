
import React, { useState, useMemo } from 'react';
import { Schedule, Staff, ShiftType } from '../types';
import { SHIFT_DETAILS } from '../constants';

interface ReportsProps {
  savedSchedules: Record<string, Schedule>;
  staff: Staff[];
  monthNames: string[];
}

const Reports: React.FC<ReportsProps> = ({ savedSchedules, staff, monthNames }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const monthKey = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}`;
  const currentReportSchedule = savedSchedules[monthKey];

  const reportStats = useMemo(() => {
    if (!currentReportSchedule) return null;

    let totalHours = 0;
    const staffStats = staff.map(s => {
      const sSched = currentReportSchedule[s.id] || {};
      const shifts = Object.values(sSched).filter(sh => 
        [ShiftType.MORNING, ShiftType.AFTERNOON, ShiftType.NIGHT].includes(sh.type)
      ).length;
      const hours = shifts * 8;
      totalHours += hours;
      return { 
        id: s.id,
        name: s.name, 
        role: s.role,
        shifts, 
        hours, 
        avatar: s.avatar,
        details: Object.values(sSched).reduce((acc, curr) => {
          acc[curr.type] = (acc[curr.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };
    });

    return { totalHours, staffStats };
  }, [currentReportSchedule, staff]);

  return (
    <div className="space-y-6">
      {/* Selector Section */}
      <div className="bg-surface-light p-6 rounded-xl border border-[#dbe1e6] shadow-sm flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-secondary-light uppercase">เลือกเดือนที่ต้องการรายงาน</label>
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="rounded-lg border-[#dbe1e6] text-sm focus:ring-primary min-w-[150px]"
          >
            {monthNames.map((name, i) => (
              <option key={i} value={i}>{name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-secondary-light uppercase">เลือกปี</label>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="rounded-lg border-[#dbe1e6] text-sm focus:ring-primary min-w-[100px]"
          >
            <option value={2024}>2567</option>
            <option value={2025}>2568</option>
          </select>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs font-medium text-text-secondary-light">ประวัติที่มีการบันทึก:</span>
          <div className="flex -space-x-2">
            {Object.keys(savedSchedules).length > 0 ? (
              Object.keys(savedSchedules).map(key => (
                <div key={key} className="size-6 rounded-full bg-primary/10 border border-primary flex items-center justify-center text-[8px] font-bold text-primary" title={key}>
                  {key.split('-')[1]}
                </div>
              ))
            ) : (
              <span className="text-[10px] text-text-secondary-light italic">ยังไม่มีประวัติ</span>
            )}
          </div>
        </div>
      </div>

      {!currentReportSchedule ? (
        <div className="bg-surface-light py-24 rounded-2xl border border-[#dbe1e6] border-dashed text-center space-y-4">
          <div className="size-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-4xl text-gray-300">event_busy</span>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-text-primary-light text-lg">ไม่พบข้อมูลตารางเวร</h4>
            <p className="text-sm text-text-secondary-light">เดือน {monthNames[selectedMonth]} {selectedYear + 543} ยังไม่มีการบันทึกตารางเวรลงในระบบ</p>
          </div>
          <button 
            className="text-primary text-sm font-bold hover:underline"
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'requests' }))}
          >
            ไปที่เมนูจัดตารางเวรเพื่อสร้างข้อมูล
          </button>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          {/* Summary Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary text-white p-6 rounded-2xl shadow-lg shadow-primary/20">
              <p className="text-xs font-bold uppercase opacity-80">ชั่วโมงทำงานรวมทั้งแผนก</p>
              <h3 className="text-3xl font-black mt-1">{reportStats?.totalHours.toLocaleString()}h</h3>
              <p className="text-[10px] mt-2 flex items-center gap-1 opacity-90">
                <span className="material-symbols-outlined text-[14px]">info</span>
                คำนวณจาก {reportStats?.staffStats.length} บุคลากร
              </p>
            </div>
            <div className="bg-surface-light p-6 rounded-2xl border border-[#dbe1e6] shadow-sm">
              <p className="text-xs font-bold text-text-secondary-light uppercase">จำนวนกะเฉลี่ยต่อคน</p>
              <h3 className="text-3xl font-black mt-1 text-text-primary-light">
                {reportStats ? (reportStats.totalHours / 8 / staff.length).toFixed(1) : 0}
              </h3>
              <p className="text-[10px] mt-2 text-accent-success font-bold">อยู่ในเกณฑ์มาตรฐาน</p>
            </div>
            <div className="bg-surface-light p-6 rounded-2xl border border-[#dbe1e6] shadow-sm">
              <p className="text-xs font-bold text-text-secondary-light uppercase">สถานะการบันทึก</p>
              <h3 className="text-lg font-bold mt-1 text-accent-success flex items-center gap-2">
                <span className="material-symbols-outlined">verified</span>
                บันทึกเรียบร้อย
              </h3>
              <p className="text-[10px] mt-2 text-text-secondary-light italic">คีย์อ้างอิง: {monthKey}</p>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="bg-surface-light rounded-2xl border border-[#dbe1e6] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#e5e7eb] flex items-center justify-between">
              <h4 className="font-bold text-text-primary-light">สรุปรายชื่อและกะงานรายบุคคล</h4>
              <button className="flex items-center gap-1 text-xs font-bold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-all">
                <span className="material-symbols-outlined text-[16px]">download</span>
                Export PDF
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-background-light text-[10px] font-bold text-text-secondary-light uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">บุคลากร</th>
                    <th className="px-4 py-3 text-center">เช้า (M)</th>
                    <th className="px-4 py-3 text-center">บ่าย (A)</th>
                    <th className="px-4 py-3 text-center">ดึก (N)</th>
                    <th className="px-4 py-3 text-center">กะรวม</th>
                    <th className="px-6 py-3 text-right">ชั่วโมงรวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {reportStats?.staffStats.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={s.avatar} alt="" className="size-8 rounded-full border border-gray-100" />
                          <div>
                            <p className="text-sm font-bold text-text-primary-light">{s.name}</p>
                            <p className="text-[10px] text-text-secondary-light">{s.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-medium text-primary">{s.details[ShiftType.MORNING] || 0}</td>
                      <td className="px-4 py-4 text-center text-sm font-medium text-orange-500">{s.details[ShiftType.AFTERNOON] || 0}</td>
                      <td className="px-4 py-4 text-center text-sm font-medium text-indigo-600">{s.details[ShiftType.NIGHT] || 0}</td>
                      <td className="px-4 py-4 text-center">
                        <span className="bg-gray-100 text-text-primary-light px-2 py-0.5 rounded-full text-xs font-bold">
                          {s.shifts}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-text-primary-light">{s.hours}h</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
