import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NoteCard from '../NoteCard';
import { Todo } from '@/types';

// Mock the store
const mockSetEditingTodoId = vi.fn();
vi.mock('../../../store/useTodoStore', () => ({
    useTodoStore: () => ({
        setEditingTodoId: mockSetEditingTodoId,
    }),
}));

// Mock utils
vi.mock('@/utils', () => ({
    formatDate: (date: string) => `Formatted ${date}`,
    getBackgroundColor: () => '#ffffff',
    getBorderColor: () => '#cccccc',
}));

const mockTodo: Todo = {
    id: 1,
    title: 'Test Note',
    description: 'Line 1\n- Item 1\n* Item 2',
    completed: false,
    owner: 'user1',
    category: { id: 1, name: 'Work', color: '#ff0000' },
    created_at: '2023-01-01',
    updated_at: '2023-01-01',
};

describe('NoteCard component', () => {
    it('renders note details correctly', () => {
        render(
            <NoteCard
                todo={mockTodo}
                onToggleComplete={() => { }}
                onDelete={() => { }}
            />
        );

        expect(screen.getByText('Test Note')).toBeInTheDocument();
        expect(screen.getByText('Work')).toBeInTheDocument();
        expect(screen.getByText('Formatted 2023-01-01')).toBeInTheDocument();
        expect(screen.getByText('Line 1')).toBeInTheDocument();
        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('calls setEditingTodoId when clicked', () => {
        render(
            <NoteCard
                todo={mockTodo}
                onToggleComplete={() => { }}
                onDelete={() => { }}
            />
        );

        fireEvent.click(screen.getByText('Test Note'));
        expect(mockSetEditingTodoId).toHaveBeenCalledWith(1);
    });

    it('calls onToggleComplete when check button is clicked', () => {
        const handleToggle = vi.fn();
        render(
            <NoteCard
                todo={mockTodo}
                onToggleComplete={handleToggle}
                onDelete={() => { }}
            />
        );

        const toggleBtn = screen.getByTitle('Mark done');
        fireEvent.click(toggleBtn);
        expect(handleToggle).toHaveBeenCalledWith(1, false);
    });

    it('calls onDelete when delete button is clicked', () => {
        const handleDelete = vi.fn();
        render(
            <NoteCard
                todo={mockTodo}
                onToggleComplete={() => { }}
                onDelete={handleDelete}
            />
        );

        const deleteBtn = screen.getByTitle('Delete note');
        fireEvent.click(deleteBtn);
        expect(handleDelete).toHaveBeenCalledWith(1);
    });
});
