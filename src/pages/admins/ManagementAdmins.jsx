import { FiPlus } from 'react-icons/fi';
import { deleteAdmin, getAdmins } from '../../service/api_services';
import { isEmpty } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { formatStringDate } from '../../common/Utils';
import useToast from '../../hooks/useToast';
import { ToastTypes } from '../../context/ToastProvider';
import AddAdminModal from './AddAdminModal';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

/**
 * 관리자 관리 페이지 컴포넌트
 * @returns {JSX.Element} - 관리자 관리 페이지
 */
export default function ManagementAdmins() {
  const { t } = useTranslation();

  let cancelconds;

  const { showToast } = useToast();
  const addAdminModalRef = useRef();

  const [list, setList] = useState([]);

  // 컴포넌트 마운트 시 관리자 목록 가져오기
  useEffect(() => {
    fetchAdmins();
  }, []);

  /**
   * 관리자 목록 가져오기
   */
  const fetchAdmins = async () => {
    const { data, cancel, error } = await getAdmins();
    cancelconds = cancel;
    if (data) {
      if (!isEmpty(data)) {
        console.log('Data ==> ', data);
        showToast(
          ToastTypes.SUCCESS,
          // 성공
          t('toast.Success'),
          // 조회를 완료했습니다.
          t('toast.SearchMessage')
        );
        setList(data);
      } else {
        setList([]);
      }
    } else if (error) {
      setList([]);
      // 오류
      showToast(ToastTypes.ERROR, t('toast.Error'), error);
      console.log('Error ==> ', error);
    }
  };

  /**
   * 관리자 정보 삭제하기
   * @param {관리자 아이디} adminId
   */
  const handleDeleteAdminId = async (adminId) => {
    // 관리자 아이디를 삭제하시겠습니까?
    const res = confirm(`${adminId}  ${t('toast.DeleteConfirm')}`);
    console.log('[handleDeleteAdminId][res] ==> ', res);
    if (res) {
      const { data, error } = await deleteAdmin(adminId);
      if (data) {
        if (!isEmpty(data)) {
          console.log('[delete admin id][data] = ', data);
          if (data === 'Successfully deleted admin info') {
            showToast(
              ToastTypes.SUCCESS,
              // 성공
              t('toast.Success'),
              // 선택한 관리자 정보가 성공적으로 삭제되었습니다.
              t('toast.DeleteMessage')
            );
            fetchAdmins();
          }
        }
      } else if (error) {
        // 오류
        showToast(ToastTypes.ERROR, t('toast.Error'), error);
        console.log('Error ==> ', error);
      }
    }
  };
  /**
   * 관리자 정보 수정 모드로 전환
   * @param {Object} adminInfo - 수정할 관리자 정보
   */
  const handleUpdateAdminInfo = (adminInfo) => {
    console.log('[handleUpdateAdminInfo][admin info]', adminInfo);
    if (addAdminModalRef && addAdminModalRef.current) {
      addAdminModalRef.current.update(adminInfo);
    }
  };

  return (
    <div className="px-24 py-16 w-full whitespace-nowrap">
      <h2 className="px-4 text-2xl font-semibold text-black sm:px-6 lg:px-8 text-center">
        {/* 관리자 관리 */}
        {t('admin.AdministratorManagement')}
      </h2>
      <div className="mt-10 px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold text-gray-900">
              {/* 시스템 관리자 */}
              {t('admin.SystemAdministrator')}
            </h1>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-900"
              onClick={() => {
                if (addAdminModalRef) {
                  addAdminModalRef.current.show();
                }
              }}
            >
              <FiPlus aria-hidden="true" className="-ml-0.5 size-5" />
              {/* 관리자 추가 */}
              {t('admin.AddAdministrators')}
            </button>
          </div>
        </div>
        <AddAdminModal
          ref={addAdminModalRef}
          callRefresh={() => fetchAdmins()}
        />
        <div className="-mx-4 mt-8 sm:-mx-0">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="py-3.5 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                >
                  No
                </th>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                >
                  {/* 아이디 */}
                  {t('HomeLogin.ID')}
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                >
                  {/* 사용유무 */}
                  {t('admin.UseYn')}
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                >
                  {/* 등록일 */}
                  {t('admin.RegisteredDate')}
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  {/* 수정일 */}
                  {t('admin.EditDate')}
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                  {/* 수정 */}
                  <span className="sr-only ">수정</span>
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                  {/* 삭제 */}
                  <span className="sr-only ">삭제</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {list &&
                !isEmpty(list) &&
                list.map((item, index) => (
                  <tr key={item.seq}>
                    <td className="whitespace-nowrap py-4 text-sm font-medium text-gray-900 sm:pl-0">
                      {index + 1}
                    </td>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      {item.admin_id}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:table-cell">
                      {item.admin_use_yn}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 lg:table-cell">
                      {formatStringDate(item.reg_date)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {formatStringDate(item.upd_date)}
                    </td>
                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <Link
                        className="text-blue-900 hover:text-blue-700 font-semibold cursor-pointer"
                        onClick={() => {
                          handleUpdateAdminInfo(item);
                        }}
                      >
                        {/* 수정 */}
                        {t('admin.Edit')}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <Link
                        className="text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                        onClick={() => {
                          handleDeleteAdminId(item.admin_id);
                        }}
                      >
                        {/* 삭제 */}
                        {t('admin.Delete')}
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
