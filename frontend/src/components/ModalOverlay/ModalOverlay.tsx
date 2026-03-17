import React, { useEffect } from 'react';
import { ModalOverlayProps } from '@/types';
import styles from './ModalOverlay.module.css';

const ModalOverlay: React.FC<ModalOverlayProps> = ({
    children,
    onClose,
    headerLeft,
    headerRight,
    closeOnOutsideClick = false,
    closeOnEsc = false
}) => {
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

    const handlePanelClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div
            className={styles.overlay}
            onClick={closeOnOutsideClick ? onClose : undefined}
            data-testid="modal-overlay"
        >
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.headerLeft}>{headerLeft}</div>
                    <div className={styles.headerRight}>{headerRight}</div>
                </div>
                <div
                    className={styles.panel}
                    onClick={handlePanelClick}
                    data-testid="modal-panel"
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ModalOverlay;