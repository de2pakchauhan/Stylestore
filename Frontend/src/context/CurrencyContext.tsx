import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { CURRENCY_CONFIG } from "../constants/currencyConfig";

type CurrencyCode = keyof typeof CURRENCY_CONFIG;

interface CurrencyContextType {
  selectedCurrency: string;
  selectedSymbol: string;
  convertPrice: (price: number) => string;
  exchangeRate: number;
  isLoading: boolean;
  error: string | null;
}

const CurrencyContext = createContext<CurrencyContextType>({
  selectedCurrency: "INR",
  selectedSymbol: "₹",
  convertPrice: (price) => price.toFixed(2),
  exchangeRate: 1,
  isLoading: false,
  error: null,
});

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [exchangeRate, setExchangeRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currencyConfigKey, setCurrencyConfigKey] = useState<CurrencyCode>("IN");

  const fetchExchangeRate = async (targetCurrency: string) => {
    const cacheKey = `INR_${targetCurrency}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const { rate, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 3600000) {
        setExchangeRate(rate);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/INR`);
      const data = await response.json();

      // Check if targetCurrency is available in the response
      if (!data.rates || !data.rates[targetCurrency]) {
        throw new Error("Currency not found in response");
      }

      const rate = data.rates[targetCurrency];
      setExchangeRate(rate);
      localStorage.setItem(cacheKey, JSON.stringify({ rate, timestamp: Date.now() }));
    } catch (err) {
      console.error("Exchange rate error:", err);
      setError("Could not fetch live rates. Using last known rate.");
      if (cached) {
        setExchangeRate(JSON.parse(cached).rate);
      } else {
        setExchangeRate(1); // fallback rate
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const updateCurrency = async () => {
      let targetCurrency = "INR";
      let configKey: CurrencyCode = "IN";

      if (user?.profile?.country) {
        const currencyEntry = Object.entries(CURRENCY_CONFIG).find(([_, config]) =>
          config.countries.includes(user.profile.country)
        );

        if (currencyEntry) {
          configKey = currencyEntry[0] as CurrencyCode;
          targetCurrency = currencyEntry[1].code;
        }
      }

      setCurrencyConfigKey(configKey);
      await fetchExchangeRate(targetCurrency);
    };

    updateCurrency();
  }, [user?.profile?.country]);

  const convertPrice = (price: number) => {
    return (price * exchangeRate).toLocaleString("en-IN", {
      style: "currency",
      currency: CURRENCY_CONFIG[currencyConfigKey].code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency: CURRENCY_CONFIG[currencyConfigKey].code,
        selectedSymbol: CURRENCY_CONFIG[currencyConfigKey].symbol,
        convertPrice,
        exchangeRate,
        isLoading,
        error,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
