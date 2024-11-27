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
 *     http://localhost:3000/log/kr
 *     http://localhost:3000/log/en
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
  setSelectedSearchFields,
  setSelectedIds,
  setSelectedRouteCellData,
  setSelectedConfigIds,
  setSelectedSearchFieldsConfig,
  setIsConfigModalOpen,
  setListConfigCount,
  onClose,
}) => {
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

  const [configList, setConfigList] = useState([]); // 화면정보탭 조회 리스트
  const [selectConfigs, setSelectConfigs] = useState(initialList); // 화면정보탭 체크박스 선택
  const [selectConfigDetail, setSelectConfigDetail] = useState(initialList);

  useEffect(() => {
    console.log('configList updated:', configList);
  }, [configList]); // 데이터 변경 시 로그 출력

  useEffect(() => {
    FIND_SAMEORIGIN_TCCFG(data);
  }, [data]);

  /**
   * 버전 모아보기
   * 조회 API (FIND_SAMEORIGIN_META)
   */
  const FIND_SAMEORIGIN_TCCFG = async () => {
    setLoading(true);
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
        setLoading(false);
      }
    } catch (error) {
      console.error('API Error:', error);
      setLoading(false);
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
   * 화면정보탭 버전 모아보기
   * 체크박스 선택 감지
   */
  const handleSelectionConfigDetail = (selectedRows) => {
    console.log(
      '🚀 ~ handleSelectionConfigDetail ~ selectedRows:',
      selectedRows
    );

    if (selectedRows && selectedRows.length > 0) {
      // reduce를 사용하여 loglist 합치기
      const combinedLogList = selectedRows.reduce((acc, row) => {
        return acc.concat(row.loglist || []);
      }, []);

      console.log('🚀 ~ combinedLogList:', combinedLogList);
      setSelectConfigs(combinedLogList);
    }
  };

  /**
   * 화면정보탭 버전 모아보기
   * 리스트 클릭 이벤트
   */
  const handleLeftCellClickDetail = (rowData) => {
    console.log('🚀 ~ handleLeftCellClickDetail ~ rowData:', rowData);
    setSelectConfigDetail(rowData.loglist); // 셀 클릭 시 loglist 설정
  };

  /**
   * 화면정보탭 버전모아보기
   * 선택 이벤트
   * selectConfigsselectConfigsselectConfigsselectConfigsselectConfigs
   */
  const handleConfigBtnDoubleClick = async () => {
    console.log('selectConfigs ==>', selectConfigs);

    if (selectConfigs && selectConfigs.length > 0) {
      const resultList = await Promise.all(
        selectConfigs.map(async (log) => {
          const condTmp = {
            meta_id: log.meta_id,
          };
          console.log('🚀 ~ selectConfigs.map ~ condTmp:', condTmp);

          const result = await FIND_META_ID(condTmp);
          console.log('🚀 ~ selectConfigs.map ~ result:', result);

          return result; // result를 반환하여 리스트에 추가
        })
      );

      // resultList를 평탄화(flatten)하여 단일 배열로 변환
      const flatResultList = resultList.flat();

      console.log('🚀 ~ handleConfigBtnDoubleClick ~ resultList:', resultList);
      console.log(
        '🚀 ~ handleConfigBtnDoubleClick ~ flatResultList:',
        flatResultList
      );

      handleConfigConfirm(flatResultList);

      // resultList는 FIND_META_ID에서 받은 결과들이 포함된 리스트
      // 이 리스트를 다른 곳으로 전달하거나 추가적인 처리를 할 수 있음
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

    setSelectedSearchFieldsConfig([]);
    setSelectedConfigIds([]);
    setSelectedConfigCellData();

    setConfigCond(initialCond);
    setConfigList(initialList);
    setSelectConfigDetail(initialList);
    setListConfigCount(0);

    setOpen(false);
    setIsConfigModalOpen(false);
  };

  /**
   * 화면정보탭 버전 모아보기 다운로드
   */
  const handleConfigDetailDownload = async () => {
    console.log('selectConfigs ==>', selectConfigs);
    setLoading(true);

    const resultList = await Promise.all(
      selectConfigs.map(async (log) => {
        const condTmp = {
          meta_id: log.meta_id, // 각 log에서 meta_id 추출
        };
        console.log('🚀 ~ selectConfigs.map ~ condTmp:', condTmp);
        const result = await FIND_META_ID(condTmp);
        console.log('🚀 ~ dataToDownload.map ~ result:', result);
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
        const logResponse = await nonAuthInstance.get(
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
        const imageResponse = await nonAuthInstance.get(
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
            <h2 className="text-center text-xl font-bold mb-2"></h2>

            <ConfigGridLDetail
              list={configList} // 왼쪽 그리드에 대한 데이터 리스트
              onSelectionChange={handleSelectionConfigDetail}
              onCellClick={handleLeftCellClickDetail} // 셀 클릭 시
            />

            {/* 오른쪽 그리드 */}
            <h2 className="text-center text-xl font-bold mb-2"></h2>
            <ConfigGridRDetail
              list={selectConfigDetail} // 오른쪽 그리드에 대한 데이터 리스트
              // onSelectionChange={
              //   (selectedRows) => setRightList(selectedRows) // 오른쪽 그리드에서 선택된 행 업데이트
              // }
            />
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
          {/* <h2>Cell Data: {data ? data.description : 'No Data'}</h2>
            <p>API Result: {apiData ? JSON.stringify(apiData) : 'Loading...'}</p>
            <button onClick={onClose} className="mt-2 p-2 bg-blue-500 text-white rounded">Close</button> */}
        </div>
      </div>
    </Dialog>
  );
};

export default ConfigModal;
