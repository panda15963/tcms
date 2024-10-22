import useLoading from '../hooks/useLoading';
import LoadingBar from '../assets/lottie/loading_gradient.json';
import Lottie from 'react-lottie';

const AppLoadingBar = () => {
  const { loading } = useLoading();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: LoadingBar,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return (
    loading && (
      <div
        id="loading_bar_container"
        className="fixed top-0 left-0 max-w-full w-full h-full flex justify-center items-center z-50 bg-gray-50 opacity-40  cursor-wait"
      >
        <div
          id="loading_bar"
          className="h-36 w-36 flex-row items-center justify-center cursor-wait opacity-70"
        >
          <Lottie
            isClickToPauseDisabled={true}
            style={{ cursor: 'wait' }}
            // height={250}
            // width={250}
            options={defaultOptions}
          />
        </div>
      </div>
    )
  );
};

export default AppLoadingBar;
