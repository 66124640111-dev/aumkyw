
import React from 'react';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-[#e5e7eb] bg-surface-light hidden md:flex flex-col z-20">
      <div className="h-full flex flex-col justify-between p-4">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 px-2">
            <div className="bg-center bg-no-repeat bg-cover rounded-lg size-10 shadow-sm" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAtpBLOebf1X-kaVzD-SaMT725T47AQleAOHJpoVwWU4J2o0OefdYKi-tebYY0ZPAM-SZNr4xafqjoCfRp6RhskvsEiPZg1BGwzop4pRaOAK-60z6Xr4sSM_FYK1tprj3413SI5ihLq9SnQvMXtRyOthgW0LkBCRAaB44QhFQ8NkWkudaW5OsMco6omFyu2cod5eZQnI7KPhuXm__Sybe3S574Ox5pRLqdVfiy2QXuIkPRvTquSEnCj8J3yiYahrrI7MOErrzIxPMl-")'}}></div>
            <div className="flex flex-col">
              <h1 className="text-text-primary-light text-base font-bold leading-tight">Thepsatri Hospital</h1>
              <p className="text-text-secondary-light text-xs font-normal">Admin Console</p>
            </div>
          </div>
          <nav className="flex flex-col gap-2">
            <NavItem 
              icon="pie_chart" 
              label="ภาพรวม (Overview)" 
              active={activeView === 'overview'} 
              onClick={() => onNavigate('overview')}
            />
            <NavItem 
              icon="calendar_month" 
              label="ตารางเวร (Schedule)" 
              active={activeView === 'schedule'} 
              onClick={() => onNavigate('schedule')}
            />
            <NavItem 
              icon="group" 
              label="บุคลากร (Staff)" 
              active={activeView === 'staff'} 
              onClick={() => onNavigate('staff')}
            />
            <NavItem 
              icon="auto_awesome" 
              label="จัดตารางเวร (Auto-Gen)" 
              active={activeView === 'requests'} 
              onClick={() => onNavigate('requests')}
            />
            <NavItem 
              icon="description" 
              label="รายงาน (Reports)" 
              active={activeView === 'reports'} 
              onClick={() => onNavigate('reports')}
            />
          </nav>
        </div>
        <div className="flex flex-col gap-2 border-t border-[#e5e7eb] pt-4">
          <NavItem 
            icon="settings" 
            label="ตั้งค่า (Settings)" 
            active={activeView === 'settings'} 
            onClick={() => onNavigate('settings')}
          />
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="bg-center bg-no-repeat bg-cover rounded-full size-8" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuACNustB6_FvlOv6cXlkpl8KtqiFEiKp3wNQ7GFS_QIDZK0oEIfltzyeNoviqut_CLZWMD5pNdjMVHDvol2rapRa0kSEGwB1kSJtiS_dg7uZmnaD3BiGcO6KW4IUVKwcMdwqYbjzrllhrusgt-FLcAOCsl4RMU8FY5ZW6xNshkQZJoV0Aqy185739MhLxrpYEHnH31iBT4vIMABuD3bNxNgalYbqub7o3KNGe-taQBdI6u4NFoJArr4S6ekLAvjpcgq9Sa8FXlMvBEx")'}}></div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text-primary-light">พญ. สมศรี</span>
              <span className="text-xs text-text-secondary-light">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const NavItem: React.FC<{icon: string, label: string, active?: boolean, badge?: number, onClick: () => void}> = ({icon, label, active, badge, onClick}) => (
  <button 
    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group w-full text-left ${active ? 'bg-primary/10 text-primary' : 'hover:bg-background-light text-text-secondary-light'}`}
    onClick={onClick}
  >
    <span className={`material-symbols-outlined transition-colors ${active ? 'material-symbols-filled text-primary' : 'group-hover:text-primary'}`}>{icon}</span>
    <span className={`text-sm font-medium ${active ? 'font-bold' : 'text-text-primary-light'}`}>{label}</span>
    {badge && <span className="ml-auto bg-accent-error text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
  </button>
);

export default Sidebar;
