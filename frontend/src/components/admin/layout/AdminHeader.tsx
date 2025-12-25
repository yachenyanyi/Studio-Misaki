import React from 'react';
import './AdminLayout.css';

interface AdminHeaderProps {
    title: string;
    subTitle?: string;
    currentTime: Date;
    onHomeClick: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subTitle, currentTime, onHomeClick }) => {
    return (
        <header className="admin-header">
            <div>
                <h1 className="admin-header-title">{title}</h1>
                {subTitle && (
                    <p className="admin-header-subtitle">
                        {subTitle}
                    </p>
                )}
            </div>
            <div className="admin-header-actions">
                 <div className="admin-clock">
                    <i className="fa fa-clock" style={{ marginRight: '0.5rem' }}></i>
                    {currentTime.toLocaleTimeString()}
                 </div>
                 <div 
                    className="admin-home-btn"
                    onClick={onHomeClick} 
                    title="Go Home"
                >
                    <i className="fa fa-home"></i>
                 </div>
            </div>
        </header>
    );
};
