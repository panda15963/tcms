import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Dialog, DialogPanel, Transition } from '@headlessui/react';
import { MdClose } from 'react-icons/md';
import { FaCheck } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import SpaceTable from '../tables/SpaceTable';
import logService from '../../service/logService';
import MapComponent from '../mapAssist/MapComponent';
import { useLocation } from 'react-router-dom';
import i18next from 'i18next';
import { FaDownload } from 'react-icons/fa6';
import useToast from '../../hooks/useToast';
import AlertMessage from '../alerts/AlertMessage';
import { nonAuthInstance } from '../../server/AxiosConfig';

// Helper function to round to 5 decimal places
const roundToFive = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? '' : num.toFixed(5);
};

/**
 * 공간 검색
 * http://localhost:3000/space/kr
 * http://localhost:3000/space/en
 */
const SpaceModal = forwardRef(
  ({ spaceFullCoords, selectedLists, isDirect }, ref) => {
    const { t, i18n } = useTranslation();
    const location = useLocation(); // 현재 경로 정보를 얻기 위한 useLocation 훅 사용
    const { showToast } = useToast();

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
    const [radius, setRadius] = useState(1000); // 기본 반경 1000m 설정
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
      console.log('🚀 ~ useEffect ~ isDirect:', isDirect);
      console.log('🚀 ~ useEffect ~ location:', location);
      if (isDirect) {
        const splittedPath = location.pathname.split('/');
        const selectedLang = splittedPath[2];
        console.log('🚀 ~ useEffect ~ selectedLang:', selectedLang);
        console.log('🚀 ~ useEffect ~ splittedPath:', splittedPath);
        if (selectedLang === 'kr') {
          i18next.changeLanguage('kor');
        } else {
          i18next.changeLanguage('eng');
        }
        setOpen(true);
      }
    }, []);

    const handleRadiusChange = (e) => {
      setRadius(Number(e.target.value)); // 슬라이더 값으로 반경 업데이트
    };

    useImperativeHandle(ref, () => ({
      show() {
        setOpen(true);
      },
    }));

    const handleRangeChange = (e) => {
      const value = parseInt(e.target.value, 10);
      setRangeValue(isNaN(value) ? '' : value); // Set to empty string if the input is invalid
    };

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

    const handleLatitudeChange = (e) => {
      setLatitude(e.target.value);
    };

    const handleLongitudeChange = (e) => {
      setLongitude(e.target.value);
    };

    const handleFocus = (setValue) => () => {
      setValue('');
    };

    const formatNumberWithCommas = (value) => {
      if (!value) return '';
      return parseInt(value, 10).toLocaleString();
    };

    const handleBlur = (value, setValue, originalValue) => () => {
      const num = parseFloat(value);
      if (value === '' || isNaN(num)) {
        setValue(originalValue);
      } else {
        setValue(roundToFive(value));
      }
    };

    /**
     * 찾기
     */
    const handleFindClick = () => {
      const condTmp = {
        group_id: -1,
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
        range: rangeValue === '' ? 100 : rangeValue,
      };

      // console.log('handleFindClick of condTmp ==>', condTmp);
      FIND_SPACE(condTmp);
    };

    /**
     * 찾기 API
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

    /**
     * 선택버튼 이벤트
     */
    const handleButtonClick = async () => {
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

        return null;
      };

      console.log('checkedLists ==>', checkedLists);

      const arrayFromList = findArray(checkedLists);
      console.log('arrayFromList ==>', arrayFromList.length);

      if (arrayFromList.length == 0) {
        // setShowAlert(true);
        console.log('1개이상 선택해 주세요.');
      } else if (arrayFromList && arrayFromList.length > 0) {
        const fileIds = arrayFromList.map((route) => route.file_id);
        const routeCoords = await SPACE_INTERPOLATION(fileIds);

        console.log('fileIds ==>', fileIds);
        console.log('routeCoords ==>', routeCoords);

        spaceFullCoords(routeCoords);
        console.log('arrayFromList ==>', arrayFromList);
        selectedLists(arrayFromList);

        setOpen(false);
      } else {
        console.error('No array found in list');
      }
    };

    /**
     * 다운로드
     */
    const handleSpaceDownload = async () => {
      const dataToDownload = checkedLists;
      console.log('dataToDownload', dataToDownload);

      for (const file of dataToDownload) {
        try {
          // sequence 0 = 로그파일
          const logResponse = await nonAuthInstance.get(
            `/download/logfile?meta_id=${file.meta_id}&sequence=0`,
            { responseType: 'blob' },
          );

          const logBlob = new Blob([logResponse.data]);
          const logUrl = window.URL.createObjectURL(logBlob);
          const logLink = document.createElement('a');

          console.log('logBlob', logBlob);
          console.log('logUrl', logUrl);
          console.log('logLink', logLink);

          logLink.href = logUrl;
          logLink.download = file.logPath.split('/').pop();
          document.body.appendChild(logLink);
          logLink.click();
          document.body.removeChild(logLink);
          window.URL.revokeObjectURL(logUrl);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.error(`Log file for meta_id ${file.meta_id} not found.`);
          } else {
            console.error(
              `Failed to download log file for meta_id ${file.meta_id}:`,
              error,
            );
          }
        }

        try {
          // sequence 1 = 이미지파일
          const imageResponse = await nonAuthInstance.get(
            `/download/logfile?meta_id=${file.meta_id}&sequence=1`,
            { responseType: 'blob' },
          );

          const imageBlob = new Blob([imageResponse.data]);
          const imageUrl = window.URL.createObjectURL(imageBlob);
          const imageLink = document.createElement('a');
          imageLink.href = imageUrl;
          imageLink.download = file.imagePath.split('/').pop();
          document.body.appendChild(imageLink);
          imageLink.click();
          document.body.removeChild(imageLink);
          window.URL.revokeObjectURL(imageUrl);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.error(`Image file for meta_id ${file.meta_id} not found.`);
          } else {
            console.error(
              `Failed to download image file for meta_id ${file.meta_id}:`,
              error,
            );
          }
        }
      }
    };

    return (
      <Transition show={open}>
        <Dialog onClose={() => setOpen(false)} className="relative z-50">
          {showAlert && (
            <AlertMessage
              message={t('SpaceModal.Alert')}
              onClose={() => setShowAlert(false)}
            />
          )}
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
                  {/* 모달 헤더 */}
                  {!isDirect && (
                    <div className="flex justify-between py-3 px-5 bg-blue-600 rounded-t-lg">
                      <h1 className="text-sm font-semibold text-white">
                        {/* 공간 검색 */}
                        {t('SpaceModal.ModalSearch')}
                      </h1>
                      <button
                        className="font-semibold"
                        onClick={() => setOpen(false)}
                      >
                        <MdClose className="text-white" size={16} />
                      </button>
                    </div>
                  )}

                  {/* Modal Content */}
                  <div className="p-2 mt-2">
                    <div className="flex justify-center items-center gap-4 mb-4">
                      <label className="text-xs font-semibold">
                        {/* 위도 */}
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
                      <label className="text-xs font-semibold">
                        {/* 경도 */}
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
                      <label className="text-xs font-semibold">
                        {/* 미터 */}
                        {t('SpaceModal.Meters')}
                      </label>
                      <button
                        className="text-base ml-2 px-3 py-1 bg-blue-500 text-white rounded"
                        onClick={handleFindClick}
                      >
                        {/* 찾기 */}
                        {t('SpaceModal.Find')}
                      </button>
                    </div>

                    <div className="pb-2">
                      <MapComponent radius={rangeValue} />
                    </div>

                    {/* Table Section */}
                    <SpaceTable
                      list={list}
                      onSelectionChange={setCheckedLists}
                    />

                    <div className="flex justify-end mt-3">
                      <button
                        onClick={
                          isDirect ? handleSpaceDownload : handleButtonClick
                        }
                        className="h-9 inline-flex items-center border-2 gap-x-2 px-3 py-2 font-semibold text-sm border-slate-300 rounded-md focus:ring-1 focus:border-sky-500 hover:border-sky-500 cursor-pointer"
                      >
                        {isDirect ? (
                          <>
                            <FaDownload
                              className="h-4 w-5 text-sky-500"
                              aria-hidden="true"
                            />
                            <span className="text-base text-sky-500 font-bold">
                              {/* 다운로드 */}
                              {t('SpaceModal.Download')}
                            </span>
                          </>
                        ) : (
                          <>
                            <FaCheck
                              className="h-4 w-5 text-sky-500"
                              aria-hidden="true"
                            />
                            <span className="text-base text-sky-500 font-bold">
                              {/* 선택 */}
                              {t('SpaceModal.Select')}
                            </span>
                          </>
                        )}
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
  },
);

export default SpaceModal;
