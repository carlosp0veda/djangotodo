import React from 'react';
import { Todo } from '../../lib/types';
import { useTodoStore } from '../../store/useTodoStore';
import styles from './NoteCard.module.css';

interface NoteCardProps {
    todo: Todo;
    onToggleComplete: (id: number, currentStatus: boolean) => void;
    onDelete: (id: number) => void;
}

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isSameDay = (d1: Date, d2: Date) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    if (isSameDay(date, today)) {
        return 'today';
    } else if (isSameDay(date, yesterday)) {
        return 'yesterday';
    } else {
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    }
};

const getBackgroundColor = (color?: string | null) => {
    if (!color) return 'var(--card-bg)';
    return color;
};

const getBorderColor = (color?: string | null) => {
    if (!color) return 'var(--card-border)';
    if (color.startsWith('#') && color.length === 7) {
        let r = parseInt(color.slice(1, 3), 16);
        let g = parseInt(color.slice(3, 5), 16);
        let b = parseInt(color.slice(5, 7), 16);
        r = Math.floor(r * 0.9);
        g = Math.floor(g * 0.9);
        b = Math.floor(b * 0.9);
        return `rgb(${r}, ${g}, ${b})`;
    }
    return color;
};

export const NoteCard: React.FC<NoteCardProps> = ({ todo, onToggleComplete, onDelete }) => {
    const store = useTodoStore();

    const renderDescription = (text: string | null) => {
        if (!text) return null;
        const lines = text.split('\n');

        return (
            <div className={styles.description}>
                {lines.map((line, i) => {
                    if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                        return (
                            <div key={i} className={styles.descItem}>
                                <span>•</span>
                                <span>{line.replace(/^[\s-*]+/, '').trim()}</span>
                            </div>
                        );
                    }
                    return <p key={i} className={styles.descPara}>{line}</p>;
                })}
            </div>
        );
    };

    const bgColor = getBackgroundColor(todo.category?.color);
    const borderColor = getBorderColor(todo.category?.color);

    return (
        <div
            onClick={() => store.setEditingTodoId(todo.id)}
            className={styles.card}
            style={{ backgroundColor: bgColor, borderColor: borderColor }}
        >
            <div className={styles.header}>
                <span className={styles.date}>
                    {formatDate(todo.created_at)}
                </span>
                {todo.category && (
                    <span className={styles.category}>
                        {todo.category.name}
                    </span>
                )}
            </div>

            <h3 className={styles.title}>
                {todo.title}
            </h3>

            <div className={styles.body}>
                {todo.description && renderDescription(todo.description)}
            </div>

            {/* Hover Actions */}
            <div className={styles.actions}>
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleComplete(todo.id, todo.completed); }}
                    className={styles.actionBtn}
                    title={todo.completed ? 'Mark pending' : 'Mark done'}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={todo.completed ? styles.checkIconDone : styles.checkIcon}>
                        <path d="M20 6 9 17l-5-5" />
                    </svg>
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(todo.id); }}
                    className={styles.actionBtn}
                    title="Delete note"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
