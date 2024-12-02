import { useRef, useState, useEffect } from 'react';
import { HiOutlineDocumentSearch, HiOutlineRefresh } from 'react-icons/hi';
import { TbWorldLatitude, TbWorldLongitude } from 'react-icons/tb';
import { FaMagnifyingGlass, FaXmark, FaBars } from 'react-icons/fa6';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import LogModal from '../modals/LogModal';
import StoreModal from '../modals/StoreModal';
import SpaceModal from '../modals/SpaceModal';
import MapAPIsLists from '../dropdowns/mapMenus/MapAPIsLists';
import MapCoordLists from '../dropdowns/mapMenus/MapCoordLists';
import GoogleMapHandler from '../mapHandler/GoogleMapHandler';
import TMapHandler from '../mapHandler/TMapHandler';
import RoutoMapHandler from '../mapHandler/RoutoMapHandler';
import TomTomMapHandler from '../mapHandler/TomTomMapHandler';
import BaiduMapHandler from '../mapHandler/BaiduMapHandler';
import HereMapHandler from '../mapHandler/HereMapHandler';
import { DECToMMS, DECToDEC, DECToDEG } from '../calculateCoords/ConvertsDEC';
import { MMSToDEC } from '../calculateCoords/ConvertsMMS';
import { DEGToDEC } from '../calculateCoords/ConvertsDEG';
import { useTranslation } from 'react-i18next';
import Completion from '../alerts/Completion';
import Error from '../alerts/Error';
const TopMenuBar = ({
  checkedNodes,
  handleRouteData,
  clickedNode,
  setCurrentApi,
  handleSpaceData,
  routeColors = () => {},
}) => {
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
  const [origins, setOrigins] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [routeFullCoords, setRouteFullCoords] = useState(null);
  const [spaceFullCoords, setSpaceFullCoords] = useState(null);

  const storeModalRef = useRef();
  const logModalRef = useRef();
  const spaceModalRef = useRef();

  const { t } = useTranslation();

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
    }
  };

  useEffect(() => {
    if (selectedAPI) {
      // Reset states when a new API is selected
      setOrigins([]);
      setDestinations([]);
      setInputValue('');
      setSelectedCoords(null);
      setClickedCoords(null);
      setConvertedCoords({ lat: '', lng: '' });
      setDisplayCoords(null);

      // Reset routeFullCoords when the map changes
      setRouteFullCoords(null);
      setSpaceFullCoords(null);

      // Set the current API to the selected API
      setCurrentApi(selectedAPI);

      // Display success message
      setSuccessValue(
        `${t('TopMenuBar.SelectedAPI')}: ${selectedAPI.name.toUpperCase()}`
      );
    }
    setRouteFullCoords(null);
  }, [selectedAPI, setCurrentApi]);

  const mergeByFileId = (routeFullCoords, checkedNodes) => {
    if (!routeFullCoords || !checkedNodes) return [];

    const mergedData = routeFullCoords.map((route) => {
      const matchedNode = checkedNodes.find(
        (node) => node.file_id === route.file_id
      );

      return {
        ...route,
        ...(matchedNode || {}), // Merge matchedNode's data
      };
    });

    // Filter only the data where country_str is "KOR" or "SAU"
    const filteredByCountry = mergedData.filter(
      (data) => data.country_str === 'KOR' || data.country_str === 'SAU'
    );

    // Exclude data where file_name includes "US"
    const filteredByName = filteredByCountry.filter(
      (data) =>
        !data.file_name.includes('US') ||
        (data.country_str === 'SAU' && data.file_name.includes('KOR'))
    );

    return filteredByName;
  };

  const handleChoosingMapAPIs = () => {
    let filteredRouteFullCoords = routeFullCoords;

    // Apply mergeByFileId only for Routo and TMap
    if (selectedAPI?.name === 'ROUTO' || selectedAPI?.name === 'TMAP') {
      filteredRouteFullCoords = mergeByFileId(routeFullCoords, checkedNodes);
    }

    console.log('routeColors ==>', routeColors);

    if (selectedAPI?.name === 'GOOGLE') {
      return (
        <GoogleMapHandler
          key="google"
          selectedCoords={selectedCoords}
          googleLocation={setClickedCoords}
          routeFullCoords={routeFullCoords} // Original data
          spaceFullCoords={spaceFullCoords}
          checkedNode={checkedNodes}
          clickedNode={clickedNode}
          routeColors={routeColors}
        />
      );
    } else if (selectedAPI?.name === 'ROUTO') {
      return (
        <RoutoMapHandler
          key="routo"
          selectedCoords={selectedCoords}
          routoLocation={setClickedCoords}
          routeFullCoords={filteredRouteFullCoords} // Filtered data
          spaceFullCoords={spaceFullCoords}
          checkedNode={checkedNodes}
          clickedNode={clickedNode}
          routeColors={routeColors}
        />
      );
    } else if (selectedAPI?.name === 'TMAP') {
      return (
        <TMapHandler
          key="tmap"
          selectedCoords={selectedCoords}
          tmapLocation={setClickedCoords}
          routeFullCoords={filteredRouteFullCoords} // Filtered data
          spaceFullCoords={spaceFullCoords}
          checkedNode={checkedNodes}
          clickedNode={clickedNode}
          routeColors={routeColors}
        />
      );
    } else if (selectedAPI?.name === 'TOMTOM') {
      return (
        <TomTomMapHandler
          key="tomtom"
          selectedCoords={selectedCoords}
          tomtomLocation={setClickedCoords}
          routeFullCoords={routeFullCoords} // Original data
          spaceFullCoords={spaceFullCoords}
          checkedNode={checkedNodes}
          clickedNode={clickedNode}
          routeColors={routeColors}
        />
      );
    } else if (selectedAPI?.name === 'BAIDU') {
      return (
        <BaiduMapHandler
          key="baidu"
          selectedCoords={selectedCoords}
          baiduLocation={setClickedCoords}
          origins={origins}
          destinations={destinations}
          routeFullCoords={routeFullCoords} // Original data
          spaceFullCoords={spaceFullCoords}
          checkedNode={checkedNodes}
          clickedNode={clickedNode}
        />
      );
    } else if (selectedAPI?.name === 'HERE') {
      return (
        <HereMapHandler
          key="here"
          selectedCoords={selectedCoords}
          hereLocation={setClickedCoords}
          routeFullCoords={routeFullCoords} // Original data
          spaceFullCoords={spaceFullCoords}
          checkedNode={checkedNodes}
          clickedNode={clickedNode}
          routeColors={routeColors}
        />
      );
    }
  };

  useEffect(() => {
    if (selectedAPI) {
      // Reset states when a new API is selected
      setOrigins([]);
      setDestinations([]);
      setInputValue('');
      setSelectedCoords(null);
      setClickedCoords(null);
      setConvertedCoords({ lat: '', lng: '' });
      setDisplayCoords(null);

      // Set the current API to the selected API
      setCurrentApi(selectedAPI);

      // Display success message
      setSuccessValue(
        `${t('TopMenuBar.SelectedAPI')}: ${selectedAPI.name.toUpperCase()}`
      );
    }
  }, [selectedAPI, setCurrentApi]);

  const handleCoordsChange = (e) => {
    const { name, value } = e.target;

    // 숫자와 소수점만 입력할 수 있도록 제한
    if (!/^[\d.]*$/.test(value)) {
      return; // 숫자와 소수점 외의 입력을 무시
    }

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
      const coordsText = `${t('Common.Latitude')}: ${convertedCoords.lat}, ${t(
        'Common.Longitude'
      )}: ${convertedCoords.lng}`;
      navigator.clipboard
        .writeText(coordsText)
        .then(() => {
          setSuccessValue(`${t('TopMenuBar.Copy.Success')}`);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 5000);
        })
        .catch((err) => {
          setErrorValue(err.message || `${t('TopMenuBar.Copy.Fail')}`);
          setError(true);
          setTimeout(() => setError(false), 5000);
        });
    } else {
      setErrorValue(`${t('TopMenuBar.CoordsNotExistence')}`);
      setError(true);
      setTimeout(() => setError(false), 5000);
    }
  };

  const parseDEGToDecimal = (degString) => {
    const parts = degString.split(' ');
    if (parts.length !== 3) {
      throw new Error(`${t('TopMenuBar.FormatError')}`);
    }

    const degrees = parseFloat(parts[0]);
    const minutes = parseFloat(parts[1]);
    const seconds = parseFloat(parts[2]);

    if (isNaN(degrees) || isNaN(minutes) || isNaN(seconds)) {
      throw new Error(`${t('TopMenuBar.FormatError')}`);
    }

    return degrees + minutes / 60 + seconds / 3600;
  };

  const handleSearch = () => {
    const lat = convertedCoords.lat;
    const lng = convertedCoords.lng;
    let latitude = `${t('Common.Latitude')}`;
    let longitude = `${t('Common.Longitude')}`;

    let decError = `${t('TopMenuBar.DECError')}`;

    let mmsError = `${t('TopMenuBar.MMSError')}`;

    let degError = `${t('TopMenuBar.DEGError')}`;

    let latError = '';
    let lngError = '';

    if (!lat) {
      latError = `${latitude} ${t('TopMenuBar.LatError')}`;
    }
    if (!lng) {
      lngError = `${longitude} ${t('TopMenuBar.LonError')}`;
    }

    if (latError || lngError) {
      let combinedError =
        latError && lngError
          ? `${t('TopMenuBar.CombinedError')}: ${latError} & ${lngError}.`
          : latError
          ? `${t('TopMenuBar.ErrorInLat')}: ${latError}.`
          : `${t('TopMenuBar.ErrorInLon')}: ${lngError}.`;

      console.log('combinedError ==>', combinedError);

      setErrorValue(combinedError);
      setError(true);
      setTimeout(() => setError(false), 2000);
      return;
    }

    const isDecimal = (value) =>
      !isNaN(value) && value.toString().includes('.');
    const isInteger = (value) => Number.isInteger(Number(value));
    const hasSpaces = (value) =>
      typeof value === 'string' && value.split(' ').length > 1;

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
        latError = `${latitude} ${degError}`;
        lngError = `${longitude} ${degError}`;
      } else if (latSpaceError) {
        latError = `${latitude} ${degError}`;
      } else if (lngSpaceError) {
        lngError = `${longitude} ${degError}`;
      }
    }

    if (latError || lngError) {
      let combinedError =
        latError && lngError
          ? `${t('TopMenuBar.CombinedError')}: ${latError} & ${lngError}`
          : latError
          ? `${t('TopMenuBar.ErrorInLat')}: ${latError}`
          : `${t('TopMenuBar.ErrorInLon')}: ${lngError}`;
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
        console.log('error.message ==>', error.message);

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
        setErrorValue(`${t('TopMenuBar.RangeError')}`);
        setError(true);
        setTimeout(() => setError(false), 2000);
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
      setErrorValue(`${t('TopMenuBar.WrongCoords')}`);
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

  const handleMapClear = () => {
    setSelectedCoords(null); // Clear selected coordinates
    setClickedCoords(null); // Clear clicked coordinates
    setRouteFullCoords(null); // Clear route coordinates
    setSpaceFullCoords(null); // Clear space coordinates
    setConvertedCoords({ lat: '', lng: '' }); // Reset converted coordinates
    setDisplayCoords(null); // Clear display coordinates
    setOrigins([]); // Clear origins
    setDestinations([]); // Clear destinations
    if (typeof routeColors === 'function') {
      routeColors([]); // Reset route colors if it's a function
    }
  };

  return (
    <>
      {success && <Completion successfulMessage={successValue} />}
      {error && <Error errorMessage={errorValue} />}
      <Disclosure as="nav" className="bg-gray-800">
        {({ open }) => (
          <>
            <div className="mx-auto inset-x-0">
              <div className="flex h-[52px] justify-between">
                <div className="flex items-center lg:px-0">
                  <div className="hidden lg:block scale-90 z-40">
                    <div className="flex">
                      <label className="px-2 py-2 text-sm font-bold text-white">
                        {/* 지도 선택 */}
                        {t('TopMenuBar.MapSelection')}
                      </label>
                      <MapAPIsLists setSelectedAPI={setSelectedAPI} />
                      <label className="rounded-md pl-10 py-2 text-sm font-bold text-white px-3 ">
                        {/* 지점 검색 */}
                        {t('TopMenuBar.StoreSearch')}
                      </label>
                      <div className="flex flex-1 justify-center lg:justify-end">
                        <div className="w-full max-w-lg lg:max-w-xs">
                          <div className="inset-y-0 flex items-center px-2">
                            <input
                              type="text"
                              onChange={handleChange}
                              onKeyDown={handleKeyDown}
                              value={inputValue}
                              style={{ width: '170px' }}
                              className="block w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-5 text-gray-500 sm:text-sm sm:leading-6 mr-2"
                              placeholder={t('Common.SearchPlaceholder')}
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
                        <label className="rounded-md px-2 py-2 text-sm font-bold text-white">
                          {/* 로그 검색 */}
                          {t('TopMenuBar.LogSearch')}
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
                      <LogModal
                        routeData={handleRouteData}
                        routeFullCoords={setRouteFullCoords}
                        ref={logModalRef}
                      />
                      <div className="flex flex-1 justify-center lg:ml-3">
                        <label className="rounded-md px-3 py-2 text-sm font-bold text-white whitespace-nowrap">
                          {/* 공간 검색 */}
                          {t('TopMenuBar.SpaceSearch')}
                        </label>
                        <button
                          type="button"
                          onClick={() => spaceModalRef.current.show()}
                          className="inset-y-5 px-3 flex items-center pr-3 border-1 rounded-md p-2 bg-gray-700"
                        >
                          <HiOutlineDocumentSearch
                            className="h-5 w-5 text-white"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                      <SpaceModal
                        ref={spaceModalRef}
                        spaceFullCoords={setSpaceFullCoords}
                        selectedLists={handleSpaceData}
                        selectedCoords={convertedCoords}
                      />
                      <div className="flex flex-1 justify-center lg:ml-3">
                        <label className="rounded-md px-3 py-2 text-sm font-bold text-white whitespace-nowrap">
                          {/* 지도 초기회*/}
                          {t('TopMenuBar.MapClear')}
                        </label>
                        <button
                          type="button"
                          onClick={handleMapClear}
                          className="inset-y-5 px-3 flex items-center pr-3 border-1 rounded-md p-2 bg-gray-700"
                        >
                          <HiOutlineRefresh
                            className="h-5 w-5 text-white"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                      <label className="rounded-md px-3 py-2 text-sm font-bold text-white pl-10">
                        {/* 입력 좌표 출력 */}
                        {t('TopMenuBar.CoordsOutput')}
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
                              className="block w-36 rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-black placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6"
                              placeholder={t('Common.Latitude')}
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
                              className="block w-36 rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-black placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6"
                              placeholder={t('Common.Longitude')}
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
                          {/* 조회 */}
                          {t('Common.Search')}
                        </button>
                      </div>
                      <div className="flex flex-0 justify-center lg:ml-3">
                        <button
                          type="button"
                          className="rounded bg-white px-2 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset"
                          onClick={handleCopy}
                        >
                          {/* 복사 */}
                          {t('TopMenuBar.CopyButton')}
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
                <div className="flex flex-1 justify-center lg:justify-end">
                  <label className="block rounded-md px-3 py-2 text-base font-medium text-white">
                    {t('TopMenuBar.MapSelection')}
                  </label>
                  <MapAPIsLists setSelectedAPI={setSelectedAPI} />
                </div>
                <div className="flex flex-1 justify-center lg:justify-end">
                  <label className="block rounded-md px-3 py-2 text-base font-medium text-white">
                    {t('TopMenuBar.StoreSearch')}
                  </label>
                  <div className="w-full max-w-lg lg:max-w-xs">
                    <div className="inset-y-0 flex items-center px-2">
                      <input
                        type="text"
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        className="block w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-5 text-gray-500 sm:text-sm sm:leading-6 mr-2"
                        placeholder={t('Common.SearchPlaceholder')}
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
                <div className="flex flex-1 justify-center lg:justify-end">
                  <label className="block rounded-md px-3 py-2 text-base font-medium text-white">
                    {t('TopMenuBar.LogSearch')}
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
                <div className="flex flex-1 justify-center lg:justify-end">
                  <label className="block rounded-md px-3 py-2 text-base font-medium text-white">
                    {t('TopMenuBar.SpaceSearch')}
                  </label>
                  <button
                    type="button"
                    // onClick={() => logModalRef.current.show()}
                    className="inset-y-5 px-3 flex items-center pr-3 border-1 rounded-md p-2 bg-gray-700"
                  >
                    <HiOutlineDocumentSearch
                      className="h-5 w-5 text-white"
                      aria-hidden="true"
                    />
                  </button>
                </div>
                <div className="flex flex-1 justify-center lg:justify-end">
                  <label className="block rounded-md px-3 py-2 text-base font-medium text-white">
                    {t('TopMenuBar.CoordsOutput')}
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
                          placeholder={t('Common.Latitude')}
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
                          placeholder={t('Common.Longitude')}
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
                      {t('Common.Search')}
                    </button>
                  </div>
                  <div className="flex flex-0 justify-center lg:ml-3">
                    <button
                      type="button"
                      className="rounded bg-white px-2 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset"
                      onClick={handleCopy}
                    >
                      {t('TopMenuBar.Copy')}
                    </button>
                  </div>
                </div>
              </div>
            </DisclosurePanel>
          </>
        )}
      </Disclosure>
      <div className="map-container">
        {/* Show either the map for coordinates or the map for routes */}
        {selectedAPI && handleChoosingMapAPIs()}
      </div>
    </>
  );
};

export default TopMenuBar;
