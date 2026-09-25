import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { receiveNotification, deleteNotification } from '../api/greenApi';

export const usePolling = () => {
    const credentials = useAuthStore((state) => state.credentials);
    const addMessage = useChatStore((state) => state.addMessage);
    const addChat = useChatStore((state) => state.addChat);
    const chats = useChatStore((state) => state.chats);

    const chatsRef = useRef(chats);
    useEffect(() => { chatsRef.current = chats; }, [chats]);

    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (!credentials) return;

        let isMounted = true;

        const poll = async () => {
            if (!isMounted) return;

            try {
                const notification = await receiveNotification(credentials);

                if (notification) {
                    const { receiptId, body } = notification;

                    if (body.typeWebhook === 'incomingMessageReceived') {
                        const chatId = body.senderData.chatId;
                        const messageText = body.messageData?.textMessageData?.textMessage;
                        const senderName = body.senderData.senderName || chatId;

                        if (messageText) {
                            if (!chatsRef.current[chatId]) {
                                addChat(chatId, senderName);
                            }

                            addMessage(chatId, {
                                id: body.idMessage || Date.now().toString(),
                                text: messageText,
                                isOutgoing: false,
                                timestamp: body.timestamp * 1000,
                            });
                        }
                    }

                    await deleteNotification(credentials, receiptId);
                }
            } catch (error) {
                console.error('Ошибка в цикле polling:', error);
            } finally {
                if (isMounted) {
                    timeoutRef.current = window.setTimeout(poll, 3000);
                }
            }
        };

        poll();

        return () => {
            isMounted = false;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [credentials, addChat, addMessage]);
};