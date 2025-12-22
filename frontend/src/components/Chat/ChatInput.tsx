import React, { useState } from 'react';
import { Send, StopCircle, RotateCcw } from 'lucide-react';
import { UI_COLORS, MESSAGES } from '../../constants';

interface Props {
    onSend: (msg: string) => void;
    onStop: () => void;
    onRollback?: () => void;
    isLoading: boolean;
    isRollingBack?: boolean;
    showRollback?: boolean;
    initialValue?: string; // 添加初始值属性
}

export const ChatInput: React.FC<Props> = ({ 
    onSend, 
    onStop, 
    onRollback, 
    isLoading, 
    isRollingBack,
    showRollback,
    initialValue = ''
}) => {
    const [input, setInput] = useState('');

    // 当初始值改变时同步到输入框
    React.useEffect(() => {
        if (initialValue) {
            setInput(initialValue);
        }
    }, [initialValue]);

    const handleSend = () => {
        if (!input.trim() || isLoading) return;
        onSend(input);
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div style={{
            padding: '1.5rem',
            background: UI_COLORS.BG_CARD,
            borderTop: '1px solid var(--border-color)',
            position: 'relative',
            zIndex: 10
        }}>
            <div style={{
                maxWidth: '900px',
                margin: '0 auto',
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                background: UI_COLORS.BG_BODY,
                borderRadius: '1.5rem',
                border: '1px solid var(--border-color)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                padding: '0.5rem',
                transition: 'border-color 0.2s, box-shadow 0.2s'
            }}>
                {showRollback && (
                    <button
                        onClick={onRollback}
                        disabled={isLoading || isRollingBack}
                        title="撤销上一步"
                        style={{
                            padding: '0.6rem',
                            margin: '0.25rem',
                            background: 'transparent',
                            color: (isLoading || isRollingBack) ? 'var(--text-sub)' : UI_COLORS.TEXT_SECONDARY,
                            border: 'none',
                            borderRadius: '1rem',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: (isLoading || isRollingBack) ? 'default' : 'pointer',
                            transition: 'all 0.2s',
                            flexShrink: 0,
                            marginRight: '0.25rem'
                        }}
                    >
                        <RotateCcw size={18} style={{ 
                            animation: isRollingBack ? 'spin 1s linear infinite' : 'none'
                        }} />
                        <style>{`
                            @keyframes spin {
                                from { transform: rotate(0deg); }
                                to { transform: rotate(-360deg); }
                            }
                        `}</style>
                    </button>
                )}
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="输入消息..."
                    disabled={isLoading}
                    style={{
                        flex: 1,
                        border: 'none',
                        background: 'transparent',
                        resize: 'none',
                        padding: '0.75rem 1rem',
                        fontSize: '0.95rem',
                        lineHeight: 1.5,
                        maxHeight: '150px',
                        outline: 'none',
                        color: UI_COLORS.TEXT_PRIMARY,
                        minHeight: '24px'
                    }}
                    rows={1}
                />
                <button
                    onClick={isLoading ? onStop : handleSend}
                    disabled={!isLoading && !input.trim()}
                    style={{
                        padding: '0.6rem',
                        margin: '0.25rem',
                        background: isLoading ? UI_COLORS.DANGER : (input.trim() ? UI_COLORS.PRIMARY : 'var(--bg-hover)'),
                        color: (isLoading || input.trim()) ? '#ffffff' : 'var(--text-sub)',
                        border: 'none',
                        borderRadius: '1rem',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: (isLoading || input.trim()) ? 'pointer' : 'default',
                        transition: 'all 0.2s',
                        flexShrink: 0,
                        marginLeft: '0.5rem'
                    }}
                >
                    {isLoading ? <StopCircle size={20} /> : <Send size={20} />}
                </button>
            </div>
            <div style={{ 
                textAlign: 'center', 
                fontSize: '0.75rem', 
                color: UI_COLORS.TEXT_SECONDARY, 
                marginTop: '0.75rem',
                opacity: 0.7
            }}>
                {MESSAGES.AI_DISCLAIMER}
            </div>
        </div>
    );
};
