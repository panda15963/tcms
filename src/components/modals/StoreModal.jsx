import { forwardRef, useImperativeHandle, useState } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { MdClose } from 'react-icons/md';
import StoreTable from '../tables/StoreTable';

const StoreModal = forwardRef((_props, ref) => {
  const [open, setOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    show() {
      setOpen(true);
    },
  }));

  return (
    <Transition show={open}>
      <Dialog className="relative z-50" onClose={() => setOpen(false)}>
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

        <div className="fixed inset-0">
          <div className="flex min-h-full items-center justify-center text-center">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel className="relative rounded-lg shadow-xl bg-white">
                <div className="flex justify-between py-3 px-5 bg-blue_ncs rounded-t-lg">
                  <h1 className="font-semibold pl-3 text-white">지점 선택</h1>
                  <button
                    className="font-semibold"
                    onClick={() => setOpen(false)}
                  >
                    <MdClose className="text-white" size={16} />
                  </button>
                </div>
                <div className="p-5">
                  <div className="text-center">
                    <div className="mt-2">
                      <div className="grid grid-cols-3 px-4 items-center">
                        <DialogTitle
                          as="h3"
                          className="text-base font-semibold leading-6"
                        >
                          Search Name
                        </DialogTitle>
                        <input type="text" className="ring-1 ring-inset ring-gray-400 p-1 rounded-md" />
                        <button className="font-bold rounded w-24 justify-self-center p-1 border-0 ring-gray-400 ring-1 hover:text-blue_ncs hover:ring-blue_ncs">
                          Search
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <StoreTable />
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});

export default StoreModal;
