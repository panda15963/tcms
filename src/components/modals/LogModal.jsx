import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useRef,
} from 'react';
import { Dialog, DialogPanel, Transition } from '@headlessui/react';
import { MdClose } from 'react-icons/md';
import { FaCheck, FaSearch } from 'react-icons/fa';
import MainGrid from '../tables/MainGrid';
import { nonAuthInstance } from '../../server/AxiosConfig';
import logService from '../../service/logService';
import MultipleSelectDropDown from '../dropdowns/MultipleSelectDropDown';
import { isEmpty } from 'lodash';
import SingleSelectDropDown from '../dropdowns/SingleSelectDropDown';
import { useTranslation } from 'react-i18next';
import ConfigGridL from '../tables/ConfigGridL';
import ConfigGridR from '../tables/ConfigGridR';
import ConfigGridL2 from '../tables/ConfigGridL2';
import MainGrid2 from '../tables/MainGrid2';
import { useLocation } from 'react-router-dom';
import i18next from 'i18next';

/**
 * 로그 검색
 * http://localhost:3000/log/kr
 * http://localhost:3000/log/en
 */
const LogModal = forwardRef(({ routeData, routeFullCoords, isDirect }, ref) => {
  const { t, i18n } = useTranslation();
  const location = useLocation(); // 현재 경로 정보를 얻기 위한 useLocation 훅 사용
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

  const initialConfigCond = {
    group_id: -1, // all : -1, virtual : 0, real : 1
    description: '',
    tag: '',
    operation: '1',
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

  const fieldsCinfiguration = [
    { id: 'description', name: t('Fields.FindDescription') },
    // { id: 'continent', name: t('Fields.Continent') },
    // { id: 'region', name: t('Fields.Region') },
    // { id: 'priority', name: t('Fields.Priority') },
    // { id: 'feature', name: t('Fields.Feature') },
    // { id: 'target', name: t('Fields.Target') },
    // { id: 'virtual', name: t('Fields.Virtual') },
    // { id: 'format', name: t('Fields.Format') },
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
  const [configCond, setConfigCond] = useState(initialConfigCond);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('route'); // "route" 탭을 기본값으로 설정
  const [selectedSearchFields, setSelectedSearchFields] = useState([]);
  const [selectedSearchFieldsConfig, setSelectedSearchFieldsConfig] = useState(
    [],
  );
  const [error, setError] = useState(null);
  const [countryList, setCountryList] = useState(initialList);
  const [featureList, setFeatureList] = useState(initialList);
  const [targetList, setTargetList] = useState(initialList);
  const [tagList, setTagList] = useState(initialList);
  const [list, setList] = useState(initialList);
  const [list2, setList2] = useState(initialList);
  const [configList, setConfigList] = useState(initialList);
  const [configList2, setConfigList2] = useState(initialList);
  const [filteredBottomOptions, setFilteredBottomOptions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedConfigIds, setSelectedConfigIds] = useState([]);
  const [selectedLogList, setSelectedLogList] = useState([]);
  const [selectedLogList2, setSelectedLogList2] = useState([]);
  const selectedConfigRowsRef = useRef([]); // useRef instead of useState

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

  useEffect(() => {
    console.log('[LIST]유즈이팩 실행 체크 ==>');
    console.log(
      'useEffect of selectedSearchFieldsConfig ==>',
      selectedSearchFieldsConfig,
    );
    // selectedOptions는 선택된 필드의 객체 리스트로 가정합니다.
    const ids = selectedSearchFieldsConfig.map((option) => option.id);

    console.log('ids ==>', ids);
    setSelectedConfigIds(ids); // 선택된 ID 리스트를 업데이트
  }, [selectedSearchFieldsConfig]);

  /**
   * Find 클릭 이벤트
   */
  const onFindMeta = async () => {
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
        });
    } catch (e) {
      console.log('FIND_META of error ==>', e);
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

  /**
   * SPACE_INTERPOLATION
   */
  const SPACE_INTERPOLATION = async (fileIds) => {
    try {
      if (!Array.isArray(fileIds)) {
        fileIds = [fileIds]; // Convert single fileId to array
      }

      const promises = fileIds.map((fileId) => {
        return logService
          .SPACE_INTERPOLATION({
            cond: { file_id: fileId },
          })
          .then((res) => {
            try {
              // Check if `res` is a string before applying `replace()`
              if (typeof res === 'string') {
                const preprocessedRes = res.replace(
                  /Coord\(lat=([\d.-]+),\s*lng=([\d.-]+)\)/g,
                  '{"lat":$1,"lng":$2}',
                );
                return JSON.parse(preprocessedRes); // Parse the preprocessed string into JSON
              } else {
                console.warn('Response is not a string:', res);
                return res; // If it's an object, return it as is
              }
            } catch (error) {
              console.error(
                `Error parsing response for fileId ${fileId}:`,
                error,
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

  // 라디오 버튼 클릭 시 호출되는 핸들러
  const handleRadioChange = (event) => {
    console.log('event.target.value', event.target.value);

    const value = event.target.value === 'AND' ? 0 : 1;
    console.log('handleRadioChange of value ==>', value);
    return value;
  };

  // Example function where list is expected to be an array

  /*
   * 로그검색 선택 이벤트
   */
  const handleButtonClick = async () => {
    console.log('로그검색 경로 선택버튼 이벤트 입니다.');

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

    const arrayFromList = findArray(list);

    if (arrayFromList) {
      const fileIds = arrayFromList.map((route) => route.file_id);
      const routeCoords = await SPACE_INTERPOLATION(fileIds);
      routeData(list);
      routeFullCoords(routeCoords);
    } else {
      console.error('No array found in list');
    }

    setOpen(false);

    setCond(initialCond); // Resetting the search conditions
    setSelectedSearchFields([]); // Reset the selected search fields
    setSelectedIds([]); // Reset the selected IDs for fields
    setList(initialList); // Reset the list of search results

    setSelectedLogList([]);
    setSelectedLogList2([]);
  };

  /*
   * 선택버튼 이벤트
   */
  const handleConfigButtonClick = async () => {
    console.log(
      'handleConfigButtonClick of selectedLogList ==>',
      selectedLogList,
    );

    const fileIds = selectedConfigRowsRef.current.map((route) => route.file_id);
    console.log('handleConfigButtonClick of fileIds ==>', fileIds);

    const routeCoords = await SPACE_INTERPOLATION(fileIds);
    console.log('handleConfigButtonClick of routeCoords ==>', routeCoords);

    routeData(selectedConfigRowsRef.current);
    routeFullCoords(routeCoords);

    setOpen(false);

    setCond(initialCond);
    setSelectedSearchFields([]);
    setSelectedIds([]);

    setList(initialList);
    setList2(initialList);

    setSelectedLogList([]);
    setSelectedLogList2([]);

    setSelectedRouteCellData();
    setIsRouteModalOpen(false);
  };

  /*
   * 로그검색 배치 이벤트
   */
  const handleConfigBtnClick = async () => {
    console.log('로그검색 배치 선택버튼 이벤트 입니다.');
    console.log('handleConfigBtnClick of selectedLogList ==>', selectedLogList);
  };

  /**
   * Find Tccfg 클릭 이벤트
   */
  const onFindTccfg = async () => {
    setError(null);

    const condTmp = {
      group_id: -1,
      description: selectedConfigIds.includes('description')
        ? configCond.description
        : '',
      tag: selectedConfigIds.includes('tag') ? configCond.tag : '',
      operation: configCond.operation,
    };

    console.log('onFindMeta of condTmp ==>', condTmp);
    FIND_TCCFG(condTmp);
  };

  /**
   * FIND TCCFG
   */
  const FIND_TCCFG = async (inputCond) => {
    try {
      await logService
        .FIND_TCCFG_10003({
          cond: inputCond,
        })
        .then((res) => {
          console.log('FIND_TCCFG_10003 of res ==>', res);
          setConfigList((prevState) => {
            return {
              ...prevState,
              list: res.findTccfg,
            };
          });
        });
    } catch (e) {
      console.log('FIND_TCCFG_10003 of error ==>', e);
    }
  };

  /*
   * 로그검색 -> 배치탭 -> 선택 이벤트
   */
  const handleLeftSelectionChange = (selectedRows) => {
    console.log('handleLeftSelectionChange of selectedRows ==>', selectedRows);
    if (selectedRows && selectedRows.length > 0) {
      setSelectedLogList(selectedRows[0].loglist);
    }
  };

  const handleLeftCellClick = (rowData) => {
    setSelectedLogList(rowData.loglist); // 셀 클릭 시 loglist 설정
  };

  const handleLeftSelectionChange2 = (selectedRows) => {
    console.log(
      'handleLeftSelectionChange2 of selectedRows2 ==>',
      selectedRows,
    );
    if (selectedRows && selectedRows.length > 0) {
      setSelectedLogList2(selectedRows[0].loglist);
    }
  };

  const handleLeftCellClick2 = (rowData) => {
    setSelectedLogList2(rowData.loglist); // 셀 클릭 시 loglist 설정
  };

  // 루트 모달 상태 관리
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [selectedRouteCellData, setSelectedRouteCellData] = useState(null);

  // 배치 모달 상태 관리
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedConfigCellData, setSelectedConfigCellData] = useState(null);

  const openRouteModal = (cellData) => {
    console.log('Opening modal with cell data:', cellData); // 디버깅 로그 추가
    setSelectedRouteCellData(cellData); // 선택된 셀의 데이터 저장
    setIsRouteModalOpen(true); // 모달 열기
  };

  const closeRouteModal = () => {
    setIsRouteModalOpen(false); // 모달 닫기
  };

  const openConfigModal = (cellData) => {
    console.log('Opening modal with cell data:', cellData); // 디버깅 로그 추가
    setSelectedConfigCellData(cellData); // 선택된 셀의 데이터 저장
    setIsConfigModalOpen(true); // 모달 열기
  };

  const closeConfigModal = () => {
    setIsConfigModalOpen(false); // 모달 닫기
  };

  /*
   * 경로 모달 창에서 API 조회 및 데이터 표시하는 컴포넌트
   * 경로 모달 (더블클릭)
   */
  const RouteModalComponent = ({ data, onClose }) => {
    console.log('RouteModalComponent of data ==>', data);
    console.log('RouteModalComponent of onClose ==>', onClose);

    useEffect(() => {
      const fetchData = async () => {
        try {
          if (data && data.meta_id) {
            // API 호출 (data.id 또는 적절한 키로 조회)
            const response = await nonAuthInstance.get(
              `/find/sameorigin/meta?group_id=${data.group_id}&meta_id=${data.origin_meta_id}`,
            );
            console.log('RouteModalComponent of response1', response);
            console.log('RouteModalComponent of response2', response.data);

            setList2((prevState) => {
              const newList = response.data.findMeta;
              if (JSON.stringify(prevState) !== JSON.stringify(newList)) {
                return newList;
              }
              return prevState;
            });
          }
        } catch (error) {
          console.error('API Error:', error);
        }
      };

      if (data) {
        fetchData();
      }
    }, [data]);

    // 경로 모달창에서 더블클릭
    return (
      <Dialog open={true} onClose={onClose}>
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-50">
          <div className="bg-white p-1 rounded-md shadow-lg">
            <div className="flex justify-between py-3 px-5 bg-blue-600 rounded-t-lg">
              <h1 className="font-semibold text-white">
                {t('LogModal.AllVersions')}
              </h1>
              <button
                className="font-semibold"
                onClick={() => setIsRouteModalOpen(false)}
              >
                <MdClose className="text-white" size={16} />
              </button>
            </div>
            <div
              className="flex flex-row justify-between space-x-4 my-4"
              style={{ marginTop: '0px', marginBottom: '0px' }}
            >
              {/* 메인2 그리드 */}
              <div className="flex-1 border border-gray-300 p-4">
                <h2 className="text-center text-xl font-bold mb-2"></h2>
                <MainGrid2
                  list={list2}
                  onSelectionChange={handleSelectionChangeRoute}
                />
              </div>
            </div>
            <div className="flex justify-end mt-1">
              <button
                onClick={handleConfigButtonClick}
                className="inline-flex items-center border-2 gap-x-2 px-3 py-1 font-semibold text-sm border-slate-300 rounded-md  focus:ring-1 focus:border-sky-500 hover:border-sky-500 cursor-pointer"
              >
                <FaCheck className="h-5 w-5 text-sky-500" aria-hidden="true" />
                <span className="text-base text-sky-500 font-bold">
                  {/* 로그검색 -> 더블클릭 -> 선택 버튼 */}
                  {t('LogModal.Select')}
                </span>
              </button>
            </div>
            {/* <h2>Cell Data: {data ? data.description : 'No Data'}</h2>
          <p>API Result: {apiData ? JSON.stringify(apiData) : 'Loading...'}</p>
          <button onClick={onClose} className="mt-2 p-2 bg-blue-500 text-white rounded">Close</button> */}
          </div>
        </div>
      </Dialog>
    );
  };

  const handleSelectionChangeRoute = (selectedRows) => {
    console.log(
      'handleSelectionChangeRoute of selectedRows ==>',
      selectedRows,
      selectedConfigRowsRef,
    );
    if (selectedRows && selectedRows.length > 0) {
      selectedConfigRowsRef.current = selectedRows;
    }
  };

  // 배치 모달 창에서 API 조회 및 데이터 표시하는 컴포넌트
  const ConfigModalComponent = ({ data, onClose }) => {
    console.log('ConfigModalComponent of data ==>', data);

    useEffect(() => {
      const fetchData = async () => {
        try {
          if (data && data.tccfg_id) {
            // API 호출 (data.id 또는 적절한 키로 조회)
            const response = await nonAuthInstance.get(
              // `/find/sameorigin/tccfg?group_id=${-1}&tccfg_id=${data.tccfg_id}`,
              `/find/sameorigin/tccfg?group_id=${data.group_id}&tccfg_id=${data.origin_tccfg_id}`,
            );
            console.log('response', response);
            console.log('response', response.data);

            setConfigList2((prevState) => {
              const newList = response.data.findTccfg;
              if (JSON.stringify(prevState) !== JSON.stringify(newList)) {
                return newList;
              }
              return prevState;
            });
          }
        } catch (error) {
          console.error('API Error:', error);
        }
      };

      if (data) {
        fetchData();
      }
    }, [data]);

    // 로그 검색 (배치탭 -> 더블클릭)
    return (
      <Dialog open={true} onClose={onClose}>
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-50">
          <div className="bg-white p-4 rounded-md shadow-lg">
            <div className="flex justify-between py-3 px-5 bg-blue_ncs">
              <h1 className="font-semibold text-white">
                {t('LogModal.AllVersions')}
              </h1>
              <button
                className="font-semibold"
                onClick={() => setIsConfigModalOpen(false)}
              >
                <MdClose className="text-white" size={16} />
              </button>
            </div>
            <div className="flex flex-row justify-between space-x-4 my-4">
              {/* 왼쪽 그리드 */}
              <div className="flex-1 border border-gray-300 p-4">
                <h2 className="text-center text-xl font-bold mb-2"></h2>
                <ConfigGridL2
                  list={configList2} // 왼쪽 그리드에 대한 데이터 리스트
                  onSelectionChange={handleLeftSelectionChange2}
                  onCellClick={handleLeftCellClick2} // 셀 클릭 시
                />
              </div>

              {/* 오른쪽 그리드 */}
              <div className="flex-1 border border-gray-300 p-4">
                <h2 className="text-center text-xl font-bold mb-2"></h2>
                <ConfigGridR
                  list={selectedLogList2} // 오른쪽 그리드에 대한 데이터 리스트
                  // onSelectionChange={
                  //   (selectedRows) => setRightList(selectedRows) // 오른쪽 그리드에서 선택된 행 업데이트
                  // }
                />
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <button
                onClick={handleConfigButtonClick}
                className="inline-flex items-center border-2 gap-x-2 px-3 py-2 font-semibold text-sm border-slate-300 rounded-md  focus:ring-1 focus:border-sky-500 hover:border-sky-500 cursor-pointer"
              >
                <FaCheck className="h-5 w-5 text-sky-500" aria-hidden="true" />
                <span className="text-base text-sky-500 font-bold">
                  {t('LogModal.Select')}
                </span>
              </button>
            </div>
            {/* <h2>Cell Data: {data ? data.description : 'No Data'}</h2>
            <p>API Result: {apiData ? JSON.stringify(apiData) : 'Loading...'}</p>
            <button onClick={onClose} className="mt-2 p-2 bg-blue-500 text-white rounded">Close</button> */}
          </div>
        </div>
      </Dialog>
    );
  };

  // 로그검색
  return (
    <Transition show={open}>
      <Dialog
        onClose={() => {
          setList(initialList); // list 초기화
          setList2(initialList);
          setOpen(false); // 모달 닫기
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
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
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
              <DialogPanel
                className="relative rounded-lg bg-white  shadow-xl text-left transition-all sm:max-w-screen-xl"
                style={{ width: '1324px' }}
              >
                {/* 모달 헤더 */}
                <div className="flex justify-between py-3 px-5 bg-blue-600 rounded-t-lg">
                  <h1 className="font-semibold text-white">
                    {t('LogModal.ModalName')}
                  </h1>
                  <button
                    className="font-semibold"
                    onClick={() => {
                      setOpen(false);
                      setList(initialList);
                      setList2(initialList);
                    }}
                  >
                    <MdClose className="text-white" size={16} />
                  </button>
                </div>

                {/* 탭 버튼 */}
                <div className="m-2 flex space-x-2 ">
                  <button
                    className={`h-9 px-2 py-1 rounded-lg border transition duration-300 ease-in-out min-w-[120px] ${
                      activeTab === 'route'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                    }`}
                    onClick={() => handleTabChange('route')}
                  >
                    {/* 경로탭 버튼*/}
                    {t('LogModal.Route')}
                  </button>
                  <button
                    className={`h-9 px-2 py-1 rounded-lg border transition duration-300 ease-in-out min-w-[120px] ${
                      activeTab === 'batch'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                    }`}
                    onClick={() => handleTabChange('batch')}
                  >
                    {/* 배치탭 버튼*/}
                    {t('LogModal.Configuration')}
                  </button>
                </div>

                {/* 탭 내용 */}
                <div className="mt-0">
                  {/* 경로탭 */}
                  {activeTab === 'route' && (
                    <div className="mr-2 ml-2 mb-2">
                      <div
                        id="search_fieds"
                        className="flex items-center justify-start z-20"
                      >
                        <span className="w-1/4 text-md font-semibold text-slate-700 text-left">
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
                      <div className="flex flex-wrap mb-2 mt-0">
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
                          className="h-10 inline-flex items-center border-2 gap-x-2 px-3 py-2 font-semibold text-sm border-slate-300 rounded-md  focus:ring-1 focus:border-sky-500 hover:border-sky-500 cursor-pointer"
                          onClick={onFindMeta}
                        >
                          <FaSearch
                            className="h-5 w-5 text-sky-500"
                            aria-hidden="true"
                          />
                          <span className="text-base text-sky-500 font-bold">
                            {/* 로그검색 -> 검색 버튼 */}
                            {t('LogModal.Find')}
                          </span>
                        </button>
                      </div>
                      {/* {loading && <p>로딩 중...</p>} */}
                      {error && <p className="text-red-500">{error}</p>}
                      <MainGrid
                        list={list}
                        onSelectionChange={(selectedRows) =>
                          setList(selectedRows)
                        }
                        onCellDoubleClick={openRouteModal} // 더블클릭 이벤트 추가
                      />

                      {/* 모달 렌더링 */}
                      {isRouteModalOpen && (
                        <RouteModalComponent
                          data={selectedRouteCellData}
                          onClose={closeRouteModal}
                        />
                      )}

                      <div className="flex justify-end mt-3">
                        <button
                          onClick={handleButtonClick}
                          className="h-10 inline-flex items-center border-2 gap-x-2 px-3 py-2 font-semibold text-sm border-slate-300 rounded-md  focus:ring-1 focus:border-sky-500 hover:border-sky-500 cursor-pointer"
                        >
                          <FaCheck
                            className="h-5 w-5 text-sky-500"
                            aria-hidden="true"
                          />
                          <span className="text-base text-sky-500 font-bold">
                            {/* 경로탭 선택 버튼 */}
                            {t('LogModal.Select')}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                  {/* 배치탭 */}
                  {activeTab === 'batch' && (
                    <div className="mr-2 ml-2 mb-2">
                      <div id="search_fieds" className="flex items-center">
                        <label className="w-1/4 text-sm font-semibold text-slate-700 px-2">
                          {/* 검색 필드 */}
                          {t('LogModal.SearchFields')}
                        </label>
                        <MultipleSelectDropDown
                          options={fieldsCinfiguration.map((field) => ({
                            ...field,
                            value: field.id,
                          }))}
                          onChange={(val) => setSelectedSearchFieldsConfig(val)}
                        />
                      </div>
                      <div className="flex flex-wrap mb-2 mt-0">
                        {!isEmpty(selectedSearchFieldsConfig) &&
                          selectedSearchFieldsConfig.map((field) => (
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
                                    console.log('e', e);

                                    setConfigCond((prevState) => {
                                      return {
                                        ...prevState,
                                        description: e.target.value,
                                      };
                                    });
                                  }}
                                />
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
                          className="h-10 inline-flex items-center border-2 gap-x-2 px-3 py-2 font-semibold text-sm border-slate-300 rounded-md  focus:ring-1 focus:border-sky-500 hover:border-sky-500 cursor-pointer"
                          onClick={onFindTccfg}
                        >
                          <FaSearch
                            className="h-5 w-5 text-sky-500"
                            aria-hidden="true"
                          />
                          <span className="text-base text-sky-500 font-bold">
                            {/* 배치탭 검색버튼 */}
                            {t('LogModal.Find')}
                          </span>
                        </button>
                      </div>
                      {/* {loading && <p>로딩 중...</p>} */}
                      {error && <p className="text-red-500">{error}</p>}
                      {/* 그리드를 2개로 나누어 왼쪽과 오른쪽에 표시 */}
                      <div className="flex flex-row justify-between space-x-2 ">
                        {/* 왼쪽 그리드 */}
                        <ConfigGridL
                          list={configList} // 왼쪽 그리드에 대한 데이터 리스트
                          onSelectionChange={
                            // (selectedRows) => setLeftList(selectedRows) // 왼쪽 그리드에서 선택된 행 업데이트
                            handleLeftSelectionChange
                          }
                          onCellClick={handleLeftCellClick} // 셀 클릭 시
                          onCellDoubleClick={openConfigModal} // 더블클릭 이벤트 추가
                        />

                        {/* 모달 렌더링 */}
                        {isConfigModalOpen && (
                          <ConfigModalComponent
                            data={selectedConfigCellData}
                            onClose={closeConfigModal}
                          />
                        )}

                        {/* 오른쪽 그리드 */}
                        <h2 className="text-center text-xl font-bold mb-2 border"></h2>
                        <ConfigGridR
                          list={selectedLogList} // 오른쪽 그리드에 대한 데이터 리스트
                          onSelectionChange={
                            (selectedRows) => setRightList(selectedRows) // 오른쪽 그리드에서 선택된 행 업데이트
                          }
                        />
                      </div>
                      <div className="flex justify-end mt-1">
                        <button
                          onClick={handleConfigBtnClick}
                          className="h-10 inline-flex items-center border-2 gap-x-2 px-3 py-2 font-semibold text-sm border-slate-300 rounded-md  focus:ring-1 focus:border-sky-500 hover:border-sky-500 cursor-pointer"
                        >
                          <FaCheck
                            className="h-5 w-5 text-sky-500"
                            aria-hidden="true"
                          />
                          <span className="text-base text-sky-500 font-bold">
                            {/* 배치탭 선택 버튼 */}
                            {t('LogModal.Select')}
                          </span>
                        </button>
                      </div>
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
