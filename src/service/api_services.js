import axios from 'axios';
import { nonAuthInstance } from '../server/MapAxiosConfig';

const createCancelToken = () => {
  let cancel;
  const token = new axios.CancelToken((c) => {
    cancel = c;
  });
  return { token, cancel };
};

export async function getAdmin(adminId) {
  try {
    const { token, cancel } = createCancelToken();
    const response = await nonAuthInstance.get(`/admin/${adminId}`, {
      cancelToken: token,
    });
    return { data: response.data, cancel };
  } catch (error) {
    // Error handling
    if (axios.isCancel(error)) {
      console.log('[getAdmin] Request canceled : ', error.message);
      return { data: null, error: 'Request was canceled' };
    }
    console.log('[getAdmin] Request error : ', error);
    return { data: null, error: error };
  }
}

export async function getAdmins() {
  try {
    const { token, cancel } = createCancelToken();
    const response = await nonAuthInstance.get(`/admin/admins`, {
      cancelToken: token,
    });
    return { data: response.data, cancel };
  } catch (error) {
    // Error handling
    if (axios.isCancel(error)) {
      console.log('[getAdmins] Request canceled : ', error.message);
      return { data: null, error: 'Request was canceled' };
    }
    console.log('[getAdmins] Request error : ', error);
    return { data: null, error: error.message };
  }
}

export async function addAdmin(data) {
  try {
    // const { token, cancel } = createCancelToken();
    console.log('[addAdmin][data] => ', data);
    const response = await nonAuthInstance.put(`/admin/add`, data);
    return { data: response.data };
  } catch (error) {
    // Error handling
    if (axios.isCancel(error)) {
      console.log('[addAdmin] Request canceled : ', error.message);
      return { data: null, error: 'Request was canceled' };
    }
    console.log('[addAdmin] Request error : ', error);
    return { data: null, error: error };
  }
}

export async function updateAdmin(data) {
  try {
    // const { token, cancel } = createCancelToken();
    console.log('[updateAdmin][data] => ', data);
    const response = await nonAuthInstance.post(`/admin/update`, data);
    return { data: response.data };
  } catch (error) {
    // Error handling
    if (axios.isCancel(error)) {
      console.log('[updateAdmin] Request canceled : ', error.message);
      return { data: null, error: 'Request was canceled' };
    }
    console.log('[updateAdmin] Request error : ', error);
    return { data: null, error: error };
  }
}

export async function deleteAdmin(adminId) {
  try {
    // const { token, cancel } = createCancelToken();
    console.log('[deleteAdmin][adminId] => ', adminId);
    const response = await nonAuthInstance.delete(`/admin/` + adminId);
    return { data: response.data };
  } catch (error) {
    // Error handling
    if (axios.isCancel(error)) {
      console.log('[deleteAdmin] Request canceled : ', error.message);
      return { data: null, error: 'Request was canceled' };
    }
    console.log('[deleteAdmin] Request error : ', error);
    return { data: null, error: error };
  }
}
