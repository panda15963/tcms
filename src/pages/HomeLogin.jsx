import { useEffect, useRef, useState } from 'react';
import Background from '../assets/images/background.jpg';
import { Link, useNavigate } from 'react-router-dom';
import useLoadingBar from '../hooks/useLoading';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import { FaRegEyeSlash, FaRegEye } from 'react-icons/fa';
import { ToastTypes } from '../context/ToastProvider';

export default function Login() {
  const navigate = useNavigate();
  const { setLoading } = useLoadingBar();
  const { login } = useAuth();
  const { showToast } = useToast();

  console.log(setLoading); // 함수가 출력되는지 확인

  const idRef = useRef();
  const passRef = useRef();
  const btnLoginRef = useRef();

  const initialRequest = {
    admin_id: '',
    password: '',
  };

  const [request, setRequest] = useState(initialRequest);
  const [showPass, setShowPass] = useState(false);
  const [authMethod, setAuthMethod] = useState('FIDO'); // FIDO가 기본 선택
  const [otpCode, setOtpCode] = useState(''); // OTP 번호 상태

  useEffect(() => {
    idRef.current.focus();
  }, []);

  const handleSubmit = async (e) => {
    // e.preventDefault();

    console.log('hello');
    setLoading(true);

    try {
      //Call api auth endpoint
      setLoading(true);
      console.log('[Authentication request] ', request);
      await authenticate(request).then((response) => {
        console.log(
          '🚀 ~ file: Login.jsx:63 ~ handleSubmit ~ response:',
          response,
        );
        if (response && response.data && response.data.resultCode === 200) {
          if (response.data.detail && isString(response.data.detail)) {
            const token = response.data.detail;
            const decodedToken = jwtDecode(token);
            console.log('🚀 ~ awaitauthenticate ~ decodedToken:', decodedToken);
            Cookies.set('access-token', token, { expires: 1 });
            const adminInfo = {
              admin_seq: decodedToken.sub ?? '',
              admin_id: decodedToken.admin_id,
              admin_level_cd: decodedToken.admin_level_cd,
              admin_level_nm: decodedToken.admin_level_nm,
              admin_name: decodedToken.admin_name,
              admin_type: decodedToken.admin_type,
            };
            axiosInstance.interceptors.request.use(
              (config) => {
                config.headers['Authorization'] = `Bearer ${token}`;
                return config;
              },
              (error) => {
                return Promise.reject(error);
              },
            );
            setLoading(false);

            login(adminInfo);
            // setAuth(adminInfo);
            if (
              adminInfo.admin_level_cd === ROLES.Admin ||
              adminInfo.admin_level_cd === ROLES.Volunteer
            ) {
              // navigate('/ad/dashboard', { replace: true });
            } else {
              // navigate('/user/dashboard', { replace: true });
            }
          }
        } else if (response.data && response.data.resultCode === 404) {
          setLoading(false);
          showToast(
            ToastTypes.ERROR,
            '실패',
            '아이디 또는 비밀번호를 잘못 입력했습니다. 입력하신 내용을 다시 확인해주세요.',
          );
        } else {
          showToast(
            ToastTypes.ERROR,
            '실패',
            '아이디 또는 비밀번호를 잘못 입력했습니다. 입력하신 내용을 다시 확인해주세요.',
          );
        }
      });
    } catch (e) {
      setLoading(false);
      console.log('Error complicated to login => ', e);
      showToast(
        ToastTypes.ERROR,
        '실패',
        '아이디(로그인 전용 아이디) 또는 비밀번호를 잘못 입력했습니다. 입력하신 내용을 다시 확인해주세요.',
      );
    }
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
          <div className="relative flex h-full w-full">
            <div className="flex-[7]" />
            <div className="flex-[3] flex justify-center items-center bg-white">
              <div className="w-full">
                <div className="w-full justify-center px-6 py-12 ">
                  <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    {/* TestCourse ManagementSystem */}
                    <h1 className="text-5xl font-bold tracking-tight text-gray-900">
                      TestCourse
                    </h1>
                    <h2 className="text-4xl font-semibold tracking-tight text-blue-700">
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
                            className="block w-full rounded-lg border-0 py-3 text-gray-900 shadow ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 pl-3"
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
                            className="block w-full rounded-lg shadow border-0 py-3 text-gray-900  ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 pl-3"
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
                            className={`px-4 py-2 rounded-lg ${authMethod === 'FIDO' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                            onClick={() => setAuthMethod('FIDO')}
                          >
                            FIDO
                          </button>
                          <button
                            className={`px-4 py-2 rounded-lg ${authMethod === 'OTP' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                            onClick={() => setAuthMethod('OTP')}
                          >
                            OTP
                          </button>

                          {/* OTP 입력 필드: OTP가 선택된 경우에만 나타남 */}
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

                      <div>
                        <button
                          ref={btnLoginRef}
                          className="flex w-full justify-center items-center rounded-lg bg-blue-700 px-3 py-4 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                          onClick={() => handleSubmit()}
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

  // 2024.10.22 이전 버전 로그인 화면
  // return (
  //   <div>
  //     {/* 컨테이너: 로그인 폼을 중앙에 배치하고, 테두리와 그림자 추가 */}
  //     <div className="container m-auto p-auto border-2 border-gray-500 shadow-lg shadow-gray-500 w-1/4 mt-48">
  //       <div className="flex min-h-full flex-1 flex-col justify-center py-6 lg:px-8">
  //         {/* 제목 섹션 */}
  //         <div className="sm:mx-auto sm:w-full sm:max-w-sm">
  //           <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
  //             Test Course <br />
  //             Management System
  //           </h2>
  //         </div>

  //         {/* 로그인 폼 섹션 */}
  //         <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm space-y-6">
  //           {/* 로그인 폼 */}
  //           <form className="space-y-6" action="#" method="POST">
  //             {/* 이메일 입력 필드 */}
  //             <div>
  //               <label
  //                 htmlFor="email"
  //                 className="block text-sm font-medium leading-6 text-gray-900"
  //               >
  //                 이메일
  //               </label>
  //               <div className="mt-2">
  //                 <input
  //                   id="email"
  //                   name="email"
  //                   type="email"
  //                   autoComplete="email"
  //                   required
  //                   className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
  //                 />
  //               </div>
  //             </div>

  //             {/* 비밀번호 입력 필드 */}
  //             <div>
  //               <div className="flex items-center justify-between">
  //                 <label
  //                   htmlFor="password"
  //                   className="block text-sm font-medium leading-6 text-gray-900"
  //                 >
  //                   비밀번호
  //                 </label>
  //               </div>
  //               <div className="mt-2">
  //                 <input
  //                   id="password"
  //                   name="password"
  //                   type="password"
  //                   autoComplete="current-password"
  //                   required
  //                   className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
  //                 />
  //               </div>
  //             </div>

  //             {/* 로그인 정보 저장 체크박스 */}
  //             <div className="flex items-center justify-between">
  //               <div className="flex items-center">
  //                 <input
  //                   id="remember_me"
  //                   name="remember_me"
  //                   type="checkbox"
  //                   className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
  //                 />
  //                 <label
  //                   htmlFor="remember_me"
  //                   className="block ml-2 text-sm text-gray-900"
  //                 >
  //                   로그인 정보 저장
  //                 </label>
  //               </div>
  //             </div>

  //             {/* 로그인 버튼 */}
  //             <button
  //               type="submit"
  //               className="w-full flex justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
  //             >
  //               로그인
  //             </button>

  //             {/* 메인페이지로 가는 링크 */}
  //             <div>
  //               <Link
  //                 to="/main/map"
  //                 className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
  //               >
  //                 바로 메인페이지로 가기
  //               </Link>
  //             </div>
  //           </form>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
}
