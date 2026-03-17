import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterForm from '../RegisterForm';
import { useAuth } from '@/hooks/useAuth';

vi.mock('@/hooks/useAuth');

describe('RegisterForm component', () => {
    const mockRegister = vi.fn();
    const handleSwitch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useAuth).mockReturnValue({
            isAuthenticated: false,
            login: vi.fn(),
            register: mockRegister,
            isLoading: false,
            error: null,
            logout: vi.fn(),
        });
    });

    it('renders the register form correctly', () => {
        render(<RegisterForm onSwitchToLogin={handleSwitch} />);

        expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('calls register with email and password on submit', async () => {
        const user = userEvent.setup(); // Setup user-event
        render(<RegisterForm onSwitchToLogin={handleSwitch} />);

        await user.type(screen.getByPlaceholderText('Email address'), 'new@example.com');
        await user.type(screen.getByPlaceholderText('Password'), 'password123');
        await user.click(screen.getByRole('button', { name: /sign up/i }));

        expect(mockRegister).toHaveBeenCalledWith({
            email: 'new@example.com',
            password: 'password123',
        });
    });

    it('toggles password visibility', async () => {
        const user = userEvent.setup();
        render(<RegisterForm onSwitchToLogin={handleSwitch} />);

        const passwordInput = screen.getByPlaceholderText('Password');
        const toggleBtn = screen.getByLabelText('Show password');

        expect(passwordInput).toHaveAttribute('type', 'password');

        await user.click(toggleBtn);
        expect(passwordInput).toHaveAttribute('type', 'text');

        await user.click(screen.getByLabelText('Hide password'));
        expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('calls onSwitchToLogin when the switch button is clicked', async () => {
        const user = userEvent.setup();
        render(<RegisterForm onSwitchToLogin={handleSwitch} />);

        await user.click(screen.getByText(/We're already friends!/i));
        expect(handleSwitch).toHaveBeenCalledTimes(1);
    });

    it('shows error message if registration fails', () => {
        vi.mocked(useAuth).mockReturnValue({
            isAuthenticated: false,
            login: vi.fn(),
            register: mockRegister,
            isLoading: false,
            error: new Error('Email already exists.'),
            logout: vi.fn(),
        });

        render(<RegisterForm onSwitchToLogin={handleSwitch} />);

        expect(screen.getByText('Email already exists.')).toBeInTheDocument();
    });

    it('disables the submit button and shows loading text while loading', () => {
        vi.mocked(useAuth).mockReturnValue({
            isAuthenticated: false,
            login: vi.fn(),
            register: mockRegister,
            isLoading: true,
            error: null,
            logout: vi.fn(),
        });

        render(<RegisterForm onSwitchToLogin={handleSwitch} />);

        const submitBtn = screen.getByRole('button', { name: /wait for it/i });
        expect(submitBtn).toBeDisabled();
    });
});