import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { BasketItem } from '../types';
import axios from 'axios';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';

interface CheckoutPageProps {
  onOrderSuccess: () => void;
  onClose: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ onOrderSuccess, onClose }) => {
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  const token = localStorage.getItem('token');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileError, setProfileError] = useState('');
  const navigate = useNavigate();
  const { convertPrice, selectedSymbol } = useCurrency();

  const requiredProfileFields = {
    first_name: 'First Name',
    last_name: 'Last Name',
    address_line1: 'Street Address',
    city: 'City',
    state: 'State/Province',
    pincode: 'ZIP/Postal Code',
    country: 'Country',
    contact_number: 'Contact Number'
  };

  const validateProfile = () => {
    if (!user) return false;
    return Object.keys(requiredProfileFields).every(field => {
      if (field === 'first_name' || field === 'last_name') {
        return user[field]?.trim().length > 0;
      }
      return user.profile?.[field]?.trim().length > 0;
    });
  };

  useEffect(() => {
    const checkProfile = () => {
      if (user && !validateProfile()) {
        setProfileError('Complete your profile to checkout');
      }
    };
    checkProfile();
  }, [user]);

  const totalAmount = cartItems.reduce((sum, item) => {
    const convertedPrice = parseFloat(convertPrice(item.price).replace(/[^0-9.]/g, ''));
    return sum + convertedPrice * (item.quantity || 0);
  }, 0);

  const handleCheckout = async () => {
    if (!user || !token) {
      alert('Please login to complete checkout');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your basket is empty');
      return;
    }

    if (!validateProfile()) {
      setProfileError('Please complete your profile information before checkout');
      return;
    }

    try {
      setIsSubmitting(true);

      await Promise.all(
        cartItems.map(async item => {
          const convertedPrice = parseFloat(convertPrice(item.price).replace(/[^0-9.]/g, ''));
          const orderData = {
            product_id: item.id,
            quantity: item.quantity,
            price: convertedPrice,
            currency: selectedSymbol
          };

          await axios.post('http://localhost:8001/api/orders', orderData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        })
      );

      clearCart();
      onOrderSuccess();
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error.response?.data?.detail || 'Checkout failed. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${selectedSymbol}${amount.toFixed(2)}`;
  };

  const getMissingFields = () => {
    if (!user) return Object.values(requiredProfileFields);
    return Object.entries(requiredProfileFields)
      .filter(([key]) => {
        if (key === 'first_name' || key === 'last_name') {
          return !user[key]?.trim();
        }
        return !user.profile?.[key]?.trim();
      })
      .map(([, value]) => value);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
      >
        <X className="h-6 w-6" />
      </button>

      <h2 className="text-2xl font-bold mb-6">Checkout</h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>

        {profileError && (
          <div className="mb-4 p-4 bg-red-100 rounded-lg">
            <p className="text-red-700 font-medium">
              Missing required information:
            </p>
            <ul className="list-disc pl-5 mt-2">
              {getMissingFields().map(field => (
                <li key={field} className="text-red-700">{field}</li>
              ))}
            </ul>
            <button
              onClick={() => navigate('/profile')}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Update Profile
            </button>
          </div>
        )}

        <div className="space-y-2 text-sm">
          <div className="font-medium">
            {user?.first_name} {user?.last_name}
          </div>
          <div className="text-gray-600 whitespace-pre-line">
            {user?.profile?.address_line1}
            {user?.profile?.address_line2 && `\n${user.profile.address_line2}`}
            {user?.profile?.landmark && `\n${user.profile.landmark}`}
            {user?.profile?.city && `\n${user.profile.city}, ${user?.profile?.state} ${user?.profile?.pincode}`}
            {user?.profile?.country && `\n${user.profile.country}`}
          </div>
          <div className="pt-2 text-gray-600">
            Phone number: {user?.profile?.contact_number}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
        <div className="space-y-4">
          {cartItems.map((item) => {
            const convertedPrice = parseFloat(convertPrice(item.price).replace(/[^0-9.]/g, ''));
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 border-b pb-2"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <p className="font-medium">
                  {formatCurrency(convertedPrice * item.quantity)}
                </p>
              </div>
            );
          })}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={isSubmitting || !validateProfile()}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
          validateProfile()
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
        } ${isSubmitting ? 'opacity-75' : ''}`}
      >
        {isSubmitting
          ? 'Processing Your Order...'
          : validateProfile()
          ? 'Confirm Secure Payment'
          : 'Complete Profile to Checkout'}
      </button>
    </div>
  );
};

export default CheckoutPage;