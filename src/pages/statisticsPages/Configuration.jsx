import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IoReloadSharp } from 'react-icons/io5';
import ConfigurationTable from '../../components/tables/statTables/ConfigurationTable';

export default function Configuration() {
  const { t } = useTranslation(); // 다국어 번역 훅
  const location = useLocation(); // React Router를 통해 전달된 위치 정보

  // 초기 상태 설정: location.state로 전달된 데이터 사용
  const initialData = location.state?.data || {};
  const pcName = location.state?.pcname || '전체'; // 선택된 PC 이름 (기본값: "전체")
  const toolName = (location.state?.toolname || '전체').toUpperCase(); // 선택된 도구 이름 (대문자로 변환, 기본값: "전체")
  const [data, setData] = useState(initialData.result || []); // 데이터 상태 관리

  /**
   * 데이터를 새로 고침하는 함수
   */
  const handleReload = () => {
    console.log('Reloading data...');
    // 데이터 새로 고침 또는 재요청 (여기서는 location.state의 데이터를 사용)
    const updatedData = location.state?.data || {}; // 실제 데이터 요청 로직으로 교체 가능
    setData(updatedData.result || []); // 상태 업데이트
  };

  /**
   * 컴포넌트가 처음 마운트되거나 location.state의 데이터가 변경될 때 데이터를 초기화
   */
  useEffect(() => {
    setData(initialData.result || []);
  }, [location.state?.data]);

  /**
   * 데이터에서 도구 이름의 공백을 제거하여 처리
   */
  const processedData = data.map((item) => ({
    ...item,
    toolname: item.toolname.replace(/\s+/g, ''), // 도구 이름의 공백 제거
  }));

  /**
   * 선택된 도구 이름(toolName) 및 PC 이름(pcName)에 따라 데이터를 필터링
   */
  const filteredData = processedData.filter(
    (item) =>
      (toolName === '전체' || item.toolname === toolName) && // "전체"이거나 선택된 도구 이름과 일치
      (pcName === '전체' || item.pc === pcName) // "전체"이거나 선택된 PC 이름과 일치
  );

  return (
    <div
      className="flex flex-col items-center justify-start pt-20 bg-gray-100 px-4 sm:px-6 lg:px-8"
      style={{ height: '87.5vh' }} // 페이지 높이 설정
    >
      {/* 헤더 섹션 */}
      <div className="flex justify-between items-center w-10/12 max-w-full pb-4">
        <h1 className="text-2xl font-bold text-center pb-4 text-gray-900">
          {/* 도구 설정 정보 변경 사항 */}
          {t('Configuration.TSIM')}
        </h1>
        <button
          className="flex items-center px-4 py-2 border border-black bg-white text-gray-900 rounded-lg shadow"
          onClick={handleReload}
        >
          <IoReloadSharp /> {/* 새로 고침 아이콘 */}
        </button>
      </div>

      {/* 테이블 섹션 */}
      <div
        className="flex items-center justify-center w-10/12 max-w-full bg-white shadow-md rounded-lg p-4 border border-black"
        style={{ height: '60vh' }} // 테이블 높이 설정
      >
        {filteredData.length ? (
          // 필터링된 데이터가 있으면 테이블 렌더링
          <ConfigurationTable data={filteredData} />
        ) : (
          // 데이터가 없으면 "데이터 없음" 메시지 표시
          <p>{t('Configuration.NoDataFound')}</p>
        )}
      </div>
    </div>
  );
}
