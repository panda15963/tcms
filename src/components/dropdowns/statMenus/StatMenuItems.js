// 메뉴 항목을 정의하는 함수
export const menuItems = (t) => [
  {
    id: 1,
    name: t('StatNavBar.TECT'), // 다국어 지원을 위한 메뉴 이름 번역
    link: '/countsByTool', // 도구 실행 횟수(도구 별)
  },
  {
    id: 2,
    name: t('StatNavBar.TECV'), // 다국어 지원을 위한 메뉴 이름 번역
    link: '/countsByVersion', // 도구 실행 횟수(버전 별)
  },
  {
    id: 3,
    name: t('StatNavBar.TUCF'), // 다국어 지원을 위한 메뉴 이름 번역
    link: '/usageFunctionCounts', // 도구 기능별 사용 횟수
  },
  {
    id: 4,
    name: t('StatNavBar.TUSRT'), // 다국어 지원을 위한 메뉴 이름 번역
    link: '/realTimeStatus', // TC 기반 도구 실시간 사용 현황
  },
  {
    id: 5,
    name: t('StatNavBar.RTTUI'), // 다국어 지원을 위한 메뉴 이름 번역
    link: '/realTimeUsageInfo', // 실시간 도구 사용 정보
  },
  {
    id: 6,
    name: t('StatNavBar.CTL'), // 다국어 지원을 위한 메뉴 이름 번역
    link: '/logs', // 도구 로그 확인
  },
  {
    id: 7,
    name: t('StatNavBar.TCIC'), // 다국어 지원을 위한 메뉴 이름 번역
    link: '/configuration', // 도구 설정 정보 변경 사항
  },
];
