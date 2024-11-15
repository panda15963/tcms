import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import { FaAngleDown, FaCheck } from 'react-icons/fa6';
import { useState } from 'react';

// classNames 함수는 여러 클래스를 결합할 때 유용함
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

// SingleSelectDropDown 컴포넌트 정의
export default function SingleSelectDropDown({ options, onChange }) {
  const [selectedField, setSelectedField] = useState(null); // 선택된 항목을 상태로 저장
  const [query, setQuery] = useState(''); // 필터링을 위한 검색어 상태

  /**
   * 선택된 항목이 변경되었을 때 처리하는 함수
   * 선택된 항목을 업데이트하고 부모 컴포넌트에 변경된 값을 전달합니다.
   */
  const handleSelectionChange = (field) => {
    console.log('handleSelectionChange=>', field);
    setSelectedField(field); // 선택된 항목 업데이트
    setQuery(''); // 검색어 초기화
    if (onChange) {
      onChange(field); // 선택된 항목을 부모 컴포넌트에 전달
    }
  };

  /**
   * 옵션을 필터링하는 함수
   * 사용자가 입력한 검색어(query)에 따라 옵션 목록을 필터링합니다.
   */
  const filteredOptions = options.filter(
    (option) =>
      option.name && option.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Combobox
      as={'div'}
      value={selectedField} // 현재 선택된 항목을 설정
      onChange={handleSelectionChange} // 선택된 항목이 변경되면 실행
      className="w-full mb-2" // 컴포넌트 스타일
    >
      <div className="relative mt-2">
        {/* ComboboxInput: 사용자가 선택한 항목을 보여주는 인풋 */}
        <ComboboxInput
          className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue_ncs sm:text-sm sm:leading-6"
          onChange={(event) => {
            console.log('event', event);
            setQuery(event.target.value); // 인풋 값에 따라 검색어 상태 업데이트
          }}
          onBlur={() => {
            setQuery(''); // 포커스가 사라지면 검색어 초기화
          }}
          displayValue={() => (selectedField ? selectedField.name : '')} // 선택된 항목을 보여줌
        />
        {/* 드롭다운 버튼 */}
        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <FaAngleDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </ComboboxButton>
        {/* 필터링된 옵션이 있을 때만 ComboboxOptions 표시 */}
        {filteredOptions.length > 0 && (
          <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {/* 필터링된 옵션 목록 */}
            {filteredOptions.map((field) => (
              <ComboboxOption
                key={field.id} // 각 옵션의 고유 ID로 key 설정
                value={field} // Combobox의 value로 사용할 값
                className={({ active }) =>
                  classNames(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    active ? 'bg-blue-600 text-white' : 'text-gray-900',
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
                          : '',
                      )}
                    >
                      {field.name}
                    </span>
                    {/* 선택된 항목에 체크 아이콘 표시 */}
                    {selectedField && selectedField.id === field.id && (
                      <span
                        className={classNames(
                          'absolute inset-y-0 right-0 flex items-center pr-4',
                          active ? 'text-white' : 'text-blue-600',
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
