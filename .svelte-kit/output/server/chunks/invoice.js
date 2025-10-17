const createEmptyInvoiceItem = () => ({
  id: crypto.randomUUID(),
  productName: "",
  specification: "",
  unit: "件",
  quantity: 1,
  unitPrice: 0,
  amount: 0,
  note: ""
});
const createEmptyInvoice = (companyInfo) => ({
  id: crypto.randomUUID(),
  invoiceNumber: generateInvoiceNumber(),
  date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
  customerInfo: {
    name: "",
    address: "",
    phone: "",
    email: ""
  },
  companyInfo,
  items: [createEmptyInvoiceItem()],
  totalAmount: 0,
  createdBy: "",
  status: "draft",
  type: "sale",
  paymentStatus: "unpaid",
  paidAmount: 0
});
const generateInvoiceNumber = () => {
  const now = /* @__PURE__ */ new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const time = String(now.getTime()).slice(-4);
  return `INV${year}${month}${day}${time}`;
};
const calculateTotalAmount = (items) => {
  return Math.round(items.reduce((total, item) => total + item.amount, 0) * 100) / 100;
};
const formatCurrency = (amount) => {
  return amount.toFixed(2);
};
const createEmptyCustomer = () => ({
  id: crypto.randomUUID(),
  name: "",
  category: "",
  initialDebt: 0,
  phone: "",
  backupPhone: "",
  address: "",
  fax: "",
  email: "",
  notes: "",
  images: [],
  attachments: [],
  createdAt: (/* @__PURE__ */ new Date()).toISOString(),
  updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
  isActive: true
});
const createEmptyProduct = () => ({
  id: crypto.randomUUID(),
  name: "",
  barcode: "",
  category: "",
  specifications: [],
  attributes: [],
  unit: "件",
  prices: [],
  tags: [],
  notes: "",
  images: [],
  createdAt: (/* @__PURE__ */ new Date()).toISOString(),
  updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
  isActive: true
});
export {
  calculateTotalAmount as a,
  createEmptyCustomer as b,
  createEmptyInvoice as c,
  createEmptyProduct as d,
  formatCurrency as f
};
