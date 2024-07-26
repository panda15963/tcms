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
import { ConvertToMMS } from '../calculateCoords/MMS';
import { ConvertToDEC } from '../calculateCoords/DEC';
import { ConvertToDEG } from '../calculateCoords/DEG';
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
        lat: parseFloat(store.latitude),
        lng: parseFloat(store.longitude),
      });
      storeModalRef.current.close();
    } else {
      alert('지점을 선택하여 주십시오!');
    }
  };

  const handleChoosingMapAPIs = () => {
    switch (selectedAPI.name) {
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
          setTimeout(() => setSuccess(false), 2000);
        })
        .catch((err) => {
          console.error('Could not copy text: ', err, '!');
          setErrorValue(err.message || 'Error copying text!');
          setError(true);
          setTimeout(() => setError(false), 2000);
        });
    } else {
      setErrorValue('복사 할 좌표가 없습니다!');
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleSearch = (e) => {
    console.log(e.key)
    if (convertedCoords.lat && convertedCoords.lng) {
      let valid = false;
      let lat = parseFloat(convertedCoords.lat);
      let lng = parseFloat(convertedCoords.lng);

      if (
        selectedAPI &&
        (selectedAPI.name === 'ROUTO' || selectedAPI.name === 'TMAP')
      ) {
        if (selectedMapList.name === 'MMS') {
          const minLat = 11880000;
          const maxLat = selectedAPI.name === 'ROUTO' ? 15480000 : 14004000;
          const minLng = 44820000;
          const maxLng = 47520000;

          valid =
            minLat <= lat && lat <= maxLat && minLng <= lng && lng <= maxLng;
        } else if (selectedMapList.name === 'DEC') {
          const minLat = 33.0;
          const maxLat = selectedAPI.name === 'ROUTO' ? 43.0 : 38.9;
          const minLng = 124.5;
          const maxLng = 132.0;

          valid =
            minLat <= lat && lat <= maxLat && minLng <= lng && lng <= maxLng;
        } else if (selectedMapList.name === 'DEG') {
          const latPattern =
            selectedAPI.name === 'ROUTO'
              ? /^(33|34|35|36|37|38|39|40|41|42) [0-5]?[0-9] [0-5]?[0-9](\.\d+)?$/
              : /^(33|34|35|36|37|38) [0-5]?[0-9] [0-5]?[0-9](\.\d+)?$/;
          const lngPattern =
            /^(124|125|126|127|128|129|130|131) [0-5]?[0-9] [0-5]?[0-9](\.\d+)?$/;

          valid =
            latPattern.test(convertedCoords.lat) &&
            lngPattern.test(convertedCoords.lng);
        }

        if (valid) {
          setSelectedCoords({ lat, lng });
        } else {
          setErrorValue('잘못된 형식의 좌표입니다!');
          setError(true);
          setTimeout(() => setError(false), 2000);
        }
      } else {
        setSelectedCoords({
          lat: parseFloat(convertedCoords.lat),
          lng: parseFloat(convertedCoords.lng),
        });
        setSuccessValue('조회되었습니다!');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      }
    } else {
      setErrorValue('검색된 좌표가 없습니다!');
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  useEffect(() => {
    if (selectedCoords) {
      let result;
      switch (selectedMapList.name) {
        case 'MMS':
          result = ConvertToMMS(selectedCoords);
          break;
        case 'DEC':
          result = ConvertToDEC(selectedCoords);
          break;
        case 'DEG':
          result = ConvertToDEG(selectedCoords);
          break;
        default:
          result = { lat: '', lng: '' };
      }
      setConvertedCoords(result);
    }
  }, [selectedCoords, selectedMapList]);

  useEffect(() => {
    if (selectedCoords) {
      let result;
      switch (selectedMapList.name) {
        case 'MMS':
          result = ConvertToMMS(selectedCoords);
          break;
        case 'DEC':
          result = ConvertToDEC(selectedCoords);
          break;
        case 'DEG':
          result = ConvertToDEG(selectedCoords);
          break;
        default:
          result = { lat: '', lng: '' };
      }
      setConvertedCoords(result);
    }
  }, [selectedCoords, selectedMapList]);

  useEffect(() => {
    setSelectedCoords(null);
  }, [selectedAPI]);

  useEffect(() => {
    if (!clickedCoords || !selectedMapList) return;

    let result;
    switch (selectedMapList.name) {
      case 'MMS':
        result = ConvertToMMS(clickedCoords);
        break;
      case 'DEC':
        result = ConvertToDEC(clickedCoords);
        break;
      case 'DEG':
        result = ConvertToDEG(clickedCoords);
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
                <div className="flex items-center lg:px-0 ">
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
                    Search
                  </button>
                </div>
                <div className="flex flex-0 justify-center lg:ml-3">
                  <button
                    type="button"
                    className="rounded bg-white px-2 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset"
                    onClick={handleCopy}
                  >
                    Copy
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
