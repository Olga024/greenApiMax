import { create } from 'zustand';

export type Message = {
    id: string;
    text: string;
    isOutgoing: boolean;
    timestamp: number;
};

export type Chat = {
    chatId: string; // Номер телефона получателя, например "79999999999"
    messages: Message[];
};

type ChatState = {
    chats: Record<string, Chat>;
    activeChatId: string | null;
    addChat: (chatId: string) => void;
    setActiveChat: (chatId: string) => void;
    addMessage: (chatId: string, message: Message) => void;
};

export const useChatStore = create<ChatState>((set) => ({
    chats: {},
    activeChatId: null,
    addChat: (chatId) =>
        set((state) => ({
            chats: {
                ...state.chats,
                [chatId]: state.chats[chatId] || { chatId, messages: [] },
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
}));