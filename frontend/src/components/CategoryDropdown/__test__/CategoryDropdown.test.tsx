import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CategoryDropdown from '../CategoryDropdown';
import { Category } from '@/types';

const mockCategories: Category[] = [
    { id: 1, name: 'Work', color: '#ff0000' },
    { id: 2, name: 'Personal', color: '#00ff00' },
];

describe('CategoryDropdown component', () => {
    it('renders "No Category" when no category is selected', () => {
        render(
            <CategoryDropdown
                categories={mockCategories}
                selectedCategoryId={null}
                onChange={() => { }}
            />
        );
        expect(screen.getByText('No Category')).toBeInTheDocument();
    });

    it('renders the selected category name', () => {
        render(
            <CategoryDropdown
                categories={mockCategories}
                selectedCategoryId={1}
                onChange={() => { }}
            />
        );
        expect(screen.getByText('Work')).toBeInTheDocument();
    });

    it('opens the dropdown when clicked', () => {
        render(
            <CategoryDropdown
                categories={mockCategories}
                selectedCategoryId={null}
                onChange={() => { }}
            />
        );

        const trigger = screen.getByRole('button');
        fireEvent.click(trigger);

        expect(screen.getByText('Work')).toBeInTheDocument();
        expect(screen.getByText('Personal')).toBeInTheDocument();
        // The list should also have "No Category"
        const items = screen.getAllByText('No Category');
        expect(items.length).toBe(2); // One in trigger, one in dropdown
    });

    it('calls onChange and closes when a category is selected', () => {
        const handleChange = vi.fn();
        render(
            <CategoryDropdown
                categories={mockCategories}
                selectedCategoryId={null}
                onChange={handleChange}
            />
        );

        fireEvent.click(screen.getByRole('button'));
        fireEvent.click(screen.getByText('Personal'));

        expect(handleChange).toHaveBeenCalledWith(2);
        // Dropdown should be closed (Personal should now be in the trigger, but not in the dropdown list)
        // Actually, Personal will be in the trigger. We can check if "No Category" (from dropdown) is gone.
        // Wait, "No Category" is always in the dropdown. 
        // Let's check if the dropdown element is still there if we had an id for it, or just check the number of "No Category" buttons.
        expect(screen.getAllByText('No Category').length).toBe(1); // Only in trigger now
    });

    it('calls onChange(null) when "No Category" is selected in the dropdown', () => {
        const handleChange = vi.fn();
        render(
            <CategoryDropdown
                categories={mockCategories}
                selectedCategoryId={1}
                onChange={handleChange}
            />
        );

        fireEvent.click(screen.getByRole('button'));
        // The first "No Category" is in the dropdown list (since selected is "Work")
        fireEvent.click(screen.getByText('No Category'));

        expect(handleChange).toHaveBeenCalledWith(null);
    });
});
