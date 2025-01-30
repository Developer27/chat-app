import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  allMessages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isMessageDeleting: false,
  isEditingMessage: false,
  isStatusChanging: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  getAllMessages: async () => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages`);
      set({ allMessages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, allMessages } = get();

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
      set({ allMessages: [...allMessages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("NewMessage", (newMessage) => {
      const isMessageSentFormSelectedUser =
        newMessage.senderId === selectedUser._id;

      if (!isMessageSentFormSelectedUser) {
        return;
      } else {
        set({
          messages: [...get().messages, newMessage],
        });
      }
    });

    socket.on("MessageEdited", (editedMessage) => {
      console.log(editedMessage);

      const isMessageSentFormSelectedUser =
        editedMessage.senderId === selectedUser._id;

      if (!isMessageSentFormSelectedUser) {
        return;
      } else {
        get().messages.map((mess) => {
          if (mess._id === editedMessage.messageId) {
            mess.text = editedMessage.editedText;
            mess.isEdited = true;
          }
        });
        set({
          messages: [...get().messages],
        });
      }
    });

    socket.on("MessageDeleted", (data) => {
      const newMess = get().messages.filter(
        (element) => element._id !== data.messageId
      );
      set({ messages: newMess });
      const isMessageSentFormSelectedUser = data.senderId === selectedUser._id;

      if (!isMessageSentFormSelectedUser) {
        return;
      } else {
        set({
          messages: [...get().messages],
        });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("NewMessage");
    socket.off("MessageEdited");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  deleteMessage: async (data) => {
    const { messages, allMessages } = get();
    set({ isMessageDeleting: true });
    try {
      await axiosInstance.delete(`/messages/${data.messageId}`, data);

      const newMess = messages.filter(
        (element) => element._id !== data.messageId
      );
      const newMess1 = allMessages.filter(
        (element) => element._id !== data.messageId
      );
      set({ messages: newMess });
      set({ allMessages: newMess1 });
    } catch (error) {
      console.log(error);
    } finally {
      set({ isMessageDeleting: false });
    }
  },

  editMessage: async (messageId, editedData) => {
    const { messages, allMessages } = get();
    set({ isEditingMessage: true });
    try {
      await axiosInstance.post(`/messages/edit/${messageId}`, editedData);

      messages.forEach((mess) => {
        if (mess._id === messageId) {
          mess.text = editedData.editedText;
          mess.isEdited = true;
        }
      });
      allMessages.forEach((mess) => {
        if (mess._id === messageId) {
          mess.text = editedData.editedText;
          mess.isEdited = true;
        }
      });

      set({ messages: messages });
      set({ allMessages: allMessages });
    } catch (error) {
      console.log(error);
    } finally {
      set({ isEditingMessage: false });
    }
  },

  // updateSeenStatus: async (data) => {
  //   set({ isStatusChanging: true });
  //   try {
  //     let res;
  //     res = await axiosInstance.post("/messages/edit", data);
  //     // await axiosInstance.post("/messages/edit", data);
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     set({ isStatusChanging: false });
  //   }
  // },
}));
