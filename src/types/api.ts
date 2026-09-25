export type AuthCredentials = {
    apiUrl: string;
    idInstance: string;
    apiTokenInstance: string;
};

export type GetStateResponse = {
    stateInstance: 'authorized' | 'notAuthorized' | 'blocked' | 'sleepMode' | 'starting';
};

export type SendMessageRequest = {
    chatId: string;
    message: string;
};

export type SendMessageResponse = {
    idMessage: string;
};

export type NotificationBody = {
    typeWebhook: string;
    instanceData: {
        idInstance: number;
        wid: string;
        typeInstance: string;
    };
    timestamp: number;
    idMessage: string;
    senderData: {
        chatId: string;
        sender: string;
        senderName: string;
    };
    messageData: {
        typeMessage: string;
        textMessageData?: {
            textMessage: string;
        };
    };
};

export type ReceiveNotificationResponse = {
    receiptId: number;
    body: NotificationBody;
} | null;