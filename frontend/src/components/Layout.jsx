import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BedDouble, 
  UserPlus, 
  Users, 
  BarChart3, 
  Settings,
  PlusSquare 
} from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => 
      `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        isActive 
          ? 'bg-blue-50 text-blue-600' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`
    }
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </NavLink>
);

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        <div className="p-6 flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <PlusSquare className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900">MedicCenter</h1>
            <p className="text-xs text-slate-500">Pro Health Admin v2.4</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem to="/beds" icon={BedDouble} label="Bed Management" />
          <SidebarItem to="/admit" icon={UserPlus} label="Admission Portal" />
          <SidebarItem to="/queue" icon={Users} label="Waiting Queue" />
          
          <div className="pt-8 pb-2">
             <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">System</p>
          </div>
          <SidebarItem to="/reports" icon={BarChart3} label="Reports" />
          <SidebarItem to="/settings" icon={Settings} label="Settings" />
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
              DS
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Dr. Sarah Smith</p>
              <p className="text-xs text-gray-500">SUPER ADMIN</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
