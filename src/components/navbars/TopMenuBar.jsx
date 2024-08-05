import { useRef, useState, useEffect } from 'react';
import { HiOutlineDocumentSearch } from 'react-icons/hi';
import { TbWorldLatitude, TbWorldLongitude } from 'react-icons/tb';
import { FaMagnifyingGlass, FaXmark, FaBars } from 'react-icons/fa6';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import LogModal from '../modals/LogModal';
import StoreModal from '../modals/StoreModal';
import MapAPIsLists from '../dropdowns/MapAPIsLists';
import MapCoordLists from '../dropdowns/MapCoordLists';
import GoogleCoords from '../displayCoords/GoogleCoords';
import TMapCoords from '../displayCoords/TMapCoords';
import RoutoCoords from '../displayCoords/RoutoCoords';
import TomTomCoords from '../displayCoords/TomTomCoords';
import BaiduCoords from '../displayCoords/BaiduCoords';
import { DECToMMS } from '../calculateCoords/convertsDEC/DECToMMS';
import { DECToDEC } from '../calculateCoords/convertsDEC/DECToDEC';
import { DECToDEG } from '../calculateCoords/convertsDEC/DECToDEG';
import { MMSToDEC } from '../calculateCoords/convertsMMS/MMSToDEC';
import { DEGToDEC } from '../calculateCoords/convertsDEG/DEGToDEC';
import Completion from '../alerts/Completion';
import Error from '../alerts/Error';

