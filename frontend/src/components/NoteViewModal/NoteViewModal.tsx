import React, { useState, useEffect, useRef } from 'react';
import { useTodoStore } from '../../store/useTodoStore';
import { useTodosQuery, useCategoriesQuery, useUpdateTodoMutation, useAddTodoMutation } from '../../hooks/useTodos';
import { CategoryDropdown } from '../CategoryDropdown/CategoryDropdown';
import { ModalOverlay } from '../ModalOverlay/ModalOverlay';
import { getBackgroundColor, getBorderColor, formatLastEdited } from '@/utils';
import { WindowWithSpeech, ISpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '@/types';
import styles from './NoteViewModal.module.css';



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
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<ISpeechRecognition | null>(null);

    useEffect(() => {
        const SpeechRecognition = (window as unknown as WindowWithSpeech).SpeechRecognition ||
            (window as unknown as WindowWithSpeech).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setDescription((prev: string) => {
                        const newText = prev + (prev.length > 0 && !prev.endsWith(' ') ? ' ' : '') + finalTranscript;
                        return newText;
                    });
                    setHasChanges(true);
                }
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert('Speech Recognition is not supported in this browser.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (error) {
                console.error('Failed to start recognition', error);
                setIsListening(false);
            }
        }
    };

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
                    title="Save changes"
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

                {/* Dictation FAB */}
                <button
                    onClick={toggleListening}
                    className={`${styles.dictationBtn} ${isListening ? styles.listening : ''}`}
                    title={isListening ? "Stop listening" : "Start dictation"}
                    type="button"
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

