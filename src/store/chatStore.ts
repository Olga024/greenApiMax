import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Message = {
    id: string;
    text: string;
    isOutgoing: boolean;
    timestamp: number;
};

export type Chat = {
    chatId: string;
    contactName: string;
    messages: Message[];
};

type ChatState = {
    chats: Record<string, Chat>;
    activeChatId: string | null;
    addChat: (chatId: string, contactName?: string) => void;
    setActiveChat: (chatId: string) => void;
    addMessage: (chatId: string, message: Message) => void;
    clearChats: () => void;
    removeChat: (chatId: string) => void;
};

export const useChatStore = create<ChatState>()(
    persist(
        (set) => ({
            chats: {},
            activeChatId: null,
            addChat: (chatId, contactName) =>
                set((state) => ({
                    chats: {
                        ...state.chats,
                        [chatId]: state.chats[chatId] || {
                            chatId,
                            contactName: contactName || chatId,
                            messages: []
                        },
                    },
                    activeChatId: chatId,
                })),
            setActiveChat: (chatId) => set({ activeChatId: chatId }),
            addMessage: (chatId, message) =>
                set((state) => {
                    const chat = state.chats[chatId];
                    if (!chat) return state;
                    return {
                        chats: {
                            ...state.chats,
                            [chatId]: {
                                ...chat,
                                messages: [...chat.messages, message],
                            },
                        },
                    };
                }),
            removeChat: (chatId) =>
                set((state) => {
                    const newChats = { ...state.chats };
                    delete newChats[chatId];
                    return {
                        chats: newChats,
                        activeChatId: state.activeChatId === chatId ? null : state.activeChatId,
                    };
                }),
            clearChats: () => set({ chats: {}, activeChatId: null }),
        }),
        { name: 'green-api-chats' }
    )
);