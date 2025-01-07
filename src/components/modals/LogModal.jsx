import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Dialog, DialogPanel, Transition } from '@headlessui/react';
import { MdClose } from 'react-icons/md';
import { FaCheck, FaSearch } from 'react-icons/fa';
import MainGrid from '../tables/mapTables/MainGrid';
import MapLogService from '../../service/MapLogService';
import MultipleSelectDropDown from '../dropdowns/mapMenus/MultipleSelectDropDown';
import { isEmpty } from 'lodash';
import SingleSelectDropDown from '../dropdowns/mapMenus/SingleSelectDropDown';
import { useTranslation } from 'react-i18next';
import ConfigGridL from '../tables/mapTables/ConfigGridL';
import ConfigGridR from '../tables/mapTables/ConfigGridR';
import { useLocation } from 'react-router-dom';
import i18next from 'i18next';
import { FaDownload } from 'react-icons/fa6';
import Error from '../alerts/Error';
import useDidMount from '../../hooks/useDidMount';
import useLoading from '../../hooks/useLoading';
import RouteModal from './RouteModal';
import ConfigModal from './ConfigModal';
import { axiosInstance } from '../../server/axios_config';

/**
 * 로그 검색
 * 다운로드 가능 별도 모달 :
 *    http://localhost:3000/log/kr
 *    http://localhost:3000/log/en
 */
