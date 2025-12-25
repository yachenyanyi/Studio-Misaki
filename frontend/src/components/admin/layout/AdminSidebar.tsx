import React from 'react';
import './AdminLayout.css';

export type ViewMode = 'dashboard' | 'articles' | 'editor' | 'users';

interface SidebarItemProps {
    icon: string;
    label: string;
    active?: boolean;
    onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => (
    <div 
        onClick={onClick}
        className={`sidebar-item ${active ? 'active' : ''}`}
    >
        <i className={`fa ${icon}`}></i>
        <span>{label}</span>
    </div>
);

interface AdminSidebarProps {
    currentView: ViewMode;
    onViewChange: (view: ViewMode) => void;
    onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentView, onViewChange, onLogout }) => {
    return (
        <div className="admin-sidebar">
            <div className="admin-sidebar-header">
                <h2 className="admin-sidebar-title">Sakura Admin</h2>
            </div>
            
            <nav className="admin-sidebar-nav">
                <SidebarItem 
                    icon="fa-chart-pie" 
                    label="Dashboard" 
                    active={currentView === 'dashboard'} 
                    onClick={() => onViewChange('dashboard')} 
                />
                <SidebarItem 
                    icon="fa-file-alt" 
                    label="Articles" 
                    active={currentView === 'articles' || currentView === 'editor'} 
                    onClick={() => onViewChange('articles')} 
                />
                {/* Future Modules */}
                <SidebarItem 
                    icon="fa-users" 
                    label="Users" 
                    active={currentView === 'users'} 
                    onClick={() => onViewChange('users')} 
                />
                <SidebarItem icon="fa-comments" label="Comments" onClick={() => {}} />
                <SidebarItem icon="fa-cog" label="Settings" onClick={() => {}} />
            </nav>

            <div style={{ marginTop: 'auto' }}>
                <button 
                    onClick={onLogout}
                    className="admin-logout-btn"
                >
                    <i className="fa fa-sign-out"></i> Logout
                </button>
            </div>
        </div>
    );
};
