import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

export default function TransferManagement() {
  const [activeTab, setActiveTab] = useState("requests");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản Lý Chuyển Viện</h2>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("requests")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "requests"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Yêu Cầu Chuyển Viện
          </button>
          <button
            onClick={() => setActiveTab("records")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "records"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Hồ Sơ Chuyển Viện
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "requests" && <TransferRequests />}
      {activeTab === "records" && <TransferRecords />}
    </div>
  );
}

function TransferRequests() {
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any>(null);

  const requests = useQuery(api.transferRequests.list);
  const patients = useQuery(api.patients.list);
  const staff = useQuery(api.staff.listByRole, { role: "doctor" });
  const createRequest = useMutation(api.transferRequests.create);
  const updateRequest = useMutation(api.transferRequests.update);
  const updateStatus = useMutation(api.transferRequests.updateStatus);
  const deleteRequest = useMutation(api.transferRequests.remove);

  const handleSubmit = async (formData: any) => {
    try {
      if (editingRequest) {
        await updateRequest({ id: editingRequest._id, ...formData });
        toast.success("Cập nhật yêu cầu chuyển viện thành công");
      } else {
        await createRequest(formData);
        toast.success("Tạo yêu cầu chuyển viện thành công");
      }
      setShowForm(false);
      setEditingRequest(null);
    } catch (error) {
      toast.error("Lưu yêu cầu chuyển viện thất bại");
    }
  };

  const handleStatusUpdate = async (id: Id<"transferRequests">, status: string) => {
    try {
      await updateStatus({ id, status: status as any });
      toast.success("Cập nhật trạng thái thành công");
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const handleDelete = async (id: Id<"transferRequests">) => {
    if (confirm("Bạn có chắc chắn muốn xóa yêu cầu chuyển viện này?")) {
      try {
        await deleteRequest({ id });
        toast.success("Xóa yêu cầu chuyển viện thành công");
      } catch (error) {
        toast.error("Xóa yêu cầu chuyển viện thất bại");
      }
    }
  };

  const handleEdit = (request: any) => {
    setEditingRequest(request);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Yêu Cầu Chuyển Viện</h3>
        <button
          onClick={() => {
            setEditingRequest(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tạo Yêu Cầu Chuyển Viện
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã Yêu Cầu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bệnh Nhân
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bác Sĩ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nơi Chuyển Đến
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mức Độ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng Thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests?.map((request) => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.requestCode}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.requestDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.patient?.firstName} {request.patient?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.patient?.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      BS. {request.staff?.firstName} {request.staff?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.staff?.department}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {request.destinationFacility}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.destinationAddress}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      request.priority === "urgent" ? "bg-red-100 text-red-800" :
                      request.priority === "high" ? "bg-orange-100 text-orange-800" :
                      request.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {request.priority === "urgent" ? "Khẩn cấp" :
                       request.priority === "high" ? "Cao" :
                       request.priority === "medium" ? "Trung bình" :
                       "Thấp"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={request.status}
                      onChange={(e) => handleStatusUpdate(request._id, e.target.value)}
                      className={`px-2 py-1 text-xs rounded-full border-0 ${
                        request.status === "completed" ? "bg-green-100 text-green-800" :
                        request.status === "approved" ? "bg-blue-100 text-blue-800" :
                        request.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}
                    >
                      <option value="pending">Chờ xử lý</option>
                      <option value="approved">Đã duyệt</option>
                      <option value="rejected">Từ chối</option>
                      <option value="completed">Hoàn thành</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(request)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(request._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <TransferRequestForm
          request={editingRequest}
          patients={patients || []}
          staff={staff || []}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingRequest(null);
          }}
        />
      )}
    </div>
  );
}

function TransferRecords() {
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const records = useQuery(api.transferRecords.list);
  const patients = useQuery(api.patients.list);
  const staff = useQuery(api.staff.listByRole, { role: "doctor" });
  const requests = useQuery(api.transferRequests.list);
  const createRecord = useMutation(api.transferRecords.create);
  const updateRecord = useMutation(api.transferRecords.update);
  const updateStatus = useMutation(api.transferRecords.updateStatus);
  const deleteRecord = useMutation(api.transferRecords.remove);

  const handleSubmit = async (formData: any) => {
    try {
      if (editingRecord) {
        await updateRecord({ id: editingRecord._id, ...formData });
        toast.success("Cập nhật hồ sơ chuyển viện thành công");
      } else {
        await createRecord(formData);
        toast.success("Tạo hồ sơ chuyển viện thành công");
      }
      setShowForm(false);
      setEditingRecord(null);
    } catch (error) {
      toast.error("Lưu hồ sơ chuyển viện thất bại");
    }
  };

  const handleStatusUpdate = async (id: Id<"transferRecords">, status: string) => {
    try {
      await updateStatus({ id, status: status as any });
      toast.success("Cập nhật trạng thái thành công");
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const handleDelete = async (id: Id<"transferRecords">) => {
    if (confirm("Bạn có chắc chắn muốn xóa hồ sơ chuyển viện này?")) {
      try {
        await deleteRecord({ id });
        toast.success("Xóa hồ sơ chuyển viện thành công");
      } catch (error) {
        toast.error("Xóa hồ sơ chuyển viện thất bại");
      }
    }
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Hồ Sơ Chuyển Viện</h3>
        <button
          onClick={() => {
            setEditingRecord(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tạo Hồ Sơ Chuyển Viện
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã Chuyển Viện
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bệnh Nhân
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bác Sĩ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nơi Chuyển Đến
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày Chuyển
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng Thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records?.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {record.transferCode}
                    </div>
                    <div className="text-sm text-gray-500">
                      {record.diagnosis}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {record.patient?.firstName} {record.patient?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {record.patient?.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      BS. {record.staff?.firstName} {record.staff?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {record.staff?.department}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {record.destinationFacility}
                    </div>
                    <div className="text-sm text-gray-500">
                      {record.destinationAddress}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {record.transferDate}
                    </div>
                    <div className="text-sm text-gray-500">
                      {record.estimatedTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={record.status}
                      onChange={(e) => handleStatusUpdate(record._id, e.target.value)}
                      className={`px-2 py-1 text-xs rounded-full border-0 ${
                        record.status === "completed" ? "bg-green-100 text-green-800" :
                        record.status === "approved" ? "bg-blue-100 text-blue-800" :
                        record.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}
                    >
                      <option value="pending">Chờ xử lý</option>
                      <option value="approved">Đã duyệt</option>
                      <option value="rejected">Từ chối</option>
                      <option value="completed">Hoàn thành</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(record)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(record._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <TransferRecordForm
          record={editingRecord}
          patients={patients || []}
          staff={staff || []}
          requests={requests || []}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingRecord(null);
          }}
        />
      )}
    </div>
  );
}

function TransferRequestForm({ request, patients, staff, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    patientId: request?.patientId || "",
    staffId: request?.staffId || "",
    treatmentDate: request?.treatmentDate || new Date().toISOString().split('T')[0],
    reason: request?.reason || "",
    requestDate: request?.requestDate || new Date().toISOString().split('T')[0],
    destinationAddress: request?.destinationAddress || "",
    destinationFacility: request?.destinationFacility || "",
    priority: request?.priority || "medium",
    notes: request?.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {request ? "Sửa Yêu Cầu Chuyển Viện" : "Tạo Yêu Cầu Chuyển Viện Mới"}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bệnh nhân
                </label>
                <select
                  required
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Chọn bệnh nhân</option>
                  {patients.map((patient: any) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bác sĩ
                </label>
                <select
                  required
                  value={formData.staffId}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Chọn bác sĩ</option>
                  {staff.map((doctor: any) => (
                    <option key={doctor._id} value={doctor._id}>
                      BS. {doctor.firstName} {doctor.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày điều trị
                </label>
                <input
                  type="date"
                  required
                  value={formData.treatmentDate}
                  onChange={(e) => setFormData({ ...formData, treatmentDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày yêu cầu
                </label>
                <input
                  type="date"
                  required
                  value={formData.requestDate}
                  onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lý do chuyển viện
              </label>
              <textarea
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cơ sở y tế chuyển đến
              </label>
              <input
                type="text"
                required
                value={formData.destinationFacility}
                onChange={(e) => setFormData({ ...formData, destinationFacility: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ cơ sở chuyển đến
              </label>
              <textarea
                required
                value={formData.destinationAddress}
                onChange={(e) => setFormData({ ...formData, destinationAddress: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mức độ ưu tiên
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
                <option value="urgent">Khẩn cấp</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {request ? "Cập nhật" : "Tạo"} Yêu Cầu
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function TransferRecordForm({ record, patients, staff, requests, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    requestId: record?.requestId || "",
    patientId: record?.patientId || "",
    staffId: record?.staffId || "",
    treatmentDate: record?.treatmentDate || new Date().toISOString().split('T')[0],
    reason: record?.reason || "",
    transferDate: record?.transferDate || new Date().toISOString().split('T')[0],
    estimatedTime: record?.estimatedTime || "",
    destinationAddress: record?.destinationAddress || "",
    destinationFacility: record?.destinationFacility || "",
    destinationPhone: record?.destinationPhone || "",
    diagnosis: record?.diagnosis || "",
    icd10Code: record?.icd10Code || "",
    pulse: record?.pulse || "",
    bloodPressure: record?.bloodPressure || "",
    respiratoryRate: record?.respiratoryRate || "",
    temperature: record?.temperature || "",
    consciousness: record?.consciousness || "",
    clinicalProgress: record?.clinicalProgress || "",
    treatmentPerformed: record?.treatmentPerformed || "",
    accompaniedPersonId: record?.accompaniedPersonId || "",
    notes: record?.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {record ? "Sửa Hồ Sơ Chuyển Viện" : "Tạo Hồ Sơ Chuyển Viện Mới"}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Thông tin cơ bản */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yêu cầu liên quan (tùy chọn)
                </label>
                <select
                  value={formData.requestId}
                  onChange={(e) => setFormData({ ...formData, requestId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Không có yêu cầu liên quan</option>
                  {requests.map((req: any) => (
                    <option key={req._id} value={req._id}>
                      {req.requestCode} - {req.patient?.firstName} {req.patient?.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bệnh nhân
                </label>
                <select
                  required
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Chọn bệnh nhân</option>
                  {patients.map((patient: any) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bác sĩ
                </label>
                <select
                  required
                  value={formData.staffId}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Chọn bác sĩ</option>
                  {staff.map((doctor: any) => (
                    <option key={doctor._id} value={doctor._id}>
                      BS. {doctor.firstName} {doctor.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ngày tháng */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày điều trị
                </label>
                <input
                  type="date"
                  required
                  value={formData.treatmentDate}
                  onChange={(e) => setFormData({ ...formData, treatmentDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày chuyển viện
                </label>
                <input
                  type="date"
                  required
                  value={formData.transferDate}
                  onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời gian dự kiến
                </label>
                <input
                  type="time"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Nơi chuyển đến */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cơ sở y tế chuyển đến
                </label>
                <input
                  type="text"
                  required
                  value={formData.destinationFacility}
                  onChange={(e) => setFormData({ ...formData, destinationFacility: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại cơ sở chuyển đến
                </label>
                <input
                  type="tel"
                  value={formData.destinationPhone}
                  onChange={(e) => setFormData({ ...formData, destinationPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ cơ sở chuyển đến
              </label>
              <textarea
                required
                value={formData.destinationAddress}
                onChange={(e) => setFormData({ ...formData, destinationAddress: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
              />
            </div>

            {/* Thông tin y tế */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chẩn đoán
                </label>
                <textarea
                  required
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã ICD10
                </label>
                <input
                  type="text"
                  value={formData.icd10Code}
                  onChange={(e) => setFormData({ ...formData, icd10Code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lý do chuyển viện
              </label>
              <textarea
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            {/* Dấu hiệu sinh tồn */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Dấu Hiệu Sinh Tồn</h4>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mạch
                  </label>
                  <input
                    type="text"
                    value={formData.pulse}
                    onChange={(e) => setFormData({ ...formData, pulse: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="lần/phút"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Huyết áp
                  </label>
                  <input
                    type="text"
                    value={formData.bloodPressure}
                    onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="mmHg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nhịp thở
                  </label>
                  <input
                    type="text"
                    value={formData.respiratoryRate}
                    onChange={(e) => setFormData({ ...formData, respiratoryRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="lần/phút"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nhiệt độ
                  </label>
                  <input
                    type="text"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="°C"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tình trạng ý thức
              </label>
              <input
                type="text"
                value={formData.consciousness}
                onChange={(e) => setFormData({ ...formData, consciousness: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="VD: Tỉnh táo, Lơ mơ, Hôn mê"
              />
            </div>

            {/* Thông tin lâm sàng */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diễn biến lâm sàng
                </label>
                <textarea
                  value={formData.clinicalProgress}
                  onChange={(e) => setFormData({ ...formData, clinicalProgress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Điều trị đã thực hiện
                </label>
                <textarea
                  value={formData.treatmentPerformed}
                  onChange={(e) => setFormData({ ...formData, treatmentPerformed: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã người đi cùng
                </label>
                <input
                  type="text"
                  value={formData.accompaniedPersonId}
                  onChange={(e) => setFormData({ ...formData, accompaniedPersonId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú bổ sung
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {record ? "Cập nhật" : "Tạo"} Hồ Sơ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}