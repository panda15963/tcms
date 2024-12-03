import React, { createContext, useContext, useState } from 'react';

/**
 * SelectedItemContext
 * @description 선택된 항목을 관리하기 위한 Context
 */
const SelectedItemContext = createContext();

/**
 * SelectedItemProvider 컴포넌트
 * @description 선택된 항목 상태를 관리하고 자식 컴포넌트에 제공
 * @param {Object} children - Provider 내부에서 렌더링할 자식 컴포넌트
 * @returns {JSX.Element} Context Provider 컴포넌트
 */
export const SelectedItemProvider = ({ children }) => {
  const [selectedItem, setSelectedItem] = useState(null); // 선택된 항목 상태 관리

  return (
    <SelectedItemContext.Provider value={{ selectedItem, setSelectedItem }}>
      {children} {/* Provider 내부 콘텐츠 렌더링 */}
    </SelectedItemContext.Provider>
  );
};

/**
 * useSelectedItem 훅
 * @description SelectedItemContext를 쉽게 사용하기 위한 커스텀 훅
 * @returns {Object} 선택된 항목 상태와 이를 변경하는 함수
 * @example
 * const { selectedItem, setSelectedItem } = useSelectedItem();
 */
export const useSelectedItem = () => {
  return useContext(SelectedItemContext);
};
