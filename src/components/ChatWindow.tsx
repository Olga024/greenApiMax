import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { sendMessage } from '../api/greenApi';
import { usePolling } from '../hooks/usePolling';

export const ChatWindow = () => {
    const credentials = useAuthStore((state) => state.credentials)!;
    const { chats, activeChatId, addChat, setActiveChat, addMessage } = useChatStore();

    const [newPhone, setNewPhone] = useState('');
    const [messageText, setMessageText] = useState('');
    const [error, setError] = useState<string | null>(null);

    const activeChat = activeChatId ? chats[activeChatId] : null;

    const handleCreateChat = (e: React.FormEvent) => {
        e.preventDefault();
        const cleanPhone = newPhone.replace(/\D/g, ''); // Оставляем только цифры
        if (!cleanPhone) return;

        addChat(cleanPhone);
        setNewPhone('');
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeChatId || !messageText.trim()) return;

        const text = messageText.trim();
        setMessageText('');
        setError(null);

        try {
            // Отправляем запрос в GREEN-API
            await sendMessage(credentials, {
                chatId: activeChatId,
                message: text,
            });

            // Добавляем сообщение в UI (оптимистично, т.к. ответ API может не содержать текста)
            addMessage(activeChatId, {
                id: Date.now().toString(),
                text,
                isOutgoing: true,
                timestamp: Date.now(),
            });
        } catch (err: any) {
            setError('Не удалось отправить сообщение. Проверьте chatId.');
            setMessageText(text); // Возвращаем текст обратно в инпут
        }
    };

    usePolling();

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Сайдбар */}
            <div className="w-1/3 bg-white border-r flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="font-bold mb-2">Новый чат</h2>
                    <form onSubmit={handleCreateChat} className="flex gap-2">
                        <input
                            type="text"
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            placeholder="Номер получателя"
                            className="flex-1 p-2 border rounded text-sm"
                        />
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded text-sm">
                            +
                        </button>
                    </form>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {Object.values(chats).map((chat) => (
                        <div
                            key={chat.chatId}
                            onClick={() => setActiveChat(chat.chatId)}
                            className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${activeChatId === chat.chatId ? 'bg-green-50' : ''
                                }`}
                        >
                            <div className="font-medium">{chat.chatId}</div>
                            <div className="text-sm text-gray-500 truncate">
                                {chat.messages[chat.messages.length - 1]?.text || 'Нет сообщений'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Окно переписки */}
            <div className="flex-1 flex flex-col">
                {activeChat ? (
                    <>
                        <div className="p-4 bg-white border-b font-bold">
                            Чат с {activeChat.chatId}
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2">
                            {activeChat.messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`max-w-[70%] p-3 rounded-lg ${msg.isOutgoing
                                        ? 'bg-green-500 text-white self-end'
                                        : 'bg-white self-start'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            ))}
                        </div>
                        {error && <div className="p-2 text-red-500 text-sm text-center">{error}</div>}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t flex gap-2">
                            <input
                                type="text"
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder="Введите сообщение..."
                                className="flex-1 p-2 border rounded"
                            />
                            <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded">
                                Отправить
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Выберите чат или создайте новый
                    </div>
                )}
            </div>
        </div>
    );
};