import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div>
      {/* 컨테이너: 로그인 폼을 중앙에 배치하고, 테두리와 그림자 추가 */}
      <div className="container m-auto p-auto border-2 border-gray-500 shadow-lg shadow-gray-500 w-1/4 mt-48">
        <div className="flex min-h-full flex-1 flex-col justify-center py-6 lg:px-8">
          {/* 제목 섹션 */}
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
              Test Course <br />
              Mgmt System
            </h2>
          </div>

          {/* 로그인 폼 섹션 */}
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm space-y-6">
            {/* 로그인 폼 */}
            <form className="space-y-6" action="#" method="POST">
              {/* 이메일 입력 필드 */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  이메일
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              {/* 비밀번호 입력 필드 */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    비밀번호
                  </label>
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              {/* 로그인 정보 저장 체크박스 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember_me"
                    name="remember_me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="remember_me"
                    className="block ml-2 text-sm text-gray-900"
                  >
                    로그인 정보 저장
                  </label>
                </div>
              </div>

              {/* 로그인 버튼 */}
              <button
                type="submit"
                className="w-full flex justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                로그인
              </button>

              {/* 메인페이지로 가는 링크 */}
              <div>
                <Link
                  to="/main/map"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  바로 메인페이지로 가기
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
