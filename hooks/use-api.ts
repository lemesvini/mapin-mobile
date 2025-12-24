import { authService } from "@/services/auth.service";
import { pinService } from "@/services/pin.service";
import { userService } from "@/services/user.service";
import { setAuthToken } from "@/services/api";

/**
 * Custom hook to access all API services
 * Provides a centralized way to access API methods throughout the app
 */
export const useApi = () => {
  return {
    auth: authService,
    pins: pinService,
    users: userService,
    setAuthToken,
  };
};

