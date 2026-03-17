import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginForm from '../LoginForm';
import { useAuth } from '@/hooks/useAuth';
const mockLogin = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
    useAuth: vi.fn(),
}));

describe('LoginForm component', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useAuth).mockReturnValue({
            isAuthenticated: false,
            login: mockLogin,
            register: vi.fn(),
            isLoading: false,
            error: null,
            logout: vi.fn(),
        });
    });

    it('renders the login form', () => {
        render(<LoginForm onSwitchToRegister={() => { }} />);

        expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('calls login with email and password on submit', async () => {
        render(<LoginForm onSwitchToRegister={() => { }} />);

        fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        expect(mockLogin).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123',
        });
    });

    it('toggles password visibility', () => {
        render(<LoginForm onSwitchToRegister={() => { }} />);

        const passwordInput = screen.getByPlaceholderText('Password');
        const toggleBtn = screen.getByLabelText('Show password');

        expect(passwordInput).toHaveAttribute('type', 'password');

        fireEvent.click(toggleBtn);
        expect(passwordInput).toHaveAttribute('type', 'text');
        expect(screen.getByLabelText('Hide password')).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('Hide password'));
        expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('calls onSwitchToRegister when the switch button is clicked', () => {
        const handleSwitch = vi.fn();
        render(<LoginForm onSwitchToRegister={handleSwitch} />);

        fireEvent.click(screen.getByText(/Oops! I've never been here before/i));
        expect(handleSwitch).toHaveBeenCalledTimes(1);
    });

    it('shows error message if login fails', () => {
        vi.mocked(useAuth).mockReturnValue({
            isAuthenticated: false,
            login: mockLogin,
            register: vi.fn(),
            isLoading: false,
            error: new Error("Login failed"),
            logout: vi.fn(),
        });

        render(<LoginForm onSwitchToRegister={() => { }} />);
        expect(screen.getByText('Login failed')).toBeInTheDocument();
    });
});