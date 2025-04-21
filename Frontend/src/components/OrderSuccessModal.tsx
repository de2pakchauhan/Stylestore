import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderSuccessModal({ isOpen, onClose }: OrderSuccessModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleViewOrders = () => {
    onClose();
    navigate("/orders");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative z-[10000]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-gray-800">Order confirmed</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-gray-600 mb-5">
          Your order has been successfully processed. You can review all orders at any time.
        </p>
        <button
          onClick={handleViewOrders}
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          View orders
        </button>
      </div>
    </div>
  );
}