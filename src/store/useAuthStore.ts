import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = "http://localhost:5001";


interface AuthStore {
  authUser: {
    _id: string;
    fullName: string;
    email: string;
    profilePic: string;
    createdAt: string;
  } | null;
  isSigningUp: boolean;
  socket: any;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  checkAuth: () => void;
  signup: (data: any) => void;
  logout: () => Promise<void>;
  login: (data: any) => void;
  updateProfile: (data: any) => void;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  authUser: null,
  socket: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data: any) => {
    try {
      set({ isSigningUp: true });
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error: any) {
      set({ authUser: null });
      toast.error(error.response.data.message || "Something went wrong");
    } finally {
      set({ isSigningUp: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.delete("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while logging out");
    }
  },
  login: async (data: any) => {
    try {
      set({ isLoggingIn: true });
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error: any) {
      set({ authUser: null });
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isLoggingIn: false });
    }
  },
  updateProfile: async (data: any) => {
    set({ isUpdatingProfile: true });

    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set((state) => ({
        authUser: state.authUser
          ? { ...state.authUser, profilePic: res.data }
          : null,
      }));
      toast.success("Profile updated successfully");
    } catch (error: any) {
      if (error.response?.status === 413) {
        return toast.error("Image size is too large");
      }
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isUpdatingProfile: false });
    }

  },
  connectSocket: ()=>{
    const {authUser} = get();
    if(!authUser?._id || get().socket?.connected) return;
    
    const socket = io(BASE_URL);
    socket.connect();
    set({ socket });

  },
  disconnectSocket: ()=>{
    const socket = get().socket;
    if(!socket.connected) return;
    socket.disconnect();
    set({ socket });
  }
}));
