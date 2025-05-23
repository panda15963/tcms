import React, { useState, useEffect, useCallback  } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IoReloadSharp } from 'react-icons/io5';
import LineChart from '../../components/D3Charts/LineChart';

export default function CountsByTool() {
  const { t } = useTranslation(); // 다국어 번역 훅
  const location = useLocation(); // React Router를 통해 전달된 위치 정보
  // 초기 데이터 설정: 데이터가 배열인지 확인하고, 기본값 설정
  const initialData = Array.isArray(location.state?.data?.result)
    ? location.state?.data?.result
    : [];
  const [data, setData] = useState(initialData); // 데이터 상태 관리
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const pcName = location.state?.pcname || '전체'; // 선택된 PC 이름 (기본값: "전체")

  const dateTerm = location.state?.dateTerm || 'Day'; // 선택된 날짜 기간 (기본값: "day")

  const handleResize = useCallback(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  /**
   * 데이터 필터링: 선택된 PC 이름에 따라 데이터 필터링
   */
  const filteredData = Array.isArray(data)
    ? data.filter(
        (item) => pcName === '전체' || pcName === 'All' || item.pc === pcName
      ) // "전체", "All" 또는 일치하는 PC만 포함
    : [];
  /**
   * 새로고침 버튼 클릭 시 데이터를 다시 로드하는 함수
   */
  const handleReload = async () => {
    console.log('데이터 새로 고침 중...', data);
    setIsLoading(true); // 로딩 상태 활성화
    try {
      // location.state의 데이터를 새로 불러오기
      const refreshedData = Array.isArray(location.state?.data?.result)
        ? location.state?.data?.result
        : [];
      setData(refreshedData); // 상태 업데이트
    } catch (error) {
      console.error('데이터 새로 고침 중 오류 발생:', error);
    } finally {
      setIsLoading(false); // 로딩 상태 비활성화
    }
  };

  /**
   * 컴포넌트 마운트 시 초기 데이터 설정
   */
  useEffect(() => {
    if (location.state?.data?.result) {
      const newData = Array.isArray(location.state.data.result)
        ? location.state.data.result
        : [];
      setData(newData);
      // 데이터를 localStorage에 저장
      localStorage.setItem('countsByToolData', JSON.stringify(newData));
    } else {
      // localStorage에서 데이터 불러오기
      const savedData = localStorage.getItem('countsByToolData');
      if (savedData) {
        setData(JSON.parse(savedData));
      }
    }
  }, [location.state]);

  return (
    <div className="flex flex-col items-center justify-start py-8 border-spacing-4 px-4 sm:px-6 lg:px-8 h-[calc(100vh-102px)] z-[1]">
      {/* 헤더 섹션 */}
      <div className="flex justify-between items-center w-[97%] pb-4">
        <h1 className="text-2xl font-bold text-center pb-4 text-gray-900">
          {/* 도구 실행 횟수(도구 별) */}
          {t('CountsByTool.CBT')}
        </h1>
        <button
          onClick={handleReload}
          disabled={isLoading} // 로딩 상태에서 버튼 비활성화
          className={`flex items-center px-4 py-2 border border-black rounded-lg shadow ${
            isLoading ? 'bg-gray-300' : 'bg-white'
          } text-gray-900`}
        >
          {isLoading ? (
            <span>{t('CountsByTool.Loading')}</span> // 로딩 중일 때 텍스트 표시
          ) : (
            <IoReloadSharp /> // 로딩이 아닐 때 아이콘 표시
          )}
        </button>
      </div>

      {/* 데이터 시각화 섹션 */}
      <div className="flex items-center justify-center w-[97%] bg-white shadow-md rounded-lg p-4 border border-black h-[100vh]">
        {filteredData.length > 0 ? (
          // 데이터가 있을 경우 차트 컴포넌트 렌더링
          <LineChart
            data={filteredData}
            groupBy="tools"
            dateTerm={dateTerm}
            windowSize ={windowSize}
          />
        ) : (
          // 데이터가 없을 경우 "데이터 없음" 메시지 표시
          <p>{t('UsageCounts.NoDataFound')}</p>
        )}
      </div>
    </div>
  );
}
