// src/lib/api.ts
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const API_BASE_URL = 'http://localhost:3000/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Generic CRUD operations
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Patient APIs
  patients = {
    getAll: () => this.get<any>('/benh-nhan'),
    search: (tuKhoa: string) => this.get<any>(`/benh-nhan/search?tuKhoa=${encodeURIComponent(tuKhoa)}`),
    getById: (id: string) => this.get<any>(`/benh-nhan/${id}`),
    create: (data: any) => this.post<any>('/benh-nhan', data),
    update: (id: string, data: any) => this.put<any>(`/benh-nhan/${id}`, data),
    delete: (id: string) => this.delete<any>(`/benh-nhan/${id}`),
  };

  // Appointment APIs (PDK Kham)
  appointments = {
    search: (params: any) => {
      const query = new URLSearchParams(params).toString();
      return this.get<any>(`/pdk-kham/search?${query}`);
    },
    getById: (id: string) => this.get<any>(`/pdk-kham/${id}`),
    create: (data: any) => this.post<any>('/pdk-kham', data),
    update: (id: string, data: any) => this.put<any>(`/pdk-kham/${id}`, data),
    updateStatus: (id: string, data: any) => this.patch<any>(`/pdk-kham/${id}/trang-thai`, data),
    delete: (id: string) => this.delete<any>(`/pdk-kham/${id}`),
  };

  departments = {
    getAll: () => this.get<any>('/khoa'),
    search: (tuKhoa: string) => this.get<any>(`/khoa/search?tuKhoa=${encodeURIComponent(tuKhoa)}`),
    getById: (id: string) => this.get<any>(`/khoa/${id}`),
  };

  // Medical examination APIs
  examinations = {
    search: (params: any) => {
      const query = new URLSearchParams(params).toString();
      return this.get<any>(`/kham-benh/search?${query}`);
    },
    getById: (id: string) => this.get<any>(`/kham-benh/${id}`),
  };

  // Staff/User APIs
  staff = {
    getAll: () => this.get<any>('/users'),
    search: (params: any) => {
      const query = new URLSearchParams(params).toString();
      return this.get<any>(`/users/search?${query}`);
    },
    getById: (id: string) => this.get<any>(`/users/${id}`),
    create: (data: any) => this.post<any>('/users', data),
    update: (id: string, data: any) => this.put<any>(`/users/${id}`, data),
    delete: (id: string) => this.delete<any>(`/users/${id}`),
  };

  // Transfer request APIs
  transferRequests = {
    search: (params: any) => {
      const query = new URLSearchParams(params).toString();
      return this.get<any>(`/chuyen-vien/yeu-cau/search?${query}`);
    },
    getById: (id: string) => this.get<any>(`/chuyen-vien/yeu-cau/${id}`),
    create: (data: any) => this.post<any>('/chuyen-vien/yeu-cau', data),
    update: (id: string, data: any) => this.put<any>(`/chuyen-vien/yeu-cau/${id}`, data),
    approve: (id: string, data: any) => this.patch<any>(`/chuyen-vien/yeu-cau/${id}/xu-ly`, data),
    delete: (id: string) => this.delete<any>(`/chuyen-vien/yeu-cau/${id}`),
  };

  // Transfer records APIs
  transferRecords = {
    search: (params: any) => {
      const query = new URLSearchParams(params).toString();
      return this.get<any>(`/chuyen-vien/phieu/search?${query}`);
    },
    getById: (id: string) => this.get<any>(`/chuyen-vien/phieu/${id}`),
    create: (data: any) => this.post<any>('/chuyen-vien/phieu', data),
    update: (id: string, data: any) => this.put<any>(`/chuyen-vien/phieu/${id}`, data),
    updateStatus: (id: string, data: any) => this.patch<any>(`/chuyen-vien/phieu/${id}/trang-thai`, data),
    delete: (id: string) => this.delete<any>(`/chuyen-vien/phieu/${id}`),
  };

  // Prescription APIs
  prescriptions = {
    search: (params: any) => {
      const query = new URLSearchParams(params).toString();
      return this.get<any>(`/don-thuoc/search?${query}`);
    },
    getById: (id: string) => this.get<any>(`/don-thuoc/${id}`),
    getDetails: (id: string) => this.get<any>(`/don-thuoc/${id}/chi-tiet`),
    create: (data: any) => this.post<any>('/don-thuoc', data),
    update: (id: string, data: any) => this.put<any>(`/don-thuoc/${id}`, data),
    delete: (id: string) => this.delete<any>(`/don-thuoc/${id}`),
    confirmPayment: (id: string) => this.patch<any>(`/don-thuoc/${id}/thanh-toan`, {}),
    addMedicine: (data: any) => this.post<any>('/don-thuoc/chi-tiet', data),
  };

  // Medicine APIs
  medicines = {
    getAll: () => this.get<any>('/duoc-pham'),
    search: (params: any) => {
      const query = new URLSearchParams(params).toString();
      return this.get<any>(`/duoc-pham/search?${query}`);
    },
    getById: (id: string) => this.get<any>(`/duoc-pham/${id}`),
    getInStock: () => this.get<any>('/duoc-pham/con-hang'),
    getExpired: () => this.get<any>('/duoc-pham/het-han'),
    getByCategory: (categoryId: string) => this.get<any>(`/duoc-pham/loai/${categoryId}`),
    getBySupplier: (supplierId: string) => this.get<any>(`/duoc-pham/ncc/${supplierId}`),
  };

  // Vaccine APIs
  vaccines = {
    getAll: () => this.get<any>('/vac-xin'),
    search: (params: any) => {
      const query = new URLSearchParams(params).toString();
      return this.get<any>(`/vac-xin/search?${query}`);
    },
    getById: (id: string) => this.get<any>(`/vac-xin/${id}`),
    getInStock: () => this.get<any>('/vac-xin/con-hang'),
    getExpired: () => this.get<any>('/vac-xin/het-han'),
  };

  // Schedule APIs
  schedules = {
    getWeekly: (params: any) => {
      const query = new URLSearchParams(params).toString();
      return this.get<any>(`/lich-lam-viec/lich-tuan?${query}`);
    },

    getStats: (params: any = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.get<any>(`/lich-lam-viec/thong-ke?${query}`);
    },

    // Shift management
    shifts: {
      getById: (id: string) => this.get<any>(`/lich-lam-viec/ca/${id}`),
      create: (data: any) => this.post<any>('/lich-lam-viec/ca', data),
      update: (id: string, data: any) => this.put<any>(`/lich-lam-viec/ca/${id}`, data),
      confirm: (id: string) => this.patch<any>(`/lich-lam-viec/ca/${id}/xac-nhan`, {}),
      delete: (id: string) => this.delete<any>(`/lich-lam-viec/ca/${id}`),
    },

    // Shift change requests
    shiftChanges: {
      getById: (id: string) => this.get<any>(`/lich-lam-viec/chuyen-ca/${id}`),
      list: (params: any = {}) => {
        const query = new URLSearchParams(params).toString();
        return this.get<any>(`/lich-lam-viec/chuyen-ca${query ? `?${query}` : ''}`);
      },
      create: (data: any) => this.post<any>('/lich-lam-viec/chuyen-ca', data),
      update: (id: string, data: any) => this.put<any>(`/lich-lam-viec/chuyen-ca/${id}`, data),
      approve: (id: string, data: any) => this.patch<any>(`/lich-lam-viec/chuyen-ca/${id}/xu-ly`, data),
      delete: (id: string) => this.delete<any>(`/lich-lam-viec/chuyen-ca/${id}`),
    },

    // Leave requests
    leaves: {
      getById: (id: string) => this.get<any>(`/lich-lam-viec/nghi-phep/${id}`),
      list: (params: any = {}) => {
        const query = new URLSearchParams(params).toString();
        return this.get<any>(`/lich-lam-viec/nghi-phep${query ? `?${query}` : ''}`);
      },
      create: (data: any) => this.post<any>('/lich-lam-viec/nghi-phep', data),
      update: (id: string, data: any) => this.put<any>(`/lich-lam-viec/nghi-phep/${id}`, data),
      approve: (id: string, data: any) => this.patch<any>(`/lich-lam-viec/nghi-phep/${id}/xu-ly`, data),
      delete: (id: string) => this.delete<any>(`/lich-lam-viec/nghi-phep/${id}`),
      getAffectedShifts: (id: string) => this.get<any>(`/lich-lam-viec/nghi-phep/${id}/ca-anh-huong`),
    },
  };

  // Dashboard APIs
  dashboard = {
    getStats: () => {
      // Since there's no dashboard API in backend, we'll simulate it
      return Promise.resolve({
        success: true,
        data: {
          todayAppointments: 0,
          totalPatients: 0,
          activeStaff: 0,
          pendingAppointments: 0,
          completedToday: 0,
        }
      });
    },
    getRecentActivity: () => {
      return Promise.resolve({
        success: true,
        data: {
          recentAppointments: [],
          recentPatients: [],
        }
      });
    },
  };
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;