import { useEffect, useState } from 'react';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react';
import { FaAngleDown, FaCheck } from 'react-icons/fa6';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const menuItems = (t) => [
  { id: 1, name: t('StatNavBar.TECT'), link: '#' },
  { id: 2, name: t('StatNavBar.TECV'), link: '#' },
  { id: 3, name: t('StatNavBar.TUCF'), link: '#' },
  { id: 4, name: t('StatNavBar.TUSRT'), link: '#' },
  { id: 5, name: t('StatNavBar.RTTUI'), link: '#' },
  { id: 6, name: t('StatNavBar.CTL'), link: '#' },
  { id: 7, name: t('StatNavBar.TCIC'), link: '#' },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function StatGraphsLists() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const path = location.pathname.split('/').pop().toUpperCase();
    const initialSelected =
      menuItems(t).find((api) => api.name === path) || menuItems(t)[0];
    setSelected(initialSelected);
  }, [location.pathname, t]);

  const handleOnSelectMap = (selectedMap) => {
    setSelected(selectedMap);
  };

  useEffect(() => {
    if (selected) {
      // Perform actions with the selected map API if needed
    }
  }, [selected, navigate]);

  if (!selected) return null;

  return (
    <Listbox value={selected} onChange={handleOnSelectMap}>
      {({ open }) => (
        <>
          <div className="relative min-w-32">
            <ListboxButton className="relative w-64 cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
              <span className="block truncate font-bold">{selected.name}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <FaAngleDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </ListboxButton>

            <Transition
              show={open}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ListboxOptions className="absolute z-50 mt-1 w-64 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {menuItems(t).map((mapAPI) => (
                  <ListboxOption
                    key={mapAPI.id}
                    className={({ selected, active }) =>
                      classNames(
                        selected ? 'bg-indigo-600 text-white' : 'font-bold text-gray-900',
                        active && !selected ? 'bg-gray-100' : '',
                        'relative cursor-default select-none py-2 pl-8 pr-4'
                      )
                    }
                    value={mapAPI}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={classNames(
                            selected ? 'font-bold text-white' : 'font-bold',
                            'block truncate'
                          )}
                        >
                          {mapAPI.name}
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-white">
                            <FaCheck className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
}
