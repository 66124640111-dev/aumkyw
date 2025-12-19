
import React, { useState, useMemo } from 'react';
import { Staff } from '../types';

interface StaffListProps {
  searchTerm: string;
  staff: Staff[];
  onAddStaff: (newStaff: Staff) => void;
  onUpdateStaff: (updatedStaff: Staff) => void;
  onDeleteStaff: (staffId: string) => void;
}

const StaffList: React.FC<StaffListProps> = ({ searchTerm, staff, onAddStaff, onUpdateStaff, onDeleteStaff }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  
  const [formData, setFormData] = useState<Partial<Staff>>({
    name: '',
    role: 'พยาบาลวิชาชีพ (RN)',
    phone: '',
    department: 'แผนกฉุกเฉิน (ER)',
    avatar: '',
    unavailableDates: [],
    availableDaysInMonth: [],
    unavailableDays: []
  });

  const departments = useMemo(() => {
    const deps = new Set(staff.map(s => s.department));
    return Array.from(deps).sort();
  }, [staff]);

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (s?: Staff) => {
    if (s) {
      setEditingStaff(s);
      setFormData(s);
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        role: 'พยาบาลวิชาชีพ (RN)',
        phone: '',
        department: 'แผนกฉุกเฉิน (ER)',
        avatar: 'https://i.pravatar.cc/150?u=' + Math.random(),
        unavailableDates: [],
        availableDaysInMonth: [],
        unavailableDays: []
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.department) return;

    if (editingStaff) {
      onUpdateStaff(formData as Staff);
    } else {
      onAddStaff({
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        isSenior: formData.role?.includes('Senior') || formData.role?.includes('หัวหน้า'),
      } as Staff);
    }
    closeModal();
  };

  const toggleUnavailableDay = (day: number) => {
    const current = formData.unavailableDays || [];
    if (current.includes(day)) {
      setFormData({ ...formData, unavailableDays: current.filter(d => d !== day) });
    } else {
      setFormData({ ...formData, unavailableDays: [...current, day] });
    }
  };

  const toggleAvailableDate = (dateNum: number) => {
    const current = formData.availableDaysInMonth || [];
    if (current.includes(dateNum)) {
      setFormData({ ...formData, availableDaysInMonth: current.filter(d => d !== dateNum) });
    } else {
      setFormData({ ...formData, availableDaysInMonth: [...current, dateNum].sort((a, b) => a - b) });
    }
  };

  const dayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-surface-light p-4 rounded-xl border border-[#dbe1e6] shadow-sm">
        <div>
          <h3 className="font-bold text-lg text-text-primary-light">พยาบาลและบุคลากร</h3>
          <p className="text-xs text-text-secondary-light">จัดการข้อมูลพื้นฐานและเงื่อนไขความสะดวกในการปฏิบัติงาน</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary-dark transition-all shadow-md"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          เพิ่มบุคลากรใหม่
        </button>
      </div>

      {departments.map(dep => {
        const depStaff = filteredStaff.filter(s => s.department === dep);
        if (depStaff.length === 0) return null;

        return (
          <section key={dep} className="space-y-3">
            <h4 className="text-sm font-bold text-primary flex items-center gap-2 px-1">
              <span className="material-symbols-outlined text-[18px]">medical_services</span>
              {dep} ({depStaff.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {depStaff.map(s => (
                <div key={s.id} className="bg-surface-light p-5 rounded-2xl border border-[#dbe1e6] shadow-sm hover:shadow-lg transition-all group relative">
                  <div className="flex items-start gap-4">
                    <div className="size-16 rounded-2xl bg-cover bg-center border-2 border-primary/5 shadow-inner" style={{ backgroundImage: `url("${s.avatar}")` }}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-sm text-text-primary-light truncate">{s.name}</h5>
                        {s.isSenior && <span className="bg-primary/10 text-primary text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-primary/20 uppercase">Senior</span>}
                      </div>
                      <p className="text-[11px] text-text-secondary-light font-medium">{s.role}</p>
                      
                      <div className="mt-3 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-[11px] text-text-primary-light">
                          <span className="material-symbols-outlined text-[14px] text-primary">call</span>
                          <span className="font-bold">{s.phone || '-'}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {s.unavailableDays.length > 0 && (
                            <span className="text-[9px] bg-red-50 text-accent-error px-1.5 py-0.5 rounded font-bold border border-red-100 flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[12px]">block</span>
                              หยุด: {s.unavailableDays.map(d => dayNames[d]).join(', ')}
                            </span>
                          )}
                          {(s.availableDaysInMonth || []).length > 0 && (
                            <span className="text-[9px] bg-green-50 text-accent-success px-1.5 py-0.5 rounded font-bold border border-green-100 flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[12px]">check_circle</span>
                              สะดวก: {(s.availableDaysInMonth || []).length} วัน
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(s)} className="p-1.5 text-text-secondary-light hover:text-primary transition-colors bg-background-light rounded-lg">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button onClick={() => onDeleteStaff(s.id)} className="p-1.5 text-text-secondary-light hover:text-accent-error transition-colors bg-background-light rounded-lg">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-light w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-8 py-5 border-b border-[#e5e7eb] flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">{editingStaff ? 'person_edit' : 'person_add'}</span>
                </div>
                <h3 className="text-xl font-bold text-text-primary-light">
                  {editingStaff ? 'แก้ไขข้อมูลบุคลากร' : 'เพิ่มบุคลากรใหม่'}
                </h3>
              </div>
              <button onClick={closeModal} className="text-text-secondary-light hover:text-accent-error p-2 hover:bg-red-50 rounded-full transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar bg-background-light/30">
              {/* Profile Basic */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary-light uppercase tracking-wider">ชื่อ-นามสกุล</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full rounded-xl border-[#dbe1e6] focus:ring-primary focus:border-primary text-sm p-3"
                    placeholder="เช่น พว. สมศรี มีสุข"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary-light uppercase tracking-wider">เบอร์โทรศัพท์ติดต่อ</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full rounded-xl border-[#dbe1e6] focus:ring-primary focus:border-primary text-sm p-3"
                    placeholder="08X-XXX-XXXX"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary-light uppercase tracking-wider">ตำแหน่งปฏิบัติงาน</label>
                  <select 
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full rounded-xl border-[#dbe1e6] focus:ring-primary focus:border-primary text-sm p-3"
                  >
                    <option>พยาบาลวิชาชีพ (RN)</option>
                    <option>พยาบาลวิชาชีพอาวุโส (Senior RN)</option>
                    <option>พนักงานผู้ช่วย (PN)</option>
                    <option>ผู้ช่วยพยาบาล (NA)</option>
                    <option>หัวหน้าเวร (Charge Nurse)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary-light uppercase tracking-wider">แผนก (Department)</label>
                  <input 
                    required
                    type="text" 
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                    className="w-full rounded-xl border-[#dbe1e6] focus:ring-primary focus:border-primary text-sm p-3"
                    placeholder="เช่น ER, ICU, OPD"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-text-secondary-light uppercase tracking-wider">รูปโปรไฟล์ (Avatar URL)</label>
                  <input 
                    type="text" 
                    value={formData.avatar}
                    onChange={e => setFormData({...formData, avatar: e.target.value})}
                    className="w-full rounded-xl border-[#dbe1e6] focus:ring-primary focus:border-primary text-sm p-3"
                    placeholder="ใส่ URL ของรูปภาพ"
                  />
                </div>
              </div>

              <hr className="border-[#e5e7eb]" />

              {/* Preferences Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Fixed Unavailability (Day of Week) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent-error text-[20px]">event_busy</span>
                    <h4 className="font-bold text-sm text-text-primary-light">วันในสัปดาห์ที่ไม่สะดวก (ประจำ)</h4>
                  </div>
                  <p className="text-[11px] text-text-secondary-light">ระบบจะไม่จัดเวรให้ในวันเหล่านี้โดยอัตโนมัติ</p>
                  <div className="flex flex-wrap gap-2">
                    {dayNames.map((name, idx) => {
                      const isActive = (formData.unavailableDays || []).includes(idx);
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => toggleUnavailableDay(idx)}
                          className={`w-10 h-10 rounded-xl text-xs font-bold border transition-all ${
                            isActive 
                            ? 'bg-accent-error text-white border-accent-error shadow-md scale-105' 
                            : 'bg-white text-text-secondary-light border-[#dbe1e6] hover:border-accent-error'
                          }`}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Specific Dates Preference */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent-success text-[20px]">verified</span>
                    <h4 className="font-bold text-sm text-text-primary-light">วันที่สะดวกเข้าเวร (รายเดือน)</h4>
                  </div>
                  <p className="text-[11px] text-text-secondary-light">เลือกวันที่พยาบาลแจ้งความจำนง "สะดวกเป็นพิเศษ" (Checkbox)</p>
                  <div className="grid grid-cols-7 gap-1.5 p-3 bg-white border border-[#dbe1e6] rounded-2xl">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(date => {
                      const isActive = (formData.availableDaysInMonth || []).includes(date);
                      return (
                        <button
                          key={date}
                          type="button"
                          onClick={() => toggleAvailableDate(date)}
                          className={`aspect-square flex items-center justify-center text-[10px] font-bold rounded-lg transition-all ${
                            isActive 
                            ? 'bg-accent-success text-white shadow-sm ring-2 ring-accent-success/20' 
                            : 'bg-gray-50 text-text-secondary-light hover:bg-green-50 hover:text-accent-success border border-transparent'
                          }`}
                        >
                          {date}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-[#e5e7eb] flex justify-end gap-3 sticky bottom-0 bg-white/80 backdrop-blur-md -mx-8 px-8 pb-4">
                <button 
                  type="button"
                  onClick={closeModal} 
                  className="px-8 py-3 text-sm font-bold text-text-secondary-light hover:bg-gray-100 rounded-2xl transition-all"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="px-10 py-3 bg-primary text-white font-bold text-sm rounded-2xl hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  บันทึกข้อมูลบุคลากร
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffList;
