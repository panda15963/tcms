import { useState, useCallback, useMemo, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import TopMenuBar from '../components/navbars/TopMenuBar';
import LeftSideSlide from '../components/slideOver/LeftSideSlide';
import RightSideSlide from '../components/slideOver/RightSideSlide';

// MapLayout component definition
export default function MapLayout() {
  const [routeData, setRouteData] = useState([]);
  const [checkedNodes, setCheckedNodes] = useState([]);
  const [clickedNode, setClickedNode] = useState(null);
  const [currentApi, setCurrentApi] = useState(null);
  const [routeColors, setRouteColors] = useState([]);
  const [isCleared, setIsCleared] = useState(false);

  const memoizedRouteData = useMemo(() => routeData, [routeData]);
  const memoizedCheckedNodes = useMemo(() => checkedNodes, [checkedNodes]);

  const handleRouteColors = useCallback((colors) => {
    setRouteColors((prevColors) => {
      let formattedColors = [];

      // Ensure colors is an array, or convert it to an array if possible
      if (Array.isArray(colors)) {
        formattedColors = colors;
      } else if (typeof colors === 'string') {
        // If colors is a string, split it into an array
        formattedColors = colors.split('');
      } else {
        console.warn('Unexpected format for colors:', colors);
        return prevColors; // If colors is not an array or a string, return previous state
      }

      // Check if the colors are in individual character format or complete hex strings
      if (formattedColors.length > 0 && formattedColors[0].length === 1) {
        // Group the characters into valid hex color strings
        const groupedColors = [];
        for (let i = 0; i < formattedColors.length; i += 7) {
          if (formattedColors[i] === '#') {
            const colorChunk = formattedColors.slice(i, i + 7);
            if (colorChunk.length === 7) {
              groupedColors.push(colorChunk.join(''));
            }
          }
        }
        formattedColors = groupedColors;
      }

      // Check if any of the new colors are not already in the previous colors
      const newColors = formattedColors.filter(
        (color) => !prevColors.includes(color)
      );
      if (newColors.length === 0) {
        return prevColors; // No new colors to add, return previous state to avoid re-render
      }

      const updatedColors = [...prevColors, ...newColors];
      return updatedColors; // Update the state with the new list
    });
  }, []);

  const handleRouteData = useCallback(
    (data) => {
      if (data !== routeData) {
        setRouteData(data);
      }
    },
    [routeData]
  );

  const handleCheckedNodes = useCallback(
    (nodes) => {
      if (nodes !== checkedNodes) {
        setCheckedNodes(nodes);
      }
    },
    [checkedNodes]
  );

  const handleClickedNode = useCallback(
    (node) => {
      if (node !== clickedNode) {
        setClickedNode(node);
      }
    },
    [clickedNode]
  );

  // Use useEffect to update state based on external changes, not during render
  useEffect(() => {
    if (currentApi) {
      // Handle any updates needed when currentApi changes
    }
  }, [currentApi]);

  const handleClear = () => {
    setIsCleared(true); // Clear 상태 업데이트
    setTimeout(() => setIsCleared(false), 100); // Clear 상태를 짧은 시간 후 초기화 (선택 사항)
  };

  return (
    <>
      {/* Top Menu Bar */}
      <TopMenuBar
        handleRouteData={handleRouteData}
        checkedNodes={memoizedCheckedNodes}
        clickedNode={clickedNode}
        setCurrentApi={setCurrentApi}
        routeColors={routeColors}
        onClear={handleClear}
        handleSpaceData={
          // Add handleSpaceData to props
          (data) => {
            setRouteData(data);
          }
        }
      />

      {/* Left Slide Panel */}
      <LeftSideSlide
        data={memoizedRouteData}
        onCheckedNodesChange={handleCheckedNodes}
        onClickedNode={handleClickedNode}
        onMapChange={currentApi}
        routeColors={handleRouteColors}
        isCleared={isCleared}
      />

      {/* Right Slide Panel */}
      <RightSideSlide
        data={memoizedRouteData}
        onMapChange={currentApi}
        isCleared={isCleared}
      />

      {/* Outlet renders nested route components */}
      <main>
        <Outlet />
      </main>
    </>
  );
}
