import { forwardRef, useImperativeHandle, useState } from 'react';
import { Dialog, DialogPanel, Transition } from '@headlessui/react';
import { MdClose } from 'react-icons/md';
import { FaCheck } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import SpaceTable from '../tables/SpaceTable';
import logService from '../../service/logService';

// Helper function to round to 5 decimal places
const roundToFive = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? '' : num.toFixed(5);
};

const SpaceModal = forwardRef(({ spaceFullCoords, selectedLists }, ref) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [latitude, setLatitude] = useState(
    roundToFive(process.env.REACT_APP_LATITUDE),
  );
  const [longitude, setLongitude] = useState(
    roundToFive(process.env.REACT_APP_LONGITUDE),
  );
  const [rangeValue, setRangeValue] = useState(100); // Initialize rangeValue state
  const [list, setList] = useState([]); // Initialize list state
  const [checkedLists, setCheckedLists] = useState([]);

  // Use useImperativeHandle to allow parent component to call show() to open the modal
  useImperativeHandle(ref, () => ({
    show() {
      setOpen(true);
    },
  }));

  // Handler for range input change
  const handleRangeChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setRangeValue(isNaN(value) ? '' : value); // Set to empty string if the input is invalid
  };

  // Handler for text input change
  const handleTextChange = (e) => {
    const value = e.target.value.replace(/,/g, ''); // Remove commas
    if (value === '') {
      setRangeValue(''); // Allow the text input to be cleared and set range to far left
    } else {
      const numericValue = parseInt(value, 10);
      if (!isNaN(numericValue)) {
        setRangeValue(numericValue);
      }
    }
  };

  // Handler for latitude input change
  const handleLatitudeChange = (e) => {
    setLatitude(e.target.value);
  };

  // Handler for longitude input change
  const handleLongitudeChange = (e) => {
    setLongitude(e.target.value);
  };

  // Handler for focus event to clear the input field
  const handleFocus = (setValue) => () => {
    setValue('');
  };

  // Helper function to format numbers with commas
  const formatNumberWithCommas = (value) => {
    if (!value) return '';
    return parseInt(value, 10).toLocaleString();
  };

  // Modified handler for blur event to retain current input if valid
  const handleBlur = (value, setValue, originalValue) => () => {
    const num = parseFloat(value);
    if (value === '' || isNaN(num)) {
      setValue(originalValue);
    } else {
      setValue(roundToFive(value)); // Update with the rounded value
    }
  };

  // Handler for "Find" button click
  const handleFindClick = () => {
    const condTmp = {
      group_id: -1,
      lat: parseFloat(latitude),
      lng: parseFloat(longitude),
      range: rangeValue === '' ? 100 : rangeValue, // Use the conditional expression here
    };

    FIND_SPACE(condTmp);
  };

  /**
   * FIND SPACE API
   */
  const FIND_SPACE = async (inputCond) => {
    try {
      const res = await logService.FIND_SPACE({
        cond: inputCond,
      });

      console.log('FIND_SPACE of res ==>', res.findMeta);

      if (res.findMeta) {
        setList((prevState) => ({
          ...prevState,
          list: res.findMeta,
        }));
      } else {
        console.log('No data found');
      }
    } catch (e) {
      console.log('FIND_SPACE of error ==>', e);
    }
  };

  /**
   * SPACE_INTERPOLATION
   */
  const SPACE_INTERPOLATION = async (fileIds) => {
    try {
      if (!Array.isArray(fileIds)) {
        fileIds = [fileIds]; // Convert single fileId to array
      }

      const promises = fileIds.map((fileId) => {
        return logService
          .SPACE_INTERPOLATION({
            cond: { file_id: fileId },
          })
          .then((res) => {
            try {
              // Check if `res` is a string before applying `replace()`
              if (typeof res === 'string') {
                const preprocessedRes = res.replace(
                  /Coord\(lat=([\d.-]+),\s*lng=([\d.-]+)\)/g,
                  '{"lat":$1,"lng":$2}',
                );
                return JSON.parse(preprocessedRes); // Parse the preprocessed string into JSON
              } else {
                console.warn('Response is not a string:', res);
                return res; // If it's an object, return it as is
              }
            } catch (error) {
              console.error(
                `Error parsing response for fileId ${fileId}:`,
                error,
              );
              return null; // Return null if parsing fails
            }
          });
      });

      const results = await Promise.all(promises);
      return results.filter((res) => res !== null); // Filter out any null values
    } catch (e) {
      console.log('SPACE_INTERPOLATION error ==>', e);
    }
  };

  // Example function where list is expected to be an array
  const handleButtonClick = async () => {
    // A recursive function to find the first array within the object
    const findArray = (obj) => {
      if (Array.isArray(obj)) {
        return obj;
      }

      if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
          const foundArray = findArray(obj[key]);
          if (foundArray) {
            return foundArray;
          }
        }
      }

      return null; // No array found
    };

    // Find the array in the list object
    const arrayFromList = findArray(checkedLists);

    if (arrayFromList) {
      // Extract file_ids from the found array
      const fileIds = arrayFromList.map((route) => route.file_id);

      // Call SPACE_INTERPOLATION with the extracted fileIds
      const routeCoords = await SPACE_INTERPOLATION(fileIds);
      spaceFullCoords(routeCoords);
      console.log(arrayFromList);
      selectedLists(arrayFromList);
    } else {
      console.error('No array found in list');
    }

    // Close the modal
    setOpen(false);
  };

  return (
    <Transition show={open}>
      <Dialog onClose={() => setOpen(false)} className="relative z-50">
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel
                className="relative rounded-lg bg-white p-0 shadow-xl text-left transition-all sm:max-w-screen-xl"
                style={{ width: '1324px' }}
              >
                <div className="flex justify-between py-3 px-5 bg-blue-600 rounded-t-lg">
                  <h1 className="font-semibold text-white">
                    {t('SpaceModal.ModalSearch')}
                  </h1>
                  <button
                    className="font-semibold"
                    onClick={() => setOpen(false)}
                  >
                    <MdClose className="text-white" size={16} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-2 mt-2">
                  <div className="flex justify-center items-center gap-4 mb-4">
                    <label className="text-sm font-semibold">
                      {t('SpaceModal.Lat')}:
                    </label>
                    <div className="flex flex-col">
                      <input
                        type="text"
                        className="border p-1 rounded w-32"
                        value={latitude}
                        onChange={handleLatitudeChange}
                        onFocus={handleFocus(setLatitude)}
                        onBlur={handleBlur(
                          latitude,
                          setLatitude,
                          roundToFive(process.env.REACT_APP_LATITUDE),
                        )}
                      />
                    </div>
                    <label className="text-sm font-semibold">
                      {t('SpaceModal.Lon')}:
                    </label>
                    <div className="flex flex-col">
                      <input
                        type="text"
                        className="border p-1 rounded w-32"
                        value={longitude}
                        onChange={handleLongitudeChange}
                        onFocus={handleFocus(setLongitude)}
                        onBlur={handleBlur(
                          longitude,
                          setLongitude,
                          roundToFive(process.env.REACT_APP_LONGITUDE),
                        )}
                      />
                    </div>
                    <input
                      type="range"
                      className="w-40"
                      min="100"
                      max="10000"
                      value={rangeValue}
                      onChange={handleRangeChange}
                    />
                    <input
                      type="text"
                      className="border p-1 rounded w-16"
                      value={formatNumberWithCommas(rangeValue)}
                      onChange={handleTextChange}
                      placeholder="100"
                    />
                    <label className="text-sm font-semibold">
                      {t('SpaceModal.Meters')}
                    </label>
                    <button
                      className="ml-2 px-3 py-1 bg-blue-500 text-white rounded"
                      onClick={handleFindClick}
                    >
                      {t('SpaceModal.Find')}
                    </button>
                  </div>

                  {/* Table Section */}
                  <SpaceTable list={list} onSelectionChange={setCheckedLists} />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleButtonClick}
                      className="inline-flex items-center border-2 gap-x-2 px-3 py-2 font-semibold text-sm border-slate-300 rounded-md focus:ring-1 focus:border-sky-500 hover:border-sky-500 cursor-pointer"
                    >
                      <FaCheck
                        className="h-5 w-5 text-sky-500"
                        aria-hidden="true"
                      />
                      <span className="text-base text-sky-500 font-bold">
                        {t('SpaceModal.Select')}
                      </span>
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});

export default SpaceModal;
