import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { MdClose } from 'react-icons/md';
import { FaCheck, FaDownload } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import ConfigGridLDetail from '../tables/mapTables/ConfigGridLDetail';
import ConfigGridRDetail from '../tables/mapTables/ConfigGridRDetail';
import {
  SPACE_INTERPOLATION,
  FIND_META_ID,
} from '../../components/requestData/MapRequestData';
import { axiosInstance } from '../../server/axios_config';

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
  const [selectedTccfg, setSelectedTccfg] = useState(initialList); // 화면정보탭 체크박스 선택 (왼쪽)
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
        const response = await axiosInstance.get(
          `/find/sameorigin/tccfg?group_id=${-1}&tccfg_id=${
            data.origin_tccfg_id
          }`
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

      setSelectedTccfg(selectedRows);
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
    console.log(
      '🚀 ~ handleConfigDetailDownload ~ selectedTccfg:',
      selectedTccfg
    );
    console.log(
      '🚀 ~ handleConfigDetailDownload ~ selectConfigs:',
      selectConfigs
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
      selectConfigs.map(async (log) => {
        const condTmp = {
          meta_id: log.meta_id, // 각 log에서 meta_id 추출
        };
        console.log('🚀 ~ selectConfigs.map ~ condTmp:', condTmp);
        const result = await FIND_META_ID(condTmp);
        console.log('🚀 ~ selectConfigs.map ~ result:', result);
        return result;
      })
    );

    // resultList를 평탄화(flatten)하여 단일 배열로 변환
    const flatResultList = resultList.flat();
    console.log(
      '🚀 ~ handleConfigDetailDownload ~ flatResultList:',
      flatResultList
    );

    // JSON 파일 다운로드 추가
    for (const item of flatResultList) {
      try {
        // 각 item의 filename 속성에 따라 파일명 지정
        const filename = item.file_name
          ? `${item.file_name}.meta`
          : 'flatResultList.meta';
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
      </div>
    </Dialog>
  );
};
export default ConfigModal;
