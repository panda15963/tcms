import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogPanel,
  Label,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { MdOutlineClear } from 'react-icons/md';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useEffect, useRef, useState } from 'react';
import {
  IoCheckmarkDoneCircleOutline,
  IoCloseCircleOutline,
} from 'react-icons/io5';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function MultipleSelectDropDown({
  formFieldName,
  options,
  onChange,
}) {
  const [selectedFields, setSelectedFields] = useState([]);
  const [query, setQuery] = useState('');

  const isSelectAllEnabled = selectedFields.length < options.length;
  const isClearSelectionEnabled = selectedFields.length > 0;

  useEffect(() => {
    // console.log('selectedFields => ', selectedFields);
  }, [selectedFields]);

  const handleSelectionChange = (fields) => {
    console.log('handleSelectionChange=>', fields);
    setSelectedFields(fields);
    setQuery('');
    if (onChange) {
      onChange(fields);
    }
  };

  const handleSelectAllClick = () => {
    setSelectedFields(options);
    if (onChange) {
      onChange(options);
    }
  };

  const handleOnClearOptions = () => {
    setSelectedFields([]);
    if (onChange) {
      onChange([]);
    }
  };

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(query.toLowerCase()),
  );

  const selectedFieldsString = selectedFields.map((f) => f.name).join(', ');

  const isSelectedField = (field) =>
    selectedFields.some((f) => f.id === field.id);

  return (
    <Combobox
      multiple
      as={'div'}
      value={selectedFields}
      onChange={handleSelectionChange}
      className="w-2/5 mb-2"
    >
      <div className="relative mt-2">
        <ComboboxInput
          disabled={true}
          className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue_ncs sm:text-sm sm:leading-6"
          onChange={(event) => {
            console.log('event', event);
            setQuery(event.target.value);
          }}
          onBlur={() => {
            setQuery('');
          }}
          displayValue={() => selectedFieldsString}
        />
        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </ComboboxButton>
        {filteredOptions.length > 0 && (
          <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            <div className="flex w-full justify-between pb-3 px-3 pt-1">
              <button
                className="inline-flex items-center gap-1 rounded-lg shadow bg-slate-100 px-2 py-1 text-blue-600 disabled:opacity-50 hover:text-blue-700 hover:font-semibold disabled:font-normal disabled:cursor-not-allowed"
                onClick={handleSelectAllClick}
                disabled={!isSelectAllEnabled}
              >
                <IoCheckmarkDoneCircleOutline
                  className="-ml-0.5 h-5 w-5 text-slate-700"
                  aria-hidden="true"
                />
                Select all
              </button>
              <button
                className="inline-flex items-center gap-1 rounded-lg shadow bg-slate-100 px-2 py-1 text-blue-600 disabled:opacity-50 hover:text-blue-700 hover:font-semibold disabled:font-normal disabled:cursor-not-allowed"
                disabled={!isClearSelectionEnabled}
                onClick={handleOnClearOptions}
              >
                <IoCloseCircleOutline
                  className="-ml-0.5 h-5 w-5 text-slate-700"
                  aria-hidden="true"
                />
                Clear selection
              </button>
            </div>
            {filteredOptions.map((field) => (
              <ComboboxOption
                key={field.id}
                value={field}
                onChange={(event) => setQuery(event.target.value)}
                className={({ focus }) =>
                  classNames(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    focus
                      ? 'bg-blue_moonstone text-white'
                      : isSelectedField(field)
                        ? 'bg-slate-100'
                        : 'text-gray-900',
                  )
                }
              >
                {({ focus, selected }) => (
                  <>
                    <span
                      className={classNames(
                        'block truncate ',
                        isSelectedField(field) && 'font-bold ',
                      )}
                    >
                      {field.name}
                    </span>
                    {isSelectedField(field) && (
                      <span
                        className={classNames(
                          'absolute inset-y-0 right-0 flex items-center pr-4',
                          focus ? 'text-white' : 'text-indigo-600',
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
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

  //   const [selectedOptions, setSelectedOptions] = useState([]);
  //   const optionsListRef = useRef();
  //   const isSelectAllEnabled = selectedOptions.length < options.length;
  //   const isClearSelectionEnabled = selectedOptions.length > 0;
  //   const handleChange = (e) => {
  //     const isChecked = e.target.checked;
  //     const option = e.target.value;
  //     const selectedOptionSet = new Set(selectedOptions);
  //     if (isChecked) {
  //       selectedOptionSet.add(option);
  //     } else {
  //       selectedOptionSet.delete(option);
  //     }
  //     const newSelectedOptions = Array.from(selectedOptionSet);
  //     setSelectedOptions(newSelectedOptions);
  //     onChange(newSelectedOptions);
  //   };
  //   const handleSelectAllClick = (e) => {
  //     e.preventDefault();
  //     const optionsInputs = optionsListRef.current.querySelectorAll('input');
  //     optionsInputs.forEach((input) => {
  //       input.checked = true;
  //     });
  //     setSelectedOptions([...options]);
  //     onChange([...options]);
  //   };
  //   const handleClearSelectionClick = (e) => {
  //     e.preventDefault();
  //     const optionsInputs = optionsListRef.current.querySelectorAll('input');
  //     optionsInputs.forEach((input) => {
  //       input.checked = false;
  //     });
  //     setSelectedOptions([]);
  //     onChange([]);
  //   };
  //   return (
  //     <label className="relative">
  //       <input type="checkbox" className="hidden peer" />
  //       {'Show the dropdown'}
  //       <div className="absolute bg-white border transition-opacity opacity-0 pointer-events-none peer-checked:opacity-100 peer-checked:pointer-events-auto">
  //         <ul ref={optionsListRef}>
  //           <li>
  //             <button
  //               onClick={handleSelectAllClick}
  //               disabled={!isSelectAllEnabled}
  //               className="w-full text-left px-2 py-1 text-blue-600 disabled:opacity-50"
  //             >
  //               {'Select All'}
  //             </button>
  //           </li>
  //           <li>
  //             <button
  //               onClick={handleClearSelectionClick}
  //               disabled={!isClearSelectionEnabled}
  //               className="w-full text-left px-2 py-1 text-blue-600 disabled:opacity-50"
  //             >
  //               {'Clear selection'}
  //             </button>
  //           </li>
  //           {options.map((option, i) => {
  //             return (
  //               <li key={option.id}>
  //                 <label className="flex whitespace-nowrap cursor-pointer px-2 py-1 transition-colors hover:bg-blue-100 [&:has(input:checked)]:bg-blue-200">
  //                   <input
  //                     type="checkbox"
  //                     name={formFieldName}
  //                     value={option}
  //                     className="cursor-pointer"
  //                     onChange={handleChange}
  //                   />
  //                   <span className="ml-1">{option.name}</span>
  //                 </label>
  //               </li>
  //             );
  //           })}
  //         </ul>
  //       </div>
  //     </label>
  //   );
}
