import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { MdClose } from 'react-icons/md';
import { FaCheck, FaDownload } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { nonAuthInstance } from '../../server/MapAxiosConfig';
import MainGridDetal from '../tables/mapTables/MainGridDetal';
import MapLogService from '../../service/MapLogService';

/**
 * 경로탭 버전 모아보기
 * 다운로드 가능 별도 모달 :
 *      http://localhost:3000/log/kr
 *      http://localhost:3000/log/en
 */
const RouteModal = ({
  data,
  isDirect,
  setLoading,
  routeData,
  routeFullCoords,
  setOpen,
  setList,
  setSelectedSearchFields,
  setSelectedIds,
  setSelectedRouteCellData,
  setIsRouteModalOpen,
  onClose,
}) => {
  const { t } = useTranslation();

  const initialList = {
    status: 'idle',
    currentRequestId: undefined,
    error: null,
    list: [],
  };

  const [routeList, setRouteList] = useState(initialList); // 경로탭 조회 리스트
  const [selectRoutes, setSelectRoutes] = useState([]); // 경로탭 체크박스 선택

  useEffect(() => {
    FIND_SAMEORIGIN_META(data);
  }, [data]);

  /**
   * 버전 모아보기 조회 API (FIND_SAMEORIGIN_META)
   */
  const FIND_SAMEORIGIN_META = async () => {
    setLoading(true);
    try {
      const response = await nonAuthInstance.get(
        `/find/sameorigin/meta?group_id=${data.group_id}&meta_id=${data.meta_id}`
      );
      setRouteList((prevState) => {
        return {
          ...prevState,
          list: response.data.findMeta,
        };
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  /**
   * 경로 표출 API (SPACE_INTERPOLATION)
   */
  const SPACE_INTERPOLATION = async (inputCond) => {
    try {
      if (!Array.isArray(inputCond)) {
        inputCond = [inputCond];
      }

      const promises = inputCond.map((value) => {
        return MapLogService.SPACE_INTERPOLATION({
          cond: { file_id: value },
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
   * 버전 모아보기 선택 핸들러
   */
  const handleSelectionRouteDetail = (selectedRows) => {
    console.log(
      '🚀 ~ handleSelectionRouteDetail ~ selectedRows:',
      selectedRows
    );

    setSelectRoutes(selectedRows);
  };

  /**
   * 선택버튼 이벤트
   */
  const handleRouteButtonClick = async () => {
    console.log('🚀 ~ handleRouteButtonClick ~ selectRoutes:', selectRoutes);

    const routeFileId = selectRoutes.map((route) => route.file_id);
    console.log('🚀 ~ handleRouteButtonClick ~ routeFileId:', routeFileId);

    const routeCoords = await SPACE_INTERPOLATION(routeFileId);
    console.log('🚀 ~ handleRouteButtonClick ~ routeCoords:', routeCoords);

    routeData(selectRoutes); // 경로 목록, 로그 메타 데이터 목록
    routeFullCoords(routeCoords); // 경로 표출

    setSelectedSearchFields([]);
    setSelectedIds([]);
    setSelectedRouteCellData();

    setList(initialList);
    setRouteList(initialList);

    // setListConfig(initialList);
    // setListConfigDetail(initialList);
    // setSelectedLogList(initialList);
    // setSelectedLogListDetail(initialList);
    // setSelectedConfigCellData();
    // setIsConfigModalOpen(false);

    setOpen(false);
    setIsRouteModalOpen(false);
  };

  /**
   * 다운로드
   */
  const handleRouteDetailDownload = async () => {
    setLoading(true);

    // JSON 파일 다운로드 추가
    for (const item of selectRoutes) {
      try {
        // 각 item의 filename 속성에 따라 파일명 지정
        const filename = item.file_name
          ? `${item.file_name}.meta`
          : 'selectRoutes.meta';
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
            item.filename || 'selectRoutes'
          }:`,
          error
        );
        setLoading(false);
      }
    }

    for (const file of dataToDownload) {
      try {
        // sequence 0 = 로그파일
        const logResponse = await nonAuthInstance.get(
          `/download/logfile?meta_id=${file.meta_id}&sequence=0`,
          { responseType: 'blob' }
        );

        const logBlob = new Blob([logResponse.data]);
        const logUrl = window.URL.createObjectURL(logBlob);
        const logLink = document.createElement('a');
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
    <Dialog
      open={true}
      onClose={() => {
        setSelectedSearchFields([]);
        setSelectedIds([]);
        setSelectedRouteCellData();
        setList(initialList);
        setRouteList(initialList);
        setOpen(false);
      }}
    >
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-50">
        <div className="bg-white p-1 rounded-md shadow-lg">
          <div className="flex justify-between py-3 px-5 bg-blue-600 rounded-t-lg">
            <h1 className="text-sm font-semibold text-white">
              {/* 버전 모아보기 */}
              {t('LogModal.AllVersions')}
            </h1>
            <button className="font-semibold" onClick={onClose}>
              <MdClose className="text-white" size={16} />
            </button>
          </div>
          <div
            className="flex flex-row justify-between space-x-4 my-4"
            style={{ marginTop: '0px', marginBottom: '0px' }}
          >
            <div className="flex-1 border border-gray-300 p-4">
              <h2 className="text-center text-xl font-bold mb-2"></h2>
              <MainGridDetal
                list={routeList}
                onSelectionChange={handleSelectionRouteDetail}
              />
            </div>
          </div>
          <div className="flex justify-end mt-1">
            <button
              onClick={
                isDirect ? handleRouteDetailDownload : handleRouteButtonClick
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

export default RouteModal;
