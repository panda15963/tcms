import { useState } from 'react';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
  Dialog,
} from '@headlessui/react';
import {
  FaXmark,
  FaBars,
  FaAngleDown,
} from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom';

const profileMenus = [
  { title: '마이페이지', link: '#' },
  { title: '로그아웃' },
];

const navBarMenus = [
  {
    title: '지도',
    link: '/main/map',
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLinkClick = (link) => {
    navigate(link);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white z-30 relative">
      <nav className="mx-auto max-w-full p-2 lg:px-8 flex justify-between items-center" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link to="/main/map" className="-m-1.5 p-1.5">
            <h1 className="text-5xl font-bold font-serif">TCMS</h1>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <FaXmark className="h-6 w-6" aria-hidden="true" />
            ) : (
              <FaBars className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12 text-center">
          {navBarMenus.map((menu, index) => (
            <Menu key={index} as="div" className="relative">
              <MenuButton
                onClick={menu.link ? () => navigate(menu.link) : undefined}
                className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900"
              >
                {menu.title}
                {menu.subMenu && menu.title !== '지도' && (
                  <FaAngleDown
                    className="h-5 w-5 flex-none text-gray-400"
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
                  <MenuItems className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-40">
                    {menu.subMenu.map((subMenu, subIndex) => (
                      <MenuItem key={subIndex}>
                        {({ active }) => (
                          <Link
                            to={subMenu.link}
                            className={classNames(
                              active ? 'bg-gray-100' : '',
                              'block px-4 py-2 text-sm text-gray-700 font-bold'
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
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <Menu as="div" className="relative ml-3">
            <MenuButton className="flex items-center">
              <img
                className="h-10 w-10 rounded-full"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Profile Picture"
              />
            </MenuButton>
            <Transition
              enter="transition ease-out duration-200"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <MenuItems className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-40">
                {profileMenus.map((item, index) => (
                  <MenuItem key={index}>
                    {({ active }) => (
                      <Link
                        to={item.link}
                        className={classNames(
                          active ? 'bg-gray-100' : '',
                          'block px-4 py-2 text-sm text-gray-700 font-bold text-center'
                        )}
                      >
                        {item.title}
                      </Link>
                    )}
                  </MenuItem>
                ))}
              </MenuItems>
            </Transition>
          </Menu>
        </div>
      </nav>
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <Dialog.Panel focus="true" className="fixed inset-0 z-10 overflow-y-auto bg-white">
          <div className="flex justify-between items-center p-6">
            <div>
              <h1 className="text-5xl font-bold font-serif">TCMS</h1>
            </div>
            <div>
              <button
                type="button"
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close main menu</span>
                <FaXmark className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navBarMenus.map((menu, index) => (
              <div key={index}>
                {menu.title === '지도' ? (
                  <button
                    onClick={() => handleLinkClick(menu.link)}
                    className="block w-full text-left px-4 py-2 text-sm font-semibold leading-6 text-gray-900"
                  >
                    {menu.title}
                  </button>
                ) : (
                  <Disclosure>
                    <DisclosureButton className="flex justify-between w-full px-4 py-2 text-sm font-semibold leading-6 text-gray-900">
                      {menu.title}
                      {menu.subMenu && (
                        <FaAngleDown
                          className={`h-5 w-5 flex-none text-gray-400 ${menu.title === '지도' ? 'hidden' : ''
                            }`}
                          aria-hidden="true"
                        />
                      )}
                    </DisclosureButton>
                    <DisclosurePanel className="px-2 py-1">
                      {menu.subMenu && menu.subMenu.map((subMenu, subIndex) => (
                        <button
                          key={subIndex}
                          onClick={() => handleLinkClick(subMenu.link)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 font-bold"
                        >
                          {subMenu.title}
                        </button>
                      ))}
                    </DisclosurePanel>
                  </Disclosure>
                )}
              </div>
            ))}
          </div>
          <div className="px-2 pb-3 border-t border-gray-200">
            <img
              className="h-10 w-10 rounded-full ml-3 mt-3"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="Profile Picture"
            />            {
              profileMenus.map((item, index) => (
                <Link
                  key={index}
                  to={item.link}
                  className="block px-4 py-2 text-sm text-gray-700 font-bold"
                >
                  {item.title}
                </Link>
              ))}
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
};

export default Navbar;
