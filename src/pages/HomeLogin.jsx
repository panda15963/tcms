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
  const { t } = useTranslation; // 다국어 번역 훅
  const navigate = useNavigate(); // 페이지 이동을 위한 네비게이션 훅

  const { setLoading } = useLoadingBar(); // 로딩 상태 관리 훅
  const { login } = useAuth(); // 로그인 상태 관리 훅
  const { showToast } = useToast(); // 토스트 메시지 표시 훅

  const idRef = useRef(); // 아이디 입력 필드 참조
  const passRef = useRef(); // 비밀번호 입력 필드 참조
  const btnLoginRef = useRef(); // 로그인 버튼 참조

  let cancelconds; // 취소 토큰 저장

  const initialRequest = {
    admin_id: '', // 초기 admin ID
    password: '', // 초기 비밀번호
  };

  const [request, setRequest] = useState(initialRequest); // 입력된 요청 상태 관리
  const [showPass, setShowPass] = useState(false); // 비밀번호 표시 여부 상태
  const [authMethod, setAuthMethod] = useState('FIDO'); // 인증 방법 기본값 (FIDO)
  const [otpCode, setOtpCode] = useState(''); // OTP 코드 상태
  // const [mpassType, setMpassType] = (useState < 1) | (2 > 2); // 1 === otp, 2 === fido
  // const [fidoModalOpen, setFidoModalOpen] = useState(false);
  // const [params, setParams] = {}

  useEffect(() => {
    idRef.current.focus(); // 컴포넌트 마운트 시 아이디 입력 필드에 포커스
  }, []);

  const clearFieldValues = () => {
    setRequest(initialRequest); // 입력 필드 초기화
  };

  /**
   * 로그인 요청 처리 함수
   * @param {Event} e - 이벤트 객체
   */
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

  /**
   * 비밀번호 표시 상태 관리
   */
  const handleMouseUp = () => {
    setShowPass(false);
  };

  const handleMouseDown = () => {
    setShowPass(true);
  };

  /**
   * 엔터 키로 입력 필드 간 이동 처리
   * @param {Event} e - 이벤트 객체
   * @param {string} id - 입력 필드 ID
   */
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

  /**
   * 로그인 없이 홈페이지로 이동
   */
  const handleGoHomeWithoutLogin = () => {
    navigate('/main/map'); // 홈페이지 경로로 이동
  };

  return (
    <>
      <div className="relative h-screen w-screen bg-cover bg-center">
        <div className="flex h-full w-full">
          {/* 배경 이미지 */}
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
                    {/* 헤더 텍스트 */}
                    <h1 className="text-5xl font-bold tracking-tight text-gray-900">
                      TestCourse
                    </h1>
                    <h2 className="text-4xl font-semibold tracking-tight text-blue-700">
                      ManagementSystem
                    </h2>
                  </div>

                  <div className="bg-white px-2 py-12 sm:px-2 mt-10 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="space-y-6">
                      {/* 아이디 입력 필드 */}
                      <div>
                        <label className="block text-base font-semibold leading-6 text-gray-700">
                          아이디
                        </label>
                        <div className="mt-2">
                          <input
                            className="block w-full rounded-lg border-0 py-3 text-gray-900 shadow ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 pl-3"
                            placeholder="아이디를 입력하세요"
                            ref={idRef}
                            id="userId"
                            name="userId"
                            type="text"
                            autoComplete="off"
                            value={request.admin_id}
                            onKeyDown={(e) => handleKeyDown(e, 'id')}
                            onChange={(e) =>
                              setRequest((prev) => ({
                                ...prev,
                                admin_id: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      {/* 비밀번호 입력 필드 */}
                      <div>
                        <label className="block text-base font-semibold leading-6 text-gray-700">
                          비밀번호
                        </label>
                        <div className="relative w-full max-w-md mt-2">
                          <input
                            placeholder="비밀번호를 입력하세요"
                            className="block w-full rounded-lg shadow border-0 py-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 pl-3"
                            ref={passRef}
                            id="password"
                            name="password"
                            type={showPass ? 'text' : 'password'}
                            value={request.password}
                            onKeyDown={(e) => handleKeyDown(e, 'pass')}
                            onChange={(e) =>
                              setRequest((prev) => ({
                                ...prev,
                                password: e.target.value,
                              }))
                            }
                          />
                          <button
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                          >
                            {showPass ? (
                              <FaRegEye className="-ml-0.5 h-5 w-5 text-gray-400" />
                            ) : (
                              <FaRegEyeSlash className="-ml-0.5 h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* 인증 방법 선택 */}
                      <div className="mt-4">
                        <label className="block text-base font-semibold leading-6 text-gray-700">
                          인증 방법 선택
                        </label>
                        <div className="flex items-center space-x-4 mt-2">
                          <button
                            className={`px-4 py-2 rounded-lg ${
                              authMethod === 'FIDO'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                            onClick={() => setAuthMethod('FIDO')}
                          >
                            FIDO
                          </button>
                          <button
                            className={`px-4 py-2 rounded-lg ${
                              authMethod === 'OTP'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                            onClick={() => setAuthMethod('OTP')}
                          >
                            OTP
                          </button>
                          {authMethod === 'OTP' && (
                            <input
                              type="text"
                              className="block w-full max-w-xs rounded-lg border-0 py-2 px-3 text-gray-900 shadow ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                              placeholder="OTP 번호 입력"
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value)}
                            />
                          )}
                        </div>
                      </div>

                      {/* 로그인 버튼 */}
                      <div>
                        <button
                          ref={btnLoginRef}
                          className="flex w-full justify-center items-center rounded-lg bg-blue-600 px-3 py-4 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                          onClick={handleSubmit}
                        >
                          로그인
                        </button>
                      </div>

                      {/* 메인 페이지 이동 버튼 */}
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
