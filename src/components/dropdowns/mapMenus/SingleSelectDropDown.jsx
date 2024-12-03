import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import { FaAngleDown, FaCheck } from 'react-icons/fa6';
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
 * SingleSelectDropDown 컴포넌트
 * - 하나의 항목만 선택 가능한 드롭다운
 * - 검색 기능 포함
 * @param {object} props - 컴포넌트에 전달되는 속성
 * @param {Array} props.options - 드롭다운에서 선택 가능한 옵션 목록
 * @param {function} props.onChange - 선택된 항목이 변경될 때 호출되는 콜백 함수
 */
export default function SingleSelectDropDown({ options, onChange }) {
  const [selectedField, setSelectedField] = useState(null); // 선택된 항목 상태
  const [query, setQuery] = useState(''); // 검색어 상태

  /**
   * 선택된 항목이 변경되었을 때 처리
   * @param {object} field - 새로 선택된 항목
   */
  const handleSelectionChange = (field) => {
    setSelectedField(field); // 선택된 항목 상태 업데이트
    setQuery(''); // 검색어 초기화
    if (onChange) {
      onChange(field); // 선택된 항목을 부모 컴포넌트에 전달
    }
  };

  /**
   * 검색어를 기반으로 옵션 필터링
   * @returns {Array} 검색어에 맞는 필터링된 옵션
   */
  const filteredOptions = options.filter(
    (option) =>
      option.name && option.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Combobox
      as="div"
      value={selectedField} // 현재 선택된 항목 설정
      onChange={handleSelectionChange} // 선택된 항목 변경 시 실행
      className="w-full mb-2"
    >
      <div className="relative mt-2">
        {/* ComboboxInput: 선택된 항목과 검색어 입력을 표시 */}
        <ComboboxInput
          className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue_ncs sm:text-sm sm:leading-6"
          onChange={(event) => setQuery(event.target.value)} // 검색어 상태 업데이트
          onBlur={() => setQuery('')} // 포커스 해제 시 검색어 초기화
          displayValue={() => (selectedField ? selectedField.name : '')} // 선택된 항목 표시
        />
        {/* 드롭다운 버튼 */}
        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <FaAngleDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </ComboboxButton>
        {/* 필터링된 옵션이 있을 때만 옵션 목록 표시 */}
        {filteredOptions.length > 0 && (
          <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {/* 필터링된 옵션 목록 */}
            {filteredOptions.map((field) => (
              <ComboboxOption
                key={field.id} // 각 옵션의 고유 ID
                value={field} // Combobox의 value로 사용할 값
                className={({ active }) =>
                  classNames(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    active ? 'bg-blue-600 text-white' : 'text-gray-900'
                  )
                }
              >
                {({ active }) => (
                  <>
                    {/* 항목 이름 */}
                    <span
                      className={classNames(
                        'block truncate',
                        selectedField && selectedField.id === field.id
                          ? 'font-bold'
                          : ''
                      )}
                    >
                      {field.name}
                    </span>
                    {/* 선택된 항목 체크 표시 */}
                    {selectedField && selectedField.id === field.id && (
                      <span
                        className={classNames(
                          'absolute inset-y-0 right-0 flex items-center pr-4',
                          active ? 'text-white' : 'text-blue-600'
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