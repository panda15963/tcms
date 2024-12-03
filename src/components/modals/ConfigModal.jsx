import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { MdClose } from 'react-icons/md';
import { FaCheck, FaDownload } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { nonAuthInstance } from '../../server/MapAxiosConfig';
import ConfigGridLDetail from '../tables/mapTables/ConfigGridLDetail';
import ConfigGridRDetail from '../tables/mapTables/ConfigGridRDetail';
import MapLogService from '../../service/MapLogService';

/**
 * 화면정보탭 버전 모아보기
 * 다운로드 가능 별도 모달 :
 *    http://localhost:3000/log/kr
 *    http://localhost:3000/log/en
 */
const ConfigModal = ({
  data,
  isDirect,
  setLoading,
  setSelectedConfigCellData,
  routeData,
  routeFullCoords,
  setOpen,
  setConfigCond,
  setSelectedConfigIds,
  setSelectedSearchFieldsConfig,
  setIsConfigModalOpen,
  setListConfigCount,
  onClose,
}) => {
  const { t } = useTranslation();

  // 초기 조건 설정
  const initialCond = {
    searchWord: '', // 검색어
    continent: '', // 대륙
    region: '', // 지역
    priority: '', // 우선순위
    target: '', // 대상
    format: '', // 형식
    feature: '', // 특성
    virtual: -1, // 가상 여부 (-1: 전체, 0: 가상, 1: 실제)
    tag: '', // 태그
    group_id: -1, // 그룹 ID
    operation: 0, // 연산자 (0: AND, 1: OR)
  };

  // 초기 리스트 상태
  const initialList = {
    status: 'idle',
    currentRequestId: undefined,
    error: null,
    list: [],
  };

  const [configList, setConfigList] = useState([]); // 화면정보탭 조회 리스트
  const [selectConfigs, setSelectConfigs] = useState(initialList); // 체크박스 선택 상태
  const [selectConfigDetail, setSelectConfigDetail] = useState(initialList); // 선택된 상세 설정

  // configList 데이터 변경 시 로그 출력
  useEffect(() => {
    console.log('configList updated:', configList);
  }, [configList]);

  // 초기 데이터 설정
  useEffect(() => {
    FIND_SAMEORIGIN_TCCFG(data);
  }, [data]);

  /**
   * 버전 모아보기
   * 조회 API (FIND_SAMEORIGIN_META)
   */
  const FIND_SAMEORIGIN_TCCFG = async () => {
    setLoading(true); // 로딩 상태 시작
    try {
      if (data && data.tccfg_id) {
        const response = await nonAuthInstance.get(
          `/find/sameorigin/tccfg?group_id=${data.group_id}&tccfg_id=${data.origin_tccfg_id}`
        );

        console.log('🚀 ~ fetchData ~ response:', response);
        setConfigList((prevState) => {
          const newList = response.data.findTccfg;
          console.log('🚀 ~ setConfigList ~ newList:', newList);

          if (JSON.stringify(prevState) !== JSON.stringify(newList)) {
            return newList;
          }
          return prevState;
        });
        setLoading(false); // 로딩 상태 종료
      }
    } catch (error) {
      console.error('API Error:', error);
      setLoading(false); // 에러 발생 시 로딩 상태 종료
    }
  };

  /**
   * 메타 검색 API (FIND_META_ID)
   * 검색 조건에 따라 메타 데이터를 검색
   */
  const FIND_META_ID = async (inputCond) => {
    try {
      const res = await MapLogService.FIND_META_ID({
        cond: inputCond,
      });

      console.log('FIND_META_ID of res ==>', res.findMeta);

      // 검색된 메타 데이터 반환
      return res.findMeta;
    } catch (e) {
      console.log('FIND_META_ID of error ==>', e);
      return null; // 오류가 발생하면 null 반환
    }
  };

  /**
   * 경로 데이터 생성 API (SPACE_INTERPOLATION)
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
      return results.filter((res) => res !== null); // 유효한 결과만 반환
    } catch (e) {
      console.log('SPACE_INTERPOLATION of error ==>', e);
    }
  };

  /**
   * 버전 모아보기
   * 체크박스 선택 핸들러
   */
  const handleSelectionConfigDetail = (selectedRows) => {
    console.log(
      '🚀 ~ handleSelectionConfigDetail ~ selectedRows:',
      selectedRows
    );
    if (selectedRows && selectedRows.length > 0) {
      const combinedLogList = selectedRows.reduce((acc, row) => {
        return acc.concat(row.loglist || []);
      }, []);
      console.log('🚀 ~ combinedLogList:', combinedLogList);
      setSelectConfigs(combinedLogList);
    }
  };

  /**
   * 버전 모아보기
   * 왼쪽 리스트 클릭 핸들러
   */
  const handleLeftCellClickDetail = (rowData) => {
    console.log('🚀 ~ handleLeftCellClickDetail ~ rowData:', rowData);
    setSelectConfigDetail(rowData.loglist); // 클릭 시 loglist 설정
  };

  /**
   * 버전 모아보기
   * 선택 이벤트
   */
  const handleConfigBtnDoubleClick = async () => {
    console.log(
      '🚀 ~ handleConfigBtnDoubleClick ~ selectConfigs:',
      selectConfigs
    );

    if (selectConfigs && selectConfigs.length > 0) {
      const resultList = await Promise.all(
        selectConfigs.map(async (log) => {
          const condTmp = {
            meta_id: log.meta_id,
          };
          console.log('🚀 ~ selectConfigs.map ~ condTmp:', condTmp);

          const result = await FIND_META_ID(condTmp);
          console.log('🚀 ~ selectConfigs.map ~ result:', result);

          return result;
        })
      );

      // 결과를 평탄화(flatten)하여 단일 배열로 변환
      const flatResultList = resultList.flat();

      console.log('🚀 ~ handleConfigBtnDoubleClick ~ resultList:', resultList);
      console.log(
        '🚀 ~ handleConfigBtnDoubleClick ~ flatResultList:',
        flatResultList
      );
      handleConfigConfirm(flatResultList);
    } else {
      console.log('선택된 로그가 없습니다.');
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
      setLoading(false);
    } else {
      console.error('No array found in list');
      setLoading(false);
    }

    // 상태 초기화
    setSelectedSearchFieldsConfig([]);
    setSelectedConfigIds([]);
    setSelectedConfigCellData();

    setConfigCond(initialCond);
    setConfigList(initialList);
    setSelectConfigs(initialList);
    setSelectConfigDetail(initialList);
    setListConfigCount(0);

    setOpen(false);
    setIsConfigModalOpen(false);
  };

  /**
   * 화면정보탭 버전 모아보기 다운로드
   */
  const handleConfigDetailDownload = async () => {
    // 다운로드 관련 코드
  };

  return (
    <Dialog open={true} onClose={onClose}>
      <div className="fixed inset-0 flex items-center justify-center z-40 bg-gray-500 bg-opacity-50">
        <div className="bg-white p-1 rounded-md shadow-lg">
          <div className="flex justify-between py-3 px-5 bg-blue-600 rounded-t-lg">
            <h1 className="font-semibold text-white">
              {t('LogModal.AllVersions')}
            </h1>
            <button className="font-semibold" onClick={onClose}>
              <MdClose className="text-white" size={16} />
            </button>
          </div>
          <div className="flex flex-row justify-between space-x-2 ">
            {/* 왼쪽 그리드 */}
            <ConfigGridLDetail
              list={configList}
              onSelectionChange={handleSelectionConfigDetail}
              onCellClick={handleLeftCellClickDetail}
            />
            {/* 오른쪽 그리드 */}
            <ConfigGridRDetail list={selectConfigDetail} />
          </div>
          <div className="flex justify-end mt-1">
            <button
              onClick={
                isDirect
                  ? handleConfigDetailDownload
                  : handleConfigBtnDoubleClick
              }
              className="inline-flex items-center border-2 gap-x-2 px-3 py-1 font-semibold text-sm border-slate-300 rounded-md focus:ring-1 focus:border-sky-500 hover:border-sky-500 cursor-pointer"
            >
              {isDirect ? (
                <>
                  <FaDownload
                    className="h-4 w-5 text-sky-500"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-sky-500 font-bold">
                    {t('LogModal.Download')}
                  </span>
                </>
              ) : (
                <>
                  <FaCheck
                    className="h-4 w-5 text-sky-500"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-sky-500 font-bold">
                    {t('LogModal.Select')}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
export default ConfigModal;