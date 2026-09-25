import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { checkAccount, sendMessage } from '../api/greenApi';
import { usePolling } from '../hooks/usePolling';

export const ChatWindow = () => {
    const credentials = useAuthStore((state) => state.credentials)!;
    const logout = useAuthStore((state) => state.logout);
    const { chats, activeChatId, addChat, setActiveChat, addMessage, clearChats, removeChat } = useChatStore();
    usePolling();

    const [newPhone, setNewPhone] = useState('');
    const [messageText, setMessageText] = useState('');
    const [error, setError] = useState<string | null>(null);

    const activeChat = activeChatId ? chats[activeChatId] : null;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeChat?.messages]);

    const handleCreateChat = (e: React.FormEvent) => {
        e.preventDefault();
        const cleanPhone = newPhone.replace(/\D/g, '');
        if (!cleanPhone) return;
        addChat(cleanPhone, cleanPhone);
        setNewPhone('');
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeChatId || !messageText.trim()) return;
        const text = messageText.trim();
        setMessageText('');
        setError(null);

        try {
            let targetChatId = activeChatId;
            if (isNaN(Number(activeChatId))) {
                const cleanPhone = activeChatId.replace(/\D/g, '');
                if (cleanPhone.length >= 11) {
                    const accountInfo = await checkAccount(credentials, Number(cleanPhone));
                    if (!accountInfo.exist) {
                        throw new Error('Аккаунт MAX не найден для этого номера');
                    }
                    targetChatId = accountInfo.chatId;
                }
            }
            await sendMessage(credentials, { chatId: targetChatId, message: text });
            addMessage(activeChatId, {
                id: Date.now().toString(),
                text,
                isOutgoing: true,
                timestamp: Date.now(),
            });
        } catch (err: any) {
            setError('Не удалось отправить. Проверьте номер.');
            setMessageText(text);
        }
    };

    const handleLogout = () => {
        logout();
        clearChats();
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Сайдбар */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
                <div className="p-4 bg-green-600 text-white flex justify-between items-center shadow-md">
                    <h2 className="font-bold text-lg">GREEN-API MAX</h2>
                    <button onClick={handleLogout} className="text-sm bg-green-700 px-3 py-1 rounded hover:bg-green-800 transition">
                        Выйти
                    </button>
                </div>

                <div className="p-4 border-b bg-gray-50">
                    <form onSubmit={handleCreateChat} className="flex gap-2">
                        <input
                            type="text"
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            placeholder="Номер получателя"
                            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500"
                        />
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition">
                            +
                        </button>
                    </form>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {Object.values(chats).map((chat) => (
                        <div
                            key={chat.chatId}
                            onClick={() => setActiveChat(chat.chatId)}
                            className={`p-4 border-b cursor-pointer transition-colors ${activeChatId === chat.chatId ? 'bg-green-50 border-l-4 border-green-500' : 'hover:bg-gray-50'
                                }`}
                        >
                            <div className="font-semibold text-gray-800">{chat.contactName}</div>
                            <div className="text-sm text-gray-500 truncate mt-1">
                                {chat.messages[chat.messages.length - 1]?.text || 'Нет сообщений'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Окно переписки */}
            <div className="flex-1 flex flex-col bg-[#e5ddd5]">
                {activeChat ? (
                    <>
                        <div className="p-4 bg-white border-b shadow-sm z-10 flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full mr-3 flex items-center justify-center font-bold">
                                    {activeChat.contactName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-800">{activeChat.contactName}</div>
                                    <div className="text-xs text-green-600">онлайн</div>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (window.confirm('Удалить этот чат?')) {
                                        removeChat(activeChat.chatId);
                                    }
                                }}
                                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
                                title="Удалить чат"
                            >
                                🗑️
                            </button>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                            {activeChat.messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${msg.isOutgoing
                                        ? 'bg-green-500 text-white self-end rounded-br-none'
                                        : 'bg-white text-gray-800 self-start rounded-bl-none'
                                        }`}
                                >
                                    <div className="text-sm break-words">{msg.text}</div>
                                    <div className={`text-[10px] mt-1 text-right ${msg.isOutgoing ? 'text-green-100' : 'text-gray-400'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {error && <div className="p-2 text-red-500 text-sm text-center bg-red-50">{error}</div>}

                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t flex gap-3">
                            <input
                                type="text"
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder="Введите сообщение..."
                                className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:border-green-500 bg-gray-50"
                            />
                            <button type="submit" className="px-6 py-3 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition shadow-md">
                                ➤
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 flex-col">
                        <div className="text-6xl mb-4">💬</div>
                        <div className="text-xl">Выберите чат или создайте новый</div>
                    </div>
                )}
            </div>
        </div>
    );
};