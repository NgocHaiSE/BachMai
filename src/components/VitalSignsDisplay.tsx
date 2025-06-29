// components/VitalSignsDisplay.tsx
import { Heart, Activity, Wind, Thermometer } from 'lucide-react';

interface VitalSignsDisplayProps {
    pulse?: number;
    bloodPressure?: string;
    respiratoryRate?: number;
    temperature?: number;
}

export const VitalSignsDisplay: React.FC<VitalSignsDisplayProps> = ({
    pulse,
    bloodPressure,
    respiratoryRate,
    temperature
}) => {
    const vitalSignsData = [
        {
            label: "Mạch",
            value: pulse ? `${pulse} lần/phút` : "Chưa có dữ liệu",
            icon: Heart,
            color: "text-red-500",
            bgColor: "bg-red-50",
            borderColor: "border-red-200"
        },
        {
            label: "Huyết áp",
            value: bloodPressure || "Chưa có dữ liệu",
            unit: bloodPressure ? "mmHg" : "",
            icon: Activity,
            color: "text-blue-500",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200"
        },
        {
            label: "Nhịp thở",
            value: respiratoryRate ? `${respiratoryRate} lần/phút` : "Chưa có dữ liệu",
            icon: Wind,
            color: "text-cyan-500",
            bgColor: "bg-cyan-50",
            borderColor: "border-cyan-200"
        },
        {
            label: "Nhiệt độ",
            value: temperature ? `${temperature}°C` : "Chưa có dữ liệu",
            icon: Thermometer,
            color: "text-orange-500",
            bgColor: "bg-orange-50",
            borderColor: "border-orange-200"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {vitalSignsData.map((item, index) => {
                const IconComponent = item.icon;
                return (
                    <div
                        key={index}
                        className={`${item.bgColor} ${item.borderColor} border rounded-xl p-4 transition-all hover:shadow-md`}
                    >
                        <div className="flex items-center mb-2">
                            <IconComponent className={`w-5 h-5 ${item.color} mr-2`} />
                            <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                            {item.value}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
