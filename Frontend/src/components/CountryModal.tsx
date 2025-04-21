import React from "react";
import { CURRENCY_CONFIG } from "../constants/currencyConfig";

const countryOptions = Object.entries(CURRENCY_CONFIG).map(([code, config]) => ({
  code: code as keyof typeof CURRENCY_CONFIG,
  label: config.label,
  symbol: config.symbol
}));

interface CountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  setSelectedCountry: (countryCode: keyof typeof CURRENCY_CONFIG) => void;
}

export default function CountryModal({ isOpen, onClose, setSelectedCountry }: CountryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Select Currency</h2>
        <ul>
          {countryOptions.map((country) => (
            <li key={country.code}>
              <button
                onClick={() => {
                  setSelectedCountry(country.code);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition text-gray-700"
              >
                {country.label} ({country.symbol})
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors mt-4"
        >
          Close
        </button>
      </div>
    </div>
  );
}