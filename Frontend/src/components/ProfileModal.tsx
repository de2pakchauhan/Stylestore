import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { CURRENCY_CONFIG } from '../constants/currencyConfig';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MemoSelect = React.memo(({ 
  options, 
  value, 
  onChange, 
  className,
  disabled,
  name
}: {
  options: Array<{ value: string, label: string }>,
  value: string,
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
  className: string,
  disabled: boolean,
  name: string
}) => (
  <select
    name={name}
    value={value}
    onChange={onChange}
    className={`${className} px-3 py-2 border border-gray-300 rounded-md focus:ring-[0.15px] focus:ring-indigo-500 focus:outline-none appearance-none`}
    disabled={disabled}
  >
    {options.map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
));

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  // Get all countries from currency config
  const allCountries = useMemo(() => {
    return Array.from(new Set(
      Object.values(CURRENCY_CONFIG).flatMap(config => config.countries)
    )).sort();
  }, []);

  // Static date data
  const { days, months, years } = useMemo(() => ({
    days: Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")),
    months: [
      { value: '01', label: 'January' },
      { value: '02', label: 'February' },
      { value: '03', label: 'March' },
      { value: '04', label: 'April' },
      { value: '05', label: 'May' },
      { value: '06', label: 'June' },
      { value: '07', label: 'July' },
      { value: '08', label: 'August' },
      { value: '09', label: 'September' },
      { value: '10', label: 'October' },
      { value: '11', label: 'November' },
      { value: '12', label: 'December' },
    ],
    years: Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i))
  }), []);

  // Form state
  const [formData, setFormData] = useState(() => ({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    day: '',
    month: '',
    year: '',
    country: user?.profile?.country || '',
    contact_number: user?.profile?.contact_number || '',
    pincode: user?.profile?.pincode || '',
    address_line1: user?.profile?.address_line1 || '',
    address_line2: user?.profile?.address_line2 || '',
    landmark: user?.profile?.landmark || '',
    city: user?.profile?.city || '',
    state: user?.profile?.state || ''
  }));

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Get currency from selected country
  const getCurrencyFromCountry = useCallback((country: string) => {
    const entry = Object.entries(CURRENCY_CONFIG).find(([_, config]) =>
      config.countries.includes(country)
    );
    return entry ? entry[1].code : 'INR';
  }, []);

  // Initialize form data
  useEffect(() => {
    if (isOpen && user?.profile) {
      const dobParts = user.profile.date_of_birth?.split("-") || [];
      setFormData(prev => ({
        ...prev,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        year: dobParts[0] || '',
        month: dobParts[1] || '',
        day: dobParts[2] || '',
        country: user.profile.country || '',
        contact_number: user.profile.contact_number || '',
        pincode: user.profile.pincode || '',
        address_line1: user.profile.address_line1 || '',
        address_line2: user.profile.address_line2 || '',
        landmark: user.profile.landmark || '',
        city: user.profile.city || '',
        state: user.profile.state || ''
      }));
    }
  }, [isOpen, user?.profile]);

  // Input handler
  const handleChange = useCallback((field: string) => 
    (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
      const value = e.target.type === 'tel' 
        ? e.target.value.replace(/\D/g, "")
        : e.target.value;
      setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitAttempted(true);
    setIsLoading(true);

    const requiredFields = [
      formData.first_name.trim(),
      formData.last_name.trim(),
      formData.day,
      formData.month,
      formData.year,
      formData.country,
      formData.contact_number.trim(),
      formData.pincode.trim(),
      formData.address_line1.trim(),
      formData.city.trim(),
      formData.state.trim()
    ];

    if (requiredFields.some(field => !field)) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    try {
      const dob = `${formData.year}-${formData.month}-${formData.day}`;
      if (new Date(dob) > new Date()) {
        throw new Error("Date of birth cannot be in the future");
      }

      const currency = getCurrencyFromCountry(formData.country);

      await updateProfile({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        date_of_birth: dob,
        country: formData.country,
        currency,
        contact_number: formData.contact_number,
        pincode: formData.pincode,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        landmark: formData.landmark,
        city: formData.city,
        state: formData.state
      });
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Update failed");
    } finally {
      setIsLoading(false);
    }
  }, [formData, updateProfile, getCurrencyFromCountry]);

  if (!user) {
    navigate('/', { replace: true });
    return null;
  }

  // Helper functions
  const getPostalPlaceholder = (currency: string) => {
    switch (currency) {
      case 'INR': return '6-digit PIN code';
      case 'USD': return '5-digit ZIP code';
      case 'GBP': return '6-8 character postcode';
      case 'EUR': return 'Postal code varies by country';
      case 'AUD': return '4-digit postcode';
      default: return 'Postal/ZIP code';
    }
  };

  const getPostalMaxLength = (currency: string) => {
    switch (currency) {
      case 'INR': return 6;
      case 'USD': return 5;
      case 'GBP': return 8;
      case 'AUD': return 4;
      default: return 10;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-[100]"
    >
      <Dialog.Overlay className="fixed inset-0 bg-black/30 transition-opacity duration-200" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4 transform transition-all duration-300">
        <div className="relative bg-white rounded-2xl max-w-2xl w-full mx-4 p-6 sm:p-8 max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-2xl font-semibold text-gray-900">
              Profile Settings
            </Dialog.Title>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Edit Profile
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                disabled={isLoading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {!user?.profile && (
            <div className="animate-pulse space-y-4 p-6">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md border border-red-100">
              {error}
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900 pb-2 border-b">Personal Information</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange('first_name')}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-[0.15px] focus:ring-indigo-500 outline-none ${
                      submitAttempted && !formData.first_name.trim() ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange('last_name')}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-[0.15px] focus:ring-indigo-500 outline-none ${
                      submitAttempted && !formData.last_name.trim() ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <div className="flex gap-3">
                  <select
                    name="day"
                    value={formData.day}
                    onChange={handleChange('day')}
                    className={`flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-[0.15px] focus:ring-indigo-500 focus:outline-none appearance-none ${
                      submitAttempted && !formData.day ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    disabled={!isEditing}
                  >
                    <option value="">Day</option>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  
                  <MemoSelect
                    name="month"
                    options={months}
                    value={formData.month}
                    onChange={handleChange('month')}
                    className={`flex-1 ${
                      submitAttempted && !formData.month ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    disabled={!isEditing}
                  />
                  
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange('year')}
                    className={`flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-[0.15px] focus:ring-indigo-500 focus:outline-none appearance-none ${
                      submitAttempted && !formData.year ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    disabled={!isEditing}
                  >
                    <option value="">Year</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4 mt-6">
              <h2 className="text-lg font-medium text-gray-900 pb-2 border-b">Location Information</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <select
                    value={formData.country}
                    onChange={handleChange('country')}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[0.15px] focus:ring-indigo-500 focus:outline-none appearance-none ${
                      submitAttempted && !formData.country ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    disabled={!isEditing}
                  >
                    <option value="">Select Country</option>
                    {allCountries.map(c => 
                      <option key={c} value={c}>{c}</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4 mt-6">
              <h2 className="text-lg font-medium text-gray-900 pb-2 border-b">Contact Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                <input
                  type="tel"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange('contact_number')}
                  maxLength={10}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-[0.15px] focus:ring-indigo-500 outline-none ${
                    submitAttempted && !formData.contact_number.trim() ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4 mt-6">
              <h2 className="text-lg font-medium text-gray-900 pb-2 border-b">Address Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postal/ZIP Code</label>
                  <input
                    type="tel"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange('pincode')}
                    maxLength={getPostalMaxLength(getCurrencyFromCountry(formData.country))}
                    placeholder={getPostalPlaceholder(getCurrencyFromCountry(formData.country))}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-[0.15px] focus:ring-indigo-500 outline-none ${
                      submitAttempted && !formData.pincode.trim() ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                  <input
                    type="text"
                    name="address_line1"
                    value={formData.address_line1}
                    onChange={handleChange('address_line1')}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-[0.15px] focus:ring-indigo-500 outline-none ${
                      submitAttempted && !formData.address_line1.trim() ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    name="address_line2"
                    value={formData.address_line2}
                    onChange={handleChange('address_line2')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-[0.15px] focus:ring-indigo-500 outline-none"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Landmark (Optional)</label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange('landmark')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-[0.15px] focus:ring-indigo-500 outline-none"
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange('city')}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-[0.15px] focus:ring-indigo-500 outline-none ${
                        submitAttempted && !formData.city.trim() ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State/Province/Region</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange('state')}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-[0.15px] focus:ring-indigo-500 outline-none ${
                        submitAttempted && !formData.state.trim() ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            {isEditing && (
              <div className="pt-4 sticky bottom-0 bg-white border-t border-gray-100 mt-auto">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-2.5 px-4 bg-indigo-600 text-white rounded-md transition-colors font-medium shadow-sm focus:ring-2 focus:ring-offset-2 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
                  }`}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </Dialog>
  );
}
// Helper functions
function getPostalPlaceholder(currency: string) {
  switch (currency) {
    case 'INR': return '6-digit PIN code';
    case 'USD': return '5-digit ZIP code';
    case 'GBP': return '6-8 character postcode';
    case 'EUR': return 'Postal code varies by country';
    case 'AUD': return '4-digit postcode';
    default: return 'Postal/ZIP code';
  }
}

function getPostalMaxLength(currency: string) {
  switch (currency) {
    case 'INR': return 6;
    case 'USD': return 5;
    case 'GBP': return 8;
    case 'AUD': return 4;
    default: return 10;
  }
}

function getMobileMaxLength() {
  return 10;
}