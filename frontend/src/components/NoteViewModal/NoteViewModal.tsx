import React, { useState } from 'react';
import { useTodoStore } from '../../store/useTodoStore';
import { useTodosQuery, useCategoriesQuery, useUpdateTodoMutation, useAddTodoMutation } from '../../hooks/useTodos';
import { CategoryDropdown } from '../CategoryDropdown/CategoryDropdown';
import { ModalOverlay } from '../ModalOverlay/ModalOverlay';
import styles from './NoteViewModal.module.css';

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

const formatLastEdited = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
    const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return `Last Edited: ${formattedDate} at ${time}`;
};

export const NoteViewModal: React.FC = () => {
    const store = useTodoStore();
    const noteId = store.editingTodoId;

    const { data: todos = [] } = useTodosQuery(store.filterCategoryId);
    const { data: categories = [] } = useCategoriesQuery();
    const updateTodoMutation = useUpdateTodoMutation();
    const addTodoMutation = useAddTodoMutation();

    const isNewNote = noteId === 'new';
    const originalNote = isNewNote ? null : todos.find(t => t.id === noteId);

    const [title, setTitle] = useState(originalNote?.title || '');
    const [description, setDescription] = useState(originalNote?.description || '');
    const [categoryId, setCategoryId] = useState<number | null>(originalNote?.category?.id || null);
    const [hasChanges, setHasChanges] = useState(false);

    if (noteId === null || (!isNewNote && !originalNote)) return null;

    const currentCategory = categories.find(c => c.id === categoryId);
    const bgColor = getBackgroundColor(currentCategory?.color);
    const borderColor = getBorderColor(currentCategory?.color);

    const handleSaveAndClose = async () => {
        if (hasChanges) {
            if (isNewNote) {
                if (title.trim()) {
                    addTodoMutation.mutate({
                        title,
                        description,
                        category_id: categoryId || undefined
                    });
                }
            } else {
                updateTodoMutation.mutate({
                    id: noteId as number,
                    data: {
                        title,
                        description,
                        category_id: categoryId || undefined
                    }
                });
            }
        }
        store.setEditingTodoId(null);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        setHasChanges(true);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value);
        setHasChanges(true);
    };

    const handleCategorySelect = (id: number | null) => {
        setCategoryId(id);
        setHasChanges(true);
    };

    return (
        <ModalOverlay
            onClose={handleSaveAndClose}
            headerLeft={
                <CategoryDropdown
                    categories={categories}
                    selectedCategoryId={categoryId}
                    onChange={handleCategorySelect}
                />
            }
            headerRight={
                <button
                    onClick={handleSaveAndClose}
                    className={styles.closeBtn}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                    </svg>
                </button>
            }
        >
            <div
                className={styles.panel}
                style={{ backgroundColor: bgColor, borderColor: borderColor }}
            >
                {/* Last Edited (Small, top right inside panel) */}
                {!isNewNote && originalNote && (
                    <div className={styles.lastEditedContainer}>
                        <span className={styles.lastEdited}>
                            {formatLastEdited(originalNote.updated_at)}
                        </span>
                    </div>
                )}

                {/* Main Content */}
                <div className={styles.content}>
                    <input
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="Note Title"
                        className={styles.titleInput}
                    />
                    <textarea
                        value={description}
                        onChange={handleDescriptionChange}
                        placeholder="Pour your heart out..."
                        className={styles.bodyInput}
                    />
                </div>

                {/* Save FAB */}
                <button
                    onClick={handleSaveAndClose}
                    className={styles.saveFab}
                    title={hasChanges ? "Save changes" : "Close note"}
                >
                    {hasChanges ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                        </svg>
                    )}
                </button>
            </div>
        </ModalOverlay>
    );
};