const LogModal = forwardRef(({ routeData, routeFullCoords, isDirect }, ref) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { loading, setLoading } = useLoading();
  const accessToken = localStorage.getItem('ACCESS_TOKEN');

  // 초기 검색 조건
  const initialCond = {
    searchWord: '', // 검색어
    continent: '', // 대륙
    region: '', // 지역
    priority: '', // 우선순위
    target: '', // 대상
    format: '', // 형식
    feature: '', // 특징
    virtual: -1, // 가상: -1(전체), 0(가상), 1(실제)
    tag: '', // 태그
    group_id: -1, // 그룹 ID
    operation: 0, // 연산: 0(AND), 1(OR)
  };

  const initialConfigCond = {
    group_id: -1, // 그룹 ID
    description: '', // 설명
    tag: '', // 태그
    operation: '1', // 연산
  };

  const initialList = {
    status: 'idle', // 상태
    currentRequestId: undefined, // 현재 요청 ID
    error: null, // 에러
    list: [], // 리스트
  };

  // 검색 필드 옵션
  const searchFields = [
    { id: 'description', name: t('Fields.FindDescription') }, // 검색 설명
    { id: 'continent', name: t('Fields.Continent') }, // 대륙
    { id: 'region', name: t('Fields.Region') }, // 지역
    { id: 'priority', name: t('Fields.Priority') }, // 우선순위
    { id: 'feature', name: t('Fields.Feature') }, // 특징
    { id: 'target', name: t('Fields.Target') }, // 대상
    { id: 'virtual', name: t('Fields.Virtual') }, // 가상
    { id: 'format', name: t('Fields.Format') }, // 형식
    { id: 'tag', name: t('Fields.Tag') }, // 태그
  ];

  // 화면 정보 검색 필드 옵션
  const configFields = [
    { id: 'description', name: t('Fields.FindDescription') }, // 검색 설명
    { id: 'tag', name: t('Fields.Tag') }, // 태그
  ];

  // 우선순위 선택 옵션
  const priority = [
    { id: 'all', name: t('Common.All') }, // 전체
    { id: 'top', name: t('Priority.Top') }, // 최상위
    { id: 'a', name: t('Priority.A') }, // A
    { id: 'b', name: t('Priority.B') }, // B
    { id: 'c', name: t('Priority.C') }, // C
  ];

  // 형식 선택 옵션
  const format = [
    { id: 'all', name: t('Common.All') }, // 전체
    { id: 'hippo', name: t('Format.Hippo') }, // 히포 형식
    { id: 'kml', name: t('Format.Kml') }, // KML 형식
    { id: 'nmea', name: t('Format.Nmea') }, // NMEA 형식
  ];

  // 가상/실제 선택 옵션
  const virtual = [
    { id: -1, name: t('Common.All') }, // 전체
    { id: 0, name: t('Virtual.VirtualLog') }, // 가상 로그
    { id: 1, name: t('Virtual.RealLog') }, // 실제 로그
  ];

  // 대륙 이름 매핑
  const continentNameMap = {
    AF: t('Continents.Africa'), // 아프리카
    AS: t('Continents.Asia'), // 아시아
    EU: t('Continents.Europe'), // 유럽
    NA: t('Continents.NorthAmerica'), // 북미
    OC: t('Continents.Oceania'), // 오세아니아
    SA: t('Continents.SouthAmerica'), // 남미
  };

  // 모달 상태 및 조건 관리
  const [cond, setCond] = useState(initialCond); // 검색 조건
  const [configCond, setConfigCond] = useState(initialConfigCond); // 화면 정보 조건
  const [error, setError] = useState(null); // 에러 상태
  const [errorValue, setErrorValue] = useState(''); // 에러 메시지
  const [open, setOpen] = useState(false); // 모달 열림 상태
  const [activeTab, setActiveTab] = useState('route'); // 활성 탭 ('route' 또는 'batch')

  // 검색필드 리스트 관련
  const [selectedSearchFields, setSelectedSearchFields] = useState([]); // 경로탭 검색필드
  const [selectedSearchFieldsConfig, setSelectedSearchFieldsConfig] = useState(
    []
  ); // 화면정보탭 검색필드
  const [countryList, setCountryList] = useState(initialList);
  const [featureList, setFeatureList] = useState(initialList);
  const [targetList, setTargetList] = useState(initialList);
  const [tagList, setTagList] = useState(initialList);
  const [filteredBottomOptions, setFilteredBottomOptions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedConfigIds, setSelectedConfigIds] = useState([]);

  // 리스트 표출 관련
  const [list, setList] = useState(initialList); // 경로탭 검색 리스트
  const [listConfig, setListConfig] = useState(initialList); // 화면정보탭 검색 리스트
  const [listRouteCount, setListRouteCount] = useState(0); // 경로탭 총 결과 카운트
  const [listConfigCount, setListConfigCount] = useState(0); // 화면정보탭 총 결과 카운트
  const [selectedRoutes, setSelectedRoutes] = useState([]); // 경로탭 체크박스 선택

  const [selectedTccfg, setSelectedTccfg] = useState(initialList); // 화면정보탭 체크박스 선택 (왼쪽)
  const [selectedLogList, setSelectedLogList] = useState(initialList); // 화면정보탭 체크박스 선택 (오른쪽)

  // 모달창 상태 관리
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false); // 경로 모달 상태 관리
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false); // 화면정보 모달 상태 관리

  // 더블클릭 관련
  const [selectedRouteCellData, setSelectedRouteCellData] = useState(null);
  const [selectedConfigCellData, setSelectedConfigCellData] = useState(null);

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
   * 검색 필드 API 최초 호출
   */
  useDidMount(() => {
    MAIN_COUNTRY();
    MAIN_FEATURE();
    MAIN_TARGET();
    MAIN_TAG();

    // 검색 필드 특징 관련 처리
    if (featureList.featureTop && featureList.featureTop.length > 0) {
      handleTopFeatureChange(featureList.featureTop[0]);
    }
  });

  /**
   * 다운로드 모달창
   * isDirect true/false 실행 감지
   */
  useEffect(() => {
    console.log('🚀 ~ useEffect ~ isDirect:', isDirect);
    console.log('🚀 ~ useEffect ~ location:', location);
    if (isDirect == true && accessToken) {
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
    } else if (isEmpty(accessToken)) {
      if (window.confirm('권한이 없습니다. 창이 닫힙니다.')) {
        window.close();
      } else {
        console.log('사용자가 창 닫기를 취소했습니다.');
      }
    }
  }, []);

  /**
   * 경로탭 검색 필드 리스트 선택
   */
  useEffect(() => {
    console.log('useEffect of selectedSearchFields ==>', selectedSearchFields);
    // selectedOptions는 선택된 필드의 객체 리스트로 가정합니다.
    const ids = selectedSearchFields.map((option) => option.id);

    console.log('useEffect of selectedSearchFields ids ==>', ids);
    setSelectedIds(ids); // 선택된 ID 리스트를 업데이트
  }, [selectedSearchFields]);

  /**
   * 화면정보탭 검색 필드 리스트 선택
   */
  useEffect(() => {
    console.log(
      'useEffect of selectedSearchFieldsConfig ==>',
      selectedSearchFieldsConfig
    );

    // selectedOptions는 선택된 필드의 객체 리스트로 가정합니다.
    const ids = selectedSearchFieldsConfig.map((option) => option.id);

    console.log('useEffect of selectedSearchFieldsConfig ids ==>', ids);
    setSelectedConfigIds(ids); // 선택된 ID 리스트를 업데이트
  }, [selectedSearchFieldsConfig]);

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
   * 모달창 탭(TAB) 핸들러
   */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  /**
   * 검색 필드 옵션 스위치
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
   * 검색 API (FIND_META_10100)
   */
  const FIND_META = async (inputCond) => {
    setLoading(true);
    try {
      await MapLogService.FIND_META_10100({
        cond: inputCond,
      }).then((res) => {
        console.log('FIND_META_10100 of res ==>', res.findMeta);
        if (res.findMeta) {
          setList((prevState) => {
            return {
              ...prevState,
              list: res.findMeta,
            };
          });
          setListRouteCount(res.findMeta.length);
        } else {
          setListRouteCount(0);
          setList((prevState) => ({
            ...prevState,
            list: [],
          }));
        }
        setLoading(false);
      });
    } catch (e) {
      console.log('FIND_META of error ==>', e);
      setLoading(false);
      setListRouteCount(0); // 결과가 없으면 0으로 설정정
      setList((prevState) => ({
        ...prevState,
        list: [],
      }));
    }
  };

  /**
   * 대륙, 지역 API (MAIN_COUNTRY)
   * continent, country_Iso2, country_Iso3, country_name
   */
  const MAIN_COUNTRY = async () => {
    try {
      await MapLogService.MAIN_COUNTRY({}).then((res) => {
        console.log('MAIN_COUNTRY of res ==>', res.country);

        // 대륙(Continent)
        const uniqueContinents = [
          ...new Set(res.country.map((country) => country.continent)),
        ];

        // 대륙(Continent) 오름차순 정렬
        uniqueContinents.sort();

        // 대륙(Continent) 분류
        const continentsList = uniqueContinents.map((continent) => ({
          id: continent.toLowerCase(),
          name: continentNameMap[continent] || continent, // 매핑된 이름 사용
        }));

        // 대륙(Continent) ALL 항목 추가
        continentsList.unshift({ id: 'all', name: t('Common.All') });

        // 지역 (Country) 주어진 데이터에서 country_Iso3를 name으로, id는 그대로 유지하는 새로운 리스트 생성
        const processedList = res.country.map((country) => ({
          id: country.country_Iso3,
          // name: country.country_Iso3,
          name: country.country_name,
        }));

        // 지역 (Country) ALL 항목 추가
        processedList.unshift({ id: 'all', name: t('Common.All') });

        // 지역 (Country)  정렬
        processedList.sort((a, b) => {
          if (a.name < b.name) return -1;
          if (a.name > b.name) return 1;
          return 0;
        });

        console.log(
          '🚀 ~ awaitMapLogService.MAIN_COUNTRY ~ continentsList:',
          continentsList
        );

        setCountryList((prevState) => {
          return {
            ...prevState,
            list: res.country,
            continent: continentsList || [], // default to empty array
            country: processedList || [], // default to empty array
          };
        });
        console.log(
          '🚀 ~ awaitMapLogService.MAIN_COUNTRY ~ featureList:',
          featureList
        );
      });
    } catch (e) {
      console.log('MAIN_COUNTRY of error ==>', e);
    }
  };

  /**
   * 특징 API (MAIN_FEATURE)
   */
  const MAIN_FEATURE = async () => {
    try {
      await MapLogService.MAIN_FEATURE({}).then((res) => {
        console.log('MAIN_FEATURE of res ==>', res.feature);

        const withHyphen = res.feature.filter((item) =>
          item.str.startsWith('-')
        );
        const withoutHyphen = res.feature.filter(
          (item) => !item.str.startsWith('-')
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

        console.log(
          '🚀 ~ awaitMapLogService.MAIN_FEATURE ~ bottomFeatureList:',
          bottomFeatureList
        );
        console.log(
          '🚀 ~ awaitMapLogService.MAIN_FEATURE ~ topFeatureList:',
          topFeatureList
        );

        // 특징 (Feature) TOP 정렬
        // topFeatureList.sort((a, b) => {
        //   if (a.name < b.name) return -1;
        //   if (a.name > b.name) return 1;
        //   return 0;
        // });

        // 특징 (Feature) ALL 항목 추가
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
   * 검색 필드 `특징` 1셀렉트박스 핸들러
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

    console.log(
      '🚀 ~ handleTopFeatureChange ~ filteredOptions:',
      filteredOptions
    );
    setFilteredBottomOptions(filteredOptions);
  };

  /**
   * 대상 API (MAIN_TARGET)
   */
  const MAIN_TARGET = async () => {
    try {
      await MapLogService.MAIN_TARGET({}).then((res) => {
        console.log('MAIN_TARGET of res ==>', res.target);

        // 대상 (Target) 주어진 데이터에서 name, id는 그대로 유지하는 새로운 리스트 생성
        const targetList = res.target.map((target) => ({
          id: target.str,
          name: target.str,
        }));

        // 대상 (Target) ALL 항목 추가
        targetList.unshift({ id: 'all', name: t('Common.All') });

        // 대상 (Target) 정렬
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
   * 태그 API (MAIN_TAG)
   */
  const MAIN_TAG = async () => {
    try {
      await MapLogService.MAIN_TAG({}).then((res) => {
        console.log('MAIN_TAG of res ==>', res.tag);

        // 태그 (Tag) 주어진 데이터에서 name, id는 그대로 유지하는 새로운 리스트 생성
        const tagList = res.tag.map((tag) => ({
          id: tag.id,
          name: tag.str,
        }));

        // 태그 (Tag) ALL 항목 추가
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
   * 경로 표출 API (SPACE_INTERPOLATION)
   */
  const SPACE_INTERPOLATION = async (fileIds) => {
    try {
      if (!Array.isArray(fileIds)) {
        fileIds = [fileIds];
      }

      const promises = fileIds.map((fileId) => {
        return MapLogService.SPACE_INTERPOLATION({
          cond: { file_id: fileId },
        }).then((res) => {
          try {
            if (typeof res === 'string') {
              const preprocessedRes = res.replace(
                /Coord\(lat=([\d.-]+),\s*lng=([\d.-]+)\)/g,
                '{"lat":$1,"lng":$2}'
              );
              return JSON.parse(preprocessedRes);
            } else {
              console.warn('Response is not a string:', res);
              return res;
            }
          } catch (error) {
            console.error(
              `Error parsing response for fileId ${fileId}:`,
              error
            );
            return null;
          }
        });
      });

      const results = await Promise.all(promises);
      return results.filter((res) => res !== null);
    } catch (e) {
      console.log('SPACE_INTERPOLATION of error ==>', e);
    }
  };

  /**
   * 메타 검색 API (FIND_META_ID)
   */
  const FIND_META_ID = async (inputCond) => {
    try {
      const res = await MapLogService.FIND_META_ID({
        cond: inputCond,
      });

      console.log('FIND_META_ID of res ==>', res.findMeta);

      // res.findMeta 값을 반환하도록 수정
      return res.findMeta;
    } catch (e) {
      console.log('FIND_META_ID of error ==>', e);
      return null; // 오류가 발생하면 null을 반환하여 처리
    }
  };

  /**
   * 검색 API (FIND TCCFG)
   */
  const FIND_TCCFG = async (inputCond) => {
    setLoading(true);
    try {
      const res = await MapLogService.FIND_TCCFG_10003({
        cond: inputCond,
      });

      console.log('FIND_TCCFG_10003 of res ==>', res);

      if (res && Array.isArray(res.findTccfg)) {
        setListConfig((prevState) => ({
          ...prevState,
          list: res.findTccfg,
        }));
        setListConfigCount(res.findTccfg.length);
      } else {
        console.error('Invalid or missing findTccfg field in response:', res);
        setListConfigCount(0);
      }
    } catch (e) {
      console.log('FIND_TCCFG_10003 of error ==>', e);
      setListConfigCount(0);
    } finally {
      setLoading(false);
    }
  };

  /****************************************************************************
   * [경로탭 이벤트 시작]
   * 경로탭 검색
   */
  const onFindMeta = async () => {
    setError(null);

    console.log('onFindMeta of cond.operation ==>', cond.operation);
    console.log('onFindMeta of selectedIds ==>', selectedIds);

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

    console.log('onFindMeta of condTmp ==>', condTmp);
    FIND_META(condTmp);
  };

  /**
   * 경로탭 검색 필드 드롭다운 선택값
   * 우선순위, 대상, 형식, 대륙, 지역
   */
  const selectedFieldsValues = (value) => {
    console.log('selectedFieldsValues of value ==>', value);

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
   * 경로탭 검색 필드 드롭다운 선택값
   * 특징
   */
  const selectedFeatureValues = (value) => {
    console.log('selectedFeatureValues of value ==>', value);

    return value
      .map((item) => {
        return item.name;
      })
      .join(',');
  };

  /**
   * 경로탭 검색 필드 드롭다운 선택값
   * 태그
   */
  const selectedTagValues = (value) => {
    console.log('selectedTagValues of value ==>', value);

    return value
      .map((item) => {
        return item.name;
      })
      .join(',');
  };

  /**
   * 경로탭 라디오 버튼 클릭 시 호출되는 핸들러
   */
  const handleRadioChange = (event) => {
    console.log(
      'handleRadioChange of event.target.value ==>',
      event.target.value
    );

    const value = event.target.value === 'AND' ? 0 : 1;
    console.log('handleRadioChange of value ==>', value);
    return value;
  };

  /**
   * 경로탭 체크 핸들러
   */
  const handleSelectionChangeRoute = (selectedRows) => {
    console.log(
      '🚀 ~ handleSelectionChangeRoute ~ selectedRows:',
      selectedRows
    );
    setSelectedRoutes(selectedRows);
  };

  /**
   * 경로탭 선택 버튼
   */
  const handleRouteClick = async () => {
    console.log('🚀 ~ handleRouteClick ~ selectedRoutes:', selectedRoutes);
    setLoading(true);
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

    const arrayFromList = findArray(selectedRoutes);
    console.log('🚀 ~ handleRouteClick ~ selectedRoutes:', selectedRoutes);
    console.log('🚀 ~ handleRouteClick ~ arrayFromList:', arrayFromList);

    if (arrayFromList.length == 0) {
      // 아무것도 선택되지 않았습니다.
      setErrorValue(`${t('SpaceModal.Alert1')}`);
      setError(true);
      setTimeout(() => setError(false), 3000);
      setLoading(false);
      return;
    }

    if (arrayFromList && arrayFromList.length > 0) {
      const fileIds = arrayFromList.map((route) => route.file_id);
      const routeCoords = await SPACE_INTERPOLATION(fileIds);
      routeData(selectedRoutes);
      routeFullCoords(routeCoords);
    } else {
      console.error('No array found in list');
      setLoading(false);
    }

    setOpen(false);

    setCond(initialCond);
    setConfigCond(initialConfigCond);

    setListRouteCount(0);
    setListConfigCount(0);

    setList(initialList);
    setListConfig(initialList);

    setSelectedRoutes();
    setSelectedTccfg();
    setSelectedLogList();

    setSelectedSearchFields([]);
    setSelectedSearchFieldsConfig([]);
    setSelectedIds([]);
    setSelectedConfigIds([]);

    setSelectedRouteCellData();
    setSelectedConfigCellData();

    setIsRouteModalOpen(false);
    setIsConfigModalOpen(false);
    setLoading(false);
  };

  /**
   * 경로탭 더블클릭 모달 호출
   */
  const openRouteModal = (cellData) => {
    console.log('🚀 ~ openRouteModal ~ cellData:', cellData);
    if (cellData && cellData.meta_id) {
      setIsRouteModalOpen(true);
      setSelectedRouteCellData(cellData);
    }
  };

  /**
   * 경로탭 다운로드
   */
  const handleRouteDownload = async () => {
    const dataToDownload = selectedRoutes;
    console.log('🚀 ~ handleRouteDownload ~ dataToDownload:', dataToDownload);
    setLoading(true);

    // JSON 파일 다운로드 추가
    for (const item of dataToDownload) {
      try {
        // 각 item의 filename 속성에 따라 파일명 지정
        const filename = item.file_name
          ? `${item.file_name}.lowmeta`
          : 'dataToDownload.lowmeta';
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

        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(
          `Failed to download JSON file for ${
            item.filename || 'dataToDownload'
          }:`,
          error
        );
        setLoading(false);
      }
    }

    for (const file of dataToDownload) {
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
          setLoading(false);
        }
      }

      try {
        // sequence 1 = 이미지파일
        const imageResponse = await axiosInstance.get(
          `/download/logfile?meta_id=${file.meta_id}&sequence=1`,
          { responseType: 'blob' }
        );

        const imageBlob = new Blob([imageResponse.data]);
        const imageUrl = window.URL.createObjectURL(imageBlob);
        const imageLink = document.createElement('a');
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
        setLoading(false);
      }
    }
    setLoading(false);
  };

  /****************************************************************************
   * [화면정보탭 이벤트 시작]
   * 화면정보탭 선택 버튼
   */
  const handleConfigClick = async () => {
    console.log('🚀 ~ handleConfigClick ~ selectedLogList:', selectedLogList);
    setLoading(true);

    if (selectedLogList && selectedLogList.length > 0) {
      const resultList = await Promise.all(
        selectedLogList.map(async (log) => {
          const condTmp = {
            meta_id: log.meta_id,
          };

          console.log('handleConfigClick of condTmp ==>', condTmp);
          const result = await FIND_META_ID(condTmp);
          console.log('result', result);

          return result;
        })
      );

      // resultList를 평탄화(flatten)하여 단일 배열로 변환
      const flatResultList = resultList.flat();

      console.log('🚀 ~ handleConfigClick ~ resultList:', resultList);
      console.log('🚀 ~ handleConfigClick ~ flatResultList:', flatResultList);

      handleConfigConfirm(flatResultList);
    } else {
      // 아무것도 선택되지 않았습니다.
      setErrorValue(`${t('SpaceModal.Alert1')}`);
      setError(true);
      setTimeout(() => setError(false), 3000);
      setLoading(false);
      return;
    }
  };

  /*
   * 화면정보탭 선택 핸들러
   */
  const handleConfigConfirm = async (confirmList) => {
    console.log('🚀 ~ handleConfigConfirm ~ confirmList:', confirmList);

    if (confirmList) {
      const fileIds = confirmList.map((route) => route.file_id);
      const routeCoords = await SPACE_INTERPOLATION(fileIds);
      routeData(confirmList);
      routeFullCoords(routeCoords);
    } else {
      console.error('No array found in list');
      setLoading(false);
    }

    setOpen(false);

    setCond(initialCond);
    setConfigCond(initialConfigCond);

    setListRouteCount(0);
    setListConfigCount(0);

    setList(initialList);
    setListConfig(initialList);

    setSelectedRoutes();
    setSelectedTccfg();
    setSelectedLogList();

    setSelectedSearchFields([]);
    setSelectedSearchFieldsConfig([]);
    setSelectedIds([]);
    setSelectedConfigIds([]);

    setSelectedRouteCellData();
    setSelectedConfigCellData();

    setIsRouteModalOpen(false);
    setIsConfigModalOpen(false);
    setLoading(false);
  };

  /**
   * 화면정보탭 검색
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
   * 화면정보탭 체크박스 선택 핸들러
   */
  const handleLeftSelectionChange = (selectedRows) => {
    console.log('🚀 ~ handleLeftSelectionChange ~ selectedRows:', selectedRows);

    if (selectedRows && selectedRows.length > 0) {
      const combinedLogList = selectedRows.reduce((acc, row) => {
        return acc.concat(row.loglist); // 각 row의 loglist를 배열에 합침
      }, []);

      console.log(
        '🚀 ~ handleLeftSelectionChange ~ combinedLogList:',
        combinedLogList
      );

      setSelectedTccfg(selectedRows);
      setSelectedLogList(combinedLogList); // 전체 합쳐진 loglist 설정
    }
  };

  /**
   * 화면정보탭 왼쪽 리스트 클릭 핸들러
   */
  const handleLeftCellClick = (rowData) => {
    console.log('🚀 ~ handleLeftCellClick ~ rowData:', rowData);
    setSelectedLogList(rowData.loglist); // 셀 클릭 시 loglist 설정
  };

  /**
   * 화면정보탭 더블클릭 모달 호출
   */
  const openConfigModal = (cellData) => {
    console.log('Opening modal with cell data:', cellData); // 디버깅 로그 추가

    if (cellData && cellData.tccfg_id) {
      setIsConfigModalOpen(true);
      setSelectedConfigCellData(cellData);
    }
  };

  /**
   * 화면정보탭 다운로드
   */
  const handleConfigDownload = async () => {
    console.log('🚀 ~ handleConfigDownload ~ selectedTccfg:', selectedTccfg);
    console.log(
      '🚀 ~ handleConfigDownload ~ selectedLogList:',
      selectedLogList
    );

    setLoading(true);

    // selectedTccfg 처리 및 다운로드
    for (const tccfg of selectedTccfg) {
      console.log('tccfg.tccfg_id ==>', tccfg.tccfg_id);

      try {
        const response = await axiosInstance.get(
          `/download/tccfg?tccfg_id=${tccfg.tccfg_id}`,
          { responseType: 'json' }
        );

        console.log('tccfg.tccfg_name', tccfg.tccfg_name);

        const filename =
          tccfg.tccfg_name && tccfg.tccfg_name.trim()
            ? `${tccfg.tccfg_name.trim()}.lowtccfg`
            : 'default.lowtccfg';
        const jsonBlob = new Blob([JSON.stringify(response.data, null, 2)], {
          type: 'application/json',
        });
        const jsonUrl = window.URL.createObjectURL(jsonBlob);
        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = filename;
        document.body.appendChild(jsonLink);
        jsonLink.click();
        document.body.removeChild(jsonLink);
        window.URL.revokeObjectURL(jsonUrl);
      } catch (error) {
        console.error(
          `Failed to download tccfg file for tccfg_id ${tccfg.tccfg_id}:`,
          error
        );
        setLoading(false);
      }
    }

    const resultList = await Promise.all(
      selectedLogList.map(async (log) => {
        const condTmp = {
          meta_id: log.meta_id,
        };

        console.log('🚀 ~ selectedLogList.map ~ condTmp:', condTmp);
        const result = await FIND_META_ID(condTmp);
        console.log('🚀 ~ selectedLogList.map ~ result:', result);

        return result;
      })
    );

    // resultList를 평탄화(flatten)하여 단일 배열로 변환
    const flatResultList = resultList.flat();
    console.log('🚀 ~ handleConfigDownload ~ flatResultList:', flatResultList);

    // JSON 파일 다운로드 추가
    for (const item of flatResultList) {
      try {
        // 각 item의 filename 속성에 따라 파일명 지정
        const filename = item.file_name
          ? `${item.file_name}.lowmeta`
          : 'flatResultList.lowmeta';
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
            item.filename || 'flatResultList'
          }:`,
          error
        );
        setLoading(false);
      }
    }

    for (const file of flatResultList) {
      try {
        // sequence 0 = 로그파일
        const logResponse = await axiosInstance.get(
          `/download/logfile?meta_id=${file.meta_id}&sequence=0`,
          { responseType: 'blob' }
        );

        console.log('logResponse ==>', logResponse);

        const logBlob = new Blob([logResponse.data]);
        const logUrl = window.URL.createObjectURL(logBlob);
        const logLink = document.createElement('a');

        console.log('logBlob', logBlob);
        console.log('logUrl', logUrl);
        console.log('logLink', logLink);

        console.log('file', file);

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
        setLoading(false);
      }

      try {
        // sequence 1 = 이미지파일
        const imageResponse = await axiosInstance.get(
          `/download/logfile?meta_id=${file.meta_id}&sequence=1`,
          { responseType: 'blob' }
        );

        const imageBlob = new Blob([imageResponse.data]);
        const imageUrl = window.URL.createObjectURL(imageBlob);
        const imageLink = document.createElement('a');
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
        setLoading(false);
      }
    }
    setLoading(false);
  };

  /*
   * [화면정보탭 이벤트 종료]
   *****************************************************************************/

  return (
    <Transition show={open}>
      {error && <Error errorMessage={errorValue} />}
      <Dialog
        onClose={() => {
          setList(initialList);
          setListConfig(initialList);
          setSelectedTccfg(initialList);
          setSelectedLogList(initialList);
          setOpen(false);
        }}
        className="relative z-40"
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
                className="relative rounded-lg bg-white shadow-xl text-left transition-all sm:max-w-screen-xl"
                style={{ width: '1324px' }}
                static
              >
                {/* 모달 헤더 */}
                {!isDirect && (
                  <div className="flex justify-between py-3 px-5 bg-blue-900 rounded-t-lg">
                    <h1 className="text-sm font-semibold text-white">
                      {/* 로그 검색 */}
                      {t('LogModal.ModalName')}
                    </h1>
                    <button
                      className="font-semibold"
                      onClick={() => {
                        setList(initialList);
                        setListConfig(initialList);
                        setSelectedTccfg(initialList);
                        setSelectedLogList(initialList);
                        setSelectedSearchFields([]);
                        setSelectedSearchFieldsConfig([]);
                        setListRouteCount(0);
                        setListConfigCount(0);
                        setOpen(false);
                      }}
                    >
                      <MdClose className="text-white" size={20} />
                    </button>
                  </div>
                )}

                {/* 탭 버튼 */}
                <div className="m-2 flex space-x-2">
                  <button
                    className={`h-9 px-4 py-2 text-sm rounded-t-lg transition-all duration-300 ease-in-out flex-1 shadow-md ${
                      activeTab === 'route'
                        ? 'bg-blue-700 text-white border-b-2 border-blue-300 shadow'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => handleTabChange('route')}
                  >
                    {/* 경로탭 버튼*/}
                    {t('LogModal.Route')}
                  </button>

                  <button
                    className={`h-9 px-4 py-2 text-sm rounded-t-lg transition-all duration-300 ease-in-out flex-1 shadow-md ${
                      activeTab === 'batch'
                        ? 'bg-blue-700 text-white border-b-2 border-blue-300 shadow'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => handleTabChange('batch')}
                  >
                    {/* 화면정보탭 버튼*/}
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
                        <label className="w-1/4 text-sm font-semibold text-slate-700 px-2">
                          {/* 검색 필드 */}
                          {t('LogModal.SearchFields')}
                        </label>
                        <MultipleSelectDropDown
                          options={searchFields.map((field) => ({
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
                                />
                              ) : field.id === 'feature' ? (
                                // feature 기능
                                <div className="w-3/4 flex flex-row space-x-2">
                                  <MultipleSelectDropDown
                                    options={featureList.featureTop}
                                    className="flex-1"
                                    onChange={handleTopFeatureChange}
                                  />
                                  <MultipleSelectDropDown
                                    options={filteredBottomOptions}
                                    className="flex-1"
                                    onChange={(value) => {
                                      setCond((prevState) => {
                                        return {
                                          ...prevState,
                                          feature: selectedFeatureValues(value),
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
                                          tag: selectedTagValues(value),
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
                                        checked={cond.operation === 0}
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
                                          [field.id]:
                                            selectedFieldsValues(value),
                                        };
                                      });
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                      <div className="flex justify-end items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          {t('LogModal.TotalResults')}: {listRouteCount}
                        </span>
                        <button
                          className="h-9 inline-flex items-center border-2 gap-x-2 px-3 py-2 font-semibold text-sm border-slate-300 rounded-md focus:ring-1 focus:border-sky-500 hover:border-sky-500 cursor-pointer"
                          onClick={onFindMeta}
                        >
                          <FaSearch
                            className="h-4 w-5 text-blue-900"
                            aria-hidden="true"
                          />
                          {/* 경로 -> 검색 버튼 */}
                          <span className="text-sm text-blue-900 font-bold">
                            {t('LogModal.Find')}
                          </span>
                        </button>
                      </div>
                      {error && <p className="text-red-500">{error}</p>}
                      <MainGrid
                        list={list}
                        onSelectionChange={handleSelectionChangeRoute}
                        onCellDoubleClick={openRouteModal}
                      />
                      {/* 경로탭 버전 모아보기 */}
                      {isRouteModalOpen && (
                        <RouteModal
                          data={selectedRouteCellData}
                          onClose={() => setIsRouteModalOpen(false)}
                          setCond={setCond}
                          setList={setList}
                          setSelectedSearchFields={setSelectedSearchFields}
                          setSelectedSearchFieldsConfig={
                            setSelectedSearchFieldsConfig
                          }
                          setSelectedRouteCellData={setSelectedRouteCellData}
                          setIsRouteModalOpen={setIsRouteModalOpen}
                          setSelectedIds={setSelectedIds}
                          setLoading={setLoading}
                          isDirect={isDirect}
                          setOpen={setOpen}
                          routeData={routeData}
                          routeFullCoords={routeFullCoords}
                        />
                      )}
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={
                            isDirect ? handleRouteDownload : handleRouteClick
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
                                {t('LogModal.Download')}
                              </span>
                            </>
                          ) : (
                            <>
                              <FaCheck
                                className="h-4 w-5 text-blue-900"
                                aria-hidden="true"
                              />
                              <span className="text-sm text-blue-900 font-bold">
                                {t('LogModal.Select')}
                              </span>
                            </>
                          )}
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
                          options={configFields.map((field) => ({
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
                                          tag: selectedTagValues(value),
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
                                        checked={cond.operation === 0}
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
                                          [field.id]:
                                            selectedFieldsValues(value),
                                        };
                                      });
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                      </div>

                      <div className="flex justify-end items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          {/* 총 결과 */}
                          {t('LogModal.TotalResults')}: {listConfigCount}
                        </span>
                        {/* 화면정보탭 검색버튼 */}
                        <button
                          className="h-9 inline-flex items-center border-2 gap-x-2 px-3 py-2 font-semibold text-sm border-slate-300 rounded-md focus:ring-1 focus:border-sky-500 hover:border-sky-500 cursor-pointer"
                          onClick={onFindTccfg}
                        >
                          <FaSearch
                            className="h-4 w-5 text-blue-900"
                            aria-hidden="true"
                          />
                          <span className="text-sm text-blue-900 font-bold">
                            {/* 화면정보탭 검색 */}
                            {t('LogModal.Find')}
                          </span>
                        </button>
                      </div>
                      {error && <p className="text-red-500">{error}</p>}
                      {/* 그리드를 2개로 나누어 왼쪽과 오른쪽에 표시 */}
                      <div className="flex flex-row justify-between space-x-2 ">
                        {/* 왼쪽 그리드 */}
                        <ConfigGridL
                          list={listConfig}
                          onSelectionChange={handleLeftSelectionChange}
                          onCellClick={handleLeftCellClick}
                          onCellDoubleClick={openConfigModal}
                        />

                        {/* 화면정보탭 버전 모아보기 */}
                        {isConfigModalOpen && (
                          <ConfigModal
                            data={selectedConfigCellData}
                            onClose={() => setIsConfigModalOpen(false)}
                            setConfigCond={setConfigCond}
                            setSelectedConfigCellData={
                              setSelectedConfigCellData
                            }
                            setSelectedSearchFieldsConfig={
                              setSelectedSearchFieldsConfig
                            }
                            setIsConfigModalOpen={setIsConfigModalOpen}
                            setSelectedIds={setSelectedIds}
                            setSelectedConfigIds={setSelectedConfigIds}
                            setListConfigCount={setListConfigCount}
                            setLoading={setLoading}
                            isDirect={isDirect}
                            setOpen={setOpen}
                            routeData={routeData}
                            routeFullCoords={routeFullCoords}
                          />
                        )}

                        {/* 오른쪽 그리드 */}
                        <h2 className="text-center text-xl font-bold mb-2 border"></h2>
                        <ConfigGridR
                          list={selectedLogList}
                          onSelectionChange={(selectedRows) =>
                            setRightList(selectedRows)
                          }
                        />
                      </div>
                      <div className="flex justify-end mt-1">
                        <button
                          onClick={
                            isDirect ? handleConfigDownload : handleConfigClick
                          }
                          className="h-9 inline-flex items-center border-2 gap-x-2 px-3 py-2 font-semibold text-sm border-slate-300 rounded-md focus:ring-1 focus:border-sky-500 hover:border-sky-500 cursor-pointer"
                        >
                          {isDirect ? (
                            <>
                              <FaDownload
                                className="h-4 w-5 text-blue-900"
                                aria-hidden="true"
                              />
                              <span className="text-sm text-blue-900 font-bold">
                                {t('LogModal.Download')}
                              </span>
                            </>
                          ) : (
                            <>
                              <FaCheck
                                className="h-4 w-5 text-blue-900"
                                aria-hidden="true"
                              />
                              <span className="text-sm text-blue-900 font-bold">
                                {t('LogModal.Select')}
                              </span>
                            </>
                          )}
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
