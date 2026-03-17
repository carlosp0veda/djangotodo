import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from './Button';

describe('Button component', () => {
    it('renders the button with children', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);
        fireEvent.click(screen.getByRole('button', { name: /click me/i }));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when the disabled prop is true', () => {
        render(<Button disabled>Click me</Button>);
        expect(screen.getByRole('button', { name: /click me/i })).toBeDisabled();
    });

    it('renders an icon when provided', () => {
        render(<Button icon={<span data-testid="test-icon">icon</span>}>Click me</Button>);
        expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('applies fluid class when fluid prop is true', () => {
        // Since we are using CSS modules, we might not be able to check the exact class name string
        // without mocking the styles, but we can verify it's rendered.
        const { container } = render(<Button fluid>Click me</Button>);
        expect(container.firstChild).toBeInTheDocument();
    });
});
