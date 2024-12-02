import { useEffect, useRef, useState } from 'react';
import Background from '../assets/images/background.jpg';
import { Link, useNavigate } from 'react-router-dom';
import useLoadingBar from '../hooks/useLoading';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import { FaRegEyeSlash, FaRegEye } from 'react-icons/fa';
import { ToastTypes } from '../context/ToastProvider';
import { useTranslation } from 'react-i18next';
import { isEmpty } from 'lodash';
import { getAdmin } from '../service/api_services';

export default function Login() {
  const { t } = useTranslation;
  const navigate = useNavigate();

  const { setLoading } = useLoadingBar();
  const { login } = useAuth();
  const { showToast } = useToast();

  const idRef = useRef();
  const passRef = useRef();
  const btnLoginRef = useRef();

  let cancelconds;

  const initialRequest = {
    admin_id: '',
    password: '',
  };

  const [request, setRequest] = useState(initialRequest);
  const [showPass, setShowPass] = useState(false);
  const [authMethod, setAuthMethod] = useState('FIDO'); // FIDO가 기본 선택
  const [otpCode, setOtpCode] = useState(''); // OTP 번호 상태
  // const [mpassType, setMpassType] = (useState < 1) | (2 > 2); // 1 === otp, 2 === fido
  // const [fidoModalOpen, setFidoModalOpen] = useState(false);
  // const [params, setParams] = {}

  useEffect(() => {
    idRef.current.focus();
  }, []);

  const clearFieldValues = () => {
    setRequest(initialRequest);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('[handleSubmit][START] ==> ');
    let checkReturn = false;
    if (isEmpty(request.admin_id)) {
      showToast(ToastTypes.WARNING, '안내', '아이디를 입력해 주세요.');
      checkReturn = true;
    }

    if (checkReturn) return;

    setLoading(true);
    console.log('[Login][Admin id] => ', request.admin_id);

    const { data, cancel, error } = await getAdmin(request.admin_id);
    console.log('🚀 ~ handleSubmit ~ data:', data);
    cancelconds = cancel;
    if (data) {
      console.log('[Login data]', data);
      if (!isEmpty(data)) {
        const adminInfo = {
          seq: data.seq,
          admin_id: data.admin_id,
          admin_use_yn: data.admin_use_yn,
        };
        login(adminInfo);
        handleGoHomeWithoutLogin();
      }
    } else if (error) {
      console.log('[Login][Error] ==> ', error);
      if (
        error.status === 404 &&
        error.response.data === 'Not found admin info'
      ) {
        showToast(
          ToastTypes.WARNING,
          '안내',
          '아이디 또는 비밀번호가 맞지 않습니다. 다시 입력해 주세요.'
        );
        clearFieldValues();
        if (idRef && idRef.current) {
          idRef.current.focus();
        }
      } else {
        showToast(
          ToastTypes.ERROR,
          '오류',
          '로그인할때 서버에 올 났습니다. \n' + error
        );
      }
    }

    setLoading(false);

    // try {
    //   //Call api auth endpoint
    //   setLoading(true);
    //   console.log('[Authentication request] ', request);
    //   await authenticate(request).then((response) => {
    //     console.log(
    //       '🚀 ~ file: Login.jsx:63 ~ handleSubmit ~ response:',
    //       response,
    //     );
    //     if (response && response.data && response.data.resultCode === 200) {
    //       if (response.data.detail && isString(response.data.detail)) {
    //         const token = response.data.detail;
    //         const decodedToken = jwtDecode(token);
    //         console.log('🚀 ~ awaitauthenticate ~ decodedToken:', decodedToken);
    //         Cookies.set('access-token', token, { expires: 1 });
    //         const adminInfo = {
    //           admin_seq: decodedToken.sub ?? '',
    //           admin_id: decodedToken.admin_id,
    //           admin_level_cd: decodedToken.admin_level_cd,
    //           admin_level_nm: decodedToken.admin_level_nm,
    //           admin_name: decodedToken.admin_name,
    //           admin_type: decodedToken.admin_type,
    //         };
    //         axiosInstance.interceptors.request.use(
    //           (config) => {
    //             config.headers['Authorization'] = `Bearer ${token}`;
    //             return config;
    //           },
    //           (error) => {
    //             return Promise.reject(error);
    //           },
    //         );
    //         setLoading(false);

    //         login(adminInfo);
    //         // setAuth(adminInfo);
    //         if (
    //           adminInfo.admin_level_cd === ROLES.Admin ||
    //           adminInfo.admin_level_cd === ROLES.Volunteer
    //         ) {
    //           // navigate('/ad/dashboard', { replace: true });
    //         } else {
    //           // navigate('/user/dashboard', { replace: true });
    //         }
    //       }
    //     } else if (response.data && response.data.resultCode === 404) {
    //       setLoading(false);
    //       showToast(
    //         ToastTypes.ERROR,
    //         '실패',
    //         '아이디 또는 비밀번호를 잘못 입력했습니다. 입력하신 내용을 다시 확인해주세요.',
    //       );
    //     } else {
    //       showToast(
    //         ToastTypes.ERROR,
    //         '실패',
    //         '아이디 또는 비밀번호를 잘못 입력했습니다. 입력하신 내용을 다시 확인해주세요.',
    //       );
    //     }
    //   });
    // } catch (e) {
    //   setLoading(false);
    //   console.log('Error complicated to login => ', e);
    //   showToast(
    //     ToastTypes.ERROR,
    //     '실패',
    //     '아이디(로그인 전용 아이디) 또는 비밀번호를 잘못 입력했습니다. 입력하신 내용을 다시 확인해주세요.',
    //   );
    // }
  };

  const handleMouseUp = () => {
    setShowPass(false);
  };

  const handleMouseDown = () => {
    setShowPass(true);
  };

  const handleKeyDown = (e, id) => {
    // console.log("🚀 ~ handleKeyDown ~ id:", id);
    // console.log("e ==> ", e);
    if (e.keyCode === 13) {
      if (id === 'id') {
        passRef.current.focus();
      } else if (id === 'pass') {
        btnLoginRef.current.focus();
      }
    }
  };

  const handleGoHomeWithoutLogin = () => {
    navigate('/main/map'); // 홈페이지 경로로 이동
  };

  return (
    <>
      <div className="relative h-screen w-screen bg-cover bg-center">
        <div className="flex h-full w-full">
          <img
            src={Background}
            alt="background"
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
          <div className="relative flex h-full w-full ">
            <div className="flex-[7]" />
            <div className="flex-[3] flex justify-center items-center bg-white">
              <div className="w-full">
                <div className="w-full justify-center py-12 transform scale-90">
                  <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    {/* TestCourse ManagementSystem */}
                    <h1 className="text-5xl font-bold tracking-tight text-gray-900">
                      TestCourse
                    </h1>
                    <h2 className="text-4xl font-semibold tracking-tight text-blue-900">
                      ManagementSystem
                    </h2>
                  </div>

                  <div className="bg-white px-2 py-12 sm:px-2 mt-10 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="space-y-6">
                      <div>
                        <div className="flex">
                          <label className="block text-base font-semibold leading-6 text-gray-700">
                            아이디
                          </label>
                          <label className="ml-1 text-base font-semibold leading-6 text-red-500">
                            {' '}
                            *
                          </label>
                        </div>
                        <div className="mt-2">
                          <input
                            className="block w-full rounded-lg border-0 py-3 text-gray-900 shadow ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-900 sm:text-sm sm:leading-6 pl-3"
                            placeholder="아이디를 입력하세요"
                            required
                            ref={idRef}
                            id="userId"
                            name="userId"
                            type="text"
                            autoComplete="off"
                            value={request.admin_id}
                            onKeyDown={(e) => handleKeyDown(e, 'id')}
                            onChange={(e) => {
                              setRequest((preVal) => {
                                return {
                                  ...preVal,
                                  admin_id: e.target.value,
                                };
                              });
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex">
                          <label className="block text-base font-semibold leading-6 text-gray-700">
                            비밀번호
                          </label>
                          <label className="ml-1 text-base font-semibold leading-6 text-red-500">
                            {' '}
                            *
                          </label>
                        </div>
                        <div className="relative w-full max-w-md mt-2">
                          <input
                            placeholder="비밀번호를 입력하세요"
                            className="block w-full rounded-lg shadow border-0 py-3 text-gray-900  ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-900 sm:text-sm sm:leading-6 pl-3"
                            required
                            ref={passRef}
                            id="password"
                            name="password"
                            type={showPass ? 'text' : 'password'}
                            value={request.password}
                            onKeyDown={(e) => handleKeyDown(e, 'pass')}
                            onChange={(e) => {
                              setRequest((preVal) => {
                                return {
                                  ...preVal,
                                  password: e.target.value,
                                };
                              });
                            }}
                          />
                          <button
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                          >
                            {showPass && (
                              <FaRegEye
                                className="-ml-0.5 h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              />
                            )}
                            {!showPass && (
                              <FaRegEyeSlash className="-ml-0.5 h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* FIDO/OTP 선택 및 OTP 입력 */}
                      <div className="mt-4">
                        <label className="block text-base font-semibold leading-6 text-gray-700">
                          인증 방법 선택
                        </label>
                        <div className="flex items-center space-x-4 mt-2">
                          <button
                            className={`px-4 py-2 rounded-lg ${
                              authMethod === 'FIDO'
                                ? 'bg-blue-900 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                            onClick={() => setAuthMethod('FIDO')}
                          >
                            FIDO
                          </button>
                          <button
                            className={`px-4 py-2 rounded-lg ${
                              authMethod === 'OTP'
                                ? 'bg-blue-900 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                            onClick={() => setAuthMethod('OTP')}
                          >
                            OTP
                          </button>

                          {/* OTP 입력 필드: OTP가 선택된 경우에만 나타남 */}
                          {authMethod === 'OTP' && (
                            <input
                              type="text"
                              className="block w-full max-w-xs rounded-lg border-0 py-2 px-3 text-gray-900 shadow ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-900 sm:text-sm sm:leading-6"
                              placeholder="OTP 번호 입력"
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value)}
                            />
                          )}
                        </div>
                      </div>

                      <div>
                        <button
                          ref={btnLoginRef}
                          className="flex w-full justify-center items-center rounded-lg bg-blue-900 px-3 py-4 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
                          onClick={(e) => handleSubmit(e)}
                        >
                          로그인
                        </button>
                      </div>

                      {/* 로그인 없이 바로 홈페이지로 이동 버튼 */}
                      <div>
                        <button
                          className="flex w-full justify-center items-center rounded-lg bg-gray-400 px-3 py-4 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 mt-4"
                          onClick={handleGoHomeWithoutLogin}
                        >
                          메인페이지로 이동
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* <div className="flex justify-center mt-10">
                    <p className="text-center text-base font-semibold text-gray-700">
                      아직 계정이 없으신가요?{' '}
                      <Link
                        to={'/register'}
                        className="font-semibold leading-6 text-blue-700 hover:underline hover:text-blue-600 underline underline-offset-4"
                      >
                        회원가입
                      </Link>
                    </p>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
