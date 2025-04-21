export const CURRENCY_CONFIG = {
  IN: { 
    code: "INR", 
    symbol: "₹", 
    label: "Indian Rupee",
    countries: ["India"]
  },
  US: { 
    code: "USD", 
    symbol: "$", 
    label: "US Dollar",
    countries: ["United States"] 
  },
  GB: { 
    code: "GBP", 
    symbol: "£", 
    label: "British Pound",
    countries: ["United Kingdom"] 
  },
  EU: { 
    code: "EUR", 
    symbol: "€", 
    label: "Euro",
    countries: [
      "Austria", "Belgium", "Cyprus", "Estonia", "Finland",
      "France", "Germany", "Greece", "Ireland", "Italy",
      "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands",
      "Portugal", "Slovakia", "Slovenia", "Spain"
    ]
  },
  AU: { 
    code: "AUD", 
    symbol: "A$", 
    label: "Australian Dollar",
    countries: ["Australia"]
  }
} as const;