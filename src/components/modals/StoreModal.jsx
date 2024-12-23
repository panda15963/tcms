import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
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
      enters: pressedEnter, // Enter 키가 눌렸는지 확인하는 상태
      values: bringValue, // 입력된 검색어 값
      onDataReceiveBack, // 부모 컴포넌트로 데이터를 전달하는 콜백 함수
      chosenMapAPIs, // 선택된 지도 API 정보
    },
    ref
  ) => {
    const [open, setOpen] = useState(false); // 모달의 열림 상태를 관리
    const [searches, setSearches] = useState([]); // 검색 결과를 저장하는 상태
    const [searchQuery, setSearchQuery] = useState(''); // 검색어를 저장하는 상태
    const { t } = useTranslation(); // i18n 훅을 사용하여 번역 함수를 가져옴

    /**
     * Enter 키가 눌렸을 때 검색을 실행하는 useEffect 훅
     * 선택된 지도 API와 함께 검색어를 기반으로 검색을 실행합니다.
     */
    useEffect(() => {
      if (pressedEnter === 'Enter' && chosenMapAPIs && chosenMapAPIs.name) {
        setSearchQuery(bringValue); // 검색어를 설정
        handleSearch(bringValue, chosenMapAPIs.name); // 선택된 API로 검색 실행
      }
    }, [pressedEnter, bringValue, chosenMapAPIs]); // pressedEnter, bringValue, chosenMapAPIs가 변경될 때 실행

    /**
     * 검색을 처리하는 함수
     * @param {string} query - 검색할 문자열
     * @param {string} apiName - 선택된 지도 API 이름
     */
    const handleSearch = async (query, apiName) => {
      if (query && apiName) {
        let results = [];
        // 선택된 API에 따라 각각의 검색 함수 호출
        switch (apiName) {
          case 'GOOGLE':
            results = await GoogleSearch(query); // Google 검색 실행
            break;
          case 'TMAP':
            results = await TMapSearch(query); // TMap 검색 실행
            break;
          case 'ROUTO':
            results = await RoutoSearch(query); // Routo 검색 실행
            break;
          case 'TOMTOM':
            results = await TomTomSearch(query); // TomTom 검색 실행
            break;
          case 'BAIDU':
            results = await BaiduSearch(query); // Baidu 검색 실행
            break;
          case 'HERE':
            results = await HereSearch(query); // Here 검색 실행
            break;
        }
        setSearches(results); // 검색 결과를 상태로 저장
      }
    };

    /**
     * Enter 키를 눌렀을 때 실행되는 함수
     * @param {object} event - 키 입력 이벤트 객체
     */
    const handleEnter = (event) => {
      if (event.key === 'Enter' && chosenMapAPIs && chosenMapAPIs.name) {
        handleSearch(searchQuery || bringValue, chosenMapAPIs.name); // Enter 시 검색 실행
      }
    };

    /**
     * 검색 버튼 클릭 시 검색을 처리하는 함수
     */
    const handleEvent = () => {
      if (
        (bringValue || searchQuery) !== '' &&
        chosenMapAPIs &&
        chosenMapAPIs.name
      ) {
        handleSearch(searchQuery || bringValue, chosenMapAPIs.name); // 검색어와 API를 기반으로 검색 실행
      }
    };

    /**
     * 테이블에서 데이터를 선택했을 때 호출되는 함수
     * @param {object} dataFromStoreTable - 선택된 테이블의 데이터
     */
    const handleDataSelect = (dataFromStoreTable) => {
      let normalizedData = dataFromStoreTable;

      // Normalize HERE Maps data structure
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
      onDataReceiveBack(normalizedData); // Pass normalized data to the parent component
      setSearches([]); // Clear search results
      handleClosed(); // Close modal
    };

    /**
     * 모달을 닫는 함수
     */
    const handleClosed = () => {
      setOpen(false); // 모달을 닫기
    };

    /**
     * 외부에서 모달을 열거나 닫기 위해 ref를 사용하여 Imperative Handle 설정
     * show()와 close()를 외부에서 호출 가능하게 합니다.
     */
    useImperativeHandle(ref, () => ({
      show() {
        setOpen(true); // 모달 열기
      },
      close() {
        setOpen(false); // 모달 닫기
      },
    }));

    return (
      <Transition show={open}>
        {/* 모달이 열릴 때 전환 애니메이션 적용 */}
        <Dialog className="relative z-50" onClose={() => handleClosed()}>
          {/* 모달 배경 애니메이션 */}
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
              {/* 모달 컨텐츠 애니메이션 */}
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
                  {/* 모달 헤더 */}
                  {/* <div className="flex justify-between py-2 px-5 bg-blue-900 rounded-t-lg"> */}
                  <div className="flex justify-between py-3 px-5 bg-blue-900 rounded-t-lg">
                    <h1 className="text-sm font-semibold text-white pt-0.5">
                      {/* 지점 검색 */}
                      {t('StoreModal.ModalName')}
                    </h1>
                    <MdClose
                      className="text-white font-semibold size-6"
                      size={16}
                      onClick={() => handleClosed()} // 닫기 버튼 클릭 시 모달 닫기
                    />
                  </div>
                  {/* 검색 UI */}
                  <div className="flex items-center justify-center gap-2 px-1 py-2">
                    <label className=" text-sm ml-1 font-semibold text-slate-700 px-2">
                      {/* 검색어 */}
                      {t('StoreModal.SearchName')}
                    </label>
                    <input
                      type="text"
                      className="pl-4 border border-black text-black p-1 rounded-md flex-grow max-w-md"
                      placeholder={t('Common.SearchPlaceholder')}
                      defaultValue={bringValue}
                      onKeyPress={handleEnter} // Enter 키 눌림 감지
                      onChange={(e) => setSearchQuery(e.target.value)} // 입력 값 업데이트
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
                        {/* 조회 */}
                        {t('Common.Search')}
                      </span>
                    </button>
                  </div>
                  {/* 검색 결과를 테이블로 표시 */}
                  <div className="p-3">
                    <StoreTable
                      stores={searches} // 검색 결과 전달
                      onDataReceive={handleDataSelect} // 테이블에서 선택된 데이터를 처리
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
