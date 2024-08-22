import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { MdClose } from 'react-icons/md';
import {
  FaRegFolderOpen,
  FaCloudDownloadAlt,
  FaCheck,
  FaSearch,
} from 'react-icons/fa';
import MainGrid from '../tables/MainGrid';
import { nonAuthInstance } from '../../server/AxiosConfig';
import logService from '../../service/logService';
import MultipleSelectDropDown from '../dropdowns/MultipleSelectDropDown';
import { useLanguage } from '../../context/LanguageProvider';
import { isArray, isEmpty } from 'lodash';

/**
 * 로그 검색
 */
const LogModal = forwardRef((_props, ref) => {
  const initialList = {
    status: 'idle',
    currentRequestId: undefined,
    error: null,
    list: [],
  };

  // 검색 필드 옵션 정의
  const fields = [
    { id: 'description', name: { eng: 'Find Description', kor: '설명 찾기' } },
    { id: 'continent', name: { eng: 'Continent', kor: '대륙' } },
    { id: 'country', name: { eng: 'Country', kor: '국가' } },
    { id: 'priority', name: { eng: 'Priority', kor: '우선순위' } },
    { id: 'feature', name: { eng: 'Feature', kor: '기능' } },
    { id: 'target', name: { eng: 'Target', kor: '대상' } },
    { id: 'virtual', name: { eng: 'Virtual', kor: '가상' } },
    { id: 'format', name: { eng: 'Format', kor: '형식' } },
    { id: 'tag', name: { eng: 'Tag', kor: '태그' } },
  ];

  const priority = [
    { id: 'all', name: { eng: 'ALL', kor: '전체' } },
    { id: 'top', name: { eng: 'Top', kor: '상위' } },
    { id: 'a', name: { eng: 'A', kor: 'A' } },
    { id: 'b', name: { eng: 'B', kor: 'B' } },
    { id: 'c', name: { eng: 'C', kor: 'C' } },
  ];

  const format = [
    { id: 'all', name: { eng: 'ALL', kor: '전체' } },
    { id: 'hippo', name: { eng: 'HIPPO (*.hippo)', kor: 'HIPPO (*.hippo)' } },
    { id: 'kml', name: { eng: 'KML (*.kml)', kor: 'KML (*.kml)' } },
    { id: 'nmea', name: { eng: 'NMEA (*.nmea)', kor: 'NMEA (*.nmea)' } },
  ];

  const virtual = [
    { id: 'all', name: { eng: 'ALL', kor: '전체' } },
    { id: 'virtualLog', name: { eng: 'Virtual Log', kor: '가상 로그' } },
    { id: 'reallog', name: { eng: 'Real Log', kor: '실제 로그' } },
  ];

  // 클래스 이름을 결합하는 유틸리티 함수
  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [selectedSearchFields, setSelectedSearchFields] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countryList, setCountryList] = useState(initialList);
  const [featureList, setFeatureList] = useState(initialList);
  const [targetList, setTargetList] = useState(initialList);
  const [tagList, setTagList] = useState(initialList);
  const [list, setList] = useState(initialList);

  // 언어에 따른 라벨 설정
  const labels =
    language === 'ENG'
      ? {
          modalName: 'Log Search',
          searchFields: 'Search Fields',
          find: 'Find',
          downloadDir: 'Download directory',
          download: 'Download',
          ok: 'OK',
        }
      : {
          modalName: '로그 검색',
          searchFields: '검색 필드',
          find: '찾기',
          downloadDir: '다운로드 경로',
          download: '다운로드',
          ok: '확인',
        };

  console.log('countryList', countryList);

  /**
   * 부모 컴포넌트에서 show() 메서드를 통해 모달을 열 수 있도록
   * useImperativeHandle을 사용하여 ref를 설정
   */
  useImperativeHandle(ref, () => ({
    show() {
      setOpen(true);
    },
  }));

  useEffect(() => {
    console.log('유즈이팩 실행 체크 ==>');
    MAIN_COUNTRY();
    MAIN_FEATURE();
    MAIN_TARGET();
    MAIN_TAG();
  }, []);

  useEffect(() => {
    console.log('[LIST]유즈이팩 실행 체크 ==>');
    console.log('useEffect of list ==>', list);
  }, [list]);

  /**
   * Find 클릭 이벤트
   */
  const onFindMeta = async () => {
    setLoading(true);
    setError(null);

    const condTmp = {
      searchWord: '',
      continent: 'NA,EU,AS',
      region: '',
      priority: '',
      target: '',
      format: '',
      feature: '',
      virtual: -1,
      tag: '',
      group_id: -1,
      operation: 0,
    };

    // const condTmp = {
    //   searchWord: '',
    //   continent: '',
    //   region: '',
    //   priority: '',
    //   target: '',
    //   format: '',
    //   feature: '',
    //   virtual: -1,
    //   tag: '',
    //   group_id: -1,
    //   operation: 0,
    // };

    console.log('onFindMeta of condTmp ==>', condTmp);
    FIND_META(condTmp);
  };

  /**
   * FIND META API
   */
  const FIND_META = async (inputCond) => {
    try {
      await logService
        .FIND_META2({
          cond: inputCond,
        })
        .then((res) => {
          console.log('FIND_META of res ==>', res.findMeta);
          setList((prevState) => {
            return {
              ...prevState,
              list: res.findMeta,
            };
          });
          setLoading(false);
        });

      // 기존코드 백업 24.08.12 -JOHN
      // try {
      //   const response = await nonAuthInstance.get('/auth/test');
      //   console.log('Response:', response);
      //   setData(response.data);
      // } catch (e) {
      //   console.error('Error:', e.response ? e.response : e.message);
      //   setError(e.response ? e.response.data : e.message);
      // }
    } catch (e) {
      console.log('FIND_META of error ==>', e);
      setLoading(false);
    }
  };

  /**
   * Search Fields 옵션 스위치
   */
  const getOptionsByFieldId = (fieldId) => {
    console.log('getOptionsByFieldId of fieldId ==>', fieldId);

    const extractName = (item) => {
      if (typeof item.name === 'object') {
        return language === 'ENG' ? item.name.eng : item.name.kor;
      }
      return item.name;
    };

    const mapOptions = (optionsList) => {
      return optionsList.map((option) => ({
        ...option,
        name: extractName(option),
      }));
    };

    switch (fieldId) {
      case 'continent':
        return mapOptions(countryList.continent);
      case 'country':
        return mapOptions(countryList.country);
      case 'priority':
        return mapOptions(priority);
      case 'feature-1':
        return mapOptions(featureList.featureTop);
      case 'feature-2':
        return mapOptions(featureList.featureBottom);
      case 'target':
        return mapOptions(targetList.target);
      case 'virtual':
        return mapOptions(virtual);
      case 'format':
        return mapOptions(format);
      case 'tag':
        return mapOptions(tagList.tag);
      default:
        return [];
    }
  };

  /**
   * MAIN COUNTRY API
   */
  const MAIN_COUNTRY = async () => {
    try {
      await logService.MAIN_COUNTRY({}).then((res) => {
        console.log('MAIN_COUNTRY of res ==>', res.country);

        // [Continent]
        const uniqueContinents = [
          ...new Set(res.country.map((country) => country.continent)),
        ];

        // [Continent] 오름차순 정렬
        uniqueContinents.sort();

        // [Continent] 분류
        const continentsList = uniqueContinents.map((continent) => ({
          id: continent.toLowerCase(),
          name: continent,
        }));

        // [Continent] ALL 항목 추가
        continentsList.unshift({ id: 'all', name: 'ALL' });

        // [Country] 주어진 데이터에서 country_Iso3를 name으로, id는 그대로 유지하는 새로운 리스트 생성
        const processedList = res.country.map((country) => ({
          id: country.id,
          name: country.country_Iso3,
        }));

        // [Country] ALL 항목 추가
        processedList.unshift({ id: 'all', name: 'ALL' });

        // [Country] 정렬
        processedList.sort((a, b) => {
          if (a.name < b.name) return -1;
          if (a.name > b.name) return 1;
          return 0;
        });

        setCountryList((prevState) => {
          return {
            ...prevState,
            list: res.country,
            continent: continentsList, // continent 리스트 추가
            country: processedList,
          };
        });
      });
    } catch (e) {
      console.log('MAIN_COUNTRY of error ==>', e);
    }
  };

  /**
   * MAIN FEATURE API
   */
  const MAIN_FEATURE = async () => {
    try {
      await logService.MAIN_FEATURE({}).then((res) => {
        console.log('MAIN_FEATURE of res ==>', res.feature);

        const withHyphen = res.feature.filter((item) =>
          item.str.startsWith('-'),
        );
        const withoutHyphen = res.feature.filter(
          (item) => !item.str.startsWith('-'),
        );

        console.log('With Hyphen:', withHyphen);
        console.log('Without Hyphen:', withoutHyphen);

        const topFeatureList = withHyphen.map((whn) => ({
          id: whn.id,
          name: whn.str.replace('-', ''),
        }));

        const bottomFeatureList = withoutHyphen.map((whn) => ({
          id: whn.id,
          name: whn.str,
        }));

        console.log('topFeatureList', topFeatureList);
        console.log('bottomFeatureList', bottomFeatureList);

        // [Feature] TOP 정렬
        // topFeatureList.sort((a, b) => {
        //   if (a.name < b.name) return -1;
        //   if (a.name > b.name) return 1;
        //   return 0;
        // });

        // [Feature] ALL 항목 추가
        topFeatureList.unshift({ id: 'all', name: 'ALL' });
        bottomFeatureList.unshift({ id: 'all', name: 'ALL' });

        setFeatureList((prevState) => {
          return {
            ...prevState,
            list: res,
            featureTop: topFeatureList,
            featureBottom: bottomFeatureList,
          };
        });
      });
    } catch (e) {
      console.log('MAIN_FEATURE of error ==>', e);
    }
  };

  /**
   * MAIN TARGET API
   */
  const MAIN_TARGET = async () => {
    try {
      await logService.MAIN_TARGET({}).then((res) => {
        console.log('MAIN_TARGET of res ==>', res.target);

        // [Target] 주어진 데이터에서 name, id는 그대로 유지하는 새로운 리스트 생성
        const targetList = res.target.map((target) => ({
          id: target.id,
          name: target.str,
        }));

        // [Country] ALL 항목 추가
        targetList.unshift({ id: 'all', name: 'ALL' });

        // [Country] 정렬
        // targetList.sort((a, b) => {
        //   if (a.name < b.name) return -1;
        //   if (a.name > b.name) return 1;
        //   return 0;
        // });

        setTargetList((prevState) => {
          return {
            ...prevState,
            list: res,
            target: targetList,
          };
        });
      });
    } catch (e) {
      console.log('MAIN_TARGET of error ==>', e);
    }
  };

  /**
   * MAIN TAG API
   */
  const MAIN_TAG = async () => {
    try {
      await logService.MAIN_TAG({}).then((res) => {
        console.log('MAIN_TAG of res ==>', res.tag);

        // [Tag] 주어진 데이터에서 name, id는 그대로 유지하는 새로운 리스트 생성
        const tagList = res.tag.map((tag) => ({
          id: tag.id,
          name: tag.str,
        }));

        // [Tag] ALL 항목 추가
        tagList.unshift({ id: 'all', name: 'ALL' });

        // [] 정렬
        // targetList.sort((a, b) => {
        //   if (a.name < b.name) return -1;
        //   if (a.name > b.name) return 1;
        //   return 0;
        // });

        setTagList((prevState) => {
          return {
            ...prevState,
            list: res,
            tag: tagList,
          };
        });
      });
    } catch (e) {
      console.log('MAIN_TAG of error ==>', e);
    }
  };

  return (
    <Transition show={open}>
      <Dialog className="relative z-50" onClose={() => setOpen(false)}>
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

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 transition-opacity text-center sm:items-center sm:p-0">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel className="relative rounded-lg transform overflow-hidden shadow-xl bg-white text-left transition-all sm:w-full sm:my-8 sm:max-w-screen-xl sm:p-0">
                <div className="flex justify-between py-3 px-5 bg-blue_ncs">
                  <h1 className="font-semibold text-white">
                    {labels.modalName}
                  </h1>
                  <button
                    className="font-semibold"
                    onClick={() => setOpen(false)}
                  >
                    <MdClose className="text-white" size={16} />
                  </button>
                </div>
                <div className="p-5">
                  <div
                    id="search_fieds"
                    className="flex items-center justify-start z-20"
                  >
                    <span className="w-1/5 text-md font-semibold text-slate-700 text-center">
                      {labels.searchFields}
                    </span>
                    <MultipleSelectDropDown
                      options={fields.map((field) => ({
                        ...field,
                        name: field.name[language.toLowerCase()], // Ensure you're getting the string for the active language
                      }))}
                      onChange={(val) => {
                        console.log('SELECTED SEARCH FIELDS', val);
                        setSelectedSearchFields(val);
                      }}
                    />
                  </div>
                  {/* Dyanmic Search fields*/}
                  <div className="flex flex-wrap mb-4 mt-4">
                    {!isEmpty(selectedSearchFields) &&
                      selectedSearchFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex w-full sm:w-1/2 items-center mt-2"
                        >
                          <label className="w-1/4 text-sm font-semibold text-slate-700 px-2">
                            {field.name}
                          </label>
                          {field.id === 'description' ? (
                            <input
                              type="text"
                              id={field.id}
                              className="w-3/4 rounded-md border-0 py-1.5 px-2 text-gray-900 shadow ring-1 ring-inset ring-gray-400 placeholder:text-gray-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 sm:text-sm sm:leading-6"
                              // onChange={(e) => {
                              //   const newFields = selectedSearchFields.map((f) =>
                              //     f.id === field.id ? { ...f, value: e.target.value } : f
                              //   );
                              //   setSelectedSearchFields(newFields);
                              // }}
                            />
                          ) : field.id === 'feature' ? (
                            <div className="w-3/4 flex flex-row space-x-2">
                              <MultipleSelectDropDown
                                options={getOptionsByFieldId(`${field.id}-1`)}
                                className="flex-1"
                                // onChange={(options) => {
                                //   const newFields = selectedSearchFields.map((f) =>
                                //     f.id === field.id ? { ...f, selectedOptions1: options } : f
                                //   );
                                //   setSelectedSearchFields(newFields);
                                // }}
                              />
                              <MultipleSelectDropDown
                                options={getOptionsByFieldId(`${field.id}-2`)}
                                className="flex-1"
                                // onChange={(options) => {
                                //   const newFields = selectedSearchFields.map((f) =>
                                //     f.id === field.id ? { ...f, selectedOptions2: options } : f
                                //   );
                                //   setSelectedSearchFields(newFields);
                                // }}
                              />
                            </div>
                          ) : field.id === 'tag' ? (
                            <div className="w-3/4 flex flex-row space-x-2">
                              <MultipleSelectDropDown
                                options={getOptionsByFieldId(`${field.id}`)}
                                className="flex-1"
                                // onChange={(options) => {
                                //   const newFields = selectedSearchFields.map((f) =>
                                //     f.id === field.id ? { ...f, selectedOptions1: options } : f
                                //   );
                                //   setSelectedSearchFields(newFields);
                                // }}
                              />
                              <div className="flex items-center space-x-2">
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`${field.id}-option`}
                                    value="AND"
                                    className="form-radio"
                                  />
                                  <span className="ml-1">AND</span>
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`${field.id}-option`}
                                    value="OR"
                                    className="form-radio"
                                  />
                                  <span className="ml-1">OR</span>
                                </label>
                              </div>
                            </div>
                          ) : (
                            <div className="w-3/4 flex flex-row space-x-2">
                              <MultipleSelectDropDown
                                options={getOptionsByFieldId(field.id)}
                                // onChange={(options) => {
                                //   const newFields = selectedSearchFields.map((f) =>
                                //     f.id === field.id ? { ...f, selectedOptions: options } : f
                                //   );
                                //   setSelectedSearchFields(newFields);
                                // }}
                              />
                            </div>
                          )}
                          {/* <input
                          type="text"
                          id={field.id}
                          className={classNames(
                            'w-3/4 rounded-md border-0 py-1.5 px-2 text-gray-900 shadow ring-1 ring-inset ring-gray-400 placeholder:text-gray-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 sm:text-sm sm:leading-6',
                          )}
                        /> */}
                        </div>
                      ))}
                  </div>
                  <div className="flex justify-end">
                    <button
                      className="inline-flex items-center border-2 gap-x-2 px-3 py-2 font-semibold text-sm border-slate-300 rounded-md  focus:ring-1 focus:border-sky-500 hover:border-sky-500 cursor-pointer"
                      onClick={onFindMeta}
                    >
                      <FaSearch
                        className="-ml-0.5 h-5 w-5 text-sky-500  cursor-pointer"
                        aria-hidden="true"
                      />
                      <label className="text-base text-sky-500 font-bold cursor-pointer">
                        {labels.find}
                      </label>
                    </button>
                  </div>
                  {loading && <p>Loading...</p>}
                  {error && <p className="text-red-500">{error}</p>}
                  {data && (
                    <div>
                      <h2 className="text-xl font-semibold mt-4">
                        Fetched Data:
                      </h2>
                      <pre className="bg-gray-100 p-4 rounded-md">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </div>
                  )}
                  <MainGrid list={list} />
                  <div
                    id="download_container"
                    className="grid grid-cols-[20%_1fr_15%] items-center"
                  >
                    <span className="text-md font-semibold text-slate-700 text-center">
                      {labels.downloadDir}
                    </span>
                    <input
                      type="text"
                      name="download_dir"
                      className="w-full px-3 py-2 bg-white border shadow-sm border-slate-400 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                    />
                    <div className="flex w-full justify-end">
                      <button className="font-semibold border-slate-300 border rounded-md px-3 py-2 ms-2 focus:ring-1 focus:border-sky-500 hover:border-sky-500">
                        <FaRegFolderOpen
                          className="-ml-0.5 h-5 w-5 text-slate-700"
                          aria-hidden="true"
                        />
                      </button>
                      <button className="inline-flex items-center gap-x-1.5 font-semibold text-sm border-slate-300 border rounded-md px-3 ms-2 focus:ring-1 focus:border-sky-500 hover:border-sky-500">
                        <FaCloudDownloadAlt
                          className="-ml-0.5 h-5 w-5 text-slate-700"
                          aria-hidden="true"
                        />
                        {labels.download}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end mt-3">
                    <button className="inline-flex items-center gap-x-1.5 font-semibold text-sm border-slate-300 border rounded-md py-2 px-3 ms-2 focus:ring-1 focus:border-sky-500 hover:border-sky-500">
                      <FaCheck
                        className="-ml-0.5 h-5 w-5 text-slate-700"
                        aria-hidden="true"
                      />
                      {labels.ok}
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});
export default LogModal;
