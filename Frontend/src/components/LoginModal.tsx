// LoginModal.tsx
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Registration fields
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  const { 
    login, 
    register,
    setIsLoginModalOpen, 
    pendingCheckout, 
    setPendingCheckout,
    registrationSuccess,
    setRegistrationSuccess
  } = useAuth();
  const navigate = useNavigate();

  // When registration is successful, force login mode (hide extra registration fields)
  useEffect(() => {
    if (registrationSuccess) {
      setIsRegistering(false);
      setExpanded(false);
    }
  }, [registrationSuccess]);

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
    setError("");
    setIsRegistering(false);
    setExpanded(false);
    setRegistrationSuccess(false);
    setIsLoginModalOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isStrongPassword = (password: string) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) && 
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[\W_]/.test(password)
    );
  };

  const handleRegister = async () => {
    try {
      await register(email, password, firstName, lastName);
      // Clear registration fields after successful registration.
      setPassword("");
      setConfirmPassword("");
      setFirstName("");
      setLastName("");
      setError("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Registration failed"
      );
      setPassword("");
      setConfirmPassword("");
    }
  };

  const handleLogin = async () => {
    try {
      await login(email, password);
      handleClose();
      
      if (pendingCheckout) {
        setPendingCheckout(false);
        navigate("/checkout");
      } 
    } catch (error: any) {
      setError(error.message);
      setPassword("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isRegistering) {
      // Registration flow:
      if (!validateEmail(email)) {
        setError("Please enter a valid email address");
        return;
      }
      if (!isStrongPassword(password)) {
        setError("Password must contain: 8+ characters, uppercase, lowercase, number, and special character");
        return;
      }
      // If not yet expanded, show extra registration fields.
      if (!expanded) {
        setExpanded(true);
        return;
      }
      
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      
      await handleRegister();
    } else {
      // Login flow
      await handleLogin();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-[60]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {registrationSuccess ? "Login" : (isRegistering ? "Register" : "Login")}
          </h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        {registrationSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            Registration successful! Please login
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegistering ? "new-password" : "current-password"}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Only render extra registration fields if not in login mode or after registration success */}
          {isRegistering && !registrationSuccess && expanded && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium"
          >
            {isRegistering && !expanded ? "Continue" : isRegistering ? "Create Account" : "Sign In"}
          </button>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setExpanded(false);
                setPassword("");
                setConfirmPassword("");
                setError("");
                setRegistrationSuccess(false);
              }}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              {isRegistering 
                ? "Already have an account? Sign In" 
                : "Don't have an account? Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
