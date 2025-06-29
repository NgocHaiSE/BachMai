// components/ClinicalInformationDisplay.tsx
import { Stethoscope, UserCheck, Clipboard, FileText } from 'lucide-react';

interface ClinicalInformationDisplayProps {
    clinicalProgress?: string;
    treatmentPerformed?: string;
    companionId?: string;
    companionName?: string;
    notes?: string;
}

export const ClinicalInformationDisplay: React.FC<ClinicalInformationDisplayProps> = ({
    clinicalProgress,
    treatmentPerformed,
    companionId,
    companionName,
    notes
}) => {
    const clinicalData = [
        {
            label: "Diễn biến lâm sàng",
            value: clinicalProgress || "Chưa có thông tin",
            icon: Stethoscope,
            color: "text-green-500",
            type: "textarea"
        },
        {
            label: "Điều trị đã thực hiện",
            value: treatmentPerformed || "Chưa có thông tin",
            icon: FileText,
            color: "text-blue-500",
            type: "textarea"
        }
    ];

    return (
        <div className="space-y-6">
            {clinicalData.map((item, index) => {
                const IconComponent = item.icon;
                return (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center mb-3">
                            <IconComponent className={`w-5 h-5 ${item.color} mr-2`} />
                            <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        </div>

                        {item.type === 'textarea' ? (
                            <div className="bg-white rounded-lg p-3 border border-gray-200 min-h-[80px]">
                                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                                    {item.value}
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-gray-900 font-medium">
                                    {item.value}
                                </p>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
