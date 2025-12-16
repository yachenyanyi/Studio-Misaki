import React from 'react';
import { UI_COLORS } from '../../constants';

interface Props {
    message: string;
}

export const ErrorMessage: React.FC<Props> = ({ message }) => {
    if (!message) return null;
    
    return (
        <div style={{ 
            padding: '0.75rem 1rem', 
            background: UI_COLORS.DANGER_BG, 
            color: UI_COLORS.DANGER_TEXT, 
            borderTop: `1px solid ${UI_COLORS.DANGER_BORDER}`,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            ⚠️ Error: {message}
        </div>
    );
};
