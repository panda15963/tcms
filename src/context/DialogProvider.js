import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { createContext, useCallback, useState } from 'react';

export const DialogContext = createContext();

export const DialogTypes = {
  REQUEST: 'request',
  SUCCESS: 'success',
  DELETE: 'delete',
};

const initialDialogContent = {
  type: '',
  title: '',
  content: '',
};

export const DialogProvider = ({ children }) => {
  const [isOpen, setOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState(initialDialogContent);
  const [onConfirm, setOnConfirm] = useState(null);

  const showDialog = useCallback((type, title, content, confirmCallback) => {
    // console.log("CALLED showDialog ==> ");
    // console.log("CALLED showDialog ==> ", type);
    // console.log("CALLED showDialog ==> ", title);
    // console.log("CALLED showDialog ==> ", content);

    setDialogContent((preVal) => {
      return {
        ...preVal,
        type: type,
        title: title,
        content: content,
      };
    });
    setOnConfirm(() => confirmCallback);
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setOnConfirm(null);
    setDialogContent(initialDialogContent);
  }, []);

  return (
    <DialogContext.Provider
      value={{ isOpen, showDialog, closeDialog, dialogContent, onConfirm }}
    >
      {children}
    </DialogContext.Provider>
  );
};
