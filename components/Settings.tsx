
import React, { useState } from 'react';

interface SettingsProps {
  settings: {
    hospitalName: string;
    department: string;
    adminPassword: string;
    rules: {
      senior: boolean;
      overwork: boolean;
      swap: boolean;
      aiMode: 'strict' | 'flexible';
    }
  };
  onUpdate: (newSettings: any) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Password Change Form State
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUser === 'admin' && loginPass === settings.adminPassword) {
      setIsAuthorized(true);
      setLoginError('');
    } else {
      setLoginError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleChangePassword = () => {
    if (!newPass) {
      setPassError('กรุณาระบุรหัสผ่านใหม่');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('รหัสผ่านไม่ตรงกัน');
      return;
    }
    
    onUpdate({
      ...settings,
      adminPassword: newPass
    });
    setNewPass('');
    setConfirmPass('');
    setPassError('');
    alert('บันทึกรหัสผ่านใหม่เรียบร้อยแล้ว');
  };

  const handleToggle = (key: string) => {
    onUpdate({
      ...settings,
      rules: {
        ...settings.rules,
        [key]: !((settings.rules as any)[key])
      }
    });
  };

  const handleModeChange = (mode: 'strict' | 'flexible') => {
    onUpdate({
      ...settings,
      rules: {
        ...settings.rules,
        aiMode: mode
      }
    });
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-surface-light p-8 rounded-2xl border border-[#dbe1e6] shadow-xl">
          <div className="text-center mb-8">
            <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">lock</span>
            </div>
            <h3 className="text-xl font-bold text-text-primary-light">ยืนยันตัวตนผู้ดูแลระบบ</h3>
            <p className="text-xs text-text-secondary-light mt-1">กรุณากรอกรหัสผ่านเพื่อเข้าถึงการตั้งค่า</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary-light uppercase">ชื่อผู้ใช้ (User)</label>
              <input 
                autoFocus
                type="text" 
                className="w-full rounded-xl border-[#dbe1e6] focus:ring-primary focus:border-primary text-sm p-3 bg-background-light/30"
                placeholder="admin"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary-light uppercase">รหัสผ่าน (Password)</label>
              <input 
                type="password" 
                className="w-full rounded-xl border-[#dbe1e6] focus:ring-primary focus:border-primary text-sm p-3 bg-background-light/30"
                placeholder="••••••••"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
              />
            </div>

            {loginError && (
              <p className="text-xs text-accent-error font-bold text-center animate-bounce">{loginError}</p>
            )}

            <button 
              type="submit"
              className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">login</span>
              เข้าสู่ระบบ
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Security Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-text-primary-light border-b border-[#e5e7eb] pb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">security</span>
          ความปลอดภัย (Admin Security)
        </h3>
        <div className="bg-white p-6 rounded-2xl border border-[#dbe1e6] shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary-light uppercase">รหัสผ่านใหม่ (New Password)</label>
            <input 
              type="password" 
              placeholder="กรอกรหัสผ่านใหม่"
              className="w-full rounded-lg border-[#dbe1e6] text-sm focus:ring-primary focus:border-primary" 
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary-light uppercase">ยืนยันรหัสผ่านใหม่ (Confirm Password)</label>
            <input 
              type="password" 
              placeholder="ยืนยันรหัสผ่านอีกครั้ง"
              className="w-full rounded-lg border-[#dbe1e6] text-sm focus:ring-primary focus:border-primary" 
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
            />
          </div>
          
          <div className="md:col-span-2 flex items-center justify-between mt-2 pt-4 border-t border-gray-50">
            {passError ? (
              <p className="text-xs text-accent-error font-bold">{passError}</p>
            ) : (
              <p className="text-[10px] text-text-secondary-light italic">แนะนำให้ตั้งรหัสผ่านที่จำได้ง่ายแต่คาดเดายากสำหรับแอดมิน</p>
            )}
            <button 
              onClick={handleChangePassword}
              className="bg-primary text-white text-xs font-bold px-6 py-2 rounded-lg hover:bg-primary-dark shadow-md transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">key</span>
              เปลี่ยนรหัสผ่านแอดมิน
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-text-primary-light border-b border-[#e5e7eb] pb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">apartment</span>
          ข้อมูลหน่วยงาน
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary-light uppercase">ชื่อโรงพยาบาล</label>
            <input 
              type="text" 
              className="w-full rounded-lg border-[#dbe1e6] text-sm focus:ring-primary focus:border-primary" 
              value={settings.hospitalName}
              onChange={(e) => onUpdate({ ...settings, hospitalName: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary-light uppercase">แผนก / วอร์ด</label>
            <input 
              type="text" 
              className="w-full rounded-lg border-[#dbe1e6] text-sm focus:ring-primary focus:border-primary" 
              value={settings.department}
              onChange={(e) => onUpdate({ ...settings, department: e.target.value })}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-text-primary-light border-b border-[#e5e7eb] pb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">rule</span>
          กฎการจัดเวร (Dynamic Rules)
        </h3>
        <div className="space-y-4">
          <ToggleItem 
            label="บังคับให้มี Senior อย่างน้อย 1 คนต่อกะ" 
            description="AI จะพยายามจัดเวรให้มีหัวหน้าเวรเสมอ" 
            active={settings.rules.senior}
            onClick={() => handleToggle('senior')}
          />
          <ToggleItem 
            label="ป้องกันการขึ้นเวรติดต่อกันเกิน 16 ชม." 
            description="จำกัดชั่วโมงทำงานสูงสุดเพื่อความปลอดภัย" 
            active={settings.rules.overwork}
            onClick={() => handleToggle('overwork')}
          />
          <ToggleItem 
            label="อนุญาตให้บุคลากรแลกเวรกันเองได้" 
            description="พยาบาลสามารถทำเรื่องแลกเวรผ่านแอปได้" 
            active={settings.rules.swap}
            onClick={() => handleToggle('swap')}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-text-primary-light border-b border-[#e5e7eb] pb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">psychology</span>
          AI Logic (Engine Config)
        </h3>
        <div className="p-5 bg-primary/5 rounded-xl border border-primary/20 space-y-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
            <p className="text-xs text-text-secondary-light leading-relaxed">
              การเลือกโหมดมีผลต่อการตัดสินใจของ AI ในการเลือกพยาบาลลงในแต่ละกะ
            </p>
          </div>
          <div className="flex gap-4">
            <label className={`flex-1 border-2 rounded-xl p-4 bg-white cursor-pointer transition-all ${settings.rules.aiMode === 'strict' ? 'border-primary shadow-md' : 'border-[#dbe1e6]'}`}>
              <input type="radio" className="hidden" onClick={() => handleModeChange('strict')} />
              <p className={`text-sm font-bold ${settings.rules.aiMode === 'strict' ? 'text-primary' : 'text-text-primary-light'}`}>Strict Mode</p>
              <p className="text-[10px] text-text-secondary-light mt-1">เน้นความถูกต้องของกฎ 100%</p>
            </label>
            <label className={`flex-1 border-2 rounded-xl p-4 bg-white cursor-pointer transition-all ${settings.rules.aiMode === 'flexible' ? 'border-primary shadow-md' : 'border-[#dbe1e6]'}`}>
              <input type="radio" className="hidden" onClick={() => handleModeChange('flexible')} />
              <p className={`text-sm font-bold ${settings.rules.aiMode === 'flexible' ? 'text-primary' : 'text-text-primary-light'}`}>Flexible Mode</p>
              <p className="text-[10px] text-text-secondary-light mt-1">เน้นความพึงพอใจรายบุคคล</p>
            </label>
          </div>
        </div>
      </section>

      <div className="pt-6 flex justify-end gap-3 sticky bottom-6 z-10">
        <button 
          className="px-8 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all flex items-center gap-2" 
          onClick={() => alert('บันทึกการตั้งค่าลงระบบแล้ว!')}
        >
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          บันทึกการตั้งค่าทั้งหมด
        </button>
      </div>
    </div>
  );
};

const ToggleItem: React.FC<{label: string, description: string, active?: boolean, onClick: () => void}> = ({label, description, active, onClick}) => (
  <div 
    className="flex items-center justify-between p-4 bg-surface-light border border-[#dbe1e6] rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
    onClick={onClick}
  >
    <div className="flex flex-col">
      <span className="text-sm font-bold text-text-primary-light">{label}</span>
      <span className="text-xs text-text-secondary-light">{description}</span>
    </div>
    <div className={`w-10 h-6 rounded-full relative transition-colors ${active ? 'bg-primary' : 'bg-gray-200'}`}>
      <div className={`absolute top-1 size-4 bg-white rounded-full shadow-sm transition-all ${active ? 'left-5' : 'left-1'}`}></div>
    </div>
  </div>
);

export default Settings;
