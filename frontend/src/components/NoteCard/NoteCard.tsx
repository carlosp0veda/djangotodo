import React from 'react';
import { NoteCardProps } from '@/types';
import { useTodoStore } from '../../store/useTodoStore';
import { formatDate, getBackgroundColor, getBorderColor } from '@/utils';
import styles from './NoteCard.module.css';


const NoteCard: React.FC<NoteCardProps> = ({ todo, onToggleComplete, onDelete }) => {
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
        <article
            onClick={() => store.setEditingTodoId(todo.id)}
            className={styles.card}
            style={{ backgroundColor: bgColor, borderColor: borderColor }}
            data-testid="note-card"
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

            <h3 className={styles.title} data-testid="note-title">
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
        </article>
    );
};

export default NoteCard;