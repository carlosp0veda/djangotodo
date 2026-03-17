import React from 'react';
import { ButtonProps } from '@/types';
import styles from './Button.module.css';

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', fluid = false, icon, children, ...props }, ref) => {
        const btnClasses = [
            styles.btn,
            fluid ? styles.fluid : '',
            className
        ].filter(Boolean).join(' ');

        return (
            <button
                ref={ref}
                className={btnClasses}
                {...props}
            >
                {icon && (
                    <span className={styles.iconWrap}>
                        {icon}
                    </span>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
