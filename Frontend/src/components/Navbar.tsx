import { ShoppingCart, Store, User } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import { useNavigate } from "react-router-dom";
import { CURRENCY_CONFIG } from "../constants/currencyConfig";
import { Menu } from '@headlessui/react';

export default function Navbar({ onBasketClick }: { onBasketClick: () => void }) {
  const { cartItems } = useCart();
  const { user, logout, setIsLoginModalOpen } = useAuth();
  const { selectedSymbol, selectedCurrency } = useCurrency();
  const navigate = useNavigate();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const getCurrencyDisplay = () => {
    return user 
      ? `${selectedSymbol} ${selectedCurrency}`
      : `${CURRENCY_CONFIG.IN.symbol} ${CURRENCY_CONFIG.IN.code}`;
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <Store className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">StyleStore</span>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* User Menu Dropdown */}
            {user ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition">
                  <User className="h-5 w-5" />
                  <span>{user.name}</span>
                </Menu.Button>
                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => navigate("/profile")}
                          className={`${
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          } block w-full px-4 py-2 text-sm text-left`}
                        >
                          Profile
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => navigate("/orders")}
                          className={`${
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          } block w-full px-4 py-2 text-sm text-left`}
                        >
                          My Orders
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={`${
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          } block w-full px-4 py-2 text-sm text-left`}
                        >
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Menu>
            ) : (
              // Login Button
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
              >
                <User className="h-5 w-5" />
                <span>Login</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={onBasketClick}
              className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 transition"
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Currency Display */}
            <div className="px-4 py-2 rounded-lg text-gray-600">
              <span className="font-medium">
                {getCurrencyDisplay()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}