import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Link } from 'react-router-dom';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function MainNavbar() {
  const menuComponent = [
    {
      title: '지도',
      link: '/src/components/map',
    },
    {
      title: '통계',
      subMenu: [{ title: '사용률', link: '#' }],
    },
    {
      title: '관리',
      subMenu: [
        { title: '관리자 관리', link: '#' },
        { title: '회원 관리', link: '#' },
      ],
    },
  ];
  const Navbar = () => {
    return (
      <>
        {menuComponent.map((menu, index) => (
          <Menu key={index} as="div" className="relative mt-4">
            <MenuButton className="inline-flex items-center border-b-2 px-5 pt-1 py-4 border-transparent text-xl font-semibold text-gray-500 hover:border-gray-300 hover:text-gray-700">
              {menu.title}
              {menu.subMenu && (
                <ChevronDownIcon
                  className="-mr-1 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              )}
            </MenuButton>
            {menu.subMenu && (
              <Transition
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <MenuItems className="absolute -left-8 w-40 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {menu.subMenu.map((subMenu, subIndex) => (
                    <MenuItem key={subIndex}>
                      {({ focus }) => (
                        <Link
                          to={subMenu.link}
                          className={classNames(
                            focus ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-md text-gray-700 text-center font-semibold',
                          )}
                        >
                          {subMenu.title}
                        </Link>
                      )}
                    </MenuItem>
                  ))}
                </MenuItems>
              </Transition>
            )}
          </Menu>
        ))}
      </>
    );
  };
  const mobileVersion = () => {
    return (
      <>
        {menuComponent.map((menu, index) => (
          <Menu key={index} as="div" className="relative mt-4">
            <MenuButton className="inline-flex items-center border-b-2 px-5 pt-1 py-4 border-transparent text-xl font-semibold text-gray-500 hover:border-gray-300 hover:text-gray-700">
              {menu.title}
              {menu.subMenu && (
                <ChevronDownIcon
                  className="-mr-1 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              )}
            </MenuButton>
            {menu.subMenu && (
              <Transition
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <MenuItems className="-left-8 w-40 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {menu.subMenu.map((subMenu, subIndex) => (
                    <MenuItem key={subIndex}>
                      {({ focus }) => (
                        <Link
                          to={subMenu.link}
                          className={classNames(
                            focus ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-md text-gray-700 text-center font-semibold',
                          )}
                        >
                          {subMenu.title}
                        </Link>
                      )}
                    </MenuItem>
                  ))}
                </MenuItems>
              </Transition>
            )}
          </Menu>
        ))}
      </>
    );
  };
  const elements = [{ title: '마이페이지', link: '#' }, { title: '로그아웃' }];
  const user = () => {
    return (
      <Menu as="div" className="relative ml-3">
        <div>
          <MenuButton className="relative flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            <span className="absolute -inset-1.5" />
            <span className="sr-only">Open user menu</span>
            <img
              className=" h-10 w-10 rounded-full"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="Profile Picture"
            />
          </MenuButton>
        </div>
        <Transition
          enter="transition ease-out duration-200"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {elements.map((element, index) => (
              <MenuItem key={index}>
                {({ focus }) => (
                  <Link
                    to={element.link}
                    className={classNames(
                      focus ? 'bg-gray-100' : '',
                      'block px-4 py-2 text-md text-gray-700 text-center font-semibold',
                    )}
                  >
                    {element.title}
                  </Link>
                )}
              </MenuItem>
            ))}
          </MenuItems>
        </Transition>
      </Menu>
    );
  };
  return (
    <Disclosure as="nav">
      {({ open }) => (
        <header>
          <div className="fixed bg-white shadow-xl px-12 inset-x-0 top-0">
            <div className="flex justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <h1 className="text-5xl font-bold font-serif">TCMS</h1>
                </div>
                <div className="relative hidden sm:ml-6 sm:flex sm:space-x-8">
                  {Navbar()}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {user()}
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <DisclosureButton className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                  <span className="absolute -inset-0.5" />
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </DisclosureButton>
              </div>
            </div>
          </div>
          <DisclosurePanel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">{mobileVersion()}</div>
            <div className="border-t border-gray-200 pb-3 pt-4">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    Tom Cook
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    tom@example.com
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {elements.map((element, index) => (
                  <Link
                    key={index}
                    to={element.link}
                    className="block px-4 py-2 text-md text-gray-700 text-center font-semibold"
                  >
                    {element.title}
                  </Link>
                ))}
              </div>
            </div>
          </DisclosurePanel>
        </header>
      )}
    </Disclosure>
  );
}
