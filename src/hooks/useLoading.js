import { useContext } from 'react';
import { LoadingBarContext } from '../context/LoadingContextProvider';

function useLoading() {
  const context = useContext(LoadingBarContext);
  if (!context) {
    throw new Error('useLoading must');
  }
  return context;
}

export default useLoading;
