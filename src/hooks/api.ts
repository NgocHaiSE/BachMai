// src/hooks/api.ts
import { useState, useEffect } from 'react';
import { apiClient } from '../libs/api';

// Generic hook for API calls
export function useApi<T>(
  apiCall: () => Promise<any>,
  dependencies: any[] = [],
  immediate = true
) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      setData(response.success ? response.data : response);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  return { data, loading, error, refetch: execute };
}

// Mutation hook
export function useMutation<T>(apiCall: (data: any) => Promise<any>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (data: any): Promise<T> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall(data);
      return response.success ? response.data : response;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

// Patient hooks
export function usePatients(searchTerm = '') {
  return useApi(
    () => searchTerm ? apiClient.patients.search(searchTerm) : apiClient.patients.getAll(),
    [searchTerm]
  );
}

export function usePatient(id: string) {
  return useApi(
    () => apiClient.patients.getById(id),
    [id],
    !!id
  );
}

export function useCreatePatient() {
  return useMutation(apiClient.patients.create);
}

export function useUpdatePatient() {
  return useMutation((data: { id: string; [key: string]: any }) => {
    const { id, ...updateData } = data;
    return apiClient.patients.update(id, updateData);
  });
}

export function useDeletePatient() {
  return useMutation(apiClient.patients.delete);
}

// Appointment hooks
export function useAppointments(params: any = {}) {
  return useApi(
    () => apiClient.appointments.search(params),
    [JSON.stringify(params)]
  );
}

export function useAppointment(id: string) {
  return useApi(
    () => apiClient.appointments.getById(id),
    [id],
    !!id
  );
}

export function useCreateAppointment() {
  return useMutation(apiClient.appointments.create);
}

export function useUpdateAppointment() {
  return useMutation((data: { id: string; [key: string]: any }) => {
    const { id, ...updateData } = data;
    return apiClient.appointments.update(id, updateData);
  });
}

export function useUpdateAppointmentStatus() {
  return useMutation((data: { id: string; TrangThaiMoi: string }) => {
    const { id, ...updateData } = data;
    return apiClient.appointments.updateStatus(id, updateData);
  });
}

export function useDeleteAppointment() {
  return useMutation(apiClient.appointments.delete);
}

// Staff hooks
export function useStaff(role?: string) {
  return useApi(
    () => role ? apiClient.staff.search({ role }) : apiClient.staff.getAll(),
    [role]
  );
}

export function useStaffMember(id: string) {
  return useApi(
    () => apiClient.staff.getById(id),
    [id],
    !!id
  );
}

export function useCreateStaff() {
  return useMutation(apiClient.staff.create);
}

export function useUpdateStaff() {
  return useMutation((data: { id: string; [key: string]: any }) => {
    const { id, ...updateData } = data;
    return apiClient.staff.update(id, updateData);
  });
}

export function useDeleteStaff() {
  return useMutation(apiClient.staff.delete);
}

// Transfer request hooks
export function useTransferRequests(params: any = {}) {
  return useApi(
    () => apiClient.transferRequests.search(params),
    [JSON.stringify(params)]
  );
}

export function useTransferRequest(id: string) {
  return useApi(
    () => apiClient.transferRequests.getById(id),
    [id],
    !!id
  );
}

export function useCreateTransferRequest() {
  return useMutation(apiClient.transferRequests.create);
}

export function useUpdateTransferRequest() {
  return useMutation((data: { id: string; [key: string]: any }) => {
    const { id, ...updateData } = data;
    return apiClient.transferRequests.update(id, updateData);
  });
}

export function useApproveTransferRequest() {
  return useMutation((data: { id: string; [key: string]: any }) => {
    const { id, ...updateData } = data;
    return apiClient.transferRequests.approve(id, updateData);
  });
}

export function useDeleteTransferRequest() {
  return useMutation(apiClient.transferRequests.delete);
}

// Transfer record hooks
export function useTransferRecords(params: any = {}) {
  return useApi(
    () => apiClient.transferRecords.search(params),
    [JSON.stringify(params)]
  );
}

export function useTransferRecord(id: string) {
  return useApi(
    () => apiClient.transferRecords.getById(id),
    [id],
    !!id
  );
}

export function useCreateTransferRecord() {
  return useMutation(apiClient.transferRecords.create);
}

export function useUpdateTransferRecord() {
  return useMutation((data: { id: string; [key: string]: any }) => {
    const { id, ...updateData } = data;
    return apiClient.transferRecords.update(id, updateData);
  });
}

export function useUpdateTransferRecordStatus() {
  return useMutation((data: { id: string; [key: string]: any }) => {
    const { id, ...updateData } = data;
    return apiClient.transferRecords.updateStatus(id, updateData);
  });
}

export function useDeleteTransferRecord() {
  return useMutation(apiClient.transferRecords.delete);
}

// Prescription hooks
export function usePrescriptions(params: any = {}) {
  return useApi(
    () => apiClient.prescriptions.search(params),
    [JSON.stringify(params)]
  );
}

export function usePrescription(id: string) {
  return useApi(
    () => apiClient.prescriptions.getById(id),
    [id],
    !!id
  );
}

export function usePrescriptionDetails(id: string) {
  return useApi(
    () => apiClient.prescriptions.getDetails(id),
    [id],
    !!id
  );
}

export function useCreatePrescription() {
  return useMutation(apiClient.prescriptions.create);
}

export function useUpdatePrescription() {
  return useMutation((data: { id: string; [key: string]: any }) => {
    const { id, ...updateData } = data;
    return apiClient.prescriptions.update(id, updateData);
  });
}

export function useDeletePrescription() {
  return useMutation(apiClient.prescriptions.delete);
}

export function useConfirmPrescriptionPayment() {
  return useMutation(apiClient.prescriptions.confirmPayment);
}

export function useAddMedicineToPrescription() {
  return useMutation(apiClient.prescriptions.addMedicine);
}

// Medicine hooks
export function useMedicines(params: any = {}) {
  return useApi(
    () => Object.keys(params).length > 0 ? apiClient.medicines.search(params) : apiClient.medicines.getAll(),
    [JSON.stringify(params)]
  );
}

export function useMedicine(id: string) {
  return useApi(
    () => apiClient.medicines.getById(id),
    [id],
    !!id
  );
}

export function useMedicinesInStock() {
  return useApi(() => apiClient.medicines.getInStock());
}

export function useExpiredMedicines() {
  return useApi(() => apiClient.medicines.getExpired());
}

// Vaccine hooks
export function useVaccines(params: any = {}) {
  return useApi(
    () => Object.keys(params).length > 0 ? apiClient.vaccines.search(params) : apiClient.vaccines.getAll(),
    [JSON.stringify(params)]
  );
}

export function useVaccine(id: string) {
  return useApi(
    () => apiClient.vaccines.getById(id),
    [id],
    !!id
  );
}

export function useVaccinesInStock() {
  return useApi(() => apiClient.vaccines.getInStock());
}

export function useExpiredVaccines() {
  return useApi(() => apiClient.vaccines.getExpired());
}

// Schedule hooks
export function useWeeklySchedule(params: any) {
  return useApi(
    () => apiClient.schedules.getWeekly(params),
    [JSON.stringify(params)],
    !!params.TuNgay && !!params.DenNgay
  );
}

export function useScheduleStats(month?: string) {
  return useApi(
    () => apiClient.schedules.getStats(month ? { thang: month } : {}),
    [month]
  );
}

// Shift hooks
export function useShift(id: string) {
  return useApi(
    () => apiClient.schedules.shifts.getById(id),
    [id],
    !!id
  );
}

export function useCreateShift() {
  return useMutation(apiClient.schedules.shifts.create);
}

export function useUpdateShift() {
  return useMutation((data: { id: string; [key: string]: any }) => {
    const { id, ...updateData } = data;
    return apiClient.schedules.shifts.update(id, updateData);
  });
}

export function useConfirmShift() {
  return useMutation(apiClient.schedules.shifts.confirm);
}

export function useDeleteShift() {
  return useMutation(apiClient.schedules.shifts.delete);
}



// Shift change request hooks
export function useShiftChangeRequest(id: string) {
  return useApi(
    () => apiClient.schedules.shiftChanges.getById(id),
    [id],
    !!id
  );
}

export function useCreateShiftChangeRequest() {
  return useMutation(apiClient.schedules.shiftChanges.create);
}

export function useUpdateShiftChangeRequest() {
  return useMutation((data: { id: string; [key: string]: any }) => {
    const { id, ...updateData } = data;
    return apiClient.schedules.shiftChanges.update(id, updateData);
  });
}

export function useApproveShiftChangeRequest() {
  return useMutation((data: { id: string; [key: string]: any }) => {
    const { id, ...updateData } = data;
    return apiClient.schedules.shiftChanges.approve(id, updateData);
  });
}

export function useDeleteShiftChangeRequest() {
  return useMutation(apiClient.schedules.shiftChanges.delete);
}

// Leave request hooks
export function useLeaveRequest(id: string) {
  return useApi(
    () => apiClient.schedules.leaves.getById(id),
    [id],
    !!id
  );
}

export function useCreateLeaveRequest() {
  return useMutation(apiClient.schedules.leaves.create);
}

export function useUpdateLeaveRequest() {
  return useMutation((data: { id: string; [key: string]: any }) => {
    const { id, ...updateData } = data;
    return apiClient.schedules.leaves.update(id, updateData);
  });
}

export function useApproveLeaveRequest() {
  return useMutation((data: { id: string; [key: string]: any }) => {
    const { id, ...updateData } = data;
    return apiClient.schedules.leaves.approve(id, updateData);
  });
}

export function useDeleteLeaveRequest() {
  return useMutation(apiClient.schedules.leaves.delete);
}

export function useLeaveAffectedShifts(id: string) {
  return useApi(
    () => apiClient.schedules.leaves.getAffectedShifts(id),
    [id],
    !!id
  );
}

// Dashboard hooks
export function useDashboardStats() {
  return useApi(() => apiClient.dashboard.getStats());
}

export function useDashboardActivity() {
  return useApi(() => apiClient.dashboard.getRecentActivity());
}

// Department hooks
export function useDepartments(searchTerm = '') {
  return useApi(
    () => searchTerm ? apiClient.departments.search(searchTerm) : apiClient.departments.getAll(),
    [searchTerm]
  );
}

export function useDepartment(id: string) {
  return useApi(
    () => apiClient.departments.getById(id),
    [id],
    !!id
  );
}


