import { useContext } from 'react';
import { ToastContext } from '../context/ToastProvider';

const useToast = () => useContext(ToastContext);

export default useToast;
