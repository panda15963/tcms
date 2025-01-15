import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IoReloadSharp } from 'react-icons/io5';
import BarChart from '../../components/D3Charts/BarChart';

export default function UsageCounts() {
  const { t } = useTranslation(); // 다국어 번역 훅
  const location = useLocation(); // React Router로 전달된 위치 정보

  // 초기 데이터 설정: location.state에서 데이터를 추출
  const initialData = Array.isArray(location.state?.data?.result)
    ? location.state?.data?.result
    : [];
  const [data, setData] = useState(initialData); // 데이터 상태 관리
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 관리
  const dateTerm = location.state?.dateTerm || 'day';

  /**
   * 데이터 처리: toolname에서 공백 제거 및 null 값 처리
   */
  const processedData = data.map((item) => ({
    ...item,
    toolname: item.toolname ? item.toolname.replace(/\s+/g, '') : '', // toolname 공백 제거 및 null 처리
  }));

  /**
   * 새로고침 버튼 클릭 시 데이터를 다시 가져오는 함수
   */
  const handleReload = async () => {
    setIsLoading(true); // 로딩 상태 활성화
    try {
      const refreshedData = location.state?.data?.result || []; // 새로운 데이터를 가져옴
      setData(refreshedData); // 상태 업데이트
    } catch (error) {
      console.error('데이터 새로 고침 중 오류 발생:', error);
    } finally {
      setIsLoading(false); // 로딩 상태 비활성화
    }
  };

  /**
   * `location.state` 변경 시 데이터 초기화
   */
  useEffect(() => {
    try {
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
          const parsedData = JSON.parse(savedData);
          setData(Array.isArray(parsedData) ? parsedData : []);
        } else {
          setData([]); // 기본 빈 배열로 설정
        }
      }
    } catch (error) {
      setData([]); // 오류가 발생해도 빈 배열로 초기화
    }
  }, [location.key]);

  return (
    <div
      className="flex flex-col items-center justify-start pt-20 px-4 sm:px-6 lg:px-8"
      style={{ height: `calc(100vh - 108px)`, zIndex: '1' }}
    >
      {/* 헤더 섹션 */}
      <div className="flex justify-between items-center w-10/12 max-w-full pb-4">
        <h1 className="text-2xl font-bold text-center pb-4 text-gray-900">
          {/* 도구 기능별 사용 횟수 */}
          {t('UsageCounts.UsageCounts')}
        </h1>
        <button
          onClick={handleReload} // 새로고침 버튼 클릭 핸들러
          disabled={isLoading} // 로딩 중에는 버튼 비활성화
          className={`flex items-center px-4 py-2 border border-black rounded-lg shadow ${
            isLoading ? 'bg-gray-300' : 'bg-white'
          } text-gray-900`}
        >
          {isLoading ? (
            <span>{t('UsageCounts.Loading')}</span> // 로딩 중 텍스트 표시
          ) : (
            <IoReloadSharp /> // 새로고침 아이콘 표시
          )}
        </button>
      </div>

      {/* 데이터 시각화 섹션 */}
      <div
        className="flex items-center justify-center w-10/12 max-w-full bg-white shadow-md rounded-lg p-4 border border-black"
        style={{ height: '60vh' }} // 차트 섹션 높이 설정
      >
        {processedData.length > 0 ? (
          // 필터링된 데이터가 있을 경우 BarChart 컴포넌트 렌더링
          <BarChart data={data} dateTerm={dateTerm} />
        ) : (
          // 데이터가 없을 경우 "데이터 없음" 메시지 표시
          <p>{t('UsageCounts.NoDataFound')}</p>
        )}
      </div>
    </div>
  );
}
