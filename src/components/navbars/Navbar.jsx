import { useState, useEffect, useCallback } from 'react';
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
  Dialog,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  DialogPanel,
} from '@headlessui/react';
import { FaXmark, FaBars, FaAngleDown, FaRegUser } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SwitchLanguages from '../toggles/SwitchLanguages';
import profileImage from '../../assets/images/profile.png'; // 이미지 파일 경로
import useAuth from '../../hooks/useAuth';
import { isEmpty } from 'lodash';
import { FaUser } from 'react-icons/fa';

const NavBar = () => {
  const { isActiveManagement, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Define the AuthPage and userDropMenus arrays after t is initialized
  const AuthPage = [
    { id: 1, name: t('NavBar.AdminManagement'), link: '/main/admins' },
    { id: 2, name: t('NavBar.UserManagement'), link: '/main/users' },
  ];

  const userDropMenus = [
    // { id: 'myPage', name: t('NavBar.MyPage') },
    { id: 'logout', name: t('NavBar.SignOut') },
  ];

  useEffect(() => {
    console.log('useEffect Navbar ===> ', isActiveManagement);
  }, []);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'kor';
    console.log('Saved Language:', savedLanguage);
    console.log('Current i18n Language:', i18n.language);
    if (i18n.language === savedLanguage.toLowerCase()) {
      i18n.changeLanguage(savedLanguage.toLowerCase());
    }
  }, [i18n]);

  const changeLanguage = useCallback(
    (lng) => {
      const newLanguage = lng.toLowerCase();
      if (i18n.language !== newLanguage) {
        i18n.changeLanguage(newLanguage);
      }
    },
    [i18n.language, i18n]
  );

  const handleLinkClick = (link) => {
    console.log('🚀 ~ handleLinkClick ~ link:', link);
    if (link && !isEmpty(link) && link === 'logout') {
      console.log('NAVIGATING MAIN ==> ');
      logout();
      navigate('/');
    } else {
      navigate(link);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="bg-white pt-1 pb-1 z-50 relative border-b-2">
      <nav
        className="mx-auto max-w-full lg:px-8 flex justify-between items-center"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link to="/main/map" className="-m-1.5 p-1.5 ">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm transform scale-95">
              <div className="flex items-center space-x-1">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  TestCourse
                </h1>
                <h1 className="text-2xl font-semibold tracking-tight text-blue-700">
                  ManagementSystem
                </h1>
              </div>
            </div>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <FaXmark className="h-6 w-6" aria-hidden="true" />
            ) : (
              <FaBars className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12 text-center transform scale-95">
          {isActiveManagement && (
            <Link
              to="/main/map"
              className="text-sm font-semibold flex items-center"
            >
              {/* 지도 */}
              {t('Common.Map')}
            </Link>
          )}
          {isActiveManagement && (
            <Menu
              as="div"
              className="relative items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900"
            >
              <MenuButton
                className="text-sm font-semibold"
                onClick={() => handleLinkClick('/main/dashboard')}
              >
                {/* 통계 */}
                {t('NavBar.Dashboard')}
              </MenuButton>
            </Menu>
          )}
          {isActiveManagement && (
            <Menu
              as="div"
              className="relative items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900"
            >
              <MenuButton className="text-sm font-semibold">
                {/* 관리 */}
                {t('NavBar.Management')} <FaAngleDown className="inline" />
              </MenuButton>
              <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <MenuItems className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <MenuItem>
                    {({ active }) => (
                      <>
                        {AuthPage.map((page) => (
                          <Link
                            key={page.id}
                            to={page.link}
                            className="block px-3 py-2 rounded-md text-base font-bold text-gray-700 hover:bg-gray-50 "
                            onClick={() => handleLinkClick(page.link)}
                          >
                            {page.name}
                          </Link>
                        ))}
                      </>
                    )}
                  </MenuItem>
                </MenuItems>
              </Transition>
            </Menu>
          )}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end py">
          <SwitchLanguages onClick={changeLanguage} />
          <Menu as="div" className="relative ml-3 transform scale-95">
            <MenuButton className="flex items-center">
              {/* <img
                className="h-10 w-10 rounded-full"
                // src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                src={profileImage}
                alt="Profile Picture"
              /> */}
              <span className="inline-block size-10 overflow-hidden rounded-full bg-gray-100">
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="size-full text-gray-300"
                >
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
            </MenuButton>
            <MenuItems
              transition
              className="absolute font-bold right-0 mt-2 w-36 rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-40"
            >
              <div className="py-1">
                {userDropMenus.map((page) => (
                  <MenuItem key={page.id}>
                    <span
                      className="block px-2 py-1 text-sm rounded-lg text-gray-600 text-center hover:bg-gray-100 hover:text-gray-800 cursor-pointer transition-all duration-200"
                      onClick={() => handleLinkClick(page.id)}
                    >
                      {page.name}
                    </span>
                  </MenuItem>
                ))}
              </div>
            </MenuItems>
          </Menu>
        </div>
      </nav>
      {/* Mobile menu */}
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <DialogPanel
          focus="true"
          className="fixed inset-0 z-10 overflow-y-auto bg-white"
        >
          <div className="flex justify-between items-center p-6"></div>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Map link should be clearly visible and separate from Disclosure */}
            <Link
              to="/main/map"
              className="block px-3 py-2 rounded-md text-base font-bold text-gray-700 hover:bg-gray-50"
              onClick={() => handleLinkClick('/main/map')}
            >
              {t('Common.Map')}
            </Link>

            <Disclosure as="div">
              <DisclosureButton className="flex justify-between w-full px-3 py-2 text-base font-bold text-gray-700 hover:bg-gray-50">
                {t('NavBar.Dashboard')}
                <FaAngleDown className="h-6 w-6" aria-hidden="true" />
              </DisclosureButton>
              <DisclosurePanel className="px-3 py-1 text-sm text-gray-700">
                <Link
                  to="/main/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-bold text-gray-700 hover:bg-gray-50"
                  onClick={() => handleLinkClick('/main/dashboard')}
                >
                  {t('NavBar.UsageRate')}
                </Link>
              </DisclosurePanel>
            </Disclosure>
            <Disclosure as="div">
              <DisclosureButton className="flex justify-between w-full px-3 py-2 text-base font-bold text-gray-700 hover:bg-gray-50">
                {t('NavBar.Management')}
                <FaAngleDown className="h-6 w-6" aria-hidden="true" />
              </DisclosureButton>
              <DisclosurePanel className="px-3 py-1 text-sm text-gray-700">
                {AuthPage.map((page) => (
                  <Link
                    key={page.id}
                    to={page.link}
                    className="block px-3 py-2 rounded-md text-base font-bold text-gray-700 hover:bg-gray-50"
                    onClick={() => handleLinkClick(page.link)}
                  >
                    {page.name}
                  </Link>
                ))}
              </DisclosurePanel>
            </Disclosure>
          </div>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <SwitchLanguages onClick={changeLanguage} />
          </div>
          <div className="px-2 pb-3 border-t border-gray-200">
            <img
              className="h-10 w-10 rounded-full ml-3 mt-3"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="Profile Picture"
            />
            {userDropMenus.map((page) => (
              <span
                key={page.id}
                className="block px-3 py-2 rounded-md text-base font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleLinkClick(page.id)}
              >
                {page.name}
              </span>
            ))}
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
};

export default NavBar;
