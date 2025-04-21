import { useCurrency } from "../context/CurrencyContext";

interface PriceConverterProps {
  basePrice: number;
}

export default function PriceConverter({ basePrice }: PriceConverterProps) {
  const { selectedSymbol, convertPrice } = useCurrency();
  
  return (
    <span>
      {selectedSymbol} {convertPrice(basePrice)}
    </span>
  );
}