// components/AccompanyingDocuments.tsx
import { FileText, Camera, Folder, Plus, CheckCircle, XCircle } from 'lucide-react';

interface AccompanyingDocumentsProps {
    documents?: string; // Chuỗi từ TaiLieuKemTheo
    readOnly?: boolean;
}

export const AccompanyingDocuments: React.FC<AccompanyingDocumentsProps> = ({
    documents,
    readOnly = true
}) => {
    // ✅ Parse chuỗi documents thành array
    const parseDocuments = (docString: string) => {
        if (!docString) return [];

        return docString
            .split(';')
            .map(doc => doc.trim())
            .filter(doc => doc.length > 0)
            .map(doc => {
                if (doc.includes('Kết quả xét nghiệm')) {
                    return { type: 'lab_results', text: doc, icon: FileText, color: 'text-green-500' };
                } else if (doc.includes('Phim chụp')) {
                    return { type: 'imaging', text: doc, icon: Camera, color: 'text-blue-500' };
                } else if (doc.includes('Hồ sơ bệnh án')) {
                    return { type: 'medical_records', text: doc, icon: Folder, color: 'text-purple-500' };
                } else if (doc.includes('Tài liệu khác')) {
                    return { type: 'others', text: doc, icon: Plus, color: 'text-orange-500' };
                }
                return { type: 'unknown', text: doc, icon: FileText, color: 'text-gray-500' };
            });
    };

    const documentList = parseDocuments(documents || '');

    const documentTypes = [
        {
            key: 'lab_results',
            label: 'Kết quả xét nghiệm',
            icon: FileText,
            color: 'text-green-500',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200'
        },
        {
            key: 'imaging',
            label: 'Phim chụp (X-quang, CT, MRI, ...)',
            icon: Camera,
            color: 'text-blue-500',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200'
        },
        {
            key: 'medical_records',
            label: 'Hồ sơ bệnh án (tóm tắt)',
            icon: Folder,
            color: 'text-purple-500',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200'
        },
        {
            key: 'others',
            label: 'Khác',
            icon: Plus,
            color: 'text-orange-500',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200'
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center mb-4">
                <FileText className="w-5 h-5 text-gray-600 mr-2" />
                <h5 className="text-sm font-medium text-gray-700">Tài liệu kèm theo</h5>
            </div>

            {documentList.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                    <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Không có tài liệu kèm theo</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {documentList.map((doc, index) => {
                        const IconComponent = doc.icon;
                        const docType = documentTypes.find(type => type.key === doc.type);

                        return (
                            <div
                                key={index}
                                className={`${docType?.bgColor || 'bg-gray-50'} ${docType?.borderColor || 'border-gray-200'} border rounded-xl p-4 transition-all hover:shadow-sm`}
                            >
                                <div className="flex items-start items-center">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 mr-3 flex-shrink-0">
                                        <IconComponent className={`w-4 h-4 ${doc.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center">
                                            {/* <CheckCircle className="w-4 h-4 text-green-500 mr-2" /> */}
                                            <span className="text-sm font-medium text-gray-900">
                                                {doc.text}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ✅ Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center">
                    <FileText className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="text-sm font-medium text-blue-900">
                        Tổng cộng: {documentList.length} loại tài liệu
                    </span>
                </div>
            </div>
        </div>
    );
};
