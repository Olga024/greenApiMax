import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { receiveNotification, deleteNotification } from '../api/greenApi';

export const usePolling = () => {
    const credentials = useAuthStore((state) => state.credentials);
    const addMessage = useChatStore((state) => state.addMessage);
    const addChat = useChatStore((state) => state.addChat);
    const chats = useChatStore((state) => state.chats);

    // Используем useRef, чтобы иметь доступ к актуальному состоянию чатов внутри цикла
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

                    // Обрабатываем только входящие сообщения
                    if (body.typeWebhook === 'incomingMessageReceived') {
                        const chatId = body.senderData.chatId;
                        const messageText = body.messageData?.textMessageData?.textMessage;

                        if (messageText) {
                            // Если чата еще нет в списке, создаем его
                            if (!chatsRef.current[chatId]) {
                                addChat(chatId);
                            }

                            addMessage(chatId, {
                                id: body.idMessage || Date.now().toString(),
                                text: messageText,
                                isOutgoing: false, // Это входящее сообщение
                                timestamp: body.timestamp * 1000,
                            });
                        }
                    }

                    // ВАЖНО: Всегда подтверждаем получение, иначе очередь застрянет
                    await deleteNotification(credentials, receiptId);
                }
            } catch (error) {
                console.error('Ошибка в цикле polling:', error);
                // При ошибке делаем паузу подольше, чтобы не спамить API
            } finally {
                // Планируем следующий запрос через 3 секунды
                if (isMounted) {
                    timeoutRef.current = window.setTimeout(poll, 3000);
                }
            }
        };

        // Запускаем цикл
        poll();

        // Очистка при размонтировании компонента
        return () => {
            isMounted = false;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [credentials, addChat, addMessage]);
};