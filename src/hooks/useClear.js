import { useState } from 'react';

export const useClear = () => {
  const [isCleared, setIsCleared] = useState(false);

  const clearMap = () => {
    setIsCleared(true);
  };

  return { isCleared, clearMap };
};
