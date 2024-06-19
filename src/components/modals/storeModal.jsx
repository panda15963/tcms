import { forwardRef, useImperativeHandle, useState } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { MdClose } from 'react-icons/md';
import StoreTable from '../table/storeTable';

const StoreModal = forwardRef((props, ref) => {
  const [open, setOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    show() {
      console.log('Called show func inside modal');
      setOpen(true);
    },
  }));

  return (
    <Transition show={open}>
      <Dialog className="relative z-10" onClose={() => setOpen(false)}>
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
                <div className="flex justify-between pb-2">
                  <h1 className="font-semibold pl-3">지점 선택</h1>
                  <button
                    className="font-semibold pr-1"
                    onClick={() => setOpen(false)}
                  >
                    <MdClose size={24} />
                  </button>
                </div>
                <div className="w-full border-t border-gray-500" />
                <div>
                  <div className="text-center">
                    <div className="mt-2">
                      <div className="grid grid-cols-3 py-2 px-4 items-center">
                        <DialogTitle
                          as="h3"
                          className="text-base font-semibold leading-6 text-gray-900"
                        >
                          Search Name
                        </DialogTitle>
                        <input type="text" className="border-black border-2" />
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded w-24 justify-self-center p-1 border-2 border-blue-500 hover:border-blue-700">
                          Search
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='p-3'>
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
