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

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function MultipleSelectDropDown({ options, onChange }) {
  const [selectedFields, setSelectedFields] = useState([]);
  const [query, setQuery] = useState('');

  const isSelectAllEnabled = selectedFields.length < options.length;
  const isClearSelectionEnabled = selectedFields.length > 0;

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
          <FaAngleDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </ComboboxButton>
        {filteredOptions.length > 0 && (
          <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
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
                disabled={!isClearSelectionEnabled}
                onClick={handleOnClearOptions}
              >
                <FaRegCircleXmark
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
                {({ focus }) => (
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
