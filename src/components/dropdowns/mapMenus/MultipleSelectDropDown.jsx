import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import {
  FaAngleDown,
  FaCheck,
  FaRegCircleCheck,
  FaRegCircleXmark,
} from 'react-icons/fa6';
import { useState } from 'react';

/**
 * 여러 클래스를 결합하여 반환하는 함수
 * @param {...string} classes - 조건에 따라 적용할 클래스들
 * @returns {string} 결합된 클래스 문자열
 */
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * MultipleSelectDropDown 컴포넌트
 * - 여러 항목을 선택할 수 있는 드롭다운
 * - 검색 기능과 선택 모두 초기화 기능 제공
 * @param {object} props - 컴포넌트에 전달되는 속성
 * @param {Array} props.options - 드롭다운에서 선택 가능한 옵션 목록
 * @param {function} props.onChange - 선택된 항목이 변경될 때 호출되는 콜백 함수
 */
export default function MultipleSelectDropDown({ options, onChange }) {
  const [selectedFields, setSelectedFields] = useState([]); // 선택된 항목 상태
  const [query, setQuery] = useState(''); // 검색어 상태

  /**
   * 모든 항목이 선택되었는지 확인
   * @returns {boolean} 선택 가능한 모든 항목이 선택되었는지 여부
   */
  const isSelectAllEnabled = selectedFields.length < (options || []).length;

  /**
   * 선택된 항목이 존재하는지 확인
   * @returns {boolean} 선택된 항목이 하나 이상인지 여부
   */
  const isClearSelectionEnabled = selectedFields.length > 0;

  /**
   * 선택된 항목이 변경되었을 때 처리
   * @param {Array} fields - 새로 선택된 항목
   */
  const handleSelectionChange = (fields) => {
    setSelectedFields(fields); // 선택된 항목 상태 업데이트
    setQuery(''); // 검색어 초기화
    if (onChange) {
      onChange(fields); // 선택된 항목을 부모 컴포넌트에 전달
    }
  };

  /**
   * 모든 항목 선택 처리
   */
  const handleSelectAllClick = () => {
    setSelectedFields(options); // 모든 옵션을 선택된 항목으로 설정
    if (onChange) {
      onChange(options); // 선택된 항목을 부모 컴포넌트에 전달
    }
  };

  /**
   * 선택된 항목 초기화 처리
   */
  const handleOnClearOptions = () => {
    setSelectedFields([]); // 선택된 항목 초기화
    if (onChange) {
      onChange([]); // 초기화된 선택 항목을 부모 컴포넌트에 전달
    }
  };

  /**
   * 검색어를 기반으로 옵션 필터링
   * @returns {Array} 검색어에 맞는 필터링된 옵션
   */
  const filteredOptions = (options || []).filter(
    (option) =>
      option.name && option.name.toLowerCase().includes(query.toLowerCase())
  );

  /**
   * 선택된 항목들의 이름을 문자열로 반환
   * @returns {string} 선택된 항목 이름들
   */
  const selectedFieldsString = selectedFields.map((f) => f.name).join(', ');

  /**
   * 항목이 선택되었는지 확인
   * @param {object} field - 확인할 항목
   * @returns {boolean} 항목이 선택되었는지 여부
   */
  const isSelectedField = (field) =>
    selectedFields.some((f) => f.id === field.id);

  return (
    <Combobox
      multiple
      as="div"
      value={selectedFields}
      onChange={handleSelectionChange}
      className="w-full mb-0"
    >
      <div className="relative mt-0">
        {/* 선택된 항목과 검색어 입력을 표시하는 ComboboxInput */}
        <ComboboxInput
          disabled
          className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue_ncs sm:text-sm sm:leading-6"
          displayValue={() => selectedFieldsString}
        />
        {/* 드롭다운 버튼 */}
        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <FaAngleDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </ComboboxButton>

        {/* 필터링된 옵션이 있을 경우에만 옵션 목록 표시 */}
        {filteredOptions.length > 0 && (
          <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {/* 'Select all'과 'Clear selection' 버튼 */}
            <div className="flex w-full justify-between pb-3 px-3 pt-1">
              <button
                className="inline-flex items-center gap-1 rounded-lg shadow bg-slate-100 px-2 py-1 text-blue-600 disabled:opacity-50 hover:text-blue-700 hover:font-semibold disabled:font-normal disabled:cursor-not-allowed"
                onClick={handleSelectAllClick}
                disabled={!isSelectAllEnabled}
              >
                <FaRegCircleCheck
                  className="-ml-0.5 h-5 w-5 text-slate-700"
                  aria-hidden="true"
                />
                Select all
              </button>
              <button
                className="inline-flex items-center gap-1 rounded-lg shadow bg-slate-100 px-2 py-1 text-blue-600 disabled:opacity-50 hover:text-blue-700 hover:font-semibold disabled:font-normal disabled:cursor-not-allowed"
                onClick={handleOnClearOptions}
                disabled={!isClearSelectionEnabled}
              >
                <FaRegCircleXmark
                  className="-ml-0.5 h-5 w-5 text-slate-700"
                  aria-hidden="true"
                />
                Clear selection
              </button>
            </div>
            {/* 옵션 목록 */}
            {filteredOptions.map((field) => (
              <ComboboxOption
                key={field.id}
                value={field}
                className={({ focus }) =>
                  classNames(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    focus
                      ? 'bg-blue_moonstone text-white'
                      : isSelectedField(field)
                      ? 'bg-slate-100'
                      : 'text-gray-900'
                  )
                }
              >
                {({ focus }) => (
                  <>
                    {/* 항목 이름 */}
                    <span
                      className={classNames(
                        'block truncate',
                        isSelectedField(field) && 'font-bold'
                      )}
                    >
                      {field.name}
                    </span>
                    {/* 선택된 항목 체크 표시 */}
                    {isSelectedField(field) && (
                      <span
                        className={classNames(
                          'absolute inset-y-0 right-0 flex items-center pr-4',
                          focus ? 'text-white' : 'text-indigo-600'
                        )}
                      >
                        <FaCheck className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        )}
      </div>
    </Combobox>
  );
}