import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ModalOverlay from '../ModalOverlay';

describe('ModalOverlay component', () => {
    it('renders children', () => {
        render(
            <ModalOverlay onClose={() => { }}>
                <div data-testid="child">Modal Content</div>
            </ModalOverlay>
        );
        expect(screen.getByTestId('child')).toBeInTheDocument();
        expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('renders header elements', () => {
        render(
            <ModalOverlay
                onClose={() => { }}
                headerLeft={<span data-testid="left">Left</span>}
                headerRight={<span data-testid="right">Right</span>}
            >
                <div>Content</div>
            </ModalOverlay>
        );
        expect(screen.getByTestId('left')).toBeInTheDocument();
        expect(screen.getByTestId('right')).toBeInTheDocument();
    });

    it('calls onClose when clicking outside if closeOnOutsideClick is true', () => {
        const handleClose = vi.fn();
        render(
            <ModalOverlay onClose={handleClose} closeOnOutsideClick={true}>
                <div>Content</div>
            </ModalOverlay>
        );

        fireEvent.click(screen.getByTestId('modal-overlay'));
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when clicking the panel even if closeOnOutsideClick is true', () => {
        const handleClose = vi.fn();
        render(
            <ModalOverlay onClose={handleClose} closeOnOutsideClick={true}>
                <div>Content</div>
            </ModalOverlay>
        );

        fireEvent.click(screen.getByTestId('modal-panel'));
        expect(handleClose).not.toHaveBeenCalled();
    });

    it('calls onClose when Escape key is pressed if closeOnEsc is true', () => {
        const handleClose = vi.fn();
        render(
            <ModalOverlay onClose={handleClose} closeOnEsc={true}>
                <div>Content</div>
            </ModalOverlay>
        );

        fireEvent.keyDown(window, { key: 'Escape' });
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when Escape key is pressed if closeOnEsc is false', () => {
        const handleClose = vi.fn();
        render(
            <ModalOverlay onClose={handleClose} closeOnEsc={false}>
                <div>Content</div>
            </ModalOverlay>
        );

        fireEvent.keyDown(window, { key: 'Escape' });
        expect(handleClose).not.toHaveBeenCalled();
    });
});
