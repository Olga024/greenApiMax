import type { AuthCredentials, GetStateResponse } from '../types/api';

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