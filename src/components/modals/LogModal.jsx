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
import { isArray, isEmpty } from 'lodash';
import SingleSelectDropDown from '../dropdowns/SingleSelectDropDown';
import { useTranslation } from 'react-i18next';

/**
 * 로그 검색
 */
const LogModal = forwardRef(({ routeData }, ref) => {
  const { t } = useTranslation();
  const initialCond = {
    searchWord: '',
    continent: '',
    region: '',
    priority: '',
    target: '',
    format: '',
    feature: '',
    virtual: -1, // all : -1, virtual : 0, real : 1
    tag: '',
    group_id: -1,
    operation: 0, // and : 0, or : 1
  };

  const initialList = {
    status: 'idle',
    currentRequestId: undefined,
    error: null,
    list: [],
  };

  // 검색 필드 옵션 정의
  const fields = [
    { id: 'description', name: t('Fields.FindDescription') },
    { id: 'continent', name: t('Fields.Continent') },
    { id: 'region', name: t('Fields.Region') },
    { id: 'priority', name: t('Fields.Priority') },
    { id: 'feature', name: t('Fields.Feature') },
    { id: 'target', name: t('Fields.Target') },
    { id: 'virtual', name: t('Fields.Virtual') },
    { id: 'format', name: t('Fields.Format') },
    { id: 'tag', name: t('Fields.Tag') },
  ];

  const priority = [
    { id: 'all', name: t('Common.All') },
    { id: 'top', name: t('Priority.Top') },
    { id: 'a', name: t('Priority.A') },
    { id: 'b', name: t('Priority.B') },
    { id: 'c', name: t('Priority.C') },
  ];

  const format = [
    { id: 'all', name: t('Common.All') },
    { id: 'hippo', name: t('Format.Hippo') },
    { id: 'kml', name: t('Format.Kml') },
    { id: 'nmea', name: t('Format.Nmea') },
  ];

  const virtual = [
    { id: -1, name: t('Common.All') },
    { id: 0, name: t('Virtual.VirtualLog') },
    { id: 1, name: t('Virtual.RealLog') },
  ];

  // 대륙 코드와 이름 매핑
  const continentNameMap = {
    AF: t('Continents.Africa'),
    AS: t('Continents.Asia'),
    EU: t('Continents.Europe'),
    NA: t('Continents.NorthAmerica'),
    OC: t('Continents.Oceania'),
    SA: t('Continents.SouthAmerica'),
  };

  const [cond, setCond] = useState(initialCond);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('route'); // "route" 탭을 기본값으로 설정
  const [selectedSearchFields, setSelectedSearchFields] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countryList, setCountryList] = useState(initialList);
  const [featureList, setFeatureList] = useState(initialList);
  const [targetList, setTargetList] = useState(initialList);
  const [tagList, setTagList] = useState(initialList);
  const [list, setList] = useState(initialList);
  const [selectedTopFeature, setSelectedTopFeature] = useState(null);
  const [filteredBottomOptions, setFilteredBottomOptions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedData, setSelectedData] = useState([]);

  // console.log('countryList', countryList);
  /**
   * 부모 컴포넌트에서 show() 메서드를 통해 모달을 열 수 있도록
   * useImperativeHandle을 사용하여 ref를 설정
   */
  useImperativeHandle(ref, () => ({
    show() {
      setOpen(true);
    },
  }));

  /**
   * 로그모달 탭핸들러
   */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    console.log('유즈이팩 실행 체크 ==>');
    MAIN_COUNTRY();
    MAIN_FEATURE();
    MAIN_TARGET();
    MAIN_TAG();

    console.log('유즈이팩 featureList', featureList);

    // Ensure featureTop is defined and has items
    if (featureList.featureTop && featureList.featureTop.length > 0) {
      handleTopFeatureChange(featureList.featureTop[0]);
    }
  }, []); // Include featureList in the dependency array

  useEffect(() => {
    console.log('[LIST]유즈이팩 실행 체크 ==>');
    console.log('useEffect of selectedSearchFields ==>', selectedSearchFields);
    // selectedOptions는 선택된 필드의 객체 리스트로 가정합니다.
    const ids = selectedSearchFields.map((option) => option.id);

    console.log('ids ==>', ids);
    setSelectedIds(ids); // 선택된 ID 리스트를 업데이트
  }, [selectedSearchFields]);

  /**
   * Find 클릭 이벤트
   */
  const onFindMeta = async () => {
    setLoading(true);
    setError(null);

    console.log('cond.operation', cond.operation);
    console.log('selectedIds', selectedIds);

    const condTmp = {
      searchWord: cond.searchWord,
      continent: selectedIds.includes('continent') ? cond.continent : '',
      region: selectedIds.includes('region') ? cond.region : '',
      priority: selectedIds.includes('priority') ? cond.priority : '',
      target: selectedIds.includes('target') ? cond.target : '',
      format: selectedIds.includes('format') ? cond.format : '',
      feature: selectedIds.includes('feature') ? cond.feature : '',
      virtual: selectedIds.includes('virtual') ? cond.virtual : '',
      tag: selectedIds.includes('tag') ? cond.tag : '',
      group_id: -1,
      operation: selectedIds.includes('tag') ? cond.operation : 0,
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
        .FIND_META_10100({
          cond: inputCond,
        })
        .then((res) => {
          console.log('FIND_META_10100 of res ==>', res.findMeta);
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
        return countryList.continent ? mapOptions(countryList.continent) : [];
      case 'region':
        return countryList.country ? mapOptions(countryList.country) : [];
      case 'priority':
        return mapOptions(priority);
      case 'feature-1':
        return featureList.featureTop ? mapOptions(featureList.featureTop) : [];
      case 'feature-2':
        return featureList.featureBottom
          ? mapOptions(featureList.featureBottom)
          : [];
      case 'target':
        return targetList.target ? mapOptions(targetList.target) : [];
      case 'virtual':
        return mapOptions(virtual);
      case 'format':
        return mapOptions(format);
      case 'tag':
        return tagList.tag ? mapOptions(tagList.tag) : [];
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
          name: continentNameMap[continent] || continent, // 매핑된 이름 사용
        }));

        // [Continent] ALL 항목 추가
        continentsList.unshift({ id: 'all', name: t('Common.All') });

        // [Country] 주어진 데이터에서 country_Iso3를 name으로, id는 그대로 유지하는 새로운 리스트 생성
        const processedList = res.country.map((country) => ({
          id: country.country_Iso3,
          // name: country.country_Iso3,
          name: country.country_name,
        }));

        // [Country] ALL 항목 추가
        processedList.unshift({ id: 'all', name: t('Common.All') });

        // [Country] 정렬
        processedList.sort((a, b) => {
          if (a.name < b.name) return -1;
          if (a.name > b.name) return 1;
          return 0;
        });

        console.log('continentsList ==>', continentsList);

        setCountryList((prevState) => {
          return {
            ...prevState,
            list: res.country,
            continent: continentsList || [], // default to empty array
            country: processedList || [], // default to empty array
          };
        });

        console.log('featureList', featureList);
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
        topFeatureList.unshift({ id: 'all', name: t('Common.All') });
        bottomFeatureList.unshift({ id: 'all', name: t('Common.All') });

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
   * handleTopFeatureChange
   */
  const handleTopFeatureChange = (selectedOption) => {
    console.log('handleTopFeatureChange of selectedOption ==>', selectedOption);

    setSelectedTopFeature(selectedOption);

    // Ensure featureBottom is defined and is an array
    if (!Array.isArray(featureList.featureBottom)) {
      console.log('featureBottom is not defined or not an array.');
      setFilteredBottomOptions([]);
      return;
    }

    if (!Array.isArray(selectedOption) || selectedOption.length === 0) {
      setFilteredBottomOptions([]);
      return;
    }

    const filteredOptions = featureList.featureBottom.filter((option) => {
      return selectedOption.some((selected) => {
        if (selected.id === 'all') {
          return true;
        }
        const selectedIdBase = Math.floor(selected.id / 1000) * 1000;
        return (
          option.id >= selectedIdBase + 1 && option.id < selectedIdBase + 1000
        );
      });
    });

    console.log('filteredOptions ==>', filteredOptions);
    setFilteredBottomOptions(filteredOptions);
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
          id: target.str,
          name: target.str,
        }));

        // [Country] ALL 항목 추가
        targetList.unshift({ id: 'all', name: t('Common.All') });

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
        tagList.unshift({ id: 'all', name: t('Common.All') });

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

  /**
   * SelectedValues
   */
  const selectedValues = (value) => {
    console.log('selectedValues of value ==>', value);

    return value
      .map((item) => {
        // 아이템의 id가 숫자인 경우 '0'을 반환하고, 문자열인 경우 대문자로 변환하여 반환
        if (typeof item.id === 'number') {
          return item.id;
        } else if (
          item.id === 'kml' ||
          item.id === 'hippo' ||
          item.id === 'nmea'
        ) {
          return item.id;
        } else {
          return item.id.toUpperCase();
        }
      })
      .join(',');
  };

  /**
   * SelectedValuesFeature
   */
  const selectedValuesFeature = (value) => {
    console.log('selectedValuesFeature of value ==>', value);

    return value
      .map((item) => {
        return item.name;
      })
      .join(',');
  };

  /**
   * SelectedValuesTag
   */
  const selectedValuesTag = (value) => {
    console.log('selectedValuesTag of value ==>', value);

    return value
      .map((item) => {
        return item.name;
      })
      .join(',');
  };

  // 라디오 버튼 클릭 시 호출되는 핸들러
  const handleRadioChange = (event) => {
    console.log('event.target.value', event.target.value);

    const value = event.target.value === 'AND' ? 0 : 1;
    console.log('handleRadioChange of value ==>', value);
    return value;
  };

  const handleSelectionChange = (selectedRows) => {
    setSelectedData(selectedRows);
  };

  const handleButtonClick = () => {
    // 선택된 데이터를 RightSideSlide, LeftSideSlide, GoogleMap에 전달
    // console.log('Selected data to pass:', selectedData);
    // 예: setRightSideData(selectedData);
    // 예: setLeftSideData(selectedData);
    // 예: setGoogleMapData(selectedData);
    routeData(selectedData);
    setOpen(false);
  };

  return (
    <Transition show={open}>
      <Dialog onClose={() => setOpen(false)} className="relative z-50">
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
              <DialogPanel className="relative rounded-lg bg-white p-5 shadow-xl text-left transition-all sm:max-w-screen-xl">
                <div className="flex justify-between py-3 px-5 bg-blue_ncs">
                  <h1 className="font-semibold text-white">로그 검색</h1>
                  <button
                    className="font-semibold"
                    onClick={() => setOpen(false)}
                  >
                    <MdClose className="text-white" size={16} />
                  </button>
                </div>

                {/* 탭 버튼 */}
                <div className="mt-4 flex space-x-4">
                  <button
                    className={`px-4 py-2 font-semibold ${activeTab === 'route' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                    onClick={() => handleTabChange('route')}
                  >
                    경로
                  </button>
                  <button
                    className={`px-4 py-2 font-semibold ${activeTab === 'batch' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                    onClick={() => handleTabChange('batch')}
                  >
                    배치
                  </button>
                </div>

                {/* 탭 내용 */}
                <div className="mt-5">
                  {activeTab === 'route' && (
                    <div>
                      {/* 여기에 기존 경로 관련 코드를 넣습니다 */}
                      <div
                        id="search_fieds"
                        className="flex items-center justify-start z-20"
                      >
                        <span className="w-1/5 text-md font-semibold text-slate-700 text-center">
                          {/* 검색 필드 */}
                          {t('LogModal.SearchFields')}
                        </span>
                        <MultipleSelectDropDown
                          options={fields.map((field) => ({
                            ...field,
                            value: field.id,
                          }))}
                          onChange={(val) => setSelectedSearchFields(val)}
                        />
                      </div>
                      <div className="flex flex-wrap mb-4 mt-4">
                        {!isEmpty(selectedSearchFields) &&
                          selectedSearchFields.map((field) => (
                            <div
                              key={field.id}
                              className="flex w-full sm:w-1/2 items-center mt-2"
                            >
                              <label className="w-1/4 text-sm font-semibold text-slate-700 px-2">
                                {/* searchWord (설명 찾기) */}
                                {field.name}
                              </label>
                              {field.id === 'description' ? (
                                <input
                                  type="text"
                                  id={field.id}
                                  className="w-3/4 rounded-md border-0 py-1.5 px-2 text-gray-900 shadow ring-1 ring-inset ring-gray-400 placeholder:text-gray-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 sm:text-sm sm:leading-6"
                                  onChange={(e) => {
                                    setCond((prevState) => {
                                      return {
                                        ...prevState,
                                        searchWord: e.target.value,
                                      };
                                    });
                                  }}
                                  // onChange={(e) => {
                                  //   const newFields = selectedSearchFields.map((f) =>
                                  //     f.id === field.id ? { ...f, value: e.target.value } : f
                                  //   );
                                  //   setSelectedSearchFields(newFields);
                                  // }}
                                />
                              ) : field.id === 'feature' ? (
                                // feature 기능
                                <div className="w-3/4 flex flex-row space-x-2">
                                  <MultipleSelectDropDown
                                    // options={getOptionsByFieldId(`${field.id}-1`)}
                                    options={featureList.featureTop}
                                    className="flex-1"
                                    onChange={handleTopFeatureChange}
                                  />
                                  <MultipleSelectDropDown
                                    // options={getOptionsByFieldId(`${field.id}-2`)}
                                    options={filteredBottomOptions}
                                    className="flex-1"
                                    onChange={(value) => {
                                      setCond((prevState) => {
                                        return {
                                          ...prevState,
                                          feature: selectedValuesFeature(value),
                                        };
                                      });
                                    }}
                                  />
                                </div>
                              ) : field.id === 'tag' ? (
                                <div className="w-3/4 flex flex-row space-x-2">
                                  <MultipleSelectDropDown
                                    options={getOptionsByFieldId(`${field.id}`)}
                                    className="flex-1"
                                    onChange={(value) => {
                                      setCond((prevState) => {
                                        return {
                                          ...prevState,
                                          tag: selectedValuesTag(value),
                                        };
                                      });
                                    }}
                                  />
                                  <div className="flex items-center space-x-2">
                                    <label className="flex items-center">
                                      <input
                                        type="radio"
                                        name={`${field.id}-option`}
                                        value="AND"
                                        className="form-radio"
                                        checked={cond.operation === 0} // AND가 기본으로 선택됨
                                        onChange={(value) => {
                                          setCond((prevState) => {
                                            return {
                                              ...prevState,
                                              operation:
                                                handleRadioChange(value),
                                            };
                                          });
                                        }}
                                      />
                                      <span className="ml-1">AND</span>
                                    </label>
                                    <label className="flex items-center">
                                      <input
                                        type="radio"
                                        name={`${field.id}-option`}
                                        value="OR"
                                        className="form-radio"
                                        checked={cond.operation === 1}
                                        onChange={(value) => {
                                          setCond((prevState) => {
                                            return {
                                              ...prevState,
                                              operation:
                                                handleRadioChange(value),
                                            };
                                          });
                                        }}
                                      />
                                      <span className="ml-1">OR</span>
                                    </label>
                                  </div>
                                </div>
                              ) : field.id === 'virtual' ? (
                                <div className="w-3/4 flex flex-row space-x-2">
                                  <SingleSelectDropDown
                                    options={getOptionsByFieldId(field.id)}
                                    onChange={(value) => {
                                      console.log('value', value);

                                      setCond((prevState) => {
                                        return {
                                          ...prevState,
                                          virtual: value.id,
                                        };
                                      });
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="w-3/4 flex flex-row space-x-2">
                                  <MultipleSelectDropDown
                                    options={getOptionsByFieldId(field.id)}
                                    onChange={(value) => {
                                      setCond((prevState) => {
                                        return {
                                          ...prevState,
                                          [field.id]: selectedValues(value),
                                        };
                                      });
                                    }}
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
                            className="h-5 w-5 text-sky-500"
                            aria-hidden="true"
                          />
                          <span className="text-base text-sky-500 font-bold">
                            검색
                          </span>
                        </button>
                      </div>
                      {loading && <p>로딩 중...</p>}
                      {error && <p className="text-red-500">{error}</p>}
                      <MainGrid
                        list={list}
                        onSelectionChange={(selectedRows) =>
                          setList(selectedRows)
                        }
                      />
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={handleButtonClick}
                          className="inline-flex items-center gap-x-1.5 font-semibold text-sm border-slate-300 border rounded-md py-2 px-3 ms-2 focus:ring-1 focus:border-sky-500 hover:border-sky-500"
                        >
                          <FaCheck
                            className="h-5 w-5 text-slate-700"
                            aria-hidden="true"
                          />
                          선택
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'batch' && (
                    <div>
                      {/* 배치 관련 내용을 여기에 넣습니다 */}
                      <p>배치 관련 내용이 여기에 들어갑니다.</p>
                    </div>
                  )}
                </div>
              </DialogPanel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});
export default LogModal;