const TopMenuBar = () => {
  const [inputValue, setInputValue] = useState('');
  const [keyPressed, setKeyPressed] = useState('');
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [selectedAPI, setSelectedAPI] = useState(null);
  const [clickedCoords, setClickedCoords] = useState(null);
  const [selectedMapList, setSelectedMapList] = useState(null);
  const [convertedCoords, setConvertedCoords] = useState({ lat: '', lng: '' });
  const [success, setSuccess] = useState(false);
  const [successValue, setSuccessValue] = useState('');
  const [error, setError] = useState(false);
  const [errorValue, setErrorValue] = useState('');
  const [displayCoords, setDisplayCoords] = useState(null);

  const storeModalRef = useRef();
  const logModalRef = useRef();

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleKeyDown = (event) => {
    const reg = /[\{\}\[\]\/?,;:|\)*~!^\-_+<>@\#$%&\\\=\(\'\"]/g;
    if (
      event.key === 'Enter' &&
      event.target.value !== '' &&
      !reg.test(event.target.value)
    ) {
      storeModalRef.current.show();
      setKeyPressed(event.key);
    }
    if (event.key === 'Backspace') {
      setInputValue('');
    }
  };

  const handleDataReceiveBack = (store) => {
    if (store.latitude && store.longitude !== undefined) {
      setInputValue('');
      setSelectedCoords({
        lat: store.latitude,
        lng: store.longitude,
      });
      storeModalRef.current.close();
    } else {
      alert('지점을 선택하여 주십시오!');
    }
  };

  const handleChoosingMapAPIs = () => {
    switch (selectedAPI?.name) {
      case 'GOOGLE':
        return (
          <GoogleCoords
            selectedCoords={selectedCoords}
            googleLocation={setClickedCoords}
          />
        );
      case 'ROUTO':
        return (
          <RoutoCoords
            selectedCoords={selectedCoords}
            routoLocation={setClickedCoords}
          />
        );
      case 'TMAP':
        return (
          <TMapCoords
            selectedCoords={selectedCoords}
            tmapLocation={setClickedCoords}
          />
        );
      case 'TOMTOM':
        return (
          <TomTomCoords
            selectedCoords={selectedCoords}
            tomtomLocation={setClickedCoords}
          />
        );
      case 'BAIDU':
        return (
          <BaiduCoords
            selectedCoords={selectedCoords}
            baiduLocation={setClickedCoords}
          />
        );
      default:
        return null;
    }
  };

  const handleCoordsChange = (e) => {
    const { name, value } = e.target;
    setConvertedCoords((prevCoords) => ({
      ...prevCoords,
      [name]: value,
    }));
  };

  const handleCoordsClick = (e) => {
    const { name } = e.target;
    setConvertedCoords((prevCoords) => ({
      ...prevCoords,
      [name]: '',
    }));
  };

  const handleCopy = () => {
    if (convertedCoords.lat && convertedCoords.lng) {
      const coordsText = `위도(Latitude): ${convertedCoords.lat}, 경도(Longitude): ${convertedCoords.lng}`;
      navigator.clipboard
        .writeText(coordsText)
        .then(() => {
          setSuccessValue('클립보드에 복사되었습니다!');
          setSuccess(true);
          setTimeout(() => setSuccess(false), 5000);
        })
        .catch((err) => {
          console.error('복사하지 못한 텍스트: ', err, '!');
          setErrorValue(err.message || '텍스트를 복사하지 못 하였습니다!');
          setError(true);
          setTimeout(() => setError(false), 5000);
        });
    } else {
      setErrorValue('복사 할 좌표가 없습니다!');
      setError(true);
      setTimeout(() => setError(false), 5000);
    }
  };

  const parseDEGToDecimal = (degString) => {
    const parts = degString.split(' ');
    if (parts.length !== 3) {
      throw new Error('DEG 형식이 틀립니다. 제대로 된 형식을 입력하세요');
    }

    const degrees = parseFloat(parts[0]);
    const minutes = parseFloat(parts[1]);
    const seconds = parseFloat(parts[2]);

    if (isNaN(degrees) || isNaN(minutes) || isNaN(seconds)) {
      throw new Error('형식이 제대로 되어있지 않습니다.');
    }

    return degrees + (minutes / 60) + (seconds / 3600);
  };

  const handleSearch = () => {
    const lat = convertedCoords.lat;
    const lng = convertedCoords.lng;
    console.log(lat, lng, typeof(lat))
    let latitude = '위도(Latitude)';
    let longitude = '경도(Longitude)';

    let decError = '에서 소수점이 무조건 포함되어야 합니다';
    let mmsError = '는 무조건 숫자이여야 합니다';
    let degError = '에서는 띄어쓰기가 무조건 있어야 합니다';

    let latError = '';
    let lngError = '';

    if (!lat) {
      latError = `${latitude}이 비어있습니다.`;
    }
    if (!lng) {
      lngError = `${longitude}이 비어있습니다.`;
    }

    if (latError || lngError) {
      let combinedError = latError && lngError
        ? `위도와 경도에서 발생한 에러: ${latError} ${lngError}`
        : latError ? `위도에서 발생한 에러: ${latError}`
          : `경도에서 발생한 에러: ${lngError}`;
      setErrorValue(combinedError);
      setError(true);
      setTimeout(() => setError(false), 2000);
      return;
    }

    const isDecimal = (value) => !isNaN(value) && value.toString().includes('.');
    const isInteger = (value) => Number.isInteger(Number(value));
    const hasSpaces = (value) => typeof value === 'string' && value.split(' ').length > 1;

    let latSpaceError = false;
    let lngSpaceError = false;

    if (selectedMapList.name === 'DEC') {
      if (!isDecimal(lat)) {
        latError = `${latitude} ${decError}`;
      }
      if (!isDecimal(lng)) {
        lngError = `${longitude} ${decError}`;
      }
    } else if (selectedMapList.name === 'MMS') {
      if (!isInteger(lat)) {
        latError = `${latitude} ${mmsError}`;
      }
      if (!isInteger(lng)) {
        lngError = `${longitude} ${mmsError}`;
      }
    } else if (selectedMapList.name === 'DEG') {
      if (!hasSpaces(lat)) {
        latSpaceError = true;
      }
      if (!hasSpaces(lng)) {
        lngSpaceError = true;
      }
      if (latSpaceError && lngSpaceError) {
        latError = lngError = `${latitude}와 ${longitude}에서 ${degError}`;
      } else if (latSpaceError) {
        latError = `${latitude} ${degError}`;
      } else if (lngSpaceError) {
        lngError = `${longitude} ${degError}`;
      }
    }

    if (latError || lngError) {
      let combinedError = latError && lngError
        ? `위도와 경도에서 발생한 에러: ${latitude}와 ${lngError}.`
        : latError ? `위도에서 발생한 에러: ${latError}.`
          : `경도에서 발생한 에러: ${lngError}.`;
      setErrorValue(combinedError);
      setError(true);
      setTimeout(() => setError(false), 2000);
      return;
    }

    let latValue, lngValue;

    if (selectedMapList.name === 'DEG') {
      try {
        latValue = parseDEGToDecimal(lat);
        lngValue = parseDEGToDecimal(lng);
      } catch (error) {
        setErrorValue(error.message);
        setError(true);
        setTimeout(() => setError(false), 2000);
        return;
      }
    } else {
      latValue = parseFloat(lat);
      lngValue = parseFloat(lng);
    }

    const validLat = !isNaN(latValue);
    const validLng = !isNaN(lngValue);

    if (validLat && validLng) {
      const ranges = {
        ROUTO: {
          MMS: {
            minLat: 11520000,
            maxLat: 15480000,
            minLng: 44640000,
            maxLng: 47520000,
          },
          DEC: { minLat: 32.0, maxLat: 43.0, minLng: 123.0, maxLng: 132.0 },
          DEG: { minLat: 32, maxLat: 43, minLng: 123, maxLng: 132 },
        },
        TMAP: {
          MMS: {
            minLat: 11520000,
            maxLat: 14040000,
            minLng: 44640000,
            maxLng: 47520000,
          },
          DEC: { minLat: 32.0, maxLat: 39.0, minLng: 123.0, maxLng: 132.0 },
          DEG: { minLat: 32, maxLat: 39, minLng: 123, maxLng: 132 },
        },
      };

      const currentRanges = ranges[selectedAPI?.name]?.[selectedMapList?.name];

      if (
        currentRanges &&
        (latValue < currentRanges.minLat ||
          latValue > currentRanges.maxLat ||
          lngValue < currentRanges.minLng ||
          lngValue > currentRanges.maxLng)
      ) {
        setErrorValue('범위 밖으로 벗어났습니다.');
        setError(true);
        setTimeout(() => setError(false), 2000);
        return;
      }

      let result;
      if (selectedMapList.name === 'MMS') {
        result = MMSToDEC({ lat: latValue, lng: lngValue });
      } else if (selectedMapList.name === 'DEC') {
        result = DECToDEC({ lat: latValue, lng: lngValue });
      } else if (selectedMapList.name === 'DEG') {
        result = DEGToDEC({ lat: latValue, lng: lngValue });
      }

      setSelectedCoords(result);
      setDisplayCoords(result);
    } else {
      setErrorValue('입력한 좌표를 확인해 주십시오.');
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  useEffect(() => {
    if (!displayCoords) return;

    let result;
    switch (selectedMapList?.name) {
      case 'MMS':
        result = DECToMMS(displayCoords);
        break;
      case 'DEG':
        result = DECToDEG(displayCoords);
        break;
      case 'DEC':
        result = DECToDEC(displayCoords);
        break;
      default:
        result = null;
    }
    if (selectedMapList.name === 'DEC') {
      setConvertedCoords(displayCoords);
    } else {
      setConvertedCoords(result);
    }
  }, [selectedMapList, displayCoords]);


  useEffect(() => {
    setSelectedCoords(null);
  }, [selectedAPI]);

  useEffect(() => {
    if (!clickedCoords) return;

    let result;
    switch (selectedMapList?.name) {
      case 'MMS':
        result = DECToMMS(clickedCoords);
        break;
      case 'DEG':
        result = DECToDEG(clickedCoords);
        break;
      case 'DEC':
        result = DECToDEC(clickedCoords);
        break;
      default:
        result = null;
    }
    setConvertedCoords(result);
  }, [clickedCoords, selectedMapList]);

  return (
    <>
      {success && <Completion successfulMessage={successValue} />}
      {error && <Error errorMessage={errorValue} />}
      <Disclosure as="nav" className="bg-gray-800">
        {({ open }) => (
          <>
            <div className="mx-auto inset-x-0">
              <div className="flex h-16 justify-between">
                <div className="flex items-center lg:px-0">
                  <div className="hidden lg:ml-6 lg:block">
                    <div className="flex">
                      <label className="px-3 py-2 text-sm font-bold text-white">
                        지도 선택
                      </label>
                      <MapAPIsLists setSelectedAPI={setSelectedAPI} />
                      <label className="rounded-md pl-10 py-2 text-sm font-bold text-white px-3">
                        지점 검색
                      </label>
                      <div className="flex flex-1 justify-center lg:justify-end">
                        <div className="w-full max-w-lg lg:max-w-xs">
                          <label htmlFor="search" className="sr-only">
                            Search
                          </label>
                          <div className="inset-y-0 flex items-center px-2">
                            <input
                              type="text"
                              onChange={handleChange}
                              onKeyDown={handleKeyDown}
                              value={inputValue}
                              className="block w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-5 text-gray-500 sm:text-sm sm:leading-6 mr-2"
                              placeholder="Search"
                            />
                            <button
                              type="button"
                              onClick={() => storeModalRef.current.show()}
                              className="inset-y-5 px-3 flex items-center border-1 rounded-md p-2 bg-gray-700"
                            >
                              <FaMagnifyingGlass
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                      <StoreModal
                        ref={storeModalRef}
                        values={inputValue}
                        enters={keyPressed}
                        onDataReceiveBack={handleDataReceiveBack}
                        chosenMapAPIs={selectedAPI}
                      />
                      <div className="flex flex-1 justify-center lg:ml-3">
                        <label className="rounded-md px-3 py-2 text-sm font-bold text-white">
                          로그 검색
                        </label>
                        <button
                          type="button"
                          onClick={() => logModalRef.current.show()}
                          className="inset-y-5 px-3 flex items-center pr-3 border-1 rounded-md p-2 bg-gray-700"
                        >
                          <HiOutlineDocumentSearch
                            className="h-5 w-5 text-white"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                      <LogModal ref={logModalRef} />
                      <label className="rounded-md px-3 py-2 text-sm font-bold text-white pl-10">
                        입력 표출 좌표
                      </label>
                      <MapCoordLists chosenDisplayCoords={setSelectedMapList} />
                      <div className="flex flex-0 justify-center lg:ml-3 lg:justify-center">
                        <div className="w-full max-w-lg lg:max-w-xs">
                          <div className="relative">
                            <button
                              type="button"
                              className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
                            >
                              <TbWorldLatitude
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              />
                            </button>
                            <input
                              id="search"
                              name="lat"
                              className="block w-36 rounded-md border-0 bg-white py-1 pl-10 pr-3 text-black placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6"
                              placeholder="Latitude"
                              value={convertedCoords.lat}
                              onChange={handleCoordsChange}
                              onClick={handleCoordsClick}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-0 justify-center lg:ml-3 lg:justify-center">
                        <div className=" max-w-lg lg:max-w-xs">
                          <div className="relative">
                            <button
                              type="button"
                              className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
                            >
                              <TbWorldLongitude
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              />
                            </button>
                            <input
                              className="block w-36 rounded-md border-0 bg-white py-1 pl-10 pr-3 text-black placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6"
                              placeholder="Longitude"
                              name="lng"
                              value={convertedCoords.lng}
                              onChange={handleCoordsChange}
                              onClick={handleCoordsClick}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-0 justify-center lg:ml-3">
                        <button
                          type="button"
                          className="rounded bg-white px-2 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset"
                          onClick={handleSearch}
                        >
                          조회
                        </button>
                      </div>
                      <div className="flex flex-0 justify-center lg:ml-3">
                        <button
                          type="button"
                          className="rounded bg-white px-2 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset"
                          onClick={handleCopy}
                        >
                          복사
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center sm:hidden">
                  {/* Mobile menu button */}
                  <DisclosureButton className="relative inline-flex items-center justify-between rounded-md p-2 text-gray-400 right-2 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span className="absolute -inset-0.5" />
                    {open ? (
                      <FaXmark className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <FaBars className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </DisclosureButton>
                </div>
              </div>
            </div>
            <DisclosurePanel className="lg:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2">
                <label className="block rounded-md px-3 py-2 text-base font-medium text-white">
                  지도 선택
                </label>
                <MapAPIsLists setSelectedAPI={setSelectedAPI} />
                <label className="block rounded-md px-3 py-2 text-base font-medium text-white">
                  지점 검색
                </label>
                <div className="flex flex-1 justify-center lg:justify-end">
                  <div className="w-full max-w-lg lg:max-w-xs">
                    <label htmlFor="search" className="sr-only">
                      Search
                    </label>
                    <div className="inset-y-0 flex items-center px-2">
                      <input
                        type="text"
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        className="block w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-5 text-gray-500 sm:text-sm sm:leading-6 mr-2"
                        placeholder="Search"
                      />
                      <button
                        type="button"
                        onClick={() => storeModalRef.current.show()}
                        className="inset-y-5 px-3 flex items-center border-1 rounded-md p-2 bg-gray-700"
                      >
                        <FaMagnifyingGlass
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>
                </div>
                <label className="block rounded-md px-3 py-2 text-base font-medium text-white">
                  로그 검색
                </label>
                <button
                  type="button"
                  onClick={() => logModalRef.current.show()}
                  className="inset-y-5 px-3 flex items-center pr-3 border-1 rounded-md p-2 bg-gray-700"
                >
                  <HiOutlineDocumentSearch
                    className="h-5 w-5 text-white"
                    aria-hidden="true"
                  />
                </button>
                <label className="block rounded-md px-3 py-2 text-base font-medium text-white">
                  입력표출좌표
                </label>
                <MapCoordLists chosenDisplayCoords={setSelectedMapList} />
                <div className="flex flex-0 justify-center lg:ml-3">
                  <div className=" max-w-lg lg:max-w-xs">
                    <div className="relative py-1">
                      <button
                        type="button"
                        className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
                      >
                        <TbWorldLatitude
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </button>
                      <input
                        id="search"
                        name="lat"
                        className="block w-36 rounded-md border-0 bg-gray-700 py-1 pl-10 pr-3 text-black placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="Latitude"
                        value={convertedCoords.lat}
                        onChange={handleCoordsChange}
                        onClick={handleCoordsClick}
                      />
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
                      >
                        <TbWorldLongitude
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </button>
                      <input
                        className="block w-36 rounded-md border-0 bg-gray-700 py-1 pl-10 pr-3 text-black placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="Longitude"
                        name="lng"
                        value={convertedCoords.lng}
                        onChange={handleCoordsChange}
                        onClick={handleCoordsClick}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-0 justify-center lg:ml-3">
                  <button
                    type="button"
                    className="rounded bg-white px-2 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset"
                    onClick={handleSearch}
                  >
                    조회
                  </button>
                </div>
                <div className="flex flex-0 justify-center lg:ml-3">
                  <button
                    type="button"
                    className="rounded bg-white px-2 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset"
                    onClick={handleCopy}
                  >
                    복사
                  </button>
                </div>
              </div>
            </DisclosurePanel>
          </>
        )}
      </Disclosure>
      <div className="map-container">
        {selectedAPI && handleChoosingMapAPIs()}
      </div>
    </>
  );
};

export default TopMenuBar;
