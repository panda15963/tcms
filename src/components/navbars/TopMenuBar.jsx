import { useRef, useState } from 'react';
import { HiOutlineDocumentSearch } from 'react-icons/hi';
import { TbWorldLatitude, TbWorldLongitude } from 'react-icons/tb';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { FaMagnifyingGlass, FaXmark, FaBars } from 'react-icons/fa6';
import LogModal from '../modals/LogModal';
import StoreModal from '../modals/StoreModal';
import MapAPIsLists from '../dropdowns/MapAPIsLists';
import MapCoordLists from '../dropdowns/MapCoordLists';
import RoutoMap from '../../pages/RoutoMap';
import TomTomMap from '../../pages/TomTomMap';
import BaiduMap from '../../pages/BaiduMap';
import GoogleCoords from '../displayCoords/GoogleCoords';
import TMapCoords from '../displayCoords/TMapCoords';
import TMap from '../../pages/TMap';

const TopMenuBar = () => {
  const [inputValue, setinputValue] = useState('');
  const [keyPressed, setKeyPressed] = useState('');
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [selectedAPI, setSelectedAPI] = useState(null);

  const storeModalRef = useRef();
  const logModalRef = useRef();

  const handleChange = (event) => {
    setinputValue(event.target.value);
  };

  const handleKeyDown = (event) => {
    const reg = /[\{\}\[\]\/?,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/g;
    if (
      event.key === 'Enter' &&
      event.target.value !== '' &&
      !reg.test(event.target.value)
    ) {
      storeModalRef.current.show();
      setKeyPressed(event.key);
    }
    if (event.key === 'Backspace') {
      setinputValue('');
    }
  };

  const handleDataReceiveBack = (store) => {
    if (store.latitude !== undefined && store.longitude !== undefined) {
      setinputValue('');
      setSelectedCoords({
        lat: parseFloat(store.latitude),
        lng: parseFloat(store.longitude),
      });
      storeModalRef.current.close();
      console.log(selectedCoords);
    } else {
      alert('지점을 선택하여 주십시오!');
    }
  };

  const handleChoosingMapAPIs = () => {
    switch (selectedAPI.name.toLowerCase()) {
      case 'google':
        return <GoogleCoords selectedCoords={selectedCoords} />;
      case 'routo':
        return <RoutoMap />;
      case 'tmap':
        return <TMapCoords selectedCoords={selectedCoords} />;
      case 'tomtom':
        return <TomTomMap />;
      case 'baidu':
        return <BaiduMap />;
      default:
        return <GoogleCoords selectedCoords={selectedCoords} />;
    }
  };
  return (
    <>
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
                      <MapCoordLists />
                      <div className="flex flex-0 justify-center lg:ml-3">
                        <div className="w-full max-w-lg lg:max-w-xs">
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
                              className="block w-36 rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-500 focus:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6"
                              placeholder="Longitude"
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
                              <TbWorldLatitude
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              />
                            </button>
                            <input
                              id="search"
                              name="search"
                              className="block w-36 rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-500 focus:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6"
                              placeholder="Latitude"
                              type="search"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-0 justify-center lg:ml-3">
                        <button
                          type="button"
                          className="rounded bg-white px-2 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset"
                        >
                          조회
                        </button>
                      </div>
                      <div className="flex flex-0 justify-center lg:ml-3">
                        <button
                          type="button"
                          className="rounded bg-white px-2 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset"
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
                <MapAPIsLists />
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
                <MapCoordLists />
                <div className="flex flex-0 justify-center lg:ml-3">
                  <div className=" max-w-lg lg:max-w-xs">
                    <div className="relative py-1">
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
                        className="block w-36 rounded-md border-0 bg-gray-700 py-1 pl-10 pr-3 text-gray-300 placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="Longitude"
                      />
                    </div>
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
                        name="search"
                        className="block w-36 rounded-md border-0 bg-gray-700 py-1 pl-10 pr-3 text-gray-300 placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="Latitude"
                        type="search"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-0 justify-center lg:ml-3">
                  <button
                    type="button"
                    className="rounded bg-white px-2 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset"
                  >
                    Search
                  </button>
                </div>
                <div className="flex flex-0 justify-center lg:ml-3">
                  <button
                    type="button"
                    className="rounded bg-white px-2 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset"
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
