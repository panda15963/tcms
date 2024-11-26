import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Label,
  Switch,
} from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { isEmpty, isFunction, update } from 'lodash';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { addAdmin, updateAdmin } from '../../service/api_services';
import useToast from '../../hooks/useToast';
import { ToastTypes } from '../../context/ToastProvider';

const initialRequest = {
  seq: 0,
  admin_id: '',
  admin_use_yn: 'Y',
};

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const AddAdminModal = forwardRef(({ callRefresh: refresh }, ref) => {
  const { showToast } = useToast();

  const [request, setRequest] = useState(initialRequest);
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [errorMsg, setErrorMessage] = useState('');
  const [updateMode, setUpdateMode] = useState(false);

  const inputAdminIdRef = useRef();

  useImperativeHandle(ref, () => ({
    show() {
      //   console.log('SHOW MODAL ===>');
      clearValues();
      setOpen(true);
    },
    update(adminInfo) {
      clearValues();
      console.log('[update][adminInfo] ', adminInfo);
      if (adminInfo && !isEmpty(adminInfo)) {
        setRequest((preVal) => {
          return {
            ...preVal,
            seq: adminInfo.seq,
            admin_id: adminInfo.admin_id,
            admin_use_yn: adminInfo.admin_use_yn,
          };
        });
        setEnabled(adminInfo.admin_use_yn === 'Y');
        setUpdateMode(true);
        setOpen(true);
      }
    },
  }));

  const clearValues = () => {
    setRequest(initialRequest);
    setErrorMessage('');
  };

  /**
   * 데이터 저장 함수
   */
  const saveAdmin = async () => {
    if (isEmpty(request.admin_id) || !request.admin_id.trim()) {
      setErrorMessage('관리자 아이디를 입력해 주세요.');
      inputAdminIdRef.current.focus();
    } else {
      setErrorMessage('');

      //관리자 정보 업데이트
      if (updateMode) {
        const { data, error } = await updateAdmin(request);
        if (data) {
          if (!isEmpty(data)) {
            console.log('[update admin][data]', data);
            if (data === 'Successfully updated') {
              showToast(ToastTypes.SUCCESS, '성공', '수정이 완료되었습니다.');
              clearValues();
              setOpen(false);
              if (isFunction(refresh)) {
                refresh();
              }
            }
          }
        } else if (error) {
          showToast(ToastTypes.ERROR, '오류', error);
          console.log('Error ==> ', error);
        }
      }
      //관리자 추가
      else {
        const { data, error } = await addAdmin(request);
        if (data) {
          if (!isEmpty(data)) {
            console.log('Data ==> ', data);
            showToast(ToastTypes.SUCCESS, '성공', '관리자 추가 완료했습니다.');
            clearValues();
            setOpen(false);
            if (isFunction(refresh)) {
              refresh();
            }
          }
        } else if (error) {
          console.log('error.status ==> ', error.status);
          if (error.status === 400 && !isEmpty(error.response.data)) {
            console.log('Error status 400 ==> ');
            console.log('[Error response][data] ==> ', error.response.data);
            if (error.response.data === 'Already registered admin id') {
              showToast(
                ToastTypes.WARNING,
                '안내',
                '이미 등록된 관리자 아이디입니다. 다른 아이디를 입력해 주세요.'
              );
              setErrorMessage(
                '이미 등록된 관리자 아이디입니다. 다른 아이디를 입력해 주세요.'
              );
              // clearValues();
              inputAdminIdRef.current.focus();
            }
          } else {
            showToast(ToastTypes.ERROR, '오류', error);
            console.log('Error ==> ', error);
          }
        }
      }
    }
  };

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="bg-white px-4 pb-4 pt-5 sm:p- sm:pb-4">
              <div className="mt-3 text-center sm:mx-4 sm:mt-0 sm:text-left ">
                <DialogTitle
                  as="h3"
                  className="text-base font-semibold text-gray-900"
                >
                  {updateMode ? '관리자 정보 수정' : '관리자 추가'}
                </DialogTitle>
                <div className="mt-6 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="admin-id"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      아이디
                    </label>
                    <div className="mt-2">
                      <input
                        readOnly={updateMode}
                        disabled={updateMode}
                        ref={inputAdminIdRef}
                        // id="admin-id"
                        // name="admin-id"
                        type="text"
                        maxLength={30}
                        className={classNames(
                          errorMsg
                            ? 'ring-red-500 focus:border-red-500'
                            : 'ring-gray-300  focus:border-blue-500 ',
                          'w-full rounded border  py-1.5 px-2 text-gray-700 text-left ring-1 ring-inset  placeholder:text-gray-400 focus:ring-1 focus:ring-inset sm:text-sm sm:leading-6 focus:outline-none disabled:bg-gray-200 disabled:border-gray-300 disabled:ring-gray-300 disabled:cursor-not-allowed'
                        )}
                        value={request.admin_id}
                        onChange={(e) => {
                          setRequest((preVal) => {
                            return {
                              ...preVal,
                              admin_id: e.target.value,
                            };
                          });
                        }}
                      />
                      {errorMsg && (
                        <p className="mt-1 font-medium text-xs text-red-600">
                          {errorMsg}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="flex grow flex-col">
                      <label className="block text-sm font-semibold text-gray-700">
                        사용유무
                      </label>
                    </span>
                    <Switch
                      checked={enabled}
                      onChange={(val) => {
                        setEnabled(val);
                        setRequest((preVal) => {
                          return {
                            ...preVal,
                            admin_use_yn: val ? 'Y' : 'N',
                          };
                        });
                      }}
                      className="mt-2 group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 data-[checked]:bg-blue-600"
                    >
                      <span
                        aria-hidden="true"
                        className="pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5"
                      />
                    </Switch>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                onClick={() => saveAdmin()}
                className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
              >
                {updateMode ? '수정' : '저장'}
              </button>
              <button
                type="button"
                data-autofocus
                onClick={() => setOpen(false)}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                닫기
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
});

export default AddAdminModal;
