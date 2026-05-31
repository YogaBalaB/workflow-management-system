import { useAuth as useAuthFromContext } from '../context/AuthContext.jsx';

export const useAuth = () => {
  return useAuthFromContext();
};
