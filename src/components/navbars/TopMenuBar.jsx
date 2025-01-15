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
import spaceIcon2 from '../../assets/icons/spaceicon2.png';
import downloadIcon2 from '../../assets/icons/downloadicon2.png';
import clearIcon2 from '../../assets/icons/mapclearicon2.png';
import searchIcon2 from '../../assets/icons/searchicon2.png';

const TopMenuBar = ({
  checkedNodes,
  handleRouteData,
  clickedNode,
  setCurrentApi,
  handleSpaceData,
  onClear,
  routeColors = () => {},
}) => {
  const [inputValue, setInputValue] = useState(''); // 검색 입력값
  const [keyPressed, setKeyPressed] = useState(''); // 마지막으로 입력된 키
  const [selectedCoords, setSelectedCoords] = useState(null); // 선택된 좌표
  const [selectedAPI, setSelectedAPI] = useState(null); // 선택된 지도 API
  const [clickedCoords, setClickedCoords] = useState(null); // 클릭된 좌표
  const [selectedMapList, setSelectedMapList] = useState(null); // 선택된 좌표 형식
  const [convertedCoords, setConvertedCoords] = useState({ lat: '', lng: '' }); // 변환된 좌표
  const [success, setSuccess] = useState(false); // 성공 메시지 표시 여부
  const [successValue, setSuccessValue] = useState(''); // 성공 메시지 내용
  const [error, setError] = useState(false); // 에러 메시지 표시 여부
  const [errorValue, setErrorValue] = useState(''); // 에러 메시지 내용
  const [displayCoords, setDisplayCoords] = useState(null); // 화면에 표시할 좌표
  const [origins, setOrigins] = useState([]); // 시작 좌표 리스트
  const [destinations, setDestinations] = useState([]); // 도착 좌표 리스트
  const [routeFullCoords, setRouteFullCoords] = useState(null); // 전체 경로 데이터
  const [spaceFullCoords, setSpaceFullCoords] = useState(null); // 전체 공간 데이터
  const [clickedNodes, setClickedNodes] = useState(null); // 클릭된 노드 데이터
  const [onClearMap, setOnClearMap] = useState(false);

  const storeModalRef = useRef(); // StoreModal 참조
  const logModalRef = useRef(); // LogModal 참조
  const spaceModalRef = useRef(); // SpaceModal 참조

  const { t } = useTranslation(); // 다국어 번역 훅

  useEffect(() => {
    setClickedNodes(clickedNode);
  }, [clickedNode]);

  /**
   * 검색 입력값 변경 핸들러
   * - 사용자가 검색 입력란에 입력한 값을 상태로 업데이트
   *
   * @param {object} event - 입력 이벤트 객체
   */
  const handleChange = (event) => {
    setInputValue(event.target.value); // 입력값 상태 업데이트
  };

  /**
   * 키보드 입력 이벤트 핸들러
   * - 사용자가 키보드를 입력했을 때 특정 키와 조건에 따라 동작 수행
   *
   * @param {object} event - 키보드 입력 이벤트 객체
   */
  const handleClearClick = () => {
    if (onClear) {
      onClear(); // 부모 컴포넌트의 Clear 핸들러 호출
    }
  };

  const handleKeyDown = (event) => {
    const reg = /[\{\}\[\]\/?,;:|\)*~!^\-_+<>@\#$%&\\\=\(\'\"]/g; // 특수문자 필터 정규식
    if (
      event.key === 'Enter' && // Enter 키 입력 시
      event.target.value !== '' && // 입력값이 비어 있지 않은 경우
      !reg.test(event.target.value) // 특수문자가 포함되지 않은 경우
    ) {
      storeModalRef.current.show(); // StoreModal 열기
      setKeyPressed(event.key); // 마지막으로 입력된 키 저장
    }
    if (event.key === 'Backspace') {
      setInputValue(''); // Backspace 입력 시 입력값 초기화
    }
  };

  /**
   * StoreModal로부터 데이터 반환 처리
   * - 모달에서 선택된 데이터를 부모 컴포넌트로 전달받아 상태를 업데이트
   *
   * @param {object} store - 모달에서 반환된 데이터 객체
   */
  const handleDataReceiveBack = (store) => {
    if (store.latitude && store.longitude !== undefined) {
      setInputValue(''); // 입력값 초기화
      setSelectedCoords({
        lat: store.latitude, // 반환된 위도 설정
        lng: store.longitude, // 반환된 경도 설정
      });
      storeModalRef.current.close(); // StoreModal 닫기
    }
  };

  // 선택된 API 변경 시 상태 초기화
  useEffect(() => {
    if (selectedAPI) {
      setOrigins([]); // 시작 좌표 초기화
      setDestinations([]); // 도착 좌표 초기화
      setInputValue(''); // 검색 입력값 초기화
      setSelectedCoords(null); // 선택된 좌표 초기화
      setClickedCoords(null); // 클릭된 좌표 초기화
      setConvertedCoords({ lat: '', lng: '' }); // 변환된 좌표 초기화
      setDisplayCoords(null); // 화면 표시 좌표 초기화
      setRouteFullCoords(null); // 경로 데이터 초기화
      setSpaceFullCoords(null); // 공간 데이터 초기화
      setCurrentApi(selectedAPI); // 현재 API 설정
    }
  }, [selectedAPI, setCurrentApi]);

  /**
   * 두 배열을 file_id 기준으로 병합하고 특정 조건에 따라 데이터를 필터링하는 함수
   *
   * @param {Array} routeFullCoords - 경로 데이터 배열
   * @param {Array} checkedNodes - 체크된 노드 데이터 배열
   * @returns {Array} 필터링된 데이터 배열
   */
  const mergeByFileId = (routeFullCoords, checkedNodes) => {
    // 경로 데이터나 체크된 노드 데이터가 없을 경우 빈 배열 반환
    if (!routeFullCoords || !checkedNodes) return [];

    // routeFullCoords와 checkedNodes를 file_id 기준으로 병합
    const mergedData = routeFullCoords.map((route) => {
      const matchedNode = checkedNodes.find(
        (node) => node.file_id === route.file_id // file_id가 일치하는 노드 찾기
      );

      return {
        ...route, // route 데이터 유지
        ...(matchedNode || {}), // 일치하는 노드 데이터 병합
      };
    });

    // country_str가 "KOR" 또는 "SAU"인 데이터만 필터링
    const filteredByCountry = mergedData.filter(
      (data) => data.country_str === 'KOR' || data.country_str === 'SAU'
    );

    // file_name에 "US"가 포함된 데이터를 제외
    // 단, country_str가 "SAU"이면서 file_name에 "KOR"이 포함된 경우는 제외하지 않음
    const filteredByName = filteredByCountry.filter(
      (data) =>
        !data.file_name.includes('US') ||
        (data.country_str === 'SAU' && data.file_name.includes('KOR'))
    );

    return filteredByName; // 최종 필터링된 데이터 반환
  };

  /**
   * 선택된 지도 API에 따라 적절한 지도 핸들러를 반환
   * - Routo와 TMap의 경우 데이터 필터링 수행
   *
   * @returns {JSX.Element|null} 선택된 지도 API에 따른 핸들러 컴포넌트 반환
   */
  const handleChoosingMapAPIs = () => {
    let filteredRouteFullCoords = routeFullCoords; // 기본 경로 데이터

    // Routo와 TMap의 경우 mergeByFileId 함수로 데이터 필터링
    if (selectedAPI?.name === 'ROUTO' || selectedAPI?.name === 'TMAP') {
      filteredRouteFullCoords = mergeByFileId(routeFullCoords, checkedNodes);
    }

    // 선택된 지도 API에 따라 적절한 지도 핸들러 반환
    if (selectedAPI?.name === 'GOOGLE') {
      return (
        <GoogleMapHandler
          key="google"
          selectedCoords={selectedCoords} // 선택된 좌표
          googleLocation={setClickedCoords} // 클릭된 좌표 설정 함수
          routeFullCoords={routeFullCoords} // 원본 경로 데이터
          spaceFullCoords={spaceFullCoords} // 공간 데이터
          checkedNode={checkedNodes} // 선택된 노드 데이터
          clickedNode={clickedNodes} // 클릭된 노드 데이터
          routeColors={routeColors} // 경로 색상
          onClearMap={onClearMap} // 지도 초기화 함수
          selectedAPI={selectedAPI.apiKey} // 선택된 API 키
        />
      );
    } else if (selectedAPI?.name === 'ROUTO') {
      return (
        <RoutoMapHandler
          key="routo"
          selectedCoords={selectedCoords}
          routoLocation={setClickedCoords}
          routeFullCoords={filteredRouteFullCoords} // 필터링된 경로 데이터
          spaceFullCoords={spaceFullCoords}
          checkedNode={checkedNodes}
          clickedNode={clickedNode}
          routeColors={routeColors}
          onClearMap={onClearMap}
          selectedAPI={selectedAPI.apiKey}
        />
      );
    } else if (selectedAPI?.name === 'TMAP') {
      return (
        <TMapHandler
          key="tmap"
          selectedCoords={selectedCoords}
          tmapLocation={setClickedCoords}
          routeFullCoords={filteredRouteFullCoords} // 필터링된 경로 데이터
          spaceFullCoords={spaceFullCoords}
          checkedNode={checkedNodes}
          clickedNode={clickedNode}
          routeColors={routeColors}
          onClearMap={onClearMap}
          selectedAPI={selectedAPI.apiKey}
        />
      );
    } else if (selectedAPI?.name === 'TOMTOM') {
      return (
        <TomTomMapHandler
          key="tomtom"
          selectedCoords={selectedCoords}
          tomtomLocation={setClickedCoords}
          routeFullCoords={routeFullCoords} // 원본 경로 데이터
          spaceFullCoords={spaceFullCoords}
          checkedNode={checkedNodes}
          clickedNode={clickedNode}
          routeColors={routeColors}
          onClearMap={onClearMap}
          selectedAPI={selectedAPI.apiKey}
        />
      );
    } else if (selectedAPI?.name === 'BAIDU') {
      return (
        <BaiduMapHandler
          key="baidu"
          selectedCoords={selectedCoords}
          baiduLocation={setClickedCoords}
          origins={origins} // 시작 좌표 리스트
          destinations={destinations} // 도착 좌표 리스트
          routeFullCoords={routeFullCoords} // 원본 경로 데이터
          spaceFullCoords={spaceFullCoords}
          checkedNode={checkedNodes}
          clickedNode={clickedNode}
          onClearMap={onClearMap}
          selectedAPI={selectedAPI.apiKey}
          routeColors={routeColors}
        />
      );
    } else if (selectedAPI?.name === 'HERE') {
      return (
        <HereMapHandler
          key="here"
          selectedCoords={selectedCoords}
          hereLocation={setClickedCoords}
          routeFullCoords={routeFullCoords} // 원본 경로 데이터
          spaceFullCoords={spaceFullCoords}
          checkedNode={checkedNodes}
          clickedNode={clickedNodes}
          routeColors={routeColors}
          onClearMap={onClearMap}
          selectedAPI={selectedAPI.apiKey}
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

  /**
   * 좌표 입력값 변경 핸들러
   * - 사용자가 입력한 값을 검증하고 상태를 업데이트
   *
   * @param {object} e - 입력 이벤트 객체
   */
  const handleCoordsChange = (e) => {
    const { name, value } = e.target;

    // 숫자와 소수점만 입력 가능하도록 제한
    if (!/^[\d.]*$/.test(value)) {
      return; // 유효하지 않은 입력은 무시
    }

    // 기존 좌표 상태에 새로운 값 업데이트
    setConvertedCoords((prevCoords) => ({
      ...prevCoords,
      [name]: value,
    }));
  };

  /**
   * 좌표 입력란 클릭 시 초기화 핸들러
   * - 클릭한 입력란의 값을 초기화
   *
   * @param {object} e - 클릭 이벤트 객체
   */
  const handleCoordsClick = (e) => {
    const { name } = e.target;

    setConvertedCoords((prevCoords) => ({
      ...prevCoords,
      [name]: '', // 해당 입력란 값 초기화
    }));
  };

  /**
   * 좌표 복사 핸들러
   * - 현재 변환된 좌표를 클립보드에 복사
   */
  const handleCopy = () => {
    if (convertedCoords.lat && convertedCoords.lng) {
      const coordsText = `${t('Common.Latitude')}: ${convertedCoords.lat}, ${t(
        'Common.Longitude'
      )}: ${convertedCoords.lng}`; // 복사할 텍스트 구성

      navigator.clipboard
        .writeText(coordsText) // 클립보드에 텍스트 복사
        .then(() => {
          setSuccessValue(`${t('TopMenuBar.Copy.Success')}`); // 성공 메시지 설정
          setSuccess(true); // 성공 상태 활성화
          setTimeout(() => setSuccess(false), 5000); // 5초 후 성공 상태 비활성화
        })
        .catch((err) => {
          setErrorValue(err.message || `${t('TopMenuBar.Copy.Fail')}`); // 에러 메시지 설정
          setError(true); // 에러 상태 활성화
          setTimeout(() => setError(false), 5000); // 5초 후 에러 상태 비활성화
        });
    } else {
      setErrorValue(`${t('TopMenuBar.CoordsNotExistence')}`); // 좌표 없음 에러 메시지 설정
      setError(true);
      setTimeout(() => setError(false), 5000);
    }
  };

  /**
   * DEG 형식의 좌표 문자열을 소수점 형식으로 변환
   * - DEG 형식은 "도 분 초"로 구성됨
   *
   * @param {string} degString - DEG 형식의 좌표 문자열
   * @returns {number} 변환된 소수점 형식 좌표값
   * @throws {Error} 형식 오류가 발생한 경우
   */
  const parseDEGToDecimal = (degString) => {
    const parts = degString.split(' '); // 문자열을 공백으로 분리
    if (parts.length !== 3) {
      throw new Error(`${t('TopMenuBar.FormatError')}`); // "도 분 초" 형식이 아닌 경우 에러 발생
    }

    const degrees = parseFloat(parts[0]); // 도
    const minutes = parseFloat(parts[1]); // 분
    const seconds = parseFloat(parts[2]); // 초

    if (isNaN(degrees) || isNaN(minutes) || isNaN(seconds)) {
      throw new Error(`${t('TopMenuBar.FormatError')}`); // 숫자로 변환할 수 없는 경우 에러 발생
    }

    // DEG -> 소수점 형식 변환
    return degrees + minutes / 60 + seconds / 3600;
  };

  /**
   * 좌표 검색 핸들러
   * - 입력된 좌표를 검증하고 변환하여 상태에 저장
   */
  const handleSearch = () => {
    const lat = convertedCoords.lat; // 입력된 위도
    const lng = convertedCoords.lng; // 입력된 경도
    const latitude = `${t('Common.Latitude')}`; // "위도" 문자열
    const longitude = `${t('Common.Longitude')}`; // "경도" 문자열

    // 에러 메시지 템플릿
    const decError = `${t('TopMenuBar.DECError')}`;
    const mmsError = `${t('TopMenuBar.MMSError')}`;
    const degError = `${t('TopMenuBar.DEGError')}`;

    let latError = ''; // 위도 에러 메시지
    let lngError = ''; // 경도 에러 메시지

    // 좌표가 입력되지 않은 경우 에러 메시지 설정
    if (!lat) {
      latError = `${latitude} ${t('TopMenuBar.LatError')}`;
    }
    if (!lng) {
      lngError = `${longitude} ${t('TopMenuBar.LonError')}`;
    }

    // 입력된 좌표가 없을 때 에러 표시
    if (latError || lngError) {
      const combinedError =
        latError && lngError
          ? `${t('TopMenuBar.CombinedError')}: ${latError} & ${lngError}.`
          : latError
          ? `${t('TopMenuBar.ErrorInLat')}: ${latError}.`
          : `${t('TopMenuBar.ErrorInLon')}: ${lngError}.`;

      console.log('combinedError ==>', combinedError);

      setErrorValue(combinedError); // 에러 메시지 설정
      setError(true); // 에러 상태 활성화
      setTimeout(() => setError(false), 2000); // 2초 후 에러 상태 비활성화
      return;
    }

    // 입력값 검증 함수
    const isDecimal = (value) =>
      !isNaN(value) && value.toString().includes('.');
    const isInteger = (value) => Number.isInteger(Number(value));
    const hasSpaces = (value) =>
      typeof value === 'string' && value.split(' ').length > 1;

    let latSpaceError = false; // DEG 형식의 위도 공백 검증 에러
    let lngSpaceError = false; // DEG 형식의 경도 공백 검증 에러

    // 좌표 형식에 따른 검증 로직
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

    // 검증 에러 발생 시 에러 메시지 설정
    if (latError || lngError) {
      const combinedError =
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

    // DEG 형식의 좌표를 소수점 형식으로 변환
    if (selectedMapList.name === 'DEG') {
      try {
        latValue = parseDEGToDecimal(lat);
        lngValue = parseDEGToDecimal(lng);
      } catch (error) {
        console.log('error.message ==>', error.message);

        setErrorValue(error.message); // 변환 에러 메시지 설정
        setError(true);
        setTimeout(() => setError(false), 2000);
        return;
      }
    } else {
      latValue = parseFloat(lat); // 소수점 형식 변환
      lngValue = parseFloat(lng);
    }

    const validLat = !isNaN(latValue); // 유효한 위도 여부 확인
    const validLng = !isNaN(lngValue); // 유효한 경도 여부 확인

    // 유효한 좌표인 경우 추가 검증 및 변환 수행
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

      // 좌표가 지정된 범위 내에 있는지 확인
      if (
        currentRanges &&
        (latValue < currentRanges.minLat ||
          latValue > currentRanges.maxLat ||
          lngValue < currentRanges.minLng ||
          lngValue > currentRanges.maxLng)
      ) {
        setErrorValue(`${t('TopMenuBar.RangeError')}`); // 범위 에러 메시지 설정
        setError(true);
        setTimeout(() => setError(false), 2000);
        return;
      }

      let result;
      // 좌표 변환 수행
      if (selectedMapList.name === 'MMS') {
        result = MMSToDEC({ lat: latValue, lng: lngValue });
      } else if (selectedMapList.name === 'DEC') {
        result = DECToDEC({ lat: latValue, lng: lngValue });
      } else if (selectedMapList.name === 'DEG') {
        result = DEGToDEC({ lat: latValue, lng: lngValue });
      }

      console.log('result ==>', result);

      setSelectedCoords(result); // 변환된 좌표 저장
      setDisplayCoords(result); // 화면에 표시할 좌표 저장
    } else {
      setErrorValue(`${t('TopMenuBar.WrongCoords')}`); // 유효하지 않은 좌표 에러 메시지
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

  /**
   * 지도 초기화 버튼 핸들러
   * setSelectedCoords  : Clear selected coordinates
   * setClickedCoords   : Clear clicked coordinates
   * setRouteFullCoords : Clear route coordinates
   * setSpaceFullCoords : Clear space coordinates
   * setConvertedCoords : Reset converted coordinates
   * setDisplayCoords   : Clear display coordinates
   * setOrigins         : Clear origins
   * setDestinations    : Clear destinations
   * routeColors        : Reset route colors if it's a function
   */
  const handleMapClear = () => {
    setSelectedCoords(null);
    setClickedCoords(null);
    setRouteFullCoords(null);
    setSpaceFullCoords(null);
    setConvertedCoords({ lat: '', lng: '' });
    setDisplayCoords(null);
    setClickedNodes(null);
    setOrigins([]);
    setDestinations([]);
    if (typeof routeColors === 'function') {
      routeColors([]);
    }
    handleClearClick();

    setOnClearMap(true); // RoutoMap 초기화 이벤트 발생
    setTimeout(() => setOnClearMap(false), 100); // 100ms 후 다시 false로 설정
  };

  return (
    <>
      {success && <Completion successfulMessage={successValue} />}
      {error && <Error errorMessage={errorValue} />}
      <Disclosure as="nav" className="bg-gray-800">
        {({ open }) => (
          <>
            <div className="mx-auto inset-x-0">
              <div className="flex h-[50px] justify-between">
                <div className="flex items-center lg:px-0">
                  <div className="hidden lg:block scale-90 z-40">
                    <div className="flex">
                      <label className="px-2 py-2 text-sm font-bold text-white">
                        {/* 지도 선택 */}
                        {t('TopMenuBar.MapSelection')}
                      </label>
                      <MapAPIsLists setSelectedAPI={setSelectedAPI} />
                      {/* <label className="rounded-md pl-10 py-2 text-sm font-bold text-white px-3 "> */}
                      <label className="px-2 py-2 pl-11 text-sm font-bold text-white">
                        {/* 지점 검색 */}
                        {t('TopMenuBar.StoreSearch')}
                      </label>
                      <div className="flex flex-1 justify-center lg:justify-end">
                        <div className="w-full max-w-lg lg:max-w-xs pl-0">
                          <div className="inset-y-0 flex items-center px-1">
                            <input
                              type="text"
                              onChange={handleChange}
                              onKeyDown={handleKeyDown}
                              value={inputValue}
                              style={{ width: '175px' }}
                              className="block w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-5 text-gray-500 sm:text-sm sm:leading-6 mr-2"
                              // 지점을 입력해 주세요
                              placeholder={t('Common.SearchPlaceholder')}
                            />
                            <button
                              type="button"
                              onClick={() => storeModalRef.current.show()}
                              // className="inset-y-5 px-3 flex items-center border-1 rounded-md p-2 bg-gray-700"
                              className="flex items-center rounded-md p-0.5 w-9 h-9 bg-gray-800"
                            >
                              <img
                                src={searchIcon2}
                                alt="Search Icon"
                                className="object-contain"
                                style={{
                                  width: '90%',
                                  height: '90%',
                                  marginLeft: '1.5px',
                                }} // 이미지 버튼 안에 꽉 차게
                              />
                              {/* <FaMagnifyingGlass
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              /> */}
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
                        <label className="rounded-md px-2 py-2 pr-2 text-sm font-bold text-white">
                          {/* 로그 검색 */}
                          {t('TopMenuBar.LogSearch')}
                        </label>
                        <button
                          type="button"
                          onClick={() => logModalRef.current.show()}
                          // className="inset-y-5 px-3 flex items-center pr-3 border-1 rounded-md p-2 bg-gray-700"
                          className="flex items-center rounded-md p-0.5 w-9 h-9  bg-gray-800"
                        >
                          <img
                            src={downloadIcon2}
                            alt="Download Icon"
                            className="object-contain"
                            style={{
                              width: '90%',
                              height: '90%',
                              marginLeft: '1.5px',
                            }} // 이미지 버튼 안에 꽉 차게
                          />
                          {/* <HiOutlineDocumentSearch
                            className="h-5 w-5 text-white"
                            aria-hidden="true"
                          /> */}
                        </button>
                      </div>
                      <LogModal
                        routeData={handleRouteData}
                        routeFullCoords={setRouteFullCoords}
                        ref={logModalRef}
                      />
                      <div className="flex flex-1 justify-center lg:ml-3">
                        <label className="rounded-md px-3 py-2 pr-2 text-sm font-bold text-white whitespace-nowrap">
                          {/* 공간 검색 */}
                          {t('TopMenuBar.SpaceSearch')}
                        </label>
                        <button
                          type="button"
                          onClick={() => spaceModalRef.current.show()}
                          // className="inset-y-5 px-3 flex items-center pr-3 border-1 rounded-md p-2 bg-gray-700"
                          className="flex items-center rounded-md p-0.5 w-9 h-9 bg-gray-800"
                        >
                          <img
                            src={spaceIcon2}
                            alt="Space Search Icon"
                            className="object-contain"
                            style={{
                              width: '90%',
                              height: '90%',
                              marginLeft: '1.5px',
                            }} // 이미지 버튼 안에 꽉 차게
                          />
                          {/* <HiOutlineDocumentSearch
                            className="h-5 w-5 text-white"
                            aria-hidden="true"
                          /> */}
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
                          {/* 지도 초기화*/}
                          {t('TopMenuBar.MapClear')}
                        </label>
                        <button
                          type="button"
                          onClick={handleMapClear}
                          // className="inset-y-5 px-3 flex items-center pr-3 border-1 rounded-md p-2 bg-gray-700"
                          className="flex items-center rounded-md p-0.5 w-9 h-9 bg-gray-800"
                        >
                          <img
                            src={clearIcon2}
                            alt="Clear Icon"
                            className="object-contain"
                            style={{
                              width: '90%',
                              height: '90%',
                              marginLeft: '1.5px',
                            }} // 이미지 버튼 안에 꽉 차게
                          />
                          {/* <HiOutlineRefresh
                            className="h-5 w-5 text-white"
                            aria-hidden="true"
                          /> */}
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
                  {/* 모바일 버전 */}
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
                        className="inset-y-5 px-3 flex items-center border-1 rounded-md p-2 bg-gray-800"
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
                    className="inset-y-5 px-3 flex items-center pr-3 border-1 rounded-md p-2 bg-gray-800"
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
                    className="inset-y-5 px-3 flex items-center pr-3 border-1 rounded-md p-2 bg-gray-800"
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
                          className="block w-36 rounded-md border-0 bg-gray-800 py-1 pl-10 pr-3 text-black placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6"
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
                          className="block w-36 rounded-md border-0 bg-gray-800 py-1 pl-10 pr-3 text-black placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6"
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
      <div
        className="map-container"
        style={{ height: `calc(100vh - 100px)`, zIndex: '1' }}
      >
        {/* 좌표나 경로를 보여주기 위한 지도 표출 */}
        {selectedAPI && handleChoosingMapAPIs()}
      </div>
    </>
  );
};

export default TopMenuBar;
