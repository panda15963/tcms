import { useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { FaXmark } from 'react-icons/fa6';
import { FaArrowCircleRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { menuItems } from '../dropdowns/statMenus/StatMenuItems';
import { useSelectedItem } from '../../context/SelectedItemContext';

export default function StatSideBar() {
  const { t } = useTranslation();
  const { selectedItem, setSelectedItem } = useSelectedItem();
  const items = menuItems(t);
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const currentItem = items.find(
      (item) => `/main/dashboard${item.link}` === location.pathname
    );
    if (currentItem && currentItem.id !== selectedItem?.id) {
      setSelectedItem(currentItem);
    } else if (!currentItem) {
      navigate(`/main/dashboard${items[0].link}`);
      setSelectedItem(items[0]);
    }
  }, [location.pathname, items, selectedItem, navigate, setSelectedItem]);

  const togglePanel = () => {
    setOpen(!open);
  };

  const handleItemClick = (id, link) => {
    const item = items.find((i) => i.id === id);
    setSelectedItem(item);
    navigate(`/main/dashboard${link}`);
    setOpen(false); // Close the sidebar when an item is selected
  };

  return (
    <div className="flex">
      {!open && (
        <div className="fixed left-0 top-1/2 transform -translate-y-1/2 z-10">
          <button
            className="text-white px-2 py-3 rounded-r-full bg-blue-900 hover:bg-blue-700"
            onClick={togglePanel}
          >
            <FaArrowCircleRight size={30} />
          </button>
        </div>
      )}

      <Transition
        show={open}
        enter="transform transition ease-in-out duration-500 sm:duration-700"
        enterFrom="-translate-x-full"
        enterTo="translate-x-0"
        leave="transform transition ease-in-out duration-500 sm:duration-700"
        leaveFrom="translate-x-0"
        leaveTo="-translate-x-full"
      >
        <div className="fixed inset-y-0 top-32 left-0 w-3/12 bg-stone-50 shadow-lg z-40 flex flex-col space-y-4 h-[800px] rounded-tr-lg">
          <div className="bg-blue-600 px-2 py-2 sm:px-3 shadow-xl rounded-tr-lg">
            <div className="flex items-center justify-between">
              <label className="flex font-semibold leading-6 text-left text-white">
                {t('StatSideBar.StatMenu')}
              </label>
              <div className="ml-3 flex h-7 items-center">
                <button
                  type="button"
                  className="relative rounded-md text-indigo-200 hover:text-white focus:outline-none"
                  onClick={togglePanel}
                >
                  <FaXmark className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          <div className="px-2 overflow-x-auto pb-5 scroll-smooth overflow-auto">
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id} className="w-full">
                  <button
                    onClick={() => handleItemClick(item.id, item.link)}
                    className={`block w-full px-4 py-2 rounded-md text-left
          ${
            selectedItem?.id === item.id
              ? 'bg-black text-white font-bold'
              : 'text-black hover:bg-black hover:text-white'
          }`}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Transition>
    </div>
  );
}
