import { useContext } from 'react';
import { DialogContext } from '../context/DialogProvider';

export const useDialog = () => {
  return useContext(DialogContext);
};
