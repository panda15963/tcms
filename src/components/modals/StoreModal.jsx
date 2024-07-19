import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { MdClose } from 'react-icons/md';
import StoreTable from '../tables/StoreTable';
import { GoogleSearch } from '../searchResults/GoogleSearch';
import { TMapSearch } from '../searchResults/TMapSearch';
import { RoutoSearch } from '../searchResults/RoutoSearch';

const StoreModal = forwardRef(
  (
    {
      enters: pressedEnter,
      values: bringValue,
      onDataReceiveBack,
      chosenMapAPIs,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [searches, setSearches] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
      if (pressedEnter === 'Enter' && chosenMapAPIs && chosenMapAPIs.name) {
        setSearchQuery(bringValue);
        handleSearch(bringValue, chosenMapAPIs.name);
      }
    }, [pressedEnter, bringValue, chosenMapAPIs]);

    const handleSearch = async (query, apiName) => {
      if (query && apiName) {
        let results = [];
        switch (apiName) {
          case 'GOOGLE':
            results = await GoogleSearch(query);
            break;
          case 'TMAP':
            results = await TMapSearch(query);
            break;
          case 'ROUTO':
            results = await RoutoSearch(query);
            break;
        }
        setSearches(results);
      }
    };

    const handleEnter = (event) => {
      if (event.key === 'Enter' && chosenMapAPIs && chosenMapAPIs.name) {
        handleSearch(bringValue, chosenMapAPIs.name);
      }
    };

    const handleEvent = () => {
      if (
        (bringValue || searchQuery) !== '' &&
        chosenMapAPIs &&
        chosenMapAPIs.name
      ) {
        handleSearch(bringValue, chosenMapAPIs.name);
      }
    };

    const handleClosed = () => {
      setOpen(false);
    };

    useImperativeHandle(ref, () => ({
      show() {
        setOpen(true);
      },
      close() {
        setOpen(false);
      },
    }));

    return (
      <Transition show={open}>
        <Dialog className="relative z-50" onClose={() => handleClosed()}>
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
                    <MdClose
                      className="text-white font-semibold size-6"
                      size={16}
                      onClick={() => handleClosed()}
                    />
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
                          <input
                            type="text"
                            className="pl-4 border border-black text-black p-1 rounded-md"
                            placeholder="Search"
                            defaultValue={bringValue}
                            onKeyPress={handleEnter}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          <button
                            className="font-bold rounded w-24 justify-self-center p-1 border border-black ring-gray-400 hover:border-blue_ncs hover:text-blue_ncs hover:ring-blue_ncs"
                            onClick={handleEvent}
                          >
                            Search
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <StoreTable
                      stores={searches}
                      onDataReceive={(dataFromStoreTable) =>
                        onDataReceiveBack(dataFromStoreTable)
                      }
                    />
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  },
);

export default StoreModal;
