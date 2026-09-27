import type {
    AuthCredentials,
    CheckAccountResponse,
    GetStateResponse,
    ReceiveNotificationResponse,
    SendMessageRequest,
    SendMessageResponse,
} from '../types/api';

const fetchWithErrorHandling = async (url: string, options: RequestInit) => {
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('Неверный API токен или ID инстанса. Проверьте данные в личном кабинете GREEN-API');
            }
            if (response.status === 466) {
                throw new Error('Превышен лимит тарифа "Разработчик". Смените тариф в личном кабинете GREEN-API');
            }
            if (response.status === 404) {
                throw new Error('Неверный API URL. Проверьте адрес в личном кабинете GREEN-API');
            }
            throw new Error(`Ошибка сервера: ${response.status}`);
        }
        return response;
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error('Не удалось подключиться к серверу. Проверьте правильность API URL и ваше интернет-соединение');
        }
        throw error;
    }
};

export const getStateInstance = async (
    credentials: AuthCredentials
): Promise<GetStateResponse> => {
    const { apiUrl, idInstance, apiTokenInstance } = credentials;
    const cleanUrl = apiUrl.replace(/\/$/, '');
    const url = `${cleanUrl}/waInstance${idInstance}/getStateInstance/${apiTokenInstance}`;

    const response = await fetchWithErrorHandling(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
    });

    return response.json();
};

export const sendMessage = async (
    credentials: AuthCredentials,
    data: SendMessageRequest
): Promise<SendMessageResponse> => {
    const { apiUrl, idInstance, apiTokenInstance } = credentials;
    const cleanUrl = apiUrl.replace(/\/$/, '');
    const url = `${cleanUrl}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;

    const response = await fetchWithErrorHandling(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
    });

    return response.json();
};

export const receiveNotification = async (
    credentials: AuthCredentials
): Promise<ReceiveNotificationResponse> => {
    const { apiUrl, idInstance, apiTokenInstance } = credentials;
    const cleanUrl = apiUrl.replace(/\/$/, '');
    const url = `${cleanUrl}/waInstance${idInstance}/receiveNotification/${apiTokenInstance}?receiveTimeout=5`;

    const response = await fetchWithErrorHandling(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
    });

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

    await fetchWithErrorHandling(url, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
    });
};

export const checkAccount = async (
    credentials: AuthCredentials,
    phoneNumber: number
): Promise<CheckAccountResponse> => {
    const { apiUrl, idInstance, apiTokenInstance } = credentials;
    const cleanUrl = apiUrl.replace(/\/$/, '');
    const url = `${cleanUrl}/waInstance${idInstance}/checkAccount/${apiTokenInstance}`;

    const response = await fetchWithErrorHandling(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
    });

    return response.json();
};