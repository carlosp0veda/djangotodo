import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sidebar from '../Sidebar';

// Mock store
const mockSetFilterCategoryId = vi.fn();
const mockSetIsCreatingCategory = vi.fn();
vi.mock('../../../store/useTodoStore', () => ({
    useTodoStore: () => ({
        filterCategoryId: 1,
        setFilterCategoryId: mockSetFilterCategoryId,
        setIsCreatingCategory: mockSetIsCreatingCategory,
    }),
}));

// Mock hooks
vi.mock('../../../hooks/useTodos', () => ({
    useCategoriesQuery: () => ({
        data: [
            { id: 1, name: 'Work', color: '#ff0000' },
            { id: 2, name: 'Personal', color: '#00ff00' },
        ],
    }),
}));

const mockLogout = vi.fn();
vi.mock('../../../hooks/useAuth', () => ({
    useAuth: () => ({
        logout: mockLogout,
    }),
}));

describe('Sidebar component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders categories', () => {
        render(<Sidebar />);

        expect(screen.getByText('Work')).toBeInTheDocument();
        expect(screen.getByText('Personal')).toBeInTheDocument();
    });

    it('calls setFilterCategoryId when a category is clicked', () => {
        render(<Sidebar />);

        fireEvent.click(screen.getByText('Personal'));
        expect(mockSetFilterCategoryId).toHaveBeenCalledWith(2);
    });

    it('calls setFilterCategoryId(null) when "All Categories" is clicked', () => {
        render(<Sidebar />);

        fireEvent.click(screen.getByText('All Categories'));
        expect(mockSetFilterCategoryId).toHaveBeenCalledWith(null);
    });

    it('calls setIsCreatingCategory(true) when "New Category" is clicked', () => {
        render(<Sidebar />);

        fireEvent.click(screen.getByText('+ New Category'));
        expect(mockSetIsCreatingCategory).toHaveBeenCalledWith(true);
    });

    it('calls logout when "Sign out" is clicked', () => {
        render(<Sidebar />);

        fireEvent.click(screen.getByText('Sign out'));
        expect(mockLogout).toHaveBeenCalledTimes(1);
    });
});
