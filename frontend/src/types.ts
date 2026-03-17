import React, { ButtonHTMLAttributes } from 'react';

export interface SpeechRecognitionResult {
    isFinal: boolean;
    [key: number]: {
        transcript: string;
    };
}

export interface SpeechRecognitionEvent {
    resultIndex: number;
    results: {
        [key: number]: SpeechRecognitionResult;
        length: number;
    };
}

export interface SpeechRecognitionErrorEvent {
    error: string;
}

export interface ISpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
}

export interface WindowWithSpeech extends Window {
    SpeechRecognition?: new () => ISpeechRecognition;
    webkitSpeechRecognition?: new () => ISpeechRecognition;
}

export interface Category {
    id: number;
    name: string;
    color: string;
}

export interface Todo {
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
    owner: string;
    category?: Category | null;
    created_at: string;
    updated_at: string;
}

export interface TodoInput {
    title: string;
    description?: string;
    completed?: boolean;
    category_id?: number | null;
}

export interface TokenResponse {
    access: string;
    refresh: string;
}

export interface TodoStore {
    filterCategoryId: number | null;
    searchTerm: string;
    editingTodoId: number | 'new' | null;

    isCreatingCategory: boolean;
    newCategoryName: string;
    newCategoryColor: string;

    setFilterCategoryId: (id: number | null) => void;
    setSearchTerm: (term: string) => void;
    setEditingTodoId: (id: number | 'new' | null) => void;
    setIsCreatingCategory: (val: boolean) => void;
    setNewCategoryName: (name: string) => void;
    setNewCategoryColor: (color: string) => void;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: React.ReactNode;
    fluid?: boolean;
}

export interface CategoryDropdownProps {
    categories: Category[];
    selectedCategoryId: number | null;
    onChange: (id: number | null) => void;
}

export interface LoginFormProps {
    onSwitchToRegister: () => void;
}

export interface ModalOverlayProps {
    children: React.ReactNode;
    onClose: () => void;
    headerLeft?: React.ReactNode;
    headerRight?: React.ReactNode;
    closeOnOutsideClick?: boolean;
    closeOnEsc?: boolean;
}

export interface NoteCardProps {
    todo: Todo;
    onToggleComplete: (id: number, currentStatus: boolean) => void;
    onDelete: (id: number) => void;
}

export interface RegisterFormProps {
    onSwitchToLogin: () => void;
}
