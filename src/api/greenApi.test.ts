import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStateInstance, sendMessage } from './greenApi';
import type { AuthCredentials } from '../types/api';

// Тестовые данные
const mockCredentials: AuthCredentials = {
    apiUrl: 'https://api.test.com',
    idInstance: '1101',
    apiTokenInstance: 'test-token',
};

describe('getStateInstance', () => {
    // Перед каждым тестом сбрасываем все моки
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('возвращает stateInstance при успешном ответе', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ stateInstance: 'authorized' }),
        } as Response);

        const result = await getStateInstance(mockCredentials);

        expect(result.stateInstance).toBe('authorized');
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);
        // Проверяем, что URL собран правильно
        expect(globalThis.fetch).toHaveBeenCalledWith(
            'https://api.test.com/waInstance1101/getStateInstance/test-token',
            expect.objectContaining({ method: 'GET' })
        );
    });

    it('кидает понятную ошибку при 401 (неверный токен)', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 401,
        } as Response);

        await expect(getStateInstance(mockCredentials)).rejects.toThrow(
            /Неверный API токен/
        );
    });

    it('кидает понятную ошибку при 404 (неверный URL)', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 404,
        } as Response);

        await expect(getStateInstance(mockCredentials)).rejects.toThrow(
            /Неверный API URL/
        );
    });

    it('кидает понятную ошибку при 466 (лимит тарифа)', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 466,
        } as Response);

        await expect(getStateInstance(mockCredentials)).rejects.toThrow(
            /Превышен лимит тарифа/
        );
    });

    it('кидает понятную ошибку при сетевом сбое (TypeError)', async () => {
        // Именно TypeError кидает fetch, когда нет соединения
        globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

        await expect(getStateInstance(mockCredentials)).rejects.toThrow(
            /Не удалось подключиться к серверу/
        );
    });

    it('корректно обрабатывает apiUrl с завершающим слэшем', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ stateInstance: 'authorized' }),
        } as Response);

        await getStateInstance({
            ...mockCredentials,
            apiUrl: 'https://api.test.com/', // <-- слэш в конце
        });

        // Проверяем, что двойного слэша нет
        expect(globalThis.fetch).toHaveBeenCalledWith(
            'https://api.test.com/waInstance1101/getStateInstance/test-token',
            expect.anything()
        );
    });
});

describe('sendMessage', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('отправляет POST-запрос с правильным телом', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ idMessage: '12345' }),
        } as Response);

        const result = await sendMessage(mockCredentials, {
            chatId: '10000000',
            message: 'Привет!',
        });

        expect(result.idMessage).toBe('12345');
        expect(globalThis.fetch).toHaveBeenCalledWith(
            'https://api.test.com/waInstance1101/sendMessage/test-token',
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ chatId: '10000000', message: 'Привет!' }),
            })
        );
    });
});