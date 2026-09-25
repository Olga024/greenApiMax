import type { AuthCredentials, GetStateResponse, SendMessageRequest, SendMessageResponse } from '../types/api';

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