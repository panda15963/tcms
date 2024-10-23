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

// classNames 함수는 여러 클래스를 결합할 때 유용함
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

// MultipleSelectDropDown 컴포넌트 정의
export default function MultipleSelectDropDown({ options, onChange }) {
  const [selectedFields, setSelectedFields] = useState([]); // 선택된 항목을 상태로 저장
  const [query, setQuery] = useState(''); // 필터링을 위한 검색어 상태

  /**
   * 모든 항목이 선택되었는지 확인하는 상태
   * 선택된 항목의 수가 옵션의 수보다 적으면 'Select all'이 활성화됩니다.
   */
  const isSelectAllEnabled = selectedFields.length < (options || []).length;

  /**
   * 선택된 항목이 존재하는지 확인하는 상태
   * 선택된 항목이 하나라도 있으면 'Clear selection' 버튼이 활성화됩니다.
   */
  const isClearSelectionEnabled = selectedFields.length > 0;

  /**
   * 선택된 항목이 변경되었을 때 처리하는 함수
   * 선택된 항목을 업데이트하고 부모 컴포넌트에 변경된 값을 전달합니다.
   */
  const handleSelectionChange = (fields) => {
    console.log('handleSelectionChange=>', fields);
    setSelectedFields(fields); // 선택된 항목 업데이트
    setQuery(''); // 검색어 초기화
    if (onChange) {
      onChange(fields); // 선택된 항목을 부모 컴포넌트에 전달
    }
  };

  /**
   * 모든 항목을 선택하는 함수
   * 'Select all' 버튼이 클릭되면 모든 옵션이 선택됩니다.
   */
  const handleSelectAllClick = () => {
    setSelectedFields(options); // 모든 옵션을 선택된 항목으로 설정
    if (onChange) {
      onChange(options); // 선택된 항목을 부모 컴포넌트에 전달
    }
  };

  /**
   * 선택된 항목을 모두 지우는 함수
   * 'Clear selection' 버튼이 클릭되면 선택된 항목이 모두 해제됩니다.
   */
  const handleOnClearOptions = () => {
    setSelectedFields([]); // 선택된 항목 초기화
    if (onChange) {
      onChange([]); // 초기화된 선택 항목을 부모 컴포넌트에 전달
    }
  };

  /**
   * 옵션을 필터링하는 함수
   * 사용자가 입력한 검색어(query)에 따라 옵션 목록을 필터링합니다.
   */
  const filteredOptions = (options || []).filter(
    (option) =>
      option.name && option.name.toLowerCase().includes(query.toLowerCase()),
  );

  /**
   * 선택된 항목의 이름을 문자열로 결합
   * 선택된 항목들의 이름을 쉼표로 구분하여 하나의 문자열로 반환합니다.
   */
  const selectedFieldsString = selectedFields.map((f) => f.name).join(', ');

  /**
   * 특정 항목이 선택되었는지 확인하는 함수
   * 주어진 항목이 현재 선택된 항목들 중에 포함되어 있는지 확인합니다.
   */
  const isSelectedField = (field) =>
    selectedFields.some((f) => f.id === field.id);

  return (
    <Combobox
      multiple // 여러 항목을 선택할 수 있도록 설정
      as={'div'}
      value={selectedFields} // 현재 선택된 항목을 설정
      onChange={handleSelectionChange} // 선택된 항목이 변경되면 실행
      className="w-full mb-0" // 컴포넌트 스타일
    >
      <div className="relative mt-2">
        {/* ComboboxInput: 사용자가 선택한 항목을 보여주는 인풋 */}
        <ComboboxInput
          disabled={true} // 인풋은 읽기 전용
          className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue_ncs sm:text-sm sm:leading-6"
          onChange={(event) => {
            console.log('event', event);
            setQuery(event.target.value); // 인풋 값에 따라 검색어 상태 업데이트
          }}
          onBlur={() => {
            setQuery(''); // 포커스가 사라지면 검색어 초기화
          }}
          displayValue={() => selectedFieldsString} // 선택된 항목을 보여줌
        />
        {/* 드롭다운 버튼 */}
        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <FaAngleDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </ComboboxButton>
        {/* 필터링된 옵션이 있을 때만 ComboboxOptions 표시 */}
        {filteredOptions.length > 0 && (
          <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {/* 'Select all'과 'Clear selection' 버튼 */}
            <div className="flex w-full justify-between pb-3 px-3 pt-1">
              <button
                className="inline-flex items-center gap-1 rounded-lg shadow bg-slate-100 px-2 py-1 text-blue-600 disabled:opacity-50 hover:text-blue-700 hover:font-semibold disabled:font-normal disabled:cursor-not-allowed"
                onClick={handleSelectAllClick} // 'Select all' 클릭 시 모든 옵션 선택
                disabled={!isSelectAllEnabled} // 모든 항목이 이미 선택된 경우 비활성화
              >
                <FaRegCircleCheck
                  className="-ml-0.5 h-5 w-5 text-slate-700"
                  aria-hidden="true"
                />
                Select all
              </button>
              <button
                className="inline-flex items-center gap-1 rounded-lg shadow bg-slate-100 px-2 py-1 text-blue-600 disabled:opacity-50 hover:text-blue-700 hover:font-semibold disabled:font-normal disabled:cursor-not-allowed"
                disabled={!isClearSelectionEnabled} // 선택된 항목이 없으면 비활성화
                onClick={handleOnClearOptions} // 'Clear selection' 클릭 시 선택된 항목 초기화
              >
                <FaRegCircleXmark
                  className="-ml-0.5 h-5 w-5 text-slate-700"
                  aria-hidden="true"
                />
                Clear selection
              </button>
            </div>
            {/* 필터링된 옵션 목록 */}
            {filteredOptions.map((field) => (
              <ComboboxOption
                key={field.id} // 각 옵션의 고유 ID로 key 설정
                value={field} // Combobox의 value로 사용할 값
                onChange={(event) => setQuery(event.target.value)} // 선택 시 검색어 설정
                className={({ focus }) =>
                  classNames(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    focus // 포커스된 항목과 선택된 항목에 따라 스타일 적용
                      ? 'bg-blue_moonstone text-white'
                      : isSelectedField(field)
                        ? 'bg-slate-100'
                        : 'text-gray-900',
                  )
                }
              >
                {({ focus }) => (
                  <>
                    {/* 항목 이름 */}
                    <span
                      className={classNames(
                        'block truncate ',
                        isSelectedField(field) && 'font-bold ',
                      )}
                    >
                      {field.name}
                    </span>
                    {/* 선택된 항목에 체크 아이콘 표시 */}
                    {isSelectedField(field) && (
                      <span
                        className={classNames(
                          'absolute inset-y-0 right-0 flex items-center pr-4',
                          focus ? 'text-white' : 'text-indigo-600',
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
