import React, { useState } from 'react';
import { useTodoStore } from '../../store/useTodoStore';
import { useTodoQuery, useCategoriesQuery, useUpdateTodoMutation, useAddTodoMutation } from '../../hooks/useTodos';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import CategoryDropdown from '../CategoryDropdown';
import ModalOverlay from '../ModalOverlay';
import { getBackgroundColor, getBorderColor, formatLastEdited } from '@/utils';
import { Category, Todo } from '@/types';
import styles from './NoteViewModal.module.css';

interface NoteViewModalContentProps {
    originalNote: Todo | null;
    categories: Category[];
    isNewNote: boolean;
    noteId: number | 'new';
    onClose: () => void;
}

const NoteViewModalContent: React.FC<NoteViewModalContentProps> = ({
    originalNote,
    categories,
    isNewNote,
    noteId
}) => {
    const store = useTodoStore();
    const updateTodoMutation = useUpdateTodoMutation();
    const addTodoMutation = useAddTodoMutation();

    const [title, setTitle] = useState(originalNote?.title || '');
    const [description, setDescription] = useState(originalNote?.description || '');
    const [categoryId, setCategoryId] = useState<number | null>(originalNote?.category?.id || null);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { isListening, toggleListening } = useSpeechToText({
        onTranscript: (transcript) => {
            setDescription((prev) => {
                const newText = prev + (prev.length > 0 && !prev.endsWith(' ') ? ' ' : '') + transcript;
                return newText;
            });
            setHasChanges(true);
        }
    });

    const validate = () => title.trim().length > 0;

    const handleSaveAndClose = async () => {
        if (hasChanges) {
            if (!validate()) {
                store.setEditingTodoId(null);
                return;
            }

            setIsSaving(true);
            try {
                if (isNewNote) {
                    await addTodoMutation.mutateAsync({
                        title: title.trim(),
                        description,
                        category_id: categoryId || undefined
                    });
                } else {
                    await updateTodoMutation.mutateAsync({
                        id: noteId as number,
                        data: {
                            title: title.trim(),
                            description,
                            category_id: categoryId || undefined
                        }
                    });
                }
            } catch (error) {
                console.error('Failed to save todo:', error);
                setIsSaving(false);
                return;
            }
        }
        store.setEditingTodoId(null);
    };

    const currentCategory = categories.find(c => c.id === categoryId);
    const bgColor = getBackgroundColor(currentCategory?.color);
    const borderColor = getBorderColor(currentCategory?.color);

    return (
        <ModalOverlay
            onClose={handleSaveAndClose}
            closeOnEsc={!isSaving}
            closeOnOutsideClick={!isSaving}
            headerLeft={
                <CategoryDropdown
                    categories={categories}
                    selectedCategoryId={categoryId}
                    onChange={(id) => {
                        setCategoryId(id);
                        setHasChanges(true);
                    }}
                />
            }
            headerRight={
                <button
                    onClick={handleSaveAndClose}
                    className={styles.closeBtn}
                    disabled={isSaving}
                    title={isSaving ? "Saving..." : "Save and close"}
                    aria-label="Close modal"
                    data-testid="close-modal-btn"
                >
                    {isSaving ? (
                        <div className={styles.spinner} />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                        </svg>
                    )}
                </button>
            }
        >
            <div
                className={styles.panel}
                style={{ backgroundColor: bgColor, borderColor: borderColor }}
            >
                {!isNewNote && originalNote && (
                    <div className={styles.lastEditedContainer}>
                        <span className={styles.lastEdited}>
                            {formatLastEdited(originalNote.updated_at)}
                        </span>
                    </div>
                )}

                <div className={styles.content}>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => { setTitle(e.target.value); setHasChanges(true); }}
                        placeholder="Note Title"
                        className={styles.titleInput}
                        disabled={isSaving}
                    />
                    <textarea
                        value={description}
                        onChange={(e) => { setDescription(e.target.value); setHasChanges(true); }}
                        placeholder="Pour your heart out..."
                        className={styles.bodyInput}
                        disabled={isSaving}
                    />
                </div>

                <button
                    onClick={toggleListening}
                    className={`${styles.dictationBtn} ${isListening ? styles.listening : ''}`}
                    title={isListening ? "Stop listening" : "Start dictation"}
                    type="button"
                    disabled={isSaving}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" fill={isListening ? "currentColor" : "none"} />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" x2="12" y1="19" y2="22" />
                    </svg>
                </button>
            </div>
        </ModalOverlay>
    );
};

const NoteViewModal: React.FC = () => {
    const store = useTodoStore();
    const noteId = store.editingTodoId;
    const isNewNote = noteId === 'new';

    const { data: originalNote, isLoading: isLoadingNote } = useTodoQuery(isNewNote ? null : (noteId as number));
    const { data: categories = [] } = useCategoriesQuery();

    if (noteId === null) return null;
    if (!isNewNote && isLoadingNote) return null;
    if (!isNewNote && !originalNote && !isLoadingNote) return null;

    return (
        <NoteViewModalContent
            key={noteId}
            noteId={noteId}
            isNewNote={isNewNote}
            originalNote={originalNote || null}
            categories={categories}
            onClose={() => store.setEditingTodoId(null)}
        />
    );
};

export default NoteViewModal;
