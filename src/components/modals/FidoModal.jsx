import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { Progress } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';
import fido_guide from '../../assets/images/fido_authentication.png';
import { isEmpty, isFunction } from 'lodash';
import useToast from '../../hooks/useToast';
import { ToastTypes } from '../../context/ToastProvider';
import { PiWarningCircleThin } from 'react-icons/pi';
import { getLoginMpassFido } from '../../service/api_services';

const initialProgressStatus = ['active', 'normal', 'exception', 'success'];
export const FidoModal = ({
  open,
  params,
  setFidoParams,
  onClose,
  handleLoginSuccess,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [seconds, setSeconds] = useState(30);
  const [progressStatus, setProgressStatus] = useState('');
  const [error, setError] = useState('');
  const [isTimeoutPaused, setTimeoutPaused] = useState(false);

  const percent = () => {
    return (seconds / 30) * 100;
  };

  const clearValues = () => {
    setError('');
    setTimeoutPaused(false);
    setProgressStatus('');
    setSeconds(30);
  };

  useEffect(() => {
    if (seconds <= 0 || (error && !isEmpty(error))) {
      console.log('SET ERROR ===> ');
      setProgressStatus('exception');
      if (seconds <= 0) {
        showToast(ToastTypes.WARNING, '경고', t(`msg.authExpired`));
      }

      showToast(
        ToastTypes.ERROR,
        '오류',
        error && !isEmpty(error) ? error : t(`msg.authError`)
      );
      handleLoginFail();
    }
  }, [seconds, error]);

  useEffect(() => {
    let timer;
    if (open && !isTimeoutPaused) {
      timer = setInterval(() => {
        setSeconds((preVal) => {
          if (preVal <= 0) {
            clearInterval(timer);
            return 0;
          }
          return preVal - 1;
        });
        //FIDO 인증 확인중...
        checkFidoAuth();
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [open, isTimeoutPaused]);

  const checkFidoAuth = async () => {
    console.log('[Calling checkFidoAuth][START] ==> ');
    console.log('[checkFidoAuth][params] => ', params);
    const { data, cancel, error } = await getLoginMpassFido(params);
    if (data) {
      console.log('🚀 ~ checkFidoAuth ~ data:', data);
      //FIDO 인증 성공
      if (data && !isEmpty(data)) {
        console.log('🚀 ~ checkFidoAuth ~ data:', data);
        //인증 성공
        if (data.code === 2000) {
          setTimeoutPaused(true);
          if (isFunction(handleLoginSuccess)) {
            handleLoginSuccess(data.result);
          }
          return;
        }
        //인증 대기
        else if (data.code === 2004) {
          setTimeoutPaused(false);
          return;
        }
      } else {
        console.log('[checkFidoAuth][Error] ==> ', error);
        // showToast(ToastTypes.ERROR, '오류', t(`msg.authError`));
      }
    } else if (error) {
      console.log('[checkFidoAuth][Error] ==> ', error);
      // showToast(ToastTypes.ERROR, '오류', t(`msg.authError`) + '\n' + error);
    }
  };

  //인증 실패 시 프로그래스 오류 UI
  const getProgressFormat = () => {
    if (progressStatus === 'exception') {
      return <div className="w-8">오류 UI</div>;
    }
    return <div className="w-8">{`${seconds}${t(`modal.sec`)}`}</div>;
  };

  const handleLoginFail = () => {
    if (isFunction(setFidoParams)) {
      setFidoParams({
        id: '',
        loginKey: '',
      });
    }
    // if (isFunction(onClose)) {
    //   onClose();
    // }
    // window.location.reload();
  };

  const isExceptionShow = () => {
    // console.log('[isExceptionShow][progressStatus] => ', progressStatus);
    // console.log('[isExceptionShow][open] => ', progressStatus);
    return open && progressStatus && progressStatus === 'exception';
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
  };

  return (
    <Dialog open={open} onClose={() => {}} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="w-[532px] h-[434px] bg-white">
            <DialogPanel
              transition
              className="relative transform overflow-hidden bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:w-full data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              <div className="flex justify-between py-3 px-5 bg-blue-600">
                <h1 className="text-lg font-semibold text-white">
                  {/* 버전 모아보기 */}
                  {t('modal.fido')}
                </h1>
                <button
                  className="font-semibold"
                  onClick={() => {
                    clearValues();
                    onClose();
                  }}
                >
                  <MdClose className="text-white" size={24} />
                </button>
              </div>

              {isExceptionShow() && (
                <div className="p-8 block items-center justify-center h-96">
                  <div>
                    <div className="flex justify-center mb-4">
                      <PiWarningCircleThin size={56} color="red" />
                    </div>

                    <span className="flex w-full font-semibold text-base text-gray-700 align-middle justify-center ">
                      {t(`msg.authError`)}
                    </span>
                  </div>
                  <div className="mt-40 flex justify-center">
                    <button
                      type="button"
                      onClick={() => onClose()}
                      className="inline-flex min-w-28 justify-center rounded-md bg-transparent border border-gray-400 px-3 py-2 text-sm font-semibold text-black shadow-sm hover:border-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      확인
                    </button>
                  </div>
                </div>
              )}
              {!isExceptionShow() && (
                <div className="p-8">
                  <div className="absolute top-14 w-10/12">
                    <Progress
                      gapPosition="top"
                      percentPosition={{ type: 'outer', align: 'center' }}
                      percent={percent}
                      // trailColor="#329898"
                      // strokeColor={'#329898FF'}
                      type="line"
                      status={progressStatus}
                      format={getProgressFormat}
                    />
                  </div>
                  <img
                    src={fido_guide}
                    alt={'FIDO 인증 방법 안내'}
                    onContextMenu={handleContextMenu}
                  />
                </div>
              )}
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
