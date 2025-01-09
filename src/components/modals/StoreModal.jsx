import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { MdClose } from 'react-icons/md';
import StoreTable from '../tables/mapTables/StoreTable';
import { GoogleSearch } from '../searchResults/GoogleSearch';
import { TMapSearch } from '../searchResults/TMapSearch';
import { RoutoSearch } from '../searchResults/RoutoSearch';
import { TomTomSearch } from '../searchResults/TomTomSearch';
import { BaiduSearch } from '../searchResults/BaiduSearch';
import { HereSearch } from '../searchResults/HereSearch';
import { useTranslation } from 'react-i18next';
import { FaSearch } from 'react-icons/fa';

const StoreModal = forwardRef(
  (
    {
      enters: pressedEnter, // Enter key state
      values: bringValue, // Search input value
      onDataReceiveBack, // Callback to parent
      chosenMapAPIs, // Selected map API
    },
    ref
  ) => {
    const [open, setOpen] = useState(false); // Modal open state
    const [searches, setSearches] = useState([]); // Search results
    const [searchQuery, setSearchQuery] = useState(''); // Search query
    const { t } = useTranslation(); // i18n hook for translations

    // Effect for handling Enter key
    useEffect(() => {
      if (pressedEnter === 'Enter' && chosenMapAPIs && chosenMapAPIs.name) {
        setSearchQuery(bringValue);
        handleSearch(bringValue, chosenMapAPIs.name);
      }
    }, [pressedEnter, bringValue, chosenMapAPIs]);

    // Search handler
    const handleSearch = async (query, apiName) => {
      if (query && apiName) {
        console.log("Searching with:", { query, apiName }); // Debug log
        let results = [];
        try {
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
            case 'TOMTOM':
              results = await TomTomSearch(query);
              break;
            case 'BAIDU':
              results = await BaiduSearch(query);
              break;
            case 'HERE':
              results = await HereSearch(query);
              break;
            default:
              console.error("Unknown API name:", apiName);
              return;
          }
          if (results.length === 0) {
            console.warn("No results found for query:", query);
          }
          setSearches(results); // Update search results
        } catch (error) {
          console.error("Search failed:", error);
        }
      } else {
        console.error("Invalid query or API name:", { query, apiName });
      }
    };

    // Handle Enter key
    const handleEnter = (event) => {
      if (event.key === 'Enter' && chosenMapAPIs && chosenMapAPIs.name) {
        handleSearch(searchQuery || bringValue, chosenMapAPIs.name);
      }
    };

    // Handle search button click
    const handleEvent = () => {
      if (
        (bringValue || searchQuery) !== '' &&
        chosenMapAPIs &&
        chosenMapAPIs.name
      ) {
        handleSearch(searchQuery || bringValue, chosenMapAPIs.name);
      }
    };

    // Handle table data selection
    const handleDataSelect = (dataFromStoreTable) => {
      let normalizedData = dataFromStoreTable;

      if (
        dataFromStoreTable.resultType === 'place' &&
        dataFromStoreTable.position
      ) {
        normalizedData = {
          name: dataFromStoreTable.title,
          latitude: dataFromStoreTable.position.lat,
          longitude: dataFromStoreTable.position.lng,
        };
      }
      onDataReceiveBack(normalizedData);
      setSearches([]); // Clear search results
      handleClosed(); // Close modal
    };

    // Close modal
    const handleClosed = () => {
      setOpen(false);
    };

    // Imperative handle for external control
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
                <DialogPanel
                  className="relative rounded-lg shadow-xl bg-white"
                  style={{ width: '800px' }}
                >
                  <div className="flex justify-between py-3 px-5 bg-blue-900 rounded-t-lg">
                    <h1 className="text-sm font-semibold text-white pt-0.5">
                      {t('StoreModal.ModalName')}
                    </h1>
                    <MdClose
                      className="text-white font-semibold size-6"
                      size={16}
                      onClick={() => handleClosed()}
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2 px-1 py-2">
                    <label className="text-sm ml-1 font-semibold text-slate-700 px-2">
                      {t('StoreModal.SearchName')}
                    </label>
                    <input
                      type="text"
                      className="pl-4 border border-black text-black p-1 rounded-md flex-grow max-w-md"
                      placeholder={t('Common.SearchPlaceholder')}
                      defaultValue={bringValue}
                      onKeyPress={handleEnter}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      className="h-9 inline-flex items-center border-2 gap-x-2 px-3 py-2 mr-1.5 font-semibold text-sm border-slate-300 rounded-md focus:ring-1 focus:border-sky-500 hover:border-sky-500 cursor-pointer"
                      onClick={handleEvent}
                    >
                      <FaSearch
                        className="h-4 w-5 text-blue-900"
                        aria-hidden="true"
                      />
                      <span className="text-sm text-blue-900 font-bold">
                        {t('Common.Search')}
                      </span>
                    </button>
                  </div>
                  <div className="p-3">
                    <StoreTable
                      stores={searches}
                      onDataReceive={handleDataSelect}
                    />
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  }
);

export default StoreModal;
