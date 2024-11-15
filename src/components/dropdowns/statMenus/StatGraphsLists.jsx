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
import { menuItems } from './StatMenuItems';
import { useSelectedItem } from '../../../context/SelectedItemContext';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function StatGraphsLists() {
  const { t } = useTranslation();
  const { setSelectedItem } = useSelectedItem();
  const navigate = useNavigate();
  const location = useLocation();
  const items = menuItems(t);

  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const currentSelected = items.find((item) => `/main/dashboard${item.link}` === location.pathname);

    if (currentSelected) {
      if (selected?.id !== currentSelected.id) {
        setSelected(currentSelected);
        setSelectedItem(currentSelected); // Sync global state as well
      }
    } else if (items[0]) {
      setSelected(items[0]);
      setSelectedItem(items[0]);
      navigate(`/main/dashboard${items[0].link}`);
    }
  }, [location.pathname, items, selected, setSelectedItem, navigate]);

  const handleOnSelectMap = (selectedMap) => {
    setSelected(selectedMap);
    setSelectedItem(selectedMap);
    navigate(`/main/dashboard${selectedMap.link}`);
  };

  return (
    <Listbox value={selected} onChange={handleOnSelectMap}>
      {({ open }) => (
        <>
          <div className="relative min-w-32">
            <ListboxButton className="relative w-64 cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
              <span className="block truncate">
                {selected ? selected.name : ''}
              </span>
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
                {items.map((mapAPI) => (
                  <ListboxOption
                    key={mapAPI.id}
                    className={({ selected, active }) =>
                      classNames(
                        selected ? 'bg-indigo-600 text-white' : 'text-gray-900',
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
                            selected ? 'font-bold text-white' : '',
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
