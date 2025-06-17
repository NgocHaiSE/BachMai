import React, { useState } from 'react';
import { Printer, X, Download, Eye } from 'lucide-react';

// Mock data for demonstration
const mockTransferRequest = {
  requestCode: "YC12345678",
  patient: {
    fullName: "Nguyễn Văn Hùng",
    age: 45,
    gender: "Nam",
    patientCode: "BN123456",
    insuranceNumber: "HX4012345678000",
    department: "Khoa Nội Tổng hợp",
    admissionDate: "15/05/2025"
  },
  transferInfo: {
    reason: "Cần can thiệp phẫu thuật chuyên sâu ngoài khả năng điều trị của bệnh viện",
    destinationFacility: "Bệnh viện Việt Đức",
    suggestedDoctor: "BS. Nguyễn Thị Thanh",
    requestDate: "23/05/2025",
    notes: "Bệnh nhân bị ngoại khoa và đòi hỏi kỹ thuật cao cần thiết để điều trị"
  },
  approvalInfo: {
    createdBy: "BS. Nguyễn Thị Thanh",
    createdDate: "23/05/2025",
    approver: "Phó trưởng khoa Tống hợp",
    approvalDate: null
  }
};

function TransferRequestPrintModal({ isOpen, onClose, requestData = mockTransferRequest }) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Logic to generate and download PDF
    console.log("Download PDF");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-[#280559] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center text-white">
            <Printer className="w-6 h-6 mr-3" />
            <div>
              <h3 className="text-lg font-semibold">Xem trước PDF</h3>
              <p className="text-sm text-white/80">Phiếu yêu cầu chuyển viện</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPDF}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
              title="Tải xuống PDF"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Preview */}
        <div className="h-[70vh] overflow-y-auto bg-gray-100 p-6">
          <div className="bg-white shadow-lg max-w-3xl mx-auto" id="printable-content">
            {/* Document Content */}
            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="text-center border-b pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-left">
                    <p className="font-bold text-sm">SỞ Y TẾ HÀ NỘI</p>
                    <p className="font-bold text-sm">BỆNH VIỆN BẠCH MAI</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">MS: 01-BV-01</p>
                    <p className="text-sm">Số lưu trữ: {requestData.requestCode}</p>
                  </div>
                </div>
                <h1 className="text-xl font-bold text-center mb-2">PHIẾU YÊU CẦU CHUYỂN VIỆN</h1>
              </div>

              {/* Thông tin bệnh nhân */}
              <div>
                <h3 className="font-bold text-base mb-3 text-[#280559]">THÔNG TIN BỆNH NHÂN:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="w-4 h-4 bg-black rounded-full inline-block mr-2 mt-1 flex-shrink-0"></span>
                    <span><strong>Họ và tên:</strong> {requestData.patient.fullName}</span>
                  </div>
                  <div className="flex">
                    <span className="w-4 h-4 bg-black rounded-full inline-block mr-2 mt-1 flex-shrink-0"></span>
                    <span><strong>Tuổi:</strong> {requestData.patient.age}</span>
                  </div>
                  <div className="flex">
                    <span className="w-4 h-4 bg-black rounded-full inline-block mr-2 mt-1 flex-shrink-0"></span>
                    <span><strong>Giới tính:</strong> {requestData.patient.gender}</span>
                  </div>
                  <div className="flex">
                    <span className="w-4 h-4 bg-black rounded-full inline-block mr-2 mt-1 flex-shrink-0"></span>
                    <span><strong>Mã bệnh nhân:</strong> {requestData.patient.patientCode}</span>
                  </div>
                  <div className="flex">
                    <span className="w-4 h-4 bg-black rounded-full inline-block mr-2 mt-1 flex-shrink-0"></span>
                    <span><strong>Số thẻ BHYT:</strong> {requestData.patient.insuranceNumber}</span>
                  </div>
                  <div className="flex">
                    <span className="w-4 h-4 bg-black rounded-full inline-block mr-2 mt-1 flex-shrink-0"></span>
                    <span><strong>Khoa điều trị:</strong> {requestData.patient.department}</span>
                  </div>
                  <div className="flex">
                    <span className="w-4 h-4 bg-black rounded-full inline-block mr-2 mt-1 flex-shrink-0"></span>
                    <span><strong>Ngày vào viện:</strong> {requestData.patient.admissionDate}</span>
                  </div>
                </div>
              </div>

              {/* Thông tin yêu cầu chuyển viện */}
              <div className="border-t pt-4">
                <h3 className="font-bold text-base mb-3 text-[#280559]">THÔNG TIN YÊU CẦU CHUYỂN VIỆN:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="w-4 h-4 bg-black rounded-full inline-block mr-2 mt-1 flex-shrink-0"></span>
                    <span><strong>Lý do chuyển viện:</strong> {requestData.transferInfo.reason}</span>
                  </div>
                  <div className="flex">
                    <span className="w-4 h-4 bg-black rounded-full inline-block mr-2 mt-1 flex-shrink-0"></span>
                    <span><strong>Cơ sở y tế đề nghị chuyển đến:</strong> {requestData.transferInfo.destinationFacility}</span>
                  </div>
                  <div className="flex">
                    <span className="w-4 h-4 bg-black rounded-full inline-block mr-2 mt-1 flex-shrink-0"></span>
                    <span><strong>Bác sĩ đề nghị chuyển đến:</strong> {requestData.transferInfo.suggestedDoctor}</span>
                  </div>
                  <div className="flex">
                    <span className="w-4 h-4 bg-black rounded-full inline-block mr-2 mt-1 flex-shrink-0"></span>
                    <span><strong>Ngày yêu cầu chuyển viện:</strong> {requestData.transferInfo.requestDate}</span>
                  </div>
                  <div className="flex">
                    <span className="w-4 h-4 bg-black rounded-full inline-block mr-2 mt-1 flex-shrink-0"></span>
                    <span><strong>Ghi chú thêm (nếu có):</strong> {requestData.transferInfo.notes}</span>
                  </div>
                </div>
              </div>

              {/* Thông tin phê duyệt */}
              <div className="border-t pt-4">
                <h3 className="font-bold text-base mb-3 text-[#280559]">THÔNG TIN PHÊ DUYỆT:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="w-4 h-4 bg-black rounded-full inline-block mr-2 mt-1 flex-shrink-0"></span>
                    <span><strong>Người lập phiếu (Bác sĩ Quản lý bệnh án):</strong> {requestData.approvalInfo.createdBy}</span>
                  </div>
                  <div className="flex">
                    <span className="w-4 h-4 bg-black rounded-full inline-block mr-2 mt-1 flex-shrink-0"></span>
                    <span><strong>Ngày lập:</strong> {requestData.approvalInfo.createdDate}</span>
                  </div>
                  <div className="flex">
                    <span className="w-4 h-4 bg-black rounded-full inline-block mr-2 mt-1 flex-shrink-0"></span>
                    <span><strong>Phó khoa hoặc Phụ trách kỹ thuật:</strong> {requestData.approvalInfo.approver}</span>
                  </div>
                  <div className="flex">
                    <span className="w-4 h-4 bg-black rounded-full inline-block mr-2 mt-1 flex-shrink-0"></span>
                    <span><strong>Ngày phê duyệt:</strong> {requestData.approvalInfo.approvalDate || "Chưa phê duyệt"}</span>
                  </div>
                  <div className="flex">
                    <span className="w-4 h-4 bg-black rounded-full inline-block mr-2 mt-1 flex-shrink-0"></span>
                    <span><strong>Ý kiến phê duyệt (nếu có):</strong> Đồng ý chuyển viện theo đề nghị của bác sĩ điều trị</span>
                  </div>
                </div>
              </div>

              {/* Footer with signatures */}
              <div className="border-t pt-6 mt-8">
                <div className="text-center mb-4">
                  <p className="font-bold">Hà Nội, ngày 24 tháng 05 năm 2025</p>
                </div>
                <div className="flex justify-between">
                  <div className="text-center">
                    <p className="font-bold mb-16">Người lập phiếu</p>
                    <p className="text-sm">(Ký, ghi rõ họ tên)</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold mb-16">Phụ trách khoa Tổng hợp</p>
                    <p className="text-sm">(Ký, ghi rõ họ tên)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 flex justify-center space-x-4">
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-6 py-3 bg-[#280559] text-white font-medium rounded-xl hover:bg-[#3a0a7a] transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Printer className="w-5 h-5 mr-2" />
            Tải xuống
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center px-6 py-3 bg-gray-500 text-white font-medium rounded-xl hover:bg-gray-600 transition-all duration-200"
          >
            <X className="w-5 h-5 mr-2" />
            Hủy
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-content,
          #printable-content * {
            visibility: visible;
          }
          #printable-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .bg-gray-100,
          .shadow-lg {
            background: white !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// Main component demonstrating usage
export default function TransferRequestPrintDemo() {
  const [showPrintModal, setShowPrintModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Quản lý phiếu yêu cầu chuyển viện</h2>
              <p className="text-gray-600">Xem và in phiếu yêu cầu chuyển viện</p>
            </div>
            
            {/* Print Button */}
            <button
              onClick={() => setShowPrintModal(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#280559] to-[#3a0a7a] text-white font-medium rounded-xl hover:from-[#3a0a7a] hover:to-[#4d0e99] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Eye className="w-5 h-5 mr-2" />
              Xem trước PDF
            </button>
          </div>

          {/* Sample content */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin yêu cầu</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Mã yêu cầu:</span>
                <span className="ml-2 text-gray-900">{mockTransferRequest.requestCode}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Bệnh nhân:</span>
                <span className="ml-2 text-gray-900">{mockTransferRequest.patient.fullName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Cơ sở chuyển đến:</span>
                <span className="ml-2 text-gray-900">{mockTransferRequest.transferInfo.destinationFacility}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Ngày yêu cầu:</span>
                <span className="ml-2 text-gray-900">{mockTransferRequest.transferInfo.requestDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Modal */}
      <TransferRequestPrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        requestData={mockTransferRequest}
      />
    </div>
  );
}