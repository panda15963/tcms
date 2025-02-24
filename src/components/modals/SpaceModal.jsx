import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Dialog, DialogPanel, Transition } from '@headlessui/react';
import { MdClose } from 'react-icons/md';
import { FaCheck, FaSearch } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import SpaceTable from '../tables/mapTables/SpaceTable';
import {
  SPACE_INTERPOLATION,
  FIND_SPACE,
} from '../../components/requestData/MapRequestData';
import MapComponent from '../mapAssist/MapComponent';
import { useLocation } from 'react-router-dom';
import i18next from 'i18next';
import { FaDownload } from 'react-icons/fa6';
import { isEmpty } from 'lodash';
import { axiosInstance } from '../../server/axios_config';
import { ToastContainer, toast, Bounce } from 'react-toastify'; // 토스트 알림 컴포넌트

/**
 * 공간 검색
 * 다운로드 가능 별도 모달 :
 *    http://localhost:3000/space/kr
 *    http://localhost:3000/space/en
 */
const SpaceModal = forwardRef(
  ({ spaceFullCoords, selectedLists, isDirect, selectedCoords }, ref) => {
    const { t } = useTranslation();
    const location = useLocation();
    const accessToken = localStorage.getItem('ACCESS_TOKEN');
    const [open, setOpen] = useState(false);
    const [latitude, setLatitude] = useState(37.5665);
    const [longitude, setLongitude] = useState(126.978);
    const [rangeValue, setRangeValue] = useState(100); // Initialize rangeValue state
    const [list, setList] = useState([]); // Initialize list state
    const [checkedLists, setCheckedLists] = useState([]);
    const [listCount, setListCount] = useState(0); // 검색 결과 개수

    useImperativeHandle(ref, () => ({
      show() {
        setOpen(true);
      },
    }));

    useEffect(() => {
      if (selectedCoords) {
        setLatitude(selectedCoords.lat || 37.5665);
        setLongitude(selectedCoords.lng || 126.978);
      }
    }, [selectedCoords]);

    useEffect(() => {
      console.log('🚀 ~ useEffect ~ isDirect:', isDirect);
      // console.log('🚀 ~ useEffect ~ location:', location);

      if (isDirect == true && accessToken) {
        const splittedPath = location.pathname.split('/');
        const selectedLang = splittedPath[2];
        console.log('🚀 ~ useEffect ~ selectedLang:', selectedLang);
        console.log('🚀 ~ useEffect ~ splittedPath:', splittedPath);
        if (selectedLang === 'kr' && accessToken) {
          i18next.changeLanguage('kor');
        } else if (selectedLang === 'en' && accessToken) {
          i18next.changeLanguage('eng');
        }
        setOpen(true);
      } else if (isEmpty(accessToken)) {
        if (window.confirm('권한이 없습니다. 창이 닫힙니다.')) {
          window.close();
        } else {
          console.log('사용자가 창 닫기를 취소했습니다.');
        }
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

    /**
     * 미터 인풋박스 onChange
     */
    const handleRangeChange = (e) => {
      const value = parseInt(e.target.value, 10);
      setRangeValue(isNaN(value) ? '' : value);
    };

    /**
     * 지도에서 클릭한 위치의 좌표를 입력 필드에 반영 핸들러
     */
    const handleMapClick = ({ latitude, longitude }) => {
      setLatitude(latitude.toFixed(5));
      setLongitude(longitude.toFixed(5));
    };

    /**
     * 미터 입력 인풋박스 제어
     */
    const handleTextChange = (e) => {
      let value = e.target.value.replace(/,/g, '');
      value = parseInt(value, 10);
      if (value === '') {
        setRangeValue('');
      } else {
        const numericValue = parseInt(value, 10);
        if (!isNaN(numericValue)) {
          // Set range to 100 if value exceeds 100
          setRangeValue(numericValue > 10000 ? 10000 : numericValue);
        }
      }
    };

    /**
     * 위도 인풋박스 onChange
     */
    const handleLatitudeChange = (e) => {
      setLatitude(e.target.value);
    };

    /**
     * 경도 인풋박스 onChange
     */
    const handleLongitudeChange = (e) => {
      setLongitude(e.target.value);
    };

    /**
     * 포커스 핸들러
     */
    const handleFocus = (setValue) => () => {
      setValue('');
    };

    /**
     *formatNumberWithCommas
     */
    const formatNumberWithCommas = (value) => {
      if (!value) return '';
      return parseInt(value, 10).toLocaleString();
    };

    /**
     *handleBlur
     */
    const handleBlur = (value, setValue, originalValue) => () => {
      const num = parseFloat(value);
      if (value === '' || isNaN(num)) {
        setValue(originalValue);
      } else {
        setValue(roundToFive(value));
      }
    };

    /**
     *roundToFive
     */
    const roundToFive = (value) => {
      const num = parseFloat(value);
      return isNaN(num) ? '' : num.toFixed(5);
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
      FIND_SPACE(condTmp)
        .then((res) => {
          setList((prevState) => ({
            ...prevState,
            list: res.list,
          }));
          setListCount(res.routeCount);
        })
        .catch((e) => {
          console.log('FIND_SPACE of error ==>', e);
        });
    };

    /**
     * 선택버튼 핸들러
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
        toast.error(`${t('SpaceModal.Alert1')}`);
      }

      const arrayFromList = findArray(checkedLists);

      if (arrayFromList && arrayFromList.length > 0) {
        const fileIds = arrayFromList.map((route) => route.file_id);
        const routeCoords = await SPACE_INTERPOLATION(fileIds);

        spaceFullCoords(routeCoords);
        selectedLists(arrayFromList);

        setList([]);
        setOpen(false);
        setLatitude(37.5665);
        setLongitude(126.978);
        setListCount(0);
        setRangeValue(100);
      } else {
        console.error('No array found in list');
      }
    };

    /**
     * 다운로드
     */
    const handleSpaceDownload = async () => {
      // JSON 파일 다운로드 추가
      for (const item of checkedLists) {
        try {
          const filename = item.file_name
            ? `${item.file_name}.lowmeta`
            : 'checkedLists.lowmeta';
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

          // 다운로드 간의 간격을 조정
          await new Promise((resolve) => setTimeout(resolve, 500)); // 100ms 대기
        } catch (error) {
          console.error(
            `Failed to download JSON file for ${
              item.filename || 'checkedLists'
            }:`,
            error
          );
        }
      }

      for (const file of checkedLists) {
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

          await new Promise((resolve) => setTimeout(resolve, 500));
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

          console.log('imageResponse ==>', imageResponse);

          const imageBlob = new Blob([imageResponse.data]);
          const imageUrl = window.URL.createObjectURL(imageBlob);
          const imageLink = document.createElement('a');

          console.log('imageUrl ==>', imageUrl);

          imageLink.href = imageUrl;
          imageLink.download = file.imagePath.split('/').pop();
          document.body.appendChild(imageLink);
          imageLink.click();
          document.body.removeChild(imageLink);
          window.URL.revokeObjectURL(imageUrl);

          await new Promise((resolve) => setTimeout(resolve, 500));
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
        <Dialog
          onClose={() => {
            setOpen(false);
            setList([]);
            setRangeValue(100);
            setLatitude(37.5665);
            setLongitude(126.978);
            setListCount(0);
          }}
          className="relative z-50"
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
            {/* <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0"> */}
            <div className="flex min-h-screen items-center justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <DialogPanel
                  className="relative rounded-lg bg-white shadow-xl text-left transition-all w-[1324px] h-[596px]"
                  static
                >
                  {!isDirect && (
                    <div className="flex justify-between py-3 px-5 bg-blue-900 rounded-t-lg">
                      <h1 className="text-sm font-semibold text-white">
                        {/* 공간 검색 */}
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
                          setListCount(0);
                        }}
                      >
                        <MdClose className="text-white" size={16} />
                      </button>
                    </div>
                  )}
                  {/* Main Layout */}
                  <div className="m-2 flex space-x-2">
                    {' '}
                    {/* flex-wrap 제거 */}
                    {/* Left Section */}
                    <div className="flex flex-col gap-1.5 w-1/3 border-r pr-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold flex-shrink-0 w-16 text-right mr-2">
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
                        <label className="text-xs font-semibold flex-shrink-0  w-16 text-right mr-2 ">
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
                        <label className="text-xs font-semibold flex-shrink-0 w-16 text-right mr-2">
                          {/* 미터 */}
                          {t('SpaceModal.Meters')}
                        </label>
                        <input
                          type="range"
                          className="flex-grow"
                          min="100"
                          max="10000"
                          value={rangeValue}
                          onChange={handleRangeChange}
                        />
                        <input
                          type="text"
                          className="border p-1 rounded w-20 text-center"
                          value={formatNumberWithCommas(rangeValue)}
                          onChange={handleTextChange}
                          placeholder="100"
                        />
                      </div>
                      {/* 찾기 버튼과 결과 개수 */}
                      <div className="flex items-center justify-start mt-1">
                        <button
                          className="h-9 inline-flex items-center border-2 gap-x-2 px-3 py-2 font-semibold text-sm border-slate-300 rounded-md focus:ring-1 focus:border-sky-500 hover:border-sky-500 cursor-pointer"
                          onClick={handleFindClick}
                        >
                          <FaSearch
                            className="h-4 w-5 text-blue-900"
                            aria-hidden="true"
                          />
                          <span className="text-sm text-blue-900 font-bold">
                            {/* 조회 */}
                            {t('SpaceModal.Find')}
                          </span>
                        </button>
                        <span className="text-sm ml-4 text-gray-600">
                          {/* 총 결과 */}
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
                  <div className="mt-0">
                    <div className="mr-2 ml-2 mb-2">
                      <SpaceTable
                        list={list}
                        onSelectionChange={setCheckedLists}
                        isDirect={isDirect}
                      />
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={
                            isDirect ? handleSpaceDownload : handleButtonClick
                          }
                          className="h-9 inline-flex items-center border-2 gap-x-2 px-3 py-2 font-semibold text-sm border-slate-300 rounded-md  focus:ring-1 focus:border-sky-500 hover:border-sky-500 cursor-pointer"
                        >
                          {isDirect ? (
                            <>
                              <FaDownload
                                className="h-4 w-5 text-blue-900"
                                aria-hidden="true"
                              />
                              <span className="text-sm text-blue-900 font-bold">
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
                              <span className="text-sm text-blue-900 font-bold">
                                {/* 선택 */}
                                {t('SpaceModal.Select')}
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </DialogPanel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
        <ToastContainer
          position="top-center"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={true}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          transition={Bounce}
        />
      </Transition>
    );
  }
);

export default SpaceModal;
