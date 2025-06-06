import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

export default function MedicalRecords() {
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const patients = useQuery(api.patients.list);
  const records = useQuery(
    api.medicalRecords.listByPatient,
    selectedPatientId ? { patientId: selectedPatientId as Id<"patients"> } : "skip"
  );
  const staff = useQuery(api.staff.list);
  const createRecord = useMutation(api.medicalRecords.create);
  const updateRecord = useMutation(api.medicalRecords.update);
  const deleteRecord = useMutation(api.medicalRecords.remove);

  const selectedPatient = patients?.find(p => p._id === selectedPatientId);

  const handleSubmit = async (formData: any) => {
    try {
      if (editingRecord) {
        await updateRecord({ id: editingRecord._id, ...formData });
        toast.success("Medical record updated successfully");
      } else {
        await createRecord({ ...formData, patientId: selectedPatientId as Id<"patients"> });
        toast.success("Medical record created successfully");
      }
      setShowForm(false);
      setEditingRecord(null);
    } catch (error) {
      toast.error("Failed to save medical record");
    }
  };

  const handleDelete = async (id: Id<"medicalRecords">) => {
    if (confirm("Are you sure you want to delete this medical record?")) {
      try {
        await deleteRecord({ id });
        toast.success("Medical record deleted successfully");
      } catch (error) {
        toast.error("Failed to delete medical record");
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
        <h2 className="text-2xl font-bold text-gray-900">Medical Records</h2>
        {selectedPatientId && (
          <button
            onClick={() => {
              setEditingRecord(null);
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Medical Record
          </button>
        )}
      </div>

      {/* Patient Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Select Patient:</label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose a patient</option>
            {patients?.map((patient) => (
              <option key={patient._id} value={patient._id}>
                {patient.firstName} {patient.lastName} - {patient.phone}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedPatient && (
        <>
          {/* Patient Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{selectedPatient.firstName} {selectedPatient.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-medium">{selectedPatient.dateOfBirth}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Blood Type</p>
                <p className="font-medium">{selectedPatient.bloodType || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Allergies</p>
                <p className="font-medium">
                  {selectedPatient.allergies?.length ? selectedPatient.allergies.join(", ") : "None"}
                </p>
              </div>
            </div>
          </div>

          {/* Medical Records */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Medical Records</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {records?.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No medical records found for this patient.
                </div>
              ) : (
                records?.map((record) => (
                  <div key={record._id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            record.recordType === "diagnosis" ? "bg-red-100 text-red-800" :
                            record.recordType === "prescription" ? "bg-blue-100 text-blue-800" :
                            record.recordType === "test-result" ? "bg-green-100 text-green-800" :
                            record.recordType === "treatment" ? "bg-purple-100 text-purple-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {record.recordType}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(record._creationTime).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">{record.title}</h4>
                        <p className="text-gray-700 mb-3">{record.description}</p>
                        
                        {record.diagnosis && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-900">Diagnosis:</p>
                            <p className="text-gray-700">{record.diagnosis}</p>
                          </div>
                        )}

                        {record.prescription && record.prescription.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-900">Prescription:</p>
                            <div className="space-y-1">
                              {record.prescription.map((med: any, index: number) => (
                                <div key={index} className="text-sm text-gray-700">
                                  <span className="font-medium">{med.medication}</span> - 
                                  {med.dosage}, {med.frequency}, {med.duration}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {record.testResults && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-900">Test Results:</p>
                            <div className="text-sm text-gray-700">
                              <p><span className="font-medium">Test:</span> {record.testResults.testName}</p>
                              <p><span className="font-medium">Results:</span> {record.testResults.results}</p>
                              {record.testResults.normalRange && (
                                <p><span className="font-medium">Normal Range:</span> {record.testResults.normalRange}</p>
                              )}
                            </div>
                          </div>
                        )}

                        <p className="text-sm text-gray-500">
                          By: Dr. {record.staff?.firstName} {record.staff?.lastName}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(record._id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Medical Record Form Modal */}
      {showForm && selectedPatientId && (
        <MedicalRecordForm
          record={editingRecord}
          staff={staff || []}
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

function MedicalRecordForm({ record, staff, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    staffId: record?.staffId || "",
    recordType: record?.recordType || "note",
    title: record?.title || "",
    description: record?.description || "",
    diagnosis: record?.diagnosis || "",
    prescription: record?.prescription || [],
    testResults: record?.testResults || null,
  });

  const [newMedication, setNewMedication] = useState({
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
  });

  const [testResults, setTestResults] = useState({
    testName: record?.testResults?.testName || "",
    results: record?.testResults?.results || "",
    normalRange: record?.testResults?.normalRange || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      testResults: formData.recordType === "test-result" && testResults.testName ? testResults : undefined,
    };
    onSubmit(submitData);
  };

  const addMedication = () => {
    if (newMedication.medication && newMedication.dosage) {
      setFormData({
        ...formData,
        prescription: [...formData.prescription, newMedication]
      });
      setNewMedication({ medication: "", dosage: "", frequency: "", duration: "" });
    }
  };

  const removeMedication = (index: number) => {
    setFormData({
      ...formData,
      prescription: formData.prescription.filter((_: any, i: number) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {record ? "Edit Medical Record" : "Add New Medical Record"}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                  {staff.filter((s: any) => s.role === "doctor").map((doctor: any) => (
                    <option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.firstName} {doctor.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Record Type
                </label>
                <select
                  value={formData.recordType}
                  onChange={(e) => setFormData({ ...formData, recordType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="note">Note</option>
                  <option value="diagnosis">Diagnosis</option>
                  <option value="prescription">Prescription</option>
                  <option value="test-result">Test Result</option>
                  <option value="treatment">Treatment</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            {(formData.recordType === "diagnosis" || formData.recordType === "treatment") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis
                </label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
              </div>
            )}

            {formData.recordType === "prescription" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prescription
                </label>
                
                {/* Current medications */}
                {formData.prescription.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {formData.prescription.map((med: any, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">
                          {med.medication} - {med.dosage}, {med.frequency}, {med.duration}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new medication */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Medication"
                    value={newMedication.medication}
                    onChange={(e) => setNewMedication({ ...newMedication, medication: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Dosage"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Frequency"
                    value={newMedication.frequency}
                    onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Duration"
                    value={newMedication.duration}
                    onChange={(e) => setNewMedication({ ...newMedication, duration: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={addMedication}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Add Medication
                </button>
              </div>
            )}

            {formData.recordType === "test-result" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Name
                  </label>
                  <input
                    type="text"
                    value={testResults.testName}
                    onChange={(e) => setTestResults({ ...testResults, testName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Results
                  </label>
                  <textarea
                    value={testResults.results}
                    onChange={(e) => setTestResults({ ...testResults, results: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Normal Range
                  </label>
                  <input
                    type="text"
                    value={testResults.normalRange}
                    onChange={(e) => setTestResults({ ...testResults, normalRange: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

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
