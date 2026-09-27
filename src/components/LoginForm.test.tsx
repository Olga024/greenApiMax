import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import * as greenApi from '../api/greenApi';

vi.mock('../api/greenApi');

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

describe('LoginForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderForm = () =>
        render(
            <BrowserRouter>
                <LoginForm />
            </BrowserRouter>
        );

    it('рендерит все три поля и кнопку', () => {
        renderForm();

        expect(screen.getByLabelText(/API URL/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/ID Instance/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/API Token Instance/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Войти/i })).toBeInTheDocument();
    });

    it('фильтрует нецифровые символы в поле ID Instance', () => {
        renderForm();
        const idInput = screen.getByLabelText(/ID Instance/i) as HTMLInputElement;

        fireEvent.change(idInput, { target: { value: 'ab12cd34' } });

        expect(idInput.value).toBe('1234');
    });

    it('показывает ошибку при коротком токене', async () => {
        renderForm();

        fireEvent.change(screen.getByLabelText(/ID Instance/i), {
            target: { value: '1101' },
        });
        fireEvent.change(screen.getByLabelText(/API Token Instance/i), {
            target: { value: 'short' },
        });
        fireEvent.click(screen.getByRole('button', { name: /Войти/i }));

        expect(
            await screen.findByText(/Токен выглядит слишком коротким/i)
        ).toBeInTheDocument();

        expect(greenApi.getStateInstance).not.toHaveBeenCalled();
    });

    it('показывает ошибку от API при неверных данных', async () => {

        vi.mocked(greenApi.getStateInstance).mockRejectedValue(
            new Error('Неверный API токен или ID инстанса')
        );

        renderForm();

        fireEvent.change(screen.getByLabelText(/ID Instance/i), {
            target: { value: '1101' },
        });
        fireEvent.change(screen.getByLabelText(/API Token Instance/i), {
            target: { value: 'a'.repeat(50) },
        });
        fireEvent.click(screen.getByRole('button', { name: /Войти/i }));

        expect(
            await screen.findByText(/Неверный API токен или ID инстанса/i)
        ).toBeInTheDocument();
    });

    it('переходит на /chat при успешной авторизации', async () => {
        vi.mocked(greenApi.getStateInstance).mockResolvedValue({
            stateInstance: 'authorized',
        });

        renderForm();

        fireEvent.change(screen.getByLabelText(/ID Instance/i), {
            target: { value: '1101' },
        });
        fireEvent.change(screen.getByLabelText(/API Token Instance/i), {
            target: { value: 'a'.repeat(50) },
        });
        fireEvent.click(screen.getByRole('button', { name: /Войти/i }));

        await waitFor(() => {
            expect(mockedNavigate).toHaveBeenCalledWith('/chat');
        });
    });

    it('очищает ошибку при изменении поля', async () => {
        vi.mocked(greenApi.getStateInstance).mockRejectedValue(
            new Error('Неверный API токен')
        );

        renderForm();

        fireEvent.change(screen.getByLabelText(/ID Instance/i), {
            target: { value: '1101' },
        });
        fireEvent.change(screen.getByLabelText(/API Token Instance/i), {
            target: { value: 'a'.repeat(50) },
        });
        fireEvent.click(screen.getByRole('button', { name: /Войти/i }));

        expect(await screen.findByText(/Неверный API токен/i)).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText(/ID Instance/i), {
            target: { value: '1102' },
        });

        expect(screen.queryByText(/Неверный API токен/i)).not.toBeInTheDocument();
    });
});