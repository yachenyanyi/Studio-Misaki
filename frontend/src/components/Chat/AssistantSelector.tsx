import React from 'react';
import type { ChatAssistant } from '../../services/chatService';
import { MessageSquare } from 'lucide-react';

interface Props {
    assistants: ChatAssistant[];
    selectedId: string;
    onSelect: (id: string) => void;
    isNew: boolean;
}

export const AssistantSelector: React.FC<Props> = ({ assistants, selectedId, onSelect, isNew }) => {
    return (
        <div style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-card)',
            flexShrink: 0
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                    style={{
                        width: 34,
                        height: 34,
                        borderRadius: 999,
                        background: 'linear-gradient(135deg,#6366f1,#ec4899)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 10px 25px rgba(79,70,229,0.45)'
                    }}
                >
                    <MessageSquare size={18} color="#ffffff" />
                </div>
                <div>
                    <div style={{ fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280' }}>
                        Studio-Misaki
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                        {isNew ? '开始新的对话' : '正在对话'}
                    </div>
                </div>
            </div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'var(--bg-body)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border-color)'
                }}
            >
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Model:</span>
                <select
                    value={selectedId}
                    onChange={(e) => onSelect(e.target.value)}
                    disabled={!isNew}
                    style={{
                        border: 'none',
                        background: 'transparent',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        outline: 'none',
                        cursor: isNew ? 'pointer' : 'default',
                        maxWidth: '180px'
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
    );
};
