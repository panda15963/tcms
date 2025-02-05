import { useState, useEffect, useCallback } from 'react';
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  PopoverGroup,
} from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { FaAngleDown } from 'react-icons/fa6';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SwitchLanguages from '../toggles/SwitchLanguages';
import useAuth from '../../hooks/useAuth';
import { isEmpty } from 'lodash';

const Navbar = () =>  {
  const { isActiveManagement, logout } = useAuth(); // 사용자 인증 관련 상태와 로그아웃 함수 가져오기
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // 모바일 메뉴 열림 상태 관리
  const navigate = useNavigate(); // 페이지 이동을 위한 네비게이트 훅
  const { t, i18n } = useTranslation(); // 다국어 지원을 위한 번역 훅
  const location = useLocation(); // 현재 위치 정보 가져오기

  // `AuthPage`와 `userDropMenus` 배열 정의 (다국어 초기화 후 사용)
  const AuthPage = [
    { id: 1, name: t('NavBar.AdminManagement'), link: '/main/admins' },
    // { id: 2, name: t('NavBar.UserManagement'), link: '/main/users' },
  ];

  const userDropMenus = [
    // { id: 'myPage', name: t('NavBar.MyPage') },
    { id: 'logout', name: t('NavBar.SignOut') },
  ];

  useEffect(() => {
    console.log('useEffect Navbar ===> ', isActiveManagement); // 관리 활성화 여부 로깅
  }, []);

  useEffect(() => {
    // 저장된 언어 가져와 현재 i18n 언어와 비교하여 변경
    const savedLanguage = localStorage.getItem('language') || 'kor';
    console.log('Saved Language:', savedLanguage);
    console.log('Current i18n Language:', i18n.language);
    if (i18n.language === savedLanguage.toLowerCase()) {
      i18n.changeLanguage(savedLanguage.toLowerCase());
    }
  }, [i18n]);

  // 언어 변경 함수
  const changeLanguage = useCallback(
    (lng) => {
      const newLanguage = lng.toLowerCase();
      if (i18n.language !== newLanguage) {
        i18n.changeLanguage(newLanguage);
      }
    },
    [i18n.language, i18n]
  );

  // 링크 클릭 핸들러
  const handleLinkClick = (link) => {
    console.log('🚀 ~ handleLinkClick ~ link:', link);
    if (link && !isEmpty(link) && link === 'logout') {
      // 로그아웃 시 메인 페이지로 이동
      console.log('NAVIGATING MAIN ==> ');
      logout();
      navigate('/');
    } else {
      // 다른 링크로 이동
      navigate(link);
      setMobileMenuOpen(false);
    }
  };

  // 특정 경로에서 새로고침
  const handleNavigation = () => {
    if (location.pathname === '/main/map') {
      window.location.reload();
    }
  };

  return (
    <header className="bg-white pt-1 pb-1 z-40 relative border-b-2">
      {/* 전역 내비게이션 */}
      <nav
        className="mx-auto max-w-full lg:px-8 flex justify-between items-center"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          {/* 로고 */}
          <Link
            to="/main/map"
            onClick={handleNavigation}
            className="-m-1.5 p-1.5 "
          >
            <div className="sm:mx-auto sm:w-full sm:max-w-sm transform scale-95">
              <div className="flex items-center space-x-1 cursor-default select-none">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  TestCourse
                </h1>
                <h1 className="text-2xl font-semibold tracking-tight text-blue-900">
                  ManagementSystem
                </h1>
              </div>
            </div>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="size-8 mr-4" />
          </button>
        </div>
        <PopoverGroup className="hidden lg:flex lg:gap-x-12">
          {isActiveManagement && (
            <Link
              to="/main/map"
              className="text-sm font-semibold flex items-center cursor-default select-none"
            >
              {/* 지도 */}
              {t('Common.Map')}
            </Link>
          )}
          {isActiveManagement && (
            <Link
              to="/main/dashboard"
              className="text-sm font-semibold flex items-center cursor-default select-none"
            >
              {/* 통계 */}
              {t('NavBar.Dashboard')}
            </Link>
          )}
          {isActiveManagement && (
            <Menu
              as="div"
              className="relative items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 select-none"
            >
              {({ open }) => (
                <>
                  <MenuButton className="text-sm font-semibold cursor-default">
                    {/* 관리 */}
                    {t('NavBar.Management')} <FaAngleDown className="inline" />
                  </MenuButton>
                  <Transition
                    show={open}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <MenuItems className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 rounded-md text-center bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {AuthPage.map((page) => (
                        <MenuItem key={page.id}>
                          {({ active }) => (
                            <Link
                              to={page.link}
                              className={`block px-3 py-2 rounded-md cursor-default text-base font-bold text-gray-700 ${
                                active ? 'bg-gray-50' : ''
                              }`}
                              onClick={() => {
                                handleLinkClick(page.link);
                              }}
                            >
                              {page.name}
                            </Link>
                          )}
                        </MenuItem>
                      ))}
                    </MenuItems>
                  </Transition>
                </>
              )}
            </Menu>
          )}
        </PopoverGroup>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end py">
          {/* 언어 변경 버튼 */}
          <SwitchLanguages onClick={changeLanguage} />
          {/* 사용자 메뉴 */}
          <Menu as="div" className="relative ml-3 transform scale-95">
            <MenuButton className="flex items-center">
              <span className="inline-block size-10 cursor-default overflow-hidden rounded-full bg-gray-100">
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
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <div className="flex lg:flex-1">
              {/* 로고 */}
              <Link
                to="/main/map"
                onClick={handleNavigation}
                className="-m-1.5 p-1.5 "
              >
                <div className="sm:mx-auto sm:w-full sm:max-w-sm transform scale-95">
                  <div className="flex flex-col items-left space-x-0 cursor-default select-none">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                      TestCourse
                    </h1>
                    <h1 className="text-2xl font-semibold tracking-tight text-blue-900">
                      ManagementSystem
                    </h1>
                  </div>
                </div>
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="size-8 mr-4" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {isActiveManagement && (
                  <Link
                    to="/main/map"
                    className="block px-3 py-2 rounded-md text-base font-bold text-gray-700 hover:bg-gray-50"
                  >
                    {/* 지도 */}
                    {t('Common.Map')}
                  </Link>
                )}
                {/* 대시보드 */}
                <Link
                  to="/main/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-bold text-gray-700 hover:bg-gray-50"
                  onClick={() => handleLinkClick('/main/dashboard')}
                >
                  {t('NavBar.Dashboard')}
                </Link>
                {/* 관리 */}
                <Disclosure as="div">
                  <DisclosureButton className="flex cursor-default justify-between w-full px-3 py-2 text-base font-bold text-gray-700 hover:bg-gray-50">
                    {t('NavBar.Management')}
                    <FaAngleDown className="h-6 w-6" aria-hidden="true" />
                  </DisclosureButton>
                  <DisclosurePanel className="px-3 py-1 text-sm text-gray-700 text-center">
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
              {/* 언어 변경 */}
              <div className="px-2 pt-2 pb-3 space-y-1">
                <SwitchLanguages onClick={changeLanguage} />
              </div>
              {/* 사용자 메뉴 */}
              <div className="px-2 pb-3 border-t border-gray-200">
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="h-10 w-10 rounded-full ml-3 mt-3"
                >
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
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
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
export default Navbar;