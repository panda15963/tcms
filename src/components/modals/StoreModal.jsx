import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react'; // 모달 대화 상자를 위한 Headless UI 컴포넌트
import { MdClose } from 'react-icons/md'; // 닫기 아이콘
import StoreTable from '../tables/mapTables/StoreTable'; // StoreTable 컴포넌트
import { GoogleSearch } from '../searchResults/GoogleSearch'; // Google 검색 함수
import { TMapSearch } from '../searchResults/TMapSearch'; // TMap 검색 함수
import { RoutoSearch } from '../searchResults/RoutoSearch'; // Routo 검색 함수
import { TomTomSearch } from '../searchResults/TomTomSearch'; // TomTom 검색 함수
import { BaiduSearch } from '../searchResults/BaiduSearch'; // Baidu 검색 함수
import { HereSearch } from '../searchResults/HereSearch'; // Here 검색 함수
import { useTranslation } from 'react-i18next'; // i18n 훅을 통한 다국어 지원
import { FaSearch } from 'react-icons/fa'; // 검색 아이콘

const StoreModal = forwardRef(
  (
    {
      enters: pressedEnter, // Enter 키 상태
      values: bringValue, // 검색 입력 값
      onDataReceiveBack, // 부모 컴포넌트로 데이터를 전달하는 콜백
      chosenMapAPIs, // 선택된 지도 API
    },
    ref
  ) => {
    const [open, setOpen] = useState(false); // 모달 열림/닫힘 상태
    const [searches, setSearches] = useState([]); // 검색 결과
    const [searchQuery, setSearchQuery] = useState(''); // 검색 쿼리
    const { t } = useTranslation(); // 다국어 번역 훅

    // Enter 키를 감지하여 검색 처리
    useEffect(() => {
      if (pressedEnter === 'Enter' && chosenMapAPIs && chosenMapAPIs.name) {
        setSearchQuery(bringValue);
        handleSearch(bringValue, chosenMapAPIs.name);
      }
    }, [pressedEnter, bringValue, chosenMapAPIs]);

    // 검색 처리 함수
    const handleSearch = async (query, apiName) => {
      if (query && apiName) {
        let results = [];
        try {
          // 선택된 API에 따라 검색 호출
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
          setSearches(results); // 검색 결과를 상태에 저장
        } catch (error) {
          console.error("Search failed:", error);
        }
      } else {
        console.error("Invalid query or API name:", { query, apiName });
      }
    };

    // Enter 키로 검색 실행
    const handleEnter = (event) => {
      if (event.key === 'Enter' && chosenMapAPIs && chosenMapAPIs.name) {
        handleSearch(searchQuery || bringValue, chosenMapAPIs.name);
      }
    };

    // 검색 버튼 클릭 처리
    const handleEvent = () => {
      if (
        (bringValue || searchQuery) !== '' &&
        chosenMapAPIs &&
        chosenMapAPIs.name
      ) {
        handleSearch(searchQuery || bringValue, chosenMapAPIs.name);
      }
    };

    // 테이블에서 선택된 데이터 처리
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
      onDataReceiveBack(normalizedData); // 부모로 데이터 전달
      setSearches([]); // 검색 결과 초기화
      handleClosed(); // 모달 닫기
    };

    // 모달 닫기 처리
    const handleClosed = () => {
      setOpen(false);
    };

    // 외부에서 모달을 열거나 닫을 수 있도록 참조를 제공
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
          {/* 모달 배경 */}
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
                {/* 모달 콘텐츠 */}
                <DialogPanel
                  className="relative rounded-lg shadow-xl bg-white w-[800px]"
                >
                  {/* 모달 헤더 */}
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
                  {/* 검색 섹션 */}
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
                  {/* 테이블 섹션 */}
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
