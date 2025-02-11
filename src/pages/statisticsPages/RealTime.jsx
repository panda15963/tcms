import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IoReloadSharp } from 'react-icons/io5';
import RealTimeUsageTable from '../../components/tables/statTables/RealTimeUsageTable';
import { useLocation } from 'react-router-dom'; // React Router의 useLocation 추가
import { LIVE_TC } from '../../components/requestData/StatRequestData'; // LIVE_TC API 추가

export default function RealTime() {
  const { t } = useTranslation(); // 다국어 번역 훅
  const [data, setData] = useState(null); // 데이터 상태 관리
  const [timer, setTimer] = useState(30); // 30초 타이머

  const location = useLocation(); // 현재 경로를 감지

  /**
   * 타이머 로직
   * 타이머가 0에 도달하면 데이터를 자동으로 새로고침합니다
   */
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown); // 컴포넌트 언마운트 시 인터벌 정리
    } else {
      handleReload(); // 타이머가 0에 도달하면 데이터 새로고침 실행
    }
  }, [timer]);

  /**
   * 데이터를 가져오는 함수
   * LIVE_TC API 호출 후 응답 데이터를 상태에 저장
   */
  const fetchData = async () => {
    const { result: response } = await LIVE_TC(); // LIVE_TC API 호출
    setData(response); // 응답 데이터를 상태에 설정
  };

  /**
   * 컴포넌트 마운트 시 초기 데이터 가져오기 및 30초 간격으로 자동 갱신 설정
   */
  useEffect(() => {
    setTimer(30); // 타이머 초기화
    fetchData(); // 컴포넌트가 처음 마운트될 때 데이터 가져오기
    const interval = setInterval(fetchData, 30000); // 30초마다 fetchData 호출

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 제거
  }, [location]);

  /**
   * 수동 새로고침 버튼 클릭 시 실행되는 핸들러
   */
  const handleReload = async () => {
    try {
      const { result: response } = await LIVE_TC(); // API 호출
      if (Array.isArray(response)) {
        setData([...response]); // 데이터 복사하여 상태에 업데이트
      } else {
        console.log('No new data found, keeping existing data'); // 데이터 없음 로그
      }
    } catch (error) {
      console.error('Error refreshing data:', error); // 에러 로그 출력
    }
    setTimer(30); // 타이머 리셋
  };

  return (
    <div className="flex flex-col items-center justify-start py-8 border-spacing-4 px-4 sm:px-6 lg:px-8 h-[calc(100vh-102px)] z-[1]">
      {/* 헤더 섹션 */}
      <div className="flex justify-between items-center w-[97%] pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {/* TC 기반 도구 실시간 사용 현황 */}
          {t('RealTime.RealTimes')}
        </h1>
        <div className="flex items-center space-x-4">
          {/* 타이머 UI 표시 */}
          <div className="w-32 h-4 bg-gray-200 rounded border border-gray-500">
            <div
              className="h-full bg-blue-500 rounded border border-blue-500"
              style={{ width: `${(timer / 30) * 100}%` }} // 타이머 퍼센트 계산
            />
          </div>
          <span className="text-gray-700">{timer}s</span> {/* 남은 시간 표시 */}
          <button
            onClick={handleReload} // 새로고침 버튼
            className="flex items-center px-4 py-2 border border-black bg-white text-gray-900 rounded-lg shadow"
          >
            <IoReloadSharp /> {/* 새로고침 아이콘 */}
          </button>
        </div>
      </div>

      {/* 데이터 테이블 섹션 */}
      <div className="flex items-center justify-center w-[97%] bg-white shadow-md rounded-lg p-4 border border-black h-[100vh]">
        {/* 데이터를 props로 전달 */}
        <RealTimeUsageTable data={data} />
      </div>
    </div>
  );
}
