import { BillingItem, PaymentMethod } from "./types";

export const billingHistory: BillingItem[] = [
  {
    id: "bill-1",
    description: "November 2024 - AI API Usage",
    amount: 32450,
    date: "2024-11-30T00:00:00Z",
    status: "pending",
  },
  {
    id: "bill-2",
    description: "October 2024 - AI API Usage",
    amount: 28900,
    date: "2024-10-31T00:00:00Z",
    status: "paid",
    invoiceUrl: "/invoices/oct-2024.pdf",
  },
  {
    id: "bill-3",
    description: "September 2024 - AI API Usage",
    amount: 25400,
    date: "2024-09-30T00:00:00Z",
    status: "paid",
    invoiceUrl: "/invoices/sep-2024.pdf",
  },
  {
    id: "bill-4",
    description: "August 2024 - AI API Usage",
    amount: 22100,
    date: "2024-08-31T00:00:00Z",
    status: "paid",
    invoiceUrl: "/invoices/aug-2024.pdf",
  },
  {
    id: "bill-5",
    description: "July 2024 - AI API Usage",
    amount: 19800,
    date: "2024-07-31T00:00:00Z",
    status: "paid",
    invoiceUrl: "/invoices/jul-2024.pdf",
  },
  {
    id: "bill-6",
    description: "June 2024 - AI API Usage",
    amount: 15200,
    date: "2024-06-30T00:00:00Z",
    status: "paid",
    invoiceUrl: "/invoices/jun-2024.pdf",
  },
];

export const paymentMethods: PaymentMethod[] = [
  {
    id: "pm-1",
    type: "card",
    last4: "4242",
    brand: "Visa",
    expiryMonth: 12,
    expiryYear: 2026,
    isDefault: true,
  },
  {
    id: "pm-2",
    type: "card",
    last4: "8888",
    brand: "Mastercard",
    expiryMonth: 8,
    expiryYear: 2025,
    isDefault: false,
  },
  {
    id: "pm-3",
    type: "bank",
    last4: "6789",
    isDefault: false,
  },
];

export const billingPlan = {
  name: "Business",
  price: 299,
  currency: "USD",
  interval: "month",
  features: [
    "Unlimited workspaces",
    "Unlimited projects",
    "Up to 50 bots",
    "Priority support",
    "Advanced analytics",
    "Custom integrations",
    "SSO authentication",
  ],
  usage: {
    bots: { used: 22, limit: 50 },
    apiCalls: { used: 2850000, limit: 5000000 },
    storage: { used: 45, limit: 100, unit: "GB" },
  },
};

