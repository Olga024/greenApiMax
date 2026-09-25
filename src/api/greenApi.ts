import type { AuthCredentials, GetStateResponse, ReceiveNotificationResponse, SendMessageRequest, SendMessageResponse } from '../types/api';

export const getStateInstance = async (
    credentials: AuthCredentials
): Promise<GetStateResponse> => {
    const { apiUrl, idInstance, apiTokenInstance } = credentials;

    // Убираем лишние слэши на стыке
    const cleanUrl = apiUrl.replace(/\/$/, '');
    const url = `${cleanUrl}/waInstance${idInstance}/getStateInstance/${apiTokenInstance}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Неверный API токен или ID инстанса');
        }
        throw new Error(`Ошибка сервера: ${response.status}`);
    }

    return response.json();
};

export const sendMessage = async (
    credentials: AuthCredentials,
    data: SendMessageRequest
): Promise<SendMessageResponse> => {
    const { apiUrl, idInstance, apiTokenInstance } = credentials;
    const cleanUrl = apiUrl.replace(/\/$/, '');
    const url = `${cleanUrl}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Ошибка отправки: ${response.status}`);
    }

    return response.json();
};

export const receiveNotification = async (
    credentials: AuthCredentials
): Promise<ReceiveNotificationResponse> => {
    const { apiUrl, idInstance, apiTokenInstance } = credentials;
    const cleanUrl = apiUrl.replace(/\/$/, '');
    // receiveTimeout=5 означает, что сервер подержит соединение до 5 секунд, если уведомлений нет (long polling)
    const url = `${cleanUrl}/waInstance${idInstance}/receiveNotification/${apiTokenInstance}?receiveTimeout=5`;

    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
        throw new Error(`Ошибка получения уведомления: ${response.status}`);
    }

    // Если уведомлений нет, API возвращает пустой ответ или null, что соответствует типу ReceiveNotificationResponse
    const text = await response.text();
    if (!text || text === 'null') return null;

    return JSON.parse(text);
};

export const deleteNotification = async (
    credentials: AuthCredentials,
    receiptId: number
): Promise<void> => {
    const { apiUrl, idInstance, apiTokenInstance } = credentials;
    const cleanUrl = apiUrl.replace(/\/$/, '');
    const url = `${cleanUrl}/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`;

    const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
        console.warn(`Не удалось удалить уведомление ${receiptId}`);
    }
};