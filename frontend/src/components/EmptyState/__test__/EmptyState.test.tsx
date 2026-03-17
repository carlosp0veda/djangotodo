import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EmptyState from '../EmptyState';

describe('EmptyState component', () => {
    it('renders the empty state message', () => {
        render(<EmptyState />);
        expect(screen.getByText(/I'm just here waiting for your charming notes.../i)).toBeInTheDocument();
    });

    it('renders the boba tea image', () => {
        render(<EmptyState />);
        const image = screen.getByAltText('Boba Tea');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', '/assets/cup.png');
    });
});
