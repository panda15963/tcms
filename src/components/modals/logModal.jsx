import { forwardRef, useImperativeHandle, useState } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { MdClose } from 'react-icons/md';
import LogTable from '../table/logTable';

const LogModal = forwardRef((props, ref) => {
  const [open, setOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    show() {
      console.log('Called show func inside modal');
      setOpen(true);
    },
  }));

  return (
    <Transition show={open}>
      <Dialog className="relative" onClose={() => setOpen(false)}>
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75" />
        </TransitionChild>

        <div className="fixed inset-0 w-full">
          <div className="flex min-h-full items-center justify-center transition-opacity">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel className="relative rounded-lg shadow-xl bg-white">
                <div className="flex justify-between py-2">
                  <h1 className="font-semibold pl-3">로그 검색</h1>
                  <button
                    className="font-semibold pr-1"
                    onClick={() => setOpen(false)}
                  >
                    <MdClose size={24} />
                  </button>
                </div>
                <div className="w-full border-t border-gray-500" />
                <div className="p-5"></div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});

export default LogModal;
