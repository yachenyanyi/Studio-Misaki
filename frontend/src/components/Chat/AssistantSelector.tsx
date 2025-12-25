import React, { useState } from 'react';
import type { ChatAssistant } from '../../services/chatService';
import { MessageSquare, Download, ChevronDown, FileJson, FileText } from 'lucide-react';

interface Props {
    assistants: ChatAssistant[];
    selectedId: string;
    onSelect: (id: string) => void;
    isNew: boolean;
    onExportJSON?: () => void;
    onExportMarkdown?: () => void;
}

export const AssistantSelector: React.FC<Props> = ({ 
    assistants, 
    selectedId, 
    onSelect, 
    isNew,
    onExportJSON,
    onExportMarkdown
}) => {
    const [showExportMenu, setShowExportMenu] = useState(false);

    return (
        <div style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-card)',
            flexShrink: 0,
            position: 'relative',
            zIndex: 10
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg,#4f46e5,#9333ea)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(79,70,229,0.2)',
                        color: 'white'
                    }}
                >
                    <MessageSquare size={20} />
                </div>
                <div>
                    <div style={{ fontSize: '0.7rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>
                        Studio-Misaki AI
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isNew ? '新对话' : '正在对话'}
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Export Dropdown */}
                {!isNew && (onExportJSON || onExportMarkdown) && (
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.4rem 0.85rem',
                                borderRadius: '0.75rem',
                                border: '1px solid #e2e8f0',
                                background: 'white',
                                color: '#64748b',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                        >
                            <Download size={16} />
                            导出对话
                            <ChevronDown size={14} style={{ transform: showExportMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>

                        {showExportMenu && (
                            <>
                                <div 
                                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }} 
                                    onClick={() => setShowExportMenu(false)}
                                />
                                <div style={{
                                    position: 'absolute',
                                    top: '110%',
                                    right: 0,
                                    background: 'white',
                                    borderRadius: '0.75rem',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    border: '1px solid #e2e8f0',
                                    padding: '0.5rem',
                                    minWidth: '160px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.25rem'
                                }}>
                                    {onExportJSON && (
                                        <button
                                            onClick={() => { onExportJSON(); setShowExportMenu(false); }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                padding: '0.6rem 0.75rem',
                                                borderRadius: '0.5rem',
                                                border: 'none',
                                                background: 'transparent',
                                                color: '#1e293b',
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <FileJson size={16} color="#4f46e5" />
                                            导出为 JSON
                                        </button>
                                    )}
                                    {onExportMarkdown && (
                                        <button
                                            onClick={() => { onExportMarkdown(); setShowExportMenu(false); }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                padding: '0.6rem 0.75rem',
                                                borderRadius: '0.5rem',
                                                border: 'none',
                                                background: 'transparent',
                                                color: '#1e293b',
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <FileText size={16} color="#10b981" />
                                            导出为 Markdown
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: '#f8fafc',
                        padding: '0.4rem 0.85rem',
                        borderRadius: '0.75rem',
                        border: '1px solid #e2e8f0',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                    }}
                >
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>智能助手:</span>
                    <select
                        value={selectedId}
                        onChange={(e) => onSelect(e.target.value)}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#1e293b',
                            outline: 'none',
                            cursor: 'pointer',
                            paddingRight: '0.5rem'
                        }}
                    >
                        {assistants.length > 0 ? (
                            assistants.map((a) => (
                                <option key={a.assistant_id} value={a.assistant_id}>
                                    {a.name || a.assistant_id}
                                </option>
                            ))
                        ) : (
                            <option value={selectedId}>{selectedId}</option>
                        )}
                    </select>
                </div>
            </div>
        </div>
    );
};
