export const menuItems = (t) => [
  { id: 1, name: t('StatNavBar.TCIC'), link: '/configuration' }, // 도구 설정 정보 변경 사항
  { id: 2, name: t('StatNavBar.TECT'), link: '/countsByTool' }, // 도구 실행 횟수(도구 별)
  { id: 3, name: t('StatNavBar.TECV'), link: '/countsByVersion' }, // 도구 실행 횟수(버전 별)
  { id: 4, name: t('StatNavBar.CTL'), link: '/logs' }, // 도구 로그 확인
  { id: 5, name: t('StatNavBar.TUSRT'), link: '/realTimeStatus' }, // TC 기반 도구 실시간 사용 현황
  { id: 6, name: t('StatNavBar.RTTUI'), link: '/realTimeUsageInfo' }, // 실시간 도구 사용 정보
  { id: 7, name: t('StatNavBar.TUCF'), link: '/usageFunctionCounts' }, // 도구 기능별 사용 횟수
];
