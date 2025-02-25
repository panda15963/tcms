import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Dialog, DialogPanel, Transition } from '@headlessui/react';
import { MdClose } from 'react-icons/md';
import { FaCheck } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import SpaceTable from '../tables/mapTables/SpaceTable';
import MapLogService from '../../service/MapLogService';
import MapComponent from '../mapAssist/MapComponent';
import { useLocation } from 'react-router-dom';
import i18next from 'i18next';
import { FaDownload } from 'react-icons/fa6';
import Error from '../alerts/Error';
import { isEmpty } from 'lodash';
import { axiosInstance } from '../../../server/axios_config';

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
  ({ spaceFullCoords, selectedLists, isDirect, selectedCoords }, ref) => {
    const { t, i18n } = useTranslation();

    const location = useLocation(); // 현재 경로 정보를 얻기 위한 useLocation 훅 사용
    const [error, setError] = useState(false);
    const [errorValue, setErrorValue] = useState('');
    const [open, setOpen] = useState(false);
    const [latitude, setLatitude] = useState(37.5665);
    const [longitude, setLongitude] = useState(126.978);
    const [rangeValue, setRangeValue] = useState(100); // Initialize rangeValue state
    const [list, setList] = useState([]); // Initialize list state
    const [checkedLists, setCheckedLists] = useState([]);
    const [radius, setRadius] = useState(1000); // 기본 반경 1000m 설정
    const [showAlert, setShowAlert] = useState(false);
    const [listCount, setListCount] = useState(0); // 검색 결과 개수

    useEffect(() => {
      if (selectedCoords) {
        setLatitude(selectedCoords.lat || 37.5665); // 값이 없으면 기본값 유지
        setLongitude(selectedCoords.lng || 126.978); // 값이 없으면 기본값 유지
      }
    }, [selectedCoords]);

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

    /**
     * ESC KEY 입력 시 모달 창 안닫히게
     */
    useEffect(() => {
      const handleKeyDown = (event) => {
        // ESC 키(키 코드 27)를 무시하도록 설정
        if (event.key === 'Escape') {
          event.stopPropagation();
        }
      };

      // keydown 이벤트 리스너 추가
      document.addEventListener('keydown', handleKeyDown);

      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
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

    // 지도에서 클릭한 위치의 좌표를 입력 필드에 반영하는 함수
    const handleMapClick = ({ latitude, longitude }) => {
      setLatitude(latitude.toFixed(5));
      setLongitude(longitude.toFixed(5));
    };

    /**
     * 미터 입력 인풋박스 제어
     */
    const handleTextChange = (e) => {
      let value = e.target.value.replace(/,/g, ''); // Remove commas
      value = parseInt(value, 10);

      if (value === '') {
        setRangeValue(''); // Allow the text input to be cleared
      } else {
        const numericValue = parseInt(value, 10);
        if (!isNaN(numericValue)) {
          // Set range to 100 if value exceeds 100
          setRangeValue(numericValue > 10000 ? 10000 : numericValue);
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

    useEffect(() => {
      console.log('useEffect LIST ==>', list);
      // setList((prevState) => ({
      //   ...prevState,
      //   list.list: [],
      // }));
    }, [list]);

    /**
     * 찾기 API
     */
    const FIND_SPACE = async (inputCond) => {
      try {
        const res = await MapLogService.FIND_SPACE({
          cond: inputCond,
        });
        console.log('FIND_SPACE of res ==>', res.findMeta);
        if (res.findMeta && res.findMeta.length > 0) {
          setList((prevState) => ({
            ...prevState,
            list: res.findMeta,
          }));
          setListCount(res.findMeta.length);
        } else {
          console.log('No data found');
          setList([]);
          setListCount(0);
        }
      } catch (e) {
        console.log('FIND_SPACE of error ==>', e);
        setList([]);
        setListCount(0);
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
          return MapLogService.SPACE_INTERPOLATION({
            cond: { file_id: fileId },
          }).then((res) => {
            try {
              // Check if `res` is a string before applying `replace()`
              if (typeof res === 'string') {
                const preprocessedRes = res.replace(
                  /Coord\(lat=([\d.-]+),\s*lng=([\d.-]+)\)/g,
                  '{"lat":$1,"lng":$2}'
                );
                return JSON.parse(preprocessedRes); // Parse the preprocessed string into JSON
              } else {
                console.warn('Response is not a string:', res);
                return res; // If it's an object, return it as is
              }
            } catch (error) {
              console.error(
                `Error parsing response for fileId ${fileId}:`,
                error
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

      if (isEmpty(checkedLists)) {
        // 아무것도 선택되지 않았습니다.
        setErrorValue(`${t('SpaceModal.Alert1')}`);
        setError(true);
        setTimeout(() => setError(false), 3000);
      }

      const arrayFromList = findArray(checkedLists);

      // console.log('checkedLists ==>', checkedLists);
      // console.log('arrayFromList ==>', arrayFromList.length);

      if (arrayFromList && arrayFromList.length > 0) {
        const fileIds = arrayFromList.map((route) => route.file_id);
        const routeCoords = await SPACE_INTERPOLATION(fileIds);

        // console.log('fileIds ==>', fileIds);
        // console.log('routeCoords ==>', routeCoords);

        spaceFullCoords(routeCoords);
        selectedLists(arrayFromList);

        setList([]);
        setOpen(false);
        setLatitude(37.5665);
        setLongitude(126.978);
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

      // JSON 파일 다운로드 추가
      for (const item of dataToDownload) {
        try {
          // 각 item의 filename 속성에 따라 파일명 지정
          const filename = item.file_name
            ? `${item.file_name}.lowmeta`
            : 'dataToDownload.lowmeta';
          const jsonBlob = new Blob([JSON.stringify(item, null, 2)], {
            type: 'application/json',
          });
          const jsonUrl = window.URL.createObjectURL(jsonBlob);
          const jsonLink = document.createElement('a');

          jsonLink.href = jsonUrl;
          jsonLink.download = filename; // 지정된 파일명으로 다운로드
          document.body.appendChild(jsonLink);
          jsonLink.click();
          document.body.removeChild(jsonLink);
          window.URL.revokeObjectURL(jsonUrl);
        } catch (error) {
          console.error(
            `Failed to download JSON file for ${
              item.filename || 'dataToDownload'
            }:`,
            error
          );
        }
      }

      for (const file of dataToDownload) {
        try {
          // sequence 0 = 로그파일
          const logResponse = await axiosInstance.get(
            `/download/logfile?meta_id=${file.meta_id}&sequence=0`,
            { responseType: 'blob' }
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
              error
            );
          }
        }

        try {
          // sequence 1 = 이미지파일
          const imageResponse = await axiosInstance.get(
            `/download/logfile?meta_id=${file.meta_id}&sequence=1`,
            { responseType: 'blob' }
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
              error
            );
          }
        }
      }
    };

    return (
      <Transition show={open}>
        {error && <Error errorMessage={errorValue} />}

        <Dialog
          onClose={() => {
            setOpen(false);
            setList([]);
            setRangeValue(100);
            setLatitude(37.5665);
            setLongitude(126.978);
          }}
          className="relative z-40"
        >
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
                <DialogPanel className="relative rounded-lg bg-white p-0 shadow-xl text-left transition-all sm:max-w-screen-xl w-[1324px]">
                  {!isDirect && (
                    <div className="flex justify-between py-3 px-5 bg-blue-600 rounded-t-lg">
                      <h1 className="text-sm font-semibold text-white">
                        {t('SpaceModal.ModalSearch')}
                      </h1>
                      <button
                        className="font-semibold"
                        onClick={() => {
                          setOpen(false);
                          setList([]);
                          setRangeValue(100);
                          setLatitude(37.5665);
                          setLongitude(126.978);
                        }}
                      >
                        <MdClose className="text-white" size={16} />
                      </button>
                    </div>
                  )}

                  {/* Main Layout */}
                  <div className="flex gap-4 p-3">
                    {' '}
                    {/* flex-wrap 제거 */}
                    {/* Left Section */}
                    <div className="flex flex-col gap-1.5 w-1/3 border-r pr-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold flex-shrink-0 mr-2">
                          {/* 위도 */}
                          {t('SpaceModal.Lat')}
                        </label>
                        <input
                          type="text"
                          className="border p-1 rounded w-full text-center"
                          value={selectedCoords?.lat || latitude}
                          onChange={handleLatitudeChange}
                          onFocus={handleFocus(setLatitude)}
                          onBlur={handleBlur(
                            latitude,
                            setLatitude,
                            roundToFive(process.env.REACT_APP_LATITUDE)
                          )}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold flex-shrink-0 mr-2">
                          {/* 경도 */}
                          {t('SpaceModal.Lon')}
                        </label>
                        <input
                          type="text"
                          className="border p-1 rounded w-full text-center"
                          value={selectedCoords?.lng || longitude}
                          onChange={handleLongitudeChange}
                          onFocus={handleFocus(setLongitude)}
                          onBlur={handleBlur(
                            longitude,
                            setLongitude,
                            roundToFive(process.env.REACT_APP_LATITUDE)
                          )}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold flex-shrink-0 mr-2">
                          {/* 미터 */}
                          {t('SpaceModal.Meters')}
                        </label>
                        <input
                          type="range"
                          className="flex-grow" // 슬라이더 너비를 유연하게 설정
                          min="100"
                          max="10000"
                          value={rangeValue}
                          onChange={handleRangeChange}
                        />
                        <input
                          type="text"
                          className="border p-1 rounded w-20 text-center" // 적절히 너비 제한
                          value={formatNumberWithCommas(rangeValue)}
                          onChange={handleTextChange}
                          placeholder="100"
                        />
                      </div>
                      {/* 찾기 버튼과 결과 개수 */}
                      <div className="flex items-center justify-start mt-1">
                        <button
                          className="text-base w-[100px] py-1 bg-blue-500 text-white rounded"
                          onClick={handleFindClick}
                        >
                          {t('SpaceModal.Find')}
                        </button>
                        <span className="text-sm ml-4 text-gray-600">
                          {t('LogModal.TotalResults')}: {listCount}
                        </span>
                      </div>
                    </div>
                    {/* Right Section for Map */}
                    <div className="w-2/3 ">
                      <MapComponent
                        latitude={latitude}
                        longitude={longitude}
                        radius={rangeValue}
                        onMapClick={handleMapClick}
                      />
                    </div>
                  </div>

                  {/* Bottom Section for Table */}
                  <div className="pr-3 pl-3 pb-2">
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
                              className="h-4 w-5 text-blue-900"
                              aria-hidden="true"
                            />
                            <span className="text-base text-blue-900 font-bold">
                              {/* 다운로드 */}
                              {t('SpaceModal.Download')}
                            </span>
                          </>
                        ) : (
                          <>
                            <FaCheck
                              className="h-4 w-5 text-blue-900"
                              aria-hidden="true"
                            />
                            <span className="text-base text-blue-900 font-bold">
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
  }
);

export default SpaceModal;
