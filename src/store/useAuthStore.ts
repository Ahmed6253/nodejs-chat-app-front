import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

interface AuthStore {
  authUser: Object | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  checkAuth: () => void;
  signup: (data: any) => void;
  logout: () => void;
  login: (data: any) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  authUser: null,

  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,

  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
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
    } catch (error: any) {
      set({ authUser: null });
      toast.error(error.response.data.message || "Something went wrong");
    } finally {
      set({ isSigningUp: false });
    }
  },
  logout: () => {
    try {
      axiosInstance.delete("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
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
    } catch (error: any) {
      set({ authUser: null });
      toast.error(error.response.data.message || "Something went wrong");
    } finally {
      set({ isLoggingIn: false });
    }
  },
}));
