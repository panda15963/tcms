import axios from 'axios';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { MdClose } from 'react-icons/md';
import {
  FaRegFolderOpen,
  FaCloudDownloadAlt,
  FaCheck,
  FaSearch,
} from 'react-icons/fa';
import MultipleSelectDropDown from '../dropdowns/MultipleSelecDropDown';
import MainGrid from '../tables/MainGrid';
import { axiosInstance, nonAuthInstance } from '../../server/AxiosConfig';

const fields = [
  { id: 'description', name: 'Find description' },
  { id: 'regions', name: 'Regions' },
  { id: 'countries', name: 'Countries' },
  { id: 'priorities', name: 'Priorities' },
  { id: 'features', name: 'Features' },
  { id: 'targets', name: 'Targets' },
  { id: 'virtualities', name: 'Virtualities ' },
  { id: 'formats', name: 'Formats' },
  { id: 'tags', name: 'Tags' },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const LogModal = forwardRef((_props, ref) => {
  const [open, setOpen] = useState(false);
  const [selectedSearchFields, setSelectedSearchFields] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const axiosData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await nonAuthInstance.get('/auth/test');
      console.log('Response:', response);
      setData(response.data);
    } catch (e) {
      console.error('Error:', e.response ? e.response : e.message);
      setError(e.response ? e.response.data : e.message);
    }
  };

  useImperativeHandle(ref, () => ({
    show() {
      setOpen(true);
    },
  }));

  return (
    <Transition show={open}>
      <Dialog className="relative z-50" onClose={() => setOpen(false)}>
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
              <DialogPanel className="relative rounded-lg transform overflow-hidden shadow-xl bg-white text-left transition-all sm:w-full sm:my-8 sm:max-w-screen-xl sm:p-0">
                <div className="flex justify-between py-3 px-5 bg-blue_ncs">
                  <h1 className="font-semibold text-white">로그 검색</h1>
                  <button
                    className="font-semibold"
                    onClick={() => setOpen(false)}
                  >
                    <MdClose className="text-white" size={16} />
                  </button>
                </div>
                <div className="p-5">
                  <div
                    id="search_fieds"
                    className="flex items-center justify-start z-20"
                  >
                    <span className="w-1/5 text-md font-semibold text-slate-700 text-center">
                      Search Fields
                    </span>
                    <MultipleSelectDropDown
                      formFieldName={'Search fields'}
                      options={fields}
                      onChange={(options) => {
                        console.log('SELECTED OPTIONS ', options);
                        setSelectedSearchFields(options);
                      }}
                    />
                  </div>
                  {/* Dyanmic Search fields*/}
                  <div className="flex flex-wrap mb-4 mt-4">
                    {selectedSearchFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex w-full sm:w-1/2 items-center mt-2"
                      >
                        <label className="w-1/4 text-sm font-semibold text-slate-700 px-2">
                          {field.name}
                        </label>
                        <input
                          type="text"
                          id={field.id}
                          className={classNames(
                            'w-3/4 rounded-md border-0 py-1.5 px-2 text-gray-900 shadow ring-1 ring-inset ring-gray-400 placeholder:text-gray-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 sm:text-sm sm:leading-6',
                          )}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <button
                      className="inline-flex items-center border-2 gap-x-2 px-3 py-2 font-semibold text-sm border-slate-300 rounded-md  focus:ring-1 focus:border-sky-500 hover:border-sky-500 cursor-pointer"
                      onClick={axiosData}
                    >
                      <FaSearch
                        className="-ml-0.5 h-5 w-5 text-sky-500  cursor-pointer"
                        aria-hidden="true"
                      />
                      <label className="text-base text-sky-500 font-bold cursor-pointer">
                        Find
                      </label>
                    </button>
                  </div>
                  {loading && <p>Loading...</p>}
                  {error && <p className="text-red-500">{error}</p>}
                  {data && (
                    <div>
                      <h2 className="text-xl font-semibold mt-4">
                        Fetched Data:
                      </h2>
                      <pre className="bg-gray-100 p-4 rounded-md">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </div>
                  )}
                  <MainGrid />
                  <div
                    id="download_container"
                    className="grid grid-cols-[20%_1fr_15%] items-center"
                  >
                    <span className="text-md font-semibold text-slate-700 text-center">
                      Download directory
                    </span>
                    <input
                      type="text"
                      name="download_dir"
                      className="w-full px-3 py-2 bg-white border shadow-sm border-slate-400 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                    />
                    <div className="flex w-full justify-end">
                      <button className="font-semibold border-slate-300 border rounded-md px-3 py-2 ms-2 focus:ring-1 focus:border-sky-500 hover:border-sky-500">
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
                  <div className="flex justify-end mt-3">
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
