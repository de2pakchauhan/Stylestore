import { X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import CheckoutPage from './CheckoutPage';
import OrderSuccessModal from './OrderSuccessModal';

interface BasketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BasketModal({ isOpen, onClose }: BasketModalProps) {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, setIsLoginModalOpen } = useAuth();
  const { convertPrice, isLoading, error } = useCurrency();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validCartItems = cartItems.filter(item => item.quantity > 0);
  const total = validCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isCheckoutDisabled = validCartItems.length === 0;

  const handleCheckoutInit = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    setIsCheckingOut(true);
  };

  const handleOrderSuccess = () => {
    clearCart();
    setIsCheckingOut(false);
    setShowSuccessModal(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9998] flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        {showSuccessModal ? (
          <OrderSuccessModal
            isOpen={showSuccessModal}
            onClose={() => {
              setShowSuccessModal(false);
              onClose();
            }}
          />
        ) : isCheckingOut ? (
          <CheckoutPage 
            onOrderSuccess={handleOrderSuccess}
            onClose={() => {
              setIsCheckingOut(false);
              onClose();
            }}
          />
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Your Basket</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="h-6 w-6" />
              </button>
            </div>

            {cartItems.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Your basket is empty</p>
            ) : (
              <>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 border-b pb-4">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-20 h-20 object-cover rounded" 
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-gray-600">
                          {isLoading ? 'Updating...' : error ? error : convertPrice(item.price)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            className="px-2 py-1 border rounded hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 border rounded hover:bg-gray-100"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-4 text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold">Total:</span>
                    <span className="text-xl font-bold">
                      {isLoading ? 'Calculating...' : error ? error : convertPrice(total)}
                    </span>
                  </div>
                  <button
                    onClick={handleCheckoutInit}
                    className={`w-full py-2 rounded-md transition-colors ${
                      isCheckoutDisabled
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                    disabled={isCheckoutDisabled}
                  >
                    {user ? 'Proceed to Checkout' : 'Login to Checkout'}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}