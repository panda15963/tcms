import { createContext, useEffect, useState } from 'react';

export const LoadingBarContext = createContext({
  loading: false,
  setLoading: null,
});

export const LoadingBarProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const value = { loading, setLoading };

  useEffect(() => {
    console.log('LOADING BAR SHOW ==> ', loading);
  }, [loading]);

  return (
    <LoadingBarContext.Provider value={value}>
      {children}
    </LoadingBarContext.Provider>
  );
};
