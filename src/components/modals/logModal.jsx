import { forwardRef, useImperativeHandle, useState } from 'react';
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
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { MdClose } from 'react-icons/md';
import { FaRegFolderOpen, FaCloudDownloadAlt, FaCheck } from 'react-icons/fa';
import MultipleSelectDropDown from '../dropdowns/MultipleSelecDropDown';

const fields = [
  {
    id: 'description',
    name: 'Find description',
  },
  { id: 'regions', name: 'Regions' },
  { id: 'countrys', name: 'Countrys' },
  { id: 'prioritys', name: 'Prioritys' },
  { id: 'features', name: 'Features' },
  { id: 'targets', name: 'Targets' },
  { id: 'virtuals', name: 'Virtuals' },
  {
    id: 'formats',
    name: 'Formats',
  },
  { id: 'tags', name: 'Tags' },
];

const LogModal = forwardRef((props, ref) => {
  const [open, setOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    show() {
      console.log('Called show func inside modal');
      setOpen(true);
    },
  }));

  return (
    <Transition show={open}>
      <Dialog className="relative z-10" onClose={() => setOpen(false)}>
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 transition-opacity text-center sm:items-center sm:p-0">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel className="relative rounded-lg transform overflow-hidden shadow-xl bg-white  text-left transition-all sm:w-full sm:my-8 sm:max-w-screen-xl sm:p-0">
                <div className="flex justify-between py-3 px-5 bg-blue_ncs">
                  <h1 className="font-semibold text-white">로그 검색</h1>
                  <button
                    className="font-semibold"
                    onClick={() => setOpen(false)}
                  >
                    <MdClose className="text-white" size={16} />
                  </button>
                </div>
                <div className="w-full border-t border-gray-200" />
                <div className="p-5">
                  <div
                    id="search_fieds"
                    className="flex items-center justify-start z-20"
                  >
                    <span className="w-1/5 text-sm font-semibold text-slate-700">
                      Search Fields
                    </span>
                    <MultipleSelectDropDown
                      formFieldName={'Search fields'}
                      options={fields}
                      onChange={(options) => {
                        console.log('SELECTED OPTIONS ', options);
                      }}
                    />
                    {/* <Combobox
                      as={'div'}
                      value={selectedFields}
                      onChange={handleSelectionChange}
                      className="w-2/5 px-2 mb-2"
                    >
                      <div className="relative mt-2">
                        <ComboboxInput
                          className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          onChange={(event) => setQuery(event.target.value)}
                          onBlur={() => setQuery('')}
                          displayValue={(fields) =>
                            fields && fields.map((f) => f.name).join(', ')
                          }
                        />
                        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                          <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </ComboboxButton>
                        {filteredFields.length > 0 && (
                          <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {filteredFields.map((field) => (
                              <ComboboxOption
                                key={field.id}
                                value={field}
                                className={({ focus }) =>
                                  classNames(
                                    'relative cursor-default select-none py-2 pl-3 pr-9',
                                    focus
                                      ? 'bg-indigo-600 text-white'
                                      : 'text-gray-900',
                                  )
                                }
                              >
                                {({ focus, selected }) => (
                                  <>
                                    <span
                                      className={classNames(
                                        'block truncate',
                                        selected && 'font-semibold',
                                      )}
                                    >
                                      {field.name}
                                    </span>

                                    {selected && (
                                      <span
                                        className={classNames(
                                          'absolute inset-y-0 right-0 flex items-center pr-4',
                                          focus
                                            ? 'text-white'
                                            : 'text-indigo-600',
                                        )}
                                      >
                                        <CheckIcon
                                          className="h-5 w-5"
                                          aria-hidden="true"
                                        />
                                      </span>
                                    )}
                                  </>
                                )}
                              </ComboboxOption>
                            ))}
                          </ComboboxOptions>
                        )}
                      </div>
                    </Combobox> */}
                  </div>
                  <div
                    id="download_container"
                    className="grid grid-cols-[20%_1fr_15%] items-center gap-2"
                  >
                    <span class=" text-sm font-semibold text-slate-700">
                      Download directory
                    </span>
                    <input
                      type="text"
                      name="download_dir"
                      class="w-full mx-2 px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                    />
                    <div className="flex w-full">
                      <button className="font-semibold border-slate-300 border  rounded-md px-3 py-2 ms-2 focus:ring-1 focus:border-sky-500 hover:border-sky-500">
                        <FaRegFolderOpen
                          className="-ml-0.5 h-5 w-5 text-slate-700"
                          aria-hidden="true"
                        />
                      </button>
                      <button className="inline-flex items-center gap-x-1.5 font-semibold text-sm border-slate-300 border rounded-md px-3 ms-2 focus:ring-1 focus:border-sky-500 hover:border-sky-500">
                        <FaCloudDownloadAlt
                          className="-ml-0.5 h-5 w-5 text-slate-700"
                          aria-hidden="true"
                        />
                        Download
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end px-2 mt-3">
                    <button className="inline-flex items-center gap-x-1.5 font-semibold text-sm border-slate-300 border rounded-md py-2 px-3 ms-2 focus:ring-1 focus:border-sky-500 hover:border-sky-500">
                      <FaCheck
                        className="-ml-0.5 h-5 w-5 text-slate-700"
                        aria-hidden="true"
                      />
                      OK
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});

export default LogModal;
