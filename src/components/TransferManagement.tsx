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
        <h2 className="text-2xl font-bold text-gray-900">Transfer Management</h2>
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
            Transfer Requests
          </button>
          <button
            onClick={() => setActiveTab("records")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "records"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Transfer Records
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
        toast.success("Transfer request updated successfully");
      } else {
        await createRequest(formData);
        toast.success("Transfer request created successfully");
      }
      setShowForm(false);
      setEditingRequest(null);
    } catch (error) {
      toast.error("Failed to save transfer request");
    }
  };

  const handleStatusUpdate = async (id: Id<"transferRequests">, status: string) => {
    try {
      await updateStatus({ id, status: status as any });
      toast.success("Request status updated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: Id<"transferRequests">) => {
    if (confirm("Are you sure you want to delete this transfer request?")) {
      try {
        await deleteRequest({ id });
        toast.success("Transfer request deleted successfully");
      } catch (error) {
        toast.error("Failed to delete transfer request");
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
        <h3 className="text-lg font-semibold text-gray-900">Transfer Requests</h3>
        <button
          onClick={() => {
            setEditingRequest(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Transfer Request
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
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
                      Dr. {request.staff?.firstName} {request.staff?.lastName}
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
                      {request.priority}
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
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(request)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(request._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
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
        toast.success("Transfer record updated successfully");
      } else {
        await createRecord(formData);
        toast.success("Transfer record created successfully");
      }
      setShowForm(false);
      setEditingRecord(null);
    } catch (error) {
      toast.error("Failed to save transfer record");
    }
  };

  const handleStatusUpdate = async (id: Id<"transferRecords">, status: string) => {
    try {
      await updateStatus({ id, status: status as any });
      toast.success("Record status updated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: Id<"transferRecords">) => {
    if (confirm("Are you sure you want to delete this transfer record?")) {
      try {
        await deleteRecord({ id });
        toast.success("Transfer record deleted successfully");
      } catch (error) {
        toast.error("Failed to delete transfer record");
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
        <h3 className="text-lg font-semibold text-gray-900">Transfer Records</h3>
        <button
          onClick={() => {
            setEditingRecord(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Transfer Record
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transfer Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transfer Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
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
                      Dr. {record.staff?.firstName} {record.staff?.lastName}
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
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(record)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(record._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
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
            {request ? "Edit Transfer Request" : "Create New Transfer Request"}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient
                </label>
                <select
                  required
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Patient</option>
                  {patients.map((patient: any) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor
                </label>
                <select
                  required
                  value={formData.staffId}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Doctor</option>
                  {staff.map((doctor: any) => (
                    <option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.firstName} {doctor.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment Date
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
                  Request Date
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
                Reason for Transfer
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
                Destination Facility
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
                Destination Address
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
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
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
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {request ? "Update" : "Create"} Request
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
            {record ? "Edit Transfer Record" : "Create New Transfer Record"}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related Request (Optional)
                </label>
                <select
                  value={formData.requestId}
                  onChange={(e) => setFormData({ ...formData, requestId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">No related request</option>
                  {requests.map((req: any) => (
                    <option key={req._id} value={req._id}>
                      {req.requestCode} - {req.patient?.firstName} {req.patient?.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient
                </label>
                <select
                  required
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Patient</option>
                  {patients.map((patient: any) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor
                </label>
                <select
                  required
                  value={formData.staffId}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Doctor</option>
                  {staff.map((doctor: any) => (
                    <option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.firstName} {doctor.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment Date
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
                  Transfer Date
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
                  Estimated Time
                </label>
                <input
                  type="time"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Destination */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination Facility
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
                  Destination Phone
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
                Destination Address
              </label>
              <textarea
                required
                value={formData.destinationAddress}
                onChange={(e) => setFormData({ ...formData, destinationAddress: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
              />
            </div>

            {/* Medical Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis
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
                  ICD10 Code
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
                Reason for Transfer
              </label>
              <textarea
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            {/* Vital Signs */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Vital Signs</h4>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pulse
                  </label>
                  <input
                    type="text"
                    value={formData.pulse}
                    onChange={(e) => setFormData({ ...formData, pulse: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="bpm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Pressure
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
                    Respiratory Rate
                  </label>
                  <input
                    type="text"
                    value={formData.respiratoryRate}
                    onChange={(e) => setFormData({ ...formData, respiratoryRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="breaths/min"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temperature
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
                Consciousness Level
              </label>
              <input
                type="text"
                value={formData.consciousness}
                onChange={(e) => setFormData({ ...formData, consciousness: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Alert, Drowsy, Unconscious"
              />
            </div>

            {/* Clinical Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clinical Progress
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
                  Treatment Performed
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
                  Accompanied Person ID
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
                  Additional Notes
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
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {record ? "Update" : "Create"} Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
