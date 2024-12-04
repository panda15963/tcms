import axios from 'axios';
import { nonAuthInstance } from '../server/MapAxiosConfig';

/**
 * 취소 토큰 생성 함수
 * @returns {Object} - 취소 토큰과 취소 함수가 포함된 객체 반환
 */
const createCancelToken = () => {
  let cancel;
  const token = new axios.CancelToken((c) => {
    cancel = c;
  });
  return { token, cancel };
};

/**
 * 관리자 정보 가져오기
 * @param {string} adminId - 가져올 관리자 ID
 * @returns {Object} - 요청 결과 데이터와 취소 함수 포함
 */
export async function getAdmin(adminId) {
  try {
    const { token, cancel } = createCancelToken();
    const response = await nonAuthInstance.get(`/admin/${adminId}`, {
      cancelToken: token,
    });
    return { data: response.data, cancel };
  } catch (error) {
    // 에러 처리
    if (axios.isCancel(error)) {
      console.log('[getAdmin] 요청 취소됨 : ', error.message);
      return { data: null, error: '요청이 취소되었습니다.' };
    }
    console.log('[getAdmin] 요청 에러 : ', error);
    return { data: null, error: error };
  }
}

/**
 * 모든 관리자 목록 가져오기
 * @returns {Object} - 요청 결과 데이터와 취소 함수 포함
 */
export async function getAdmins() {
  try {
    const { token, cancel } = createCancelToken();
    const response = await nonAuthInstance.get(`/admin/admins`, {
      cancelToken: token,
    });
    return { data: response.data, cancel };
  } catch (error) {
    // 에러 처리
    if (axios.isCancel(error)) {
      console.log('[getAdmins] 요청 취소됨 : ', error.message);
      return { data: null, error: '요청이 취소되었습니다.' };
    }
    console.log('[getAdmins] 요청 에러 : ', error);
    return { data: null, error: error.message };
  }
}

/**
 * 관리자 추가
 * @param {Object} data - 추가할 관리자 데이터
 * @returns {Object} - 요청 결과 데이터
 */
export async function addAdmin(data) {
  try {
    console.log('[addAdmin][data] => ', data);
    const response = await nonAuthInstance.put(`/admin/add`, data);
    return { data: response.data };
  } catch (error) {
    // 에러 처리
    if (axios.isCancel(error)) {
      console.log('[addAdmin] 요청 취소됨 : ', error.message);
      return { data: null, error: '요청이 취소되었습니다.' };
    }
    console.log('[addAdmin] 요청 에러 : ', error);
    return { data: null, error: error };
  }
}

/**
 * 관리자 정보 업데이트
 * @param {Object} data - 업데이트할 관리자 데이터
 * @returns {Object} - 요청 결과 데이터
 */
export async function updateAdmin(data) {
  try {
    console.log('[updateAdmin][data] => ', data);
    const response = await nonAuthInstance.post(`/admin/update`, data);
    return { data: response.data };
  } catch (error) {
    // 에러 처리
    if (axios.isCancel(error)) {
      console.log('[updateAdmin] 요청 취소됨 : ', error.message);
      return { data: null, error: '요청이 취소되었습니다.' };
    }
    console.log('[updateAdmin] 요청 에러 : ', error);
    return { data: null, error: error };
  }
}

/**
 * 관리자 삭제
 * @param {string} adminId - 삭제할 관리자 ID
 * @returns {Object} - 요청 결과 데이터
 */
export async function deleteAdmin(adminId) {
  try {
    console.log('[deleteAdmin][adminId] => ', adminId);
    const response = await nonAuthInstance.delete(`/admin/` + adminId);
    return { data: response.data };
  } catch (error) {
    // 에러 처리
    if (axios.isCancel(error)) {
      console.log('[deleteAdmin] 요청 취소됨 : ', error.message);
      return { data: null, error: '요청이 취소되었습니다.' };
    }
    console.log('[deleteAdmin] 요청 에러 : ', error);
    return { data: null, error: error };
  }
}
