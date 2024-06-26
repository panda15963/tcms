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
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Link, useNavigate } from 'react-router-dom';

const profileMenus = [
  { title: '마이페이지', link: '#' },
  { title: '로그아웃' },
];

const userNavigation = [
  { name: 'Your Profile', href: '#' },
  { name: 'Settings', href: '#' },
  { name: 'Sign out', href: '#' },
];

const navBarMenus = [
  {
    title: '지도',
    link: '/main/map/google',
  },
  {
    title: '통계',
    subMenu: [{ title: '사용률', link: '/main/dashboard' }],
  },
  {
    title: '관리',
    subMenu: [
      { title: '관리자 관리', link: '/main/admins' },
      { title: '회원 관리', link: '/main/users' },
    ],
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Navbar = () => {
  const navigate = useNavigate();
  const navMenus = () => {
    return (
      <>
        {navBarMenus.map((menu, index) => (
          <Menu key={index} as="div" className="relative mt-4 ml-32">
            <MenuButton
              className="inline-flex items-center border-b-2 px-7 pt-1 py-4 border-transparent text-base font-semibold text-gray-800  hover:border-gray-300 hover:text-gray-600"
              onClick={
                menu.title === '지도'
                  ? () => navigate('/main/map/google')
                  : () => {}
              }
            >
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
                <MenuItems className=" z-10 absolute -left-8 w-40 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {menu.subMenu.map((subMenu, subIndex) => (
                    <MenuItem key={subIndex}>
                      {({ focus }) => (
                        <Link
                          to={subMenu.link}
                          className={classNames(
                            focus ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-md text-gray-900 text-center font-normal',
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

  const MobileNavBar = () => {
    return (
      <>
        {navBarMenus.map((menu, index) => (
          <Menu key={index} as="div" className="relative mt-4">
            <MenuButton
              className="inline-flex items-center border-b-2 px-5 pt-1 py-4 border-transparent text-xl font-semibold text-gray-500 hover:border-gray-300 hover:text-gray-700"
              onClick={
                menu.title === '지도'
                  ? () => navigate('/main/map/google')
                  : () => {}
              }
            >
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
            {profileMenus.map((element, index) => (
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
    <Disclosure as="nav" className="bg-white border-b border-gray-200">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <Link to={'/main/map/google'}>
                  <div className="flex-shrink-0">
                    <h1 className="text-5xl font-bold font-serif">TCMS</h1>
                  </div>
                </Link>
                <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-5">
                  {navMenus()}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {user()}
              </div>
              <div className="-mr-2 flex md:hidden">
                {/* Mobile menu button */}
                <DisclosureButton className="relative inline-flex items-center justify-center rounded-md bg-indigo-600 p-2 text-indigo-200 hover:bg-indigo-500 hover:bg-opacity-75 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </DisclosureButton>
              </div>
            </div>
          </div>
          <DisclosurePanel className="md:hidden">
            <div className="space-y-1 pb-3 pt-2">{MobileNavBar()}</div>
            <div className="border-t border-indigo-700 pb-3 pt-4">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={user.imageUrl}
                    alt=""
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">
                    {user.name}
                  </div>
                  <div className="text-sm font-medium text-indigo-300">
                    {user.email}
                  </div>
                </div>
                <button
                  type="button"
                  className="relative ml-auto flex-shrink-0 rounded-full border-2 border-transparent bg-indigo-600 p-1 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                >
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-3 space-y-1 px-2">
                {userNavigation.map((item) => (
                  <DisclosureButton
                    key={item.name}
                    as="a"
                    href={item.href}
                    className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-indigo-500 hover:bg-opacity-75"
                  >
                    {item.name}
                  </DisclosureButton>
                ))}
              </div>
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;
