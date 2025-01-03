import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import UsageStatusTable from '../../components/tables/statTables/UsageStatusTable';
import { IoReloadSharp } from 'react-icons/io5';
import { useLocation } from 'react-router-dom'; // React Router의 useLocation 추가
import { LIVE_TOOL } from '../../components/StatRequestData';

export default function UsageStatus() {
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
   * LIVE_TOOL API 호출 후 응답 데이터를 상태에 저장
   */
  const fetchData = async () => {
    const { result: response } = await LIVE_TOOL(); // API 호출
    setData(response); // 응답 데이터를 상태에 설정
  };

  /**
   * 컴포넌트가 마운트될 때 초기 데이터 가져오기 및 자동 갱신 설정
   */
  useEffect(() => {
    setTimer(30); // 타이머 초기화
    fetchData(); // 초기 데이터 가져오기
    const interval = setInterval(fetchData, 30000); // 30초마다 데이터 갱신

    // 컴포넌트 언마운트 시 인터벌 제거
    return () => clearInterval(interval);
  }, [location]);

  /**
   * 수동 새로고침 버튼 클릭 시 실행되는 핸들러
   */
  const handleReload = async () => {
    try {
      const { result: response } = await LIVE_TOOL(); // API 호출
      if (Array.isArray(response)) {
        setData([...response]); // 데이터 복사하여 상태에 업데이트
        console.log('Data refreshed'); // 새로고침 확인 로그
      } else {
        console.log('No new data found, keeping existing data'); // 데이터 없음 로그
      }
    } catch (error) {
      console.error('Error refreshing data:', error); // 에러 로그 출력
    }
    setTimer(30); // 타이머 리셋
  };

  return (
    <div
      className="flex flex-col items-center justify-start pt-20 bg-gray-100 px-4 sm:px-6 lg:px-8"
      style={{ height: '87.5vh' }} // 페이지 높이 설정
    >
      {/* 헤더 섹션 */}
      <div className="flex justify-between items-center w-10/12 max-w-full pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {/** 실시간 도구 사용 정보 */}
          {t('UsageInformation.ToolUsageInformation')}
        </h1>
        <div className="flex items-center space-x-4">
          {/* 타이머 UI 표시 */}
          <div className="w-32 h-4 bg-gray-200 rounded border border-gray-500">
            <div
              className="h-full bg-blue-500 rounded border border-blue-500"
              style={{ width: `${(timer / 30) * 100}%` }} // 타이머 퍼센트 계산
            ></div>
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
      <div
        className="flex items-center justify-center w-10/12 max-w-full bg-white shadow-md rounded-lg p-4 border border-black"
        style={{ height: '60vh' }} // 테이블 섹션 높이 설정
      >
        {/* 데이터를 UsageStatusTable 컴포넌트에 전달 */}
        <UsageStatusTable data={data} />{' '}
      </div>
    </div>
  );
}
