import { Fragment, useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { FaXmark } from 'react-icons/fa6';
import { FaArrowCircleLeft } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { CiSquarePlus, CiSquareMinus } from 'react-icons/ci';

export default function RightSideSlide({ data, onMapChange, isCleared }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState([]); // Default to all expanded
  const [rowsData, setRowsData] = useState([]); // State to manage rows data

  useEffect(() => {
    if (isCleared) {
      // Clear 동작 처리
      setExpandedRows();
      setRowsData();
      setOpen(false);
    }
  }, [isCleared]); // isCleared 상태가 변경될 때마다 실행

  // useEffect to automatically open the panel when data is provided
  useEffect(() => {
    if (onMapChange?.name === 'ROUTO' || onMapChange?.name === 'TMAP') {
      // 특정 지도 종류일 때 필터링 로직 실행
      if (data && data.length > 0) {
        console.log('onMapChange is ROUTO or TMAP, applying filters.');

        const filteredByCountry = data.filter(
          (item) => item.country_str === 'KOR' || item.country_str === 'SAU'
        );

        const filteredByName = filteredByCountry.filter(
          (item) =>
            !item.file_name.includes('US') ||
            (item.country_str === 'SAU' && item.file_name.includes('KOR'))
        );

        setOpen(true);
        setRowsData(filteredByName);

        const firstRowId = filteredByName.length > 0 ? [1] : [];
        setExpandedRows(firstRowId);
      } else {
        setOpen(false); // 데이터가 없으면 패널 닫기
      }
    } else {
      if (data && data.length > 0) {
        setOpen(true);
        setRowsData(data);

        const firstRowId = data.length > 0 ? [1] : [];
        setExpandedRows(firstRowId);
      } else {
        setOpen(false);
      }
    }
  }, [data, onMapChange]);

  // 지도 변경 시 데이터를 초기화
  useEffect(() => {
    if (onMapChange) {
      setRowsData([]); // 행 데이터 초기화
      setExpandedRows([]); // 확장된 행 초기화
      setOpen(false); // 패널 닫기
    }
  }, [onMapChange]);

  // 행 데이터를 구성
  const rows =
    Array.isArray(rowsData) && rowsData.length > 0
      ? rowsData.map((item, index) => ({
          id: index + 1, // Unique ID for each row
          col1: (
            <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
              {`${index + 1}. ${item?.file_name || 'No file name available'}`}
            </span>
          ),
          // 하위 데이터 포함
          children: item?.file_name && [
            {
              id: `${index + 1}-2`,
              col1: t('RightSideSlide.Name'),
              col2: item?.file_name || 'None',
            },
            {
              id: `${index + 1}-3`,
              col1: t('RightSideSlide.Continent'),
              col2: item?.continent_str || 'None',
            },
            {
              id: `${index + 1}-4`,
              col1: t('RightSideSlide.Country'),
              col2: item?.country_str || 'None',
            },
            {
              id: `${index + 1}-5`,
              col1: t('RightSideSlide.Creator'),
              col2: item?.creator || 'Unknown',
            },
            {
              id: `${index + 1}-6`,
              col1: t('RightSideSlide.CreatedDate'),
              col2: item?.create_date || 'Unknown',
            },
            {
              id: `${index + 1}-7`,
              col1: t('RightSideSlide.LastChangeDate'),
              col2: item?.modified_date || 'Unknown',
            },
            {
              id: `${index + 1}-8`,
              col1: t('RightSideSlide.Priority'),
              col2: item?.priority_str || 'None',
            },
            {
              id: `${index + 1}-9`,
              col1: t('RightSideSlide.FeatureCategory'),
              children: [
                {
                  id: `${index + 1}-9-1`,
                  col1: t('RightSideSlide.Feature'),
                  col2: item?.feature_str || 'None',
                },
              ],
            },
            {
              id: `${index + 1}-10`,
              col1: t('RightSideSlide.MCOLS'),
              children: [
                {
                  id: `${index + 1}-10-1`,
                  col1: '-',
                  col2: item?.mcolslist?.[0]?.name || '-',
                },
              ],
            },
            {
              id: `${index + 1}-11`,
              col1: t('RightSideSlide.TC'),
              children: [
                {
                  id: `${index + 1}-11-1`,
                  col1: '-',
                  col2: item?.tc || 'None',
                },
              ],
            },
            {
              id: `${index + 1}-12`,
              col1: t('RightSideSlide.Memo'),
              children: [
                {
                  id: `${index + 1}-12-1`,
                  col1: '-',
                  col2: item?.memo?.[0] || 'None',
                },
              ],
            },
            {
              id: `${index + 1}-13`,
              col1: t('RightSideSlide.Target'),
              col2: item?.target_str || 'None',
            },
            {
              id: `${index + 1}-14`,
              col1: t('RightSideSlide.Summary'),
              col2: item?.summary_str || 'None',
            },
            {
              id: `${index + 1}-15`,
              col1: t('RightSideSlide.Departure'),
              col2: item?.start_name || 'Unknown',
              children: [
                {
                  id: `${index + 1}-15-1`,
                  col1: t('RightSideSlide.Lon'),
                  col2: item?.start_coord?.split(',')[0] || 'None',
                },
                {
                  id: `${index + 1}-15-2`,
                  col1: t('RightSideSlide.Lat'),
                  col2: item?.start_coord?.split(',')[1] || 'None',
                },
              ],
            },
            {
              id: `${index + 1}-16`,
              col1: t('RightSideSlide.Destination'),
              col2: item?.goal_name || 'Unknown',
              children: [
                {
                  id: `${index + 1}-16-1`,
                  col1: t('RightSideSlide.Lon'),
                  col2: item?.goal_coord?.split(',')[0] || 'None',
                },
                {
                  id: `${index + 1}-16-2`,
                  col1: t('RightSideSlide.Lat'),
                  col2: item?.goal_coord?.split(',')[1] || 'None',
                },
              ],
            },
            {
              id: `${index + 1}-17`,
              col1: t('RightSideSlide.Distance'),
              col2: item?.distance_str
                ? `${(item.distance_str / 1000).toFixed(2)} km`
                : 'None',
            },
            {
              id: `${index + 1}-18`,
              col1: t('RightSideSlide.TripTotalTime'),
              col2: item?.triptime_total || 'None',
            },
            {
              id: `${index + 1}-19`,
              col1: t('RightSideSlide.TripStartTime'),
              col2: item?.triptime_start || 'None',
            },
            {
              id: `${index + 1}-20`,
              col1: t('RightSideSlide.TripEndTime'),
              col2: item?.triptime_end || 'None',
            },
            {
              id: `${index + 1}-21`,
              col1: t('RightSideSlide.Description'),
              col2: item?.summary_str || 'None',
            },
            {
              id: `${index + 1}-22`,
              col1: t('RightSideSlide.TAGS'),
              children: [
                {
                  id: `${index + 1}-22-1`,
                  col1: t('RightSideSlide.Tag'),
                  col2: item?.tags?.[0] || 'None',
                },
              ],
            },
            {
              id: `${index + 1}-23`,
              col1: t('RightSideSlide.FileName'),
              col2: item?.file_name || 'None',
            },
            {
              id: `${index + 1}-24`,
              col1: t('RightSideSlide.PassingPoint'),
              children: item.passingpts?.length
                ? item.passingpts
                    .map((pt, ptIndex) => [
                      {
                        id: `${index + 1}-${ptIndex + 1}-addr`,
                        col1: t('RightSideSlide.Address'),
                        col2: pt.addr || 'None',
                      },
                      {
                        id: `${index + 1}-${ptIndex + 1}-road`,
                        col1: t('RightSideSlide.RoadName'),
                        col2: pt.road || 'None',
                      },
                    ])
                    .flat() // 중첩 배열을 평탄화
                : [
                    {
                      id: `${index + 1}-24-none`,
                      col1: '-',
                      col2: 'None',
                    },
                  ],
            },
          ],
        }))
      : [];

  // 행 확장/축소 토글
  const toggleRow = (id) => {
    setExpandedRows((pre) =>
      pre.includes(id) ? pre.filter((rowId) => rowId !== id) : [...pre, id]
    );
  };

  return (
    <div className="flex">
      {!open && (
        // 패널이 닫혀 있을 때 열기 버튼
        <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-10">
          <button
            className="text-white px-2 py-3 rounded-l-full bg-blue-900 hover:bg-blue_lapis"
            onClick={() => setOpen(true)}
          >
            <FaArrowCircleLeft size={30} />
          </button>
        </div>
      )}
      <Transition
        // 애니메이션 효과
        show={open}
        enter="transform transition ease-in-out duration-500 sm:duration-700"
        enterFrom="translate-x-full"
        enterTo="translate-x-0"
        leave="transform transition ease-in-out duration-500 sm:duration-700"
        leaveFrom="translate-x-0"
        leaveTo="translate-x-full"
      >
        <div className="fixed inset-y-0 top-32 right-0 w-3/12 bg-stone-50 shadow-lg z-30 flex flex-col space-y-4 h-[800px] rounded-tl-lg">
          <div className="bg-blue-900 px-2 py-2 sm:px-3 shadow-xl rounded-tl-lg">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold leading-6 text-white">
                {t('RightSideSlide.LogMetaDataList')}
              </span>
              <div className="ml-3 flex h-7 items-center">
                <button
                  type="button"
                  className="relative rounded-md text-indigo-200 hover:text-white focus:outline-none hover:outline-none"
                  onClick={() => setOpen(false)}
                >
                  <FaXmark className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          {/* 데이터 테이블 */}
          <div className="px-2 overflow-x-auto pb-5 scroll-smooth overflow-scroll ">
            {rows.length > 0 ? (
              <table className="min-w-full border-collapse border border-gray-200">
                <tbody>
                  {rows.map((row, index) => (
                    <Fragment key={index}>
                      <tr>
                        <td className="flex text-center justify-center items-center bg-stone-100">
                          {Array.isArray(row.children) &&
                            row.children.length > 0 && (
                              <button
                                className="focus:outline-none"
                                onClick={() => toggleRow(row.id)}
                              >
                                {expandedRows.includes(row.id) ? (
                                  <CiSquareMinus />
                                ) : (
                                  <CiSquarePlus />
                                )}
                              </button>
                            )}
                        </td>
                        <td
                          className="border border-gray-300 px-2 text-xs font-normal text-gray-900 text-nowrap"
                          colSpan={2}
                        >
                          {row.col1}
                        </td>
                      </tr>
                      {/* 하위 데이터 렌더링 */}
                      {Array.isArray(row.children) &&
                        expandedRows.includes(row.id) &&
                        row.children.map((child) => (
                          <Fragment key={child.id}>
                            <tr>
                              <td className="flex text-center justify-center items-center bg-gray-100">
                                {Array.isArray(child.children) &&
                                  child.children.length > 0 && (
                                    <button
                                      className="focus:outline-none"
                                      onClick={() => toggleRow(child.id)}
                                    >
                                      {expandedRows.includes(child.id) ? (
                                        <CiSquareMinus />
                                      ) : (
                                        <CiSquarePlus />
                                      )}
                                    </button>
                                  )}
                              </td>
                              <td className="border border-gray-300 ps-5 pr-2 text-xs font-normal text-gray-900">
                                {child.col1}
                              </td>
                              <td className="border border-gray-300 ps-5 pr-2 text-xs font-normal text-gray-900">
                                {child.col2}
                              </td>
                            </tr>
                            {Array.isArray(child.children) &&
                              expandedRows.includes(child.id) &&
                              child.children.map((nestedChild) => (
                                <tr key={nestedChild.id}>
                                  <td className="bg-gray-200" />
                                  <td className="border border-gray-300 ps-8 pr-2 text-xs font-normal text-gray-900">
                                    {nestedChild.col1}
                                  </td>
                                  <td className="border border-gray-300 ps-8 pr-2 text-xs font-normal text-gray-900">
                                    {nestedChild.col2}
                                  </td>
                                </tr>
                              ))}
                          </Fragment>
                        ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            ) : (
              // 데이터가 없을 때 메시지 표시
              <div className="text-center py-5">
                <p className="text-gray-500">
                  {t('RightSideSlide.NoDataFound') ||
                    '데이터를 찾을 수 없습니다.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </Transition>
    </div>
  );
}
