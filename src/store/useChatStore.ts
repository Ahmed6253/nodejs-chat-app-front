import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

interface ChatStore {
  messages: any[];
  users: [];
  selectedUser: {
    _id: string;
    fullName: string;
    email: string;
    profilePic: string;
    createdAt: string;
  } | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  sendMessage: (messageData:  { text: string; image: string  }) => Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  getUsers: () => Promise<void>;
  setSelectedUser: (selectedUser: { _id: string } | null) => void;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,


  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId: string) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error : any) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData ) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser?._id}`,
        messageData,
      );
      set({ messages: [...messages, res.data] });
    } catch (error :any) {
      toast.error(error.response.data.message);
    }
  },

    subscribeToMessages: () => {
      const { selectedUser } : any = get();
      if (!selectedUser) return;

      const socket = useAuthStore.getState().socket;

      socket.on("newMessage", (newMessage : any ) => {
        const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
        if (!isMessageSentFromSelectedUser) return;

        set({
          messages: [...get().messages, {...newMessage, createdAt: new Date()}],
        });
      });
    },

    unsubscribeFromMessages: () => {
      const socket = useAuthStore.getState().socket;
      socket.off("newMessage");
    },

  setSelectedUser: (selectedUser : any | null) =>  set({ selectedUser } ),
}));
