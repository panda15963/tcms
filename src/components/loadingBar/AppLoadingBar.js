import useLoading from '../../hooks/useLoading'; // 로딩 상태 관리 훅
import LoadingBar from '../../assets/lottie/loading_gradient.json'; // Lottie 애니메이션 데이터
import Lottie from 'react-lottie'; // Lottie 애니메이션 렌더링 라이브러리

/**
 * AppLoadingBar 컴포넌트
 * @description 로딩 상태일 때 화면 중앙에 Lottie 애니메이션을 표시
 * @returns {JSX.Element|null} 로딩 중일 경우 로딩 애니메이션, 아닐 경우 null
 */
const AppLoadingBar = () => {
  const { loading } = useLoading(); // 현재 로딩 상태 가져오기

  /**
   * Lottie 애니메이션 기본 옵션
   * @property {boolean} loop - 애니메이션 반복 여부
   * @property {boolean} autoplay - 애니메이션 자동 재생 여부
   * @property {Object} animationData - Lottie 애니메이션 데이터
   * @property {Object} rendererSettings - 렌더링 설정
   */
  const defaultOptions = {
    loop: true, // 애니메이션 반복 여부
    autoplay: true, // 자동 재생
    animationData: LoadingBar, // Lottie JSON 데이터
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice', // 화면 비율 유지 설정
    },
  };

  return (
    loading && ( // 로딩 상태일 때만 로딩 바 표시
      <div
        id="loading_bar_container"
        className="fixed top-0 left-0 max-w-full w-full h-full flex justify-center items-center z-50 bg-gray-50 opacity-40 cursor-wait"
      >
        <div
          id="loading_bar"
          className="h-36 w-36 flex-row items-center justify-center cursor-wait opacity-70"
        >
          {/* Lottie 애니메이션 컴포넌트 */}
          <Lottie
            isClickToPauseDisabled={true} // 클릭으로 애니메이션 일시정지 비활성화
            className="cursor-wait" // 커서 스타일
            options={defaultOptions} // Lottie 애니메이션 옵션
          />
        </div>
      </div>
    )
  );
};
export default AppLoadingBar;