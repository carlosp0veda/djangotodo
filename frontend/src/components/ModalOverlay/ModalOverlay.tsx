import React, { useEffect } from 'react';
import styles from './ModalOverlay.module.css';

interface ModalOverlayProps {
    children: React.ReactNode;
    onClose: () => void;
    headerLeft?: React.ReactNode;
    headerRight?: React.ReactNode;
    closeOnOutsideClick?: boolean;
    closeOnEsc?: boolean;
}

export const ModalOverlay: React.FC<ModalOverlayProps> = ({
    children,
    onClose,
    headerLeft,
    headerRight,
    closeOnOutsideClick = false,
    closeOnEsc = false
}) => {
    // Handle escape key
    useEffect(() => {
        if (!closeOnEsc) return;
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose, closeOnEsc]);

    // Prevent propagation when clicking the panel itself
    const handlePanelClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div className={styles.overlay} onClick={closeOnOutsideClick ? onClose : undefined}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.headerLeft}>{headerLeft}</div>
                    <div className={styles.headerRight}>{headerRight}</div>
                </div>
                <div className={styles.panel} onClick={handlePanelClick}>
                    {children}
                </div>
            </div>
        </div>
    );
};
