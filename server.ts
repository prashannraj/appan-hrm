import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface DocumentUpload {
  id: string;
  name: string;
  type: "Citizenship" | "Passport" | "PAN Card" | "License" | "Certificate" | "Other";
  fileUrl: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
}

interface CompensationComponent {
  id: string;
  name: string;
  type: "percent" | "flat";
  value: number;
  calculatedAmount: number;
}

interface LifecycleEvent {
  id: string;
  date: string;
  type: "Onboard" | "Promotion" | "Transfer" | "Salary Revision" | "Confirmation" | "Disciplinary" | "Exit";
  details: string;
  previousValue?: string;
  newValue?: string;
  approvedBy?: string;
}

interface Policy {
  id: string;
  title: string;
  category: "HR" | "Finance" | "IT" | "Operations";
  version: string;
  publishDate: string;
  content: string;
  acknowledgedBy: string[]; // employee ids
}

// Define TypeScript interfaces for our server data store
interface Employee {
  id: string;
  name: string;
  gender: string;
  dob: string;
  maritalStatus: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  citizenshipNo: string;
  passportNo: string;
  joinDate: string;
  probationMonths: number;
  contractType: string;
  department: string;
  designation: string;
  salaryBasic: number;
  salaryAllowances: number;
  salaryDeductions: number;
  pan: string;
  ssf: string;
  cit: string;
  taxInfo: string;
  assignedAssets: string[];
  education: string;
  experience: string;
  dependents: string;
  profilePicture?: string;
  documents?: DocumentUpload[];
  allowancesList?: CompensationComponent[];
  deductionsList?: CompensationComponent[];
  lifecycleHistory?: LifecycleEvent[];
}

interface AttendanceLog {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: "Present" | "Late" | "Absent" | "Half Day";
  overtimeMinutes: number;
  lateMinutes: number;
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  approvedBy?: string;
  createdAt: string;
}

interface WfhRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  approvedBy?: string;
  createdAt: string;
}

interface Timesheet {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  task: string;
  project: string;
  hours: number;
  status: "Draft" | "Submitted" | "Approved";
  approvedBy?: string;
}

interface TravelRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  destination: string;
  purpose: string;
  startDate: string;
  endDate: string;
  estimatedCost: number;
  advanceAmount: number;
  status: "Pending" | "Approved" | "Settled" | "Rejected";
  expenses: { item: string; amount: number }[];
  approvedBy?: string;
}

interface Asset {
  id: string;
  code: string;
  name: string;
  category: "IT" | "Furniture" | "Vehicle" | "Equipment";
  assignedTo?: string;
  purchaseDate: string;
  cost: number;
  status: "Active" | "Maintenance" | "Disposed";
  maintenanceLogs: { date: string; cost: number; description: string }[];
}

interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  driverName: string;
  status: "Available" | "In Trip" | "Maintenance";
  fuelLogs: { date: string; liters: number; cost: number; mileage: number }[];
  trips: { date: string; route: string; purpose: string; miles: number }[];
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
}

interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  companyName: string;
  agreementSigned: boolean;
  signatureDate?: string;
  signatureName?: string;
  signatureTitle?: string;
  signatureType?: "Upload" | "Draw" | "Type";
  signatureData?: string;
}

// In-Memory Database State
let employees: Employee[] = [
  {
    id: "EMP-001",
    name: "Aarav Sharma",
    gender: "Male",
    dob: "1988-04-12",
    maritalStatus: "Married",
    phone: "+977-9851012345",
    email: "aarav.sharma@example-ngo.org",
    address: "Kathmandu, Nepal",
    emergencyContact: "Sunita Sharma (+977-9803022110)",
    citizenshipNo: "27-01-75-09823",
    passportNo: "N1234567",
    joinDate: "2018-01-15",
    probationMonths: 6,
    contractType: "Permanent",
    department: "Executive",
    designation: "Executive Director",
    salaryBasic: 120000,
    salaryAllowances: 30000,
    salaryDeductions: 15000,
    pan: "302910392",
    ssf: "SSF-89102",
    cit: "CIT-781923",
    taxInfo: "15% Bracket",
    assignedAssets: ["AST-001", "AST-004"],
    education: "Ph.D. in Development Studies, Kathmandu University",
    experience: "15+ years in international non-governmental project direction.",
    dependents: "Sunita Sharma (Spouse), Aarush Sharma (Son)",
    lifecycleHistory: [
      { id: "LC-101", date: "2018-01-15", type: "Onboard", details: "Joined Glow Forward Foundation as Executive Director.", approvedBy: "Board of Directors" },
      { id: "LC-102", date: "2018-07-15", type: "Confirmation", details: "Probation successfully completed and confirmed as Permanent staff.", approvedBy: "Board of Directors" },
      { id: "LC-103", date: "2022-01-15", type: "Salary Revision", details: "Annual increments and inflation correction applied.", previousValue: "NRs. 100,000 Basic", newValue: "NRs. 120,000 Basic", approvedBy: "Finance Committee" }
    ]
  },
  {
    id: "EMP-002",
    name: "Priya Patel",
    gender: "Female",
    dob: "1992-09-24",
    maritalStatus: "Single",
    phone: "+977-9841029384",
    email: "priya.patel@example-ngo.org",
    address: "Lalitpur, Nepal",
    emergencyContact: "Ramesh Patel (+977-9818392019)",
    citizenshipNo: "32-02-79-10291",
    passportNo: "N8910239",
    joinDate: "2020-03-01",
    probationMonths: 3,
    contractType: "Contractual",
    department: "Finance",
    designation: "Finance & Admin Director",
    salaryBasic: 95000,
    salaryAllowances: 20000,
    salaryDeductions: 12000,
    pan: "492019203",
    ssf: "SSF-78192",
    cit: "CIT-671829",
    taxInfo: "15% Bracket",
    assignedAssets: ["AST-002"],
    education: "MBA in Finance, Tribhuvan University",
    experience: "8 years corporate & development sector auditing.",
    dependents: "None",
    lifecycleHistory: [
      { id: "LC-201", date: "2020-03-01", type: "Onboard", details: "Joined Glow Forward Foundation as Finance & Admin Director.", approvedBy: "Aarav Sharma" },
      { id: "LC-202", date: "2020-06-01", type: "Confirmation", details: "Completed 3 months probation period. Confirmed.", approvedBy: "Aarav Sharma" }
    ]
  },
  {
    id: "EMP-003",
    name: "Kiran Thapa",
    gender: "Male",
    dob: "1994-01-10",
    maritalStatus: "Married",
    phone: "+977-9851198765",
    email: "kiran.thapa@example-ngo.org",
    address: "Bhaktapur, Nepal",
    emergencyContact: "Meera Thapa (+977-9851101234)",
    citizenshipNo: "14-01-71-38291",
    passportNo: "N3019283",
    joinDate: "2021-06-15",
    probationMonths: 6,
    contractType: "Permanent",
    department: "Programs",
    designation: "Senior Program Coordinator",
    salaryBasic: 80000,
    salaryAllowances: 15000,
    salaryDeductions: 10000,
    pan: "501923019",
    ssf: "SSF-38291",
    cit: "CIT-283910",
    taxInfo: "15% Bracket",
    assignedAssets: ["AST-003"],
    education: "M.A. in Social Work, St. Xavier's College",
    experience: "5 years working on rural education and healthcare initiatives.",
    dependents: "Meera Thapa (Spouse)",
    lifecycleHistory: [
      { id: "LC-301", date: "2021-06-15", type: "Onboard", details: "Joined as Senior Program Coordinator.", approvedBy: "Aarav Sharma" },
      { id: "LC-302", date: "2021-12-15", type: "Confirmation", details: "Completed 6-month probation successfully.", approvedBy: "Srijana Adhikari" },
      { id: "LC-303", date: "2024-04-01", type: "Promotion", details: "Promoted from Program Coordinator to Senior Program Coordinator based on excellent performance on rural education project.", previousValue: "Program Coordinator", newValue: "Senior Program Coordinator", approvedBy: "Aarav Sharma" }
    ]
  },
  {
    id: "EMP-004",
    name: "Srijana Adhikari",
    gender: "Female",
    dob: "1996-07-18",
    maritalStatus: "Single",
    phone: "+977-9801239847",
    email: "srijana.adhikari@example-ngo.org",
    address: "Pokhara, Nepal",
    emergencyContact: "Gopal Adhikari (+977-9801201201)",
    citizenshipNo: "41-01-81-00293",
    passportNo: "N4820192",
    joinDate: "2022-10-01",
    probationMonths: 3,
    contractType: "Contractual",
    department: "Human Resources",
    designation: "HR Officer",
    salaryBasic: 60000,
    salaryAllowances: 10000,
    salaryDeductions: 8000,
    pan: "602938192",
    ssf: "SSF-10293",
    cit: "CIT-593819",
    taxInfo: "10% Bracket",
    assignedAssets: [],
    education: "B.A. in Business Administration, Pokhara University",
    experience: "3 years in NGO recruiting and policy implementation.",
    dependents: "Gopal Adhikari (Father)",
    lifecycleHistory: [
      { id: "LC-401", date: "2022-10-01", type: "Onboard", details: "Joined as HR Officer.", approvedBy: "Priya Patel" },
      { id: "LC-402", date: "2023-01-01", type: "Confirmation", details: "Confirmed in permanent role after 3 months probation.", approvedBy: "Aarav Sharma" }
    ]
  },
  {
    id: "EMP-005",
    name: "Ram Bahadur",
    gender: "Male",
    dob: "1985-11-30",
    maritalStatus: "Married",
    phone: "+977-9813928172",
    email: "ram.bahadur@example-ngo.org",
    address: "Lalitpur, Nepal",
    emergencyContact: "Sita Bahadur (+977-9813000111)",
    citizenshipNo: "21-03-72-91023",
    passportNo: "",
    joinDate: "2019-05-01",
    probationMonths: 0,
    contractType: "Permanent",
    department: "Operations",
    designation: "Head Driver",
    salaryBasic: 40000,
    salaryAllowances: 12000,
    salaryDeductions: 5000,
    pan: "102938129",
    ssf: "SSF-02918",
    cit: "CIT-392812",
    taxInfo: "10% Bracket",
    assignedAssets: ["VEH-001"],
    education: "Secondary School Completion",
    experience: "10+ years light & heavy vehicle driving, off-road experience.",
    dependents: "Sita Bahadur (Spouse), Ramita Bahadur (Daughter)",
    lifecycleHistory: [
      { id: "LC-501", date: "2019-05-01", type: "Onboard", details: "Joined as Head Driver.", approvedBy: "Priya Patel" }
    ]
  }
];

let users: User[] = [
  {
    id: "USER-001",
    email: "admin@appan.com",
    passwordHash: "admin123",
    fullName: "Prashann Raj",
    companyName: "AppanTech",
    agreementSigned: true,
    signatureDate: "2026-06-12T10:00:00.000Z",
    signatureName: "Prashann Raj",
    signatureTitle: "Managing Director",
    signatureType: "Type",
    signatureData: "Prashann Raj"
  }
];

let activeSessions: { [token: string]: string } = {
  "token_admin_key_123456789": "USER-001" // Seeded token for admin
};

let attendance: AttendanceLog[] = [
  {
    id: "ATT-001",
    employeeId: "EMP-001",
    employeeName: "Aarav Sharma",
    date: "2026-07-14",
    checkIn: "08:55",
    checkOut: "17:05",
    status: "Present",
    overtimeMinutes: 5,
    lateMinutes: 0
  },
  {
    id: "ATT-002",
    employeeId: "EMP-002",
    employeeName: "Priya Patel",
    date: "2026-07-14",
    checkIn: "09:15",
    checkOut: "17:10",
    status: "Late",
    overtimeMinutes: 10,
    lateMinutes: 15
  },
  {
    id: "ATT-003",
    employeeId: "EMP-003",
    employeeName: "Kiran Thapa",
    date: "2026-07-14",
    checkIn: "08:45",
    checkOut: "17:00",
    status: "Present",
    overtimeMinutes: 0,
    lateMinutes: 0
  },
  {
    id: "ATT-004",
    employeeId: "EMP-005",
    employeeName: "Ram Bahadur",
    date: "2026-07-14",
    checkIn: "08:30",
    checkOut: "18:00",
    status: "Present",
    overtimeMinutes: 60,
    lateMinutes: 0
  }
];

let leaves: LeaveRequest[] = [
  {
    id: "LV-101",
    employeeId: "EMP-003",
    employeeName: "Kiran Thapa",
    leaveType: "Sick Leave",
    startDate: "2026-07-10",
    endDate: "2026-07-11",
    reason: "Severe viral fever",
    status: "Approved",
    approvedBy: "Aarav Sharma",
    createdAt: "2026-07-09"
  },
  {
    id: "LV-102",
    employeeId: "EMP-004",
    employeeName: "Srijana Adhikari",
    leaveType: "Casual Leave",
    startDate: "2026-07-20",
    endDate: "2026-07-22",
    reason: "Attending sister's wedding",
    status: "Pending",
    createdAt: "2026-07-13"
  }
];

let wfh: WfhRequest[] = [
  {
    id: "WFH-001",
    employeeId: "EMP-002",
    employeeName: "Priya Patel",
    startDate: "2026-07-15",
    endDate: "2026-07-16",
    reason: "Plumbing maintenance at home and tax filing sync",
    status: "Pending",
    createdAt: "2026-07-14"
  }
];

let timesheets: Timesheet[] = [
  {
    id: "TS-001",
    employeeId: "EMP-003",
    employeeName: "Kiran Thapa",
    date: "2026-07-14",
    task: "Drafting Quarterly Education Progress Report",
    project: "Rural Literacy Initiative",
    hours: 8,
    status: "Approved",
    approvedBy: "Aarav Sharma"
  },
  {
    id: "TS-002",
    employeeId: "EMP-004",
    employeeName: "Srijana Adhikari",
    date: "2026-07-14",
    task: "Sourcing candidate resumes and preliminary interviews",
    project: "Staff Capacity Building",
    hours: 7.5,
    status: "Submitted"
  }
];

let travel: TravelRequest[] = [
  {
    id: "TRV-001",
    employeeId: "EMP-003",
    employeeName: "Kiran Thapa",
    destination: "Surkhet District, Western Nepal",
    purpose: "Field monitoring of newly constructed literacy hubs",
    startDate: "2026-07-25",
    endDate: "2026-07-30",
    estimatedCost: 35000,
    advanceAmount: 25000,
    status: "Approved",
    expenses: [],
    approvedBy: "Priya Patel"
  },
  {
    id: "TRV-002",
    employeeId: "EMP-001",
    employeeName: "Aarav Sharma",
    destination: "Geneva, Switzerland",
    purpose: "NGO Global Partners Summit and donor networking",
    startDate: "2026-08-10",
    endDate: "2026-08-16",
    estimatedCost: 280000,
    advanceAmount: 200000,
    status: "Pending",
    expenses: []
  }
];

let assets: Asset[] = [
  {
    id: "AST-001",
    code: "AST-IT-2023-01",
    name: "MacBook Pro 14\"",
    category: "IT",
    assignedTo: "EMP-001",
    purchaseDate: "2023-04-12",
    cost: 185000,
    status: "Active",
    maintenanceLogs: [
      { date: "2024-11-02", cost: 12000, description: "Battery thermal diagnostic and replacement" }
    ]
  },
  {
    id: "AST-002",
    code: "AST-IT-2023-02",
    name: "Dell Latitude 5430",
    category: "IT",
    assignedTo: "EMP-002",
    purchaseDate: "2023-05-20",
    cost: 110000,
    status: "Active",
    maintenanceLogs: []
  },
  {
    id: "AST-003",
    code: "AST-IT-2024-05",
    name: "Lenovo ThinkPad L14",
    category: "IT",
    assignedTo: "EMP-003",
    purchaseDate: "2024-02-15",
    cost: 95000,
    status: "Active",
    maintenanceLogs: []
  },
  {
    id: "AST-004",
    code: "AST-FUR-2021-08",
    name: "Ergonomic Office Mesh Chair",
    category: "Furniture",
    assignedTo: "EMP-001",
    purchaseDate: "2021-08-10",
    cost: 25000,
    status: "Active",
    maintenanceLogs: []
  },
  {
    id: "AST-005",
    code: "AST-EQ-2022-11",
    name: "Epson Projector EB-E01",
    category: "Equipment",
    purchaseDate: "2022-11-30",
    cost: 45000,
    status: "Maintenance",
    maintenanceLogs: [
      { date: "2026-07-02", cost: 8000, description: "Projector bulb replacement and filter cleaning" }
    ]
  }
];

let vehicles: Vehicle[] = [
  {
    id: "VEH-001",
    plateNumber: "Ba 3 Cha 9012",
    model: "Toyota Land Cruiser Prado",
    driverName: "Ram Bahadur",
    status: "Available",
    fuelLogs: [
      { date: "2026-07-01", liters: 65, cost: 11050, mileage: 124500 },
      { date: "2026-07-12", liters: 70, cost: 11900, mileage: 125100 }
    ],
    trips: [
      { date: "2026-07-05", route: "Kathmandu to Sindhupalchok return", purpose: "Water Project Site Audit", miles: 180 },
      { date: "2026-07-11", route: "Kathmandu city transfers", purpose: "Receiving UN donor delegation", miles: 45 }
    ]
  },
  {
    id: "VEH-002",
    plateNumber: "Ba 2 Cha 4810",
    model: "Mahindra Scorpio 4WD",
    driverName: "Hari Prasad",
    status: "Maintenance",
    fuelLogs: [
      { date: "2026-06-25", liters: 50, cost: 8500, mileage: 98400 }
    ],
    trips: [
      { date: "2026-06-20", route: "Kathmandu to Trishuli return", purpose: "Healthcare Hub Setup", miles: 140 }
    ]
  }
];

let auditLogs: AuditLog[] = [
  {
    id: "LOG-001",
    timestamp: "2026-07-15T08:15:00-07:00",
    user: "Srijana Adhikari (HR)",
    action: "Created Employee Record EMP-004",
    module: "HRIS"
  },
  {
    id: "LOG-002",
    timestamp: "2026-07-15T09:10:00-07:00",
    user: "Aarav Sharma (Admin)",
    action: "Approved Leave Request LV-101",
    module: "LEAVE"
  },
  {
    id: "LOG-003",
    timestamp: "2026-07-15T10:02:00-07:00",
    user: "Priya Patel (Finance)",
    action: "Linked Asset AST-001 to Aarav Sharma",
    module: "ASSETS"
  }
];

let policies: Policy[] = [
  {
    id: "POL-001",
    title: "Appan HRM Personnel & Code of Conduct Policy",
    category: "HR",
    version: "v1.4",
    publishDate: "2026-06-12",
    content: "This policy establishes the core expectations of professional conduct, operational integrity, and ethical practice. All employees of the organization must adhere to high standards of transparency, respect, and compliance with local laws. This includes zero tolerance for discrimination, harassment, or conflicts of interest. Personal relationship disclosures and strict boundary rules for managers are mandatory.",
    acknowledgedBy: ["EMP-001", "EMP-003"]
  },
  {
    id: "POL-002",
    title: "Travel & Daily Allowance (TADA) Policy",
    category: "Finance",
    version: "v2.1",
    publishDate: "2026-07-01",
    content: "Defines reimbursement rates for domestic and international official travels. Standard daily allowance (per diem) for field personnel in Koshi and Madhesh provinces is capped at NRs. 2,500 per day. For Bagmati province field work, it is NRs. 2,000 per day. Official receipt upload is mandatory for lodging accommodations, and all trips must have pre-approved travel requests.",
    acknowledgedBy: ["EMP-002"]
  },
  {
    id: "POL-003",
    title: "Information Security & Asset Protection Guide",
    category: "IT",
    version: "v1.0",
    publishDate: "2025-08-15",
    content: "Establishes secure handling parameters for organization-issued hardware (laptops, mobile phones, tablets). Users must configure strong passwords/PINs, keep firmware updated, and avoid storing sensitive personally identifiable information (PII) on unencrypted local drives. Lost assets must be reported to the IT Officer within 4 hours.",
    acknowledgedBy: ["EMP-001", "EMP-004"]
  }
];

let organizationSettings = {
  name: "Glow Forward Foundation",
  acronym: "GFF",
  registeredAddress: "Sanepa Heights, Lalitpur, Nepal",
  email: "info@glowforward.org",
  phone: "+977-1-5523019",
  registrationNo: "Reg-39201/SWC-9201",
  fiscalYear: "2025/2026",
  departments: ["Executive", "Programs", "Finance", "Human Resources", "M&E", "Operations"],
  designations: ["Executive Director", "Finance & Admin Director", "Senior Program Coordinator", "M&E Specialist", "HR Officer", "Program Associate", "Finance Assistant", "Head Driver", "Office Assistant"],
  leavePolicies: [
    { type: "Casual Leave", allocation: 12, cashable: false },
    { type: "Sick Leave", allocation: 15, cashable: true },
    { type: "Maternity Leave", allocation: 60, cashable: false },
    { type: "Paternity Leave", allocation: 10, cashable: false },
    { type: "Special Leave", allocation: 6, cashable: false }
  ]
};

// Darbandi Position Control Helper
const getDarbandiStats = () => {
  const approved = [
    { title: "Executive Director", approved: 1, department: "Executive" },
    { title: "Finance & Admin Director", approved: 1, department: "Finance" },
    { title: "Senior Program Coordinator", approved: 2, department: "Programs" },
    { title: "M&E Specialist", approved: 1, department: "M&E" },
    { title: "HR Officer", approved: 1, department: "Human Resources" },
    { title: "Program Associate", approved: 3, department: "Programs" },
    { title: "Finance Assistant", approved: 2, department: "Finance" },
    { title: "Head Driver", approved: 1, department: "Operations" },
    { title: "Office Assistant", approved: 2, department: "Operations" }
  ];

  return approved.map(pos => {
    const filled = employees.filter(emp => emp.designation === pos.title).length;
    return {
      ...pos,
      filled,
      remaining: pos.approved - filled
    };
  });
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser Middleware
  app.use(express.json());

  // Helper to authenticate user from Authorization header
  function getLoggedInUser(req: express.Request): User | null {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.split(" ")[1];
    const userId = activeSessions[token];
    if (!userId) return null;
    const user = users.find(u => u.id === userId);
    return user || null;
  }

  // Auth: Register
  app.post("/api/v1/auth/register", (req, res) => {
    const { email, password, fullName, companyName } = req.body;
    if (!email || !password || !fullName || !companyName) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const lowerEmail = email.toLowerCase().trim();
    if (users.some(u => u.email.toLowerCase() === lowerEmail)) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const newUser: User = {
      id: `USER-00${users.length + 1}`,
      email: lowerEmail,
      passwordHash: password,
      fullName: fullName.trim(),
      companyName: companyName.trim(),
      agreementSigned: false
    };
    users.push(newUser);

    const token = `token_${Math.random().toString(36).substr(2)}_${Date.now()}`;
    activeSessions[token] = newUser.id;

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        companyName: newUser.companyName,
        agreementSigned: newUser.agreementSigned
      }
    });
  });

  // Auth: Login
  app.post("/api/v1/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const lowerEmail = email.toLowerCase().trim();
    const user = users.find(u => u.email.toLowerCase() === lowerEmail && u.passwordHash === password);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = `token_${Math.random().toString(36).substr(2)}_${Date.now()}`;
    activeSessions[token] = user.id;

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        agreementSigned: user.agreementSigned,
        signatureDate: user.signatureDate,
        signatureName: user.signatureName,
        signatureTitle: user.signatureTitle,
        signatureType: user.signatureType,
        signatureData: user.signatureData
      }
    });
  });

  // Auth: Me (get logged-in user profile)
  app.get("/api/v1/auth/me", (req, res) => {
    const user = getLoggedInUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        agreementSigned: user.agreementSigned,
        signatureDate: user.signatureDate,
        signatureName: user.signatureName,
        signatureTitle: user.signatureTitle,
        signatureType: user.signatureType,
        signatureData: user.signatureData
      }
    });
  });

  // Auth: Sign Agreement
  app.post("/api/v1/auth/sign-agreement", (req, res) => {
    const user = getLoggedInUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { signatureName, signatureTitle, signatureType, signatureData } = req.body;
    if (!signatureName) {
      return res.status(400).json({ error: "Signature name is required" });
    }

    user.agreementSigned = true;
    user.signatureDate = new Date().toISOString();
    user.signatureName = signatureName;
    user.signatureTitle = signatureTitle || "";
    user.signatureType = signatureType || "Type";
    user.signatureData = signatureData || signatureName;

    auditLogs.unshift({
      id: `LOG-0${auditLogs.length + 10}`,
      timestamp: new Date().toISOString(),
      user: user.fullName,
      action: `Signed Appan HRM Service Agreement (Customer: ${user.companyName})`,
      module: "SETTINGS"
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        agreementSigned: user.agreementSigned,
        signatureDate: user.signatureDate,
        signatureName: user.signatureName,
        signatureTitle: user.signatureTitle,
        signatureType: user.signatureType,
        signatureData: user.signatureData
      }
    });
  });

  // Auth: Logout
  app.post("/api/v1/auth/logout", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      delete activeSessions[token];
    }
    res.json({ success: true });
  });

  // 1. API ROUTES

  // Health check
  app.get("/api/v1/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // MIS Dashboard Stats
  app.get("/api/v1/dashboard/stats", (req, res) => {
    const totalEmployees = employees.length;
    const activeAssets = assets.length;
    const maintenanceAssets = assets.filter(a => a.status === "Maintenance").length;
    const activeVehicles = vehicles.filter(v => v.status === "Available").length;
    const pendingLeaves = leaves.filter(l => l.status === "Pending").length;
    const pendingTravels = travel.filter(t => t.status === "Pending").length;
    const pendingWfh = wfh.filter(w => w.status === "Pending").length;

    // Attendance rate for today
    const presentToday = attendance.filter(a => a.status === "Present" || a.status === "Late").length;
    const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 100;

    // Monthly expenditure on fleet, assets and salaries
    const totalSalaries = employees.reduce((sum, emp) => sum + emp.salaryBasic + emp.salaryAllowances, 0);
    const assetValue = assets.reduce((sum, a) => sum + a.cost, 0);

    res.json({
      totalEmployees,
      activeAssets,
      maintenanceAssets,
      activeVehicles,
      pendingLeaves,
      pendingTravels,
      pendingWfh,
      attendanceRate,
      totalSalaries,
      assetValue,
      darbandi: getDarbandiStats()
    });
  });

  // HRIS: Get and post employees
  app.get("/api/v1/employees", (req, res) => {
    res.json(employees);
  });

  app.post("/api/v1/employees", (req, res) => {
    const newEmp: Employee = {
      id: `EMP-00${employees.length + 1}`,
      name: req.body.name || "New Employee",
      gender: req.body.gender || "Male",
      dob: req.body.dob || "1995-01-01",
      maritalStatus: req.body.maritalStatus || "Single",
      phone: req.body.phone || "",
      email: req.body.email || "",
      address: req.body.address || "",
      emergencyContact: req.body.emergencyContact || "",
      citizenshipNo: req.body.citizenshipNo || "C-TEMP-9920",
      passportNo: req.body.passportNo || "",
      joinDate: req.body.joinDate || new Date().toISOString().split('T')[0],
      probationMonths: Number(req.body.probationMonths) || 3,
      contractType: req.body.contractType || "Contractual",
      department: req.body.department || "Programs",
      designation: req.body.designation || "Program Associate",
      salaryBasic: Number(req.body.salaryBasic) || 50000,
      salaryAllowances: Number(req.body.salaryAllowances) || 8000,
      salaryDeductions: Number(req.body.salaryDeductions) || 5000,
      pan: req.body.pan || "",
      ssf: req.body.ssf || "",
      cit: req.body.cit || "",
      taxInfo: req.body.taxInfo || "10% Bracket",
      assignedAssets: [],
      education: req.body.education || "Bachelor's Degree",
      experience: req.body.experience || "Fresh entry / mid level experience",
      dependents: req.body.dependents || "None",
      profilePicture: req.body.profilePicture || "",
      documents: req.body.documents || [],
      allowancesList: req.body.allowancesList || [],
      deductionsList: req.body.deductionsList || []
    };

    employees.push(newEmp);

    auditLogs.unshift({
      id: `LOG-0${auditLogs.length + 10}`,
      timestamp: new Date().toISOString(),
      user: "System Admin (HR)",
      action: `Created Employee Record ${newEmp.id} (${newEmp.name})`,
      module: "HRIS"
    });

    res.status(201).json(newEmp);
  });

  app.put("/api/v1/employees/:id", (req, res) => {
    const { id } = req.params;
    const index = employees.findIndex(e => e.id === id);
    if (index !== -1) {
      const existing = employees[index];
      const updated: Employee = {
        ...existing,
        ...req.body,
        id: existing.id // protect ID from changing
      };

      // Ensure types
      if (req.body.salaryBasic !== undefined) updated.salaryBasic = Number(req.body.salaryBasic);
      if (req.body.salaryAllowances !== undefined) updated.salaryAllowances = Number(req.body.salaryAllowances);
      if (req.body.salaryDeductions !== undefined) updated.salaryDeductions = Number(req.body.salaryDeductions);
      if (req.body.probationMonths !== undefined) updated.probationMonths = Number(req.body.probationMonths);

      // Bidirectional asset sync
      if (req.body.assignedAssets !== undefined) {
        const newAssetIds: string[] = req.body.assignedAssets;
        assets.forEach(asset => {
          if (asset.assignedTo === id && !newAssetIds.includes(asset.id)) {
            asset.assignedTo = undefined;
          } else if (newAssetIds.includes(asset.id)) {
            asset.assignedTo = id;
          }
        });
      }

      employees[index] = updated;

      auditLogs.unshift({
        id: `LOG-0${auditLogs.length + 10}`,
        timestamp: new Date().toISOString(),
        user: "System Admin (HR)",
        action: `Updated Employee Record ${id} (${updated.name})`,
        module: "HRIS"
      });

      res.json(updated);
    } else {
      res.status(404).json({ error: "Employee not found" });
    }
  });

  app.delete("/api/v1/employees/:id", (req, res) => {
    const { id } = req.params;
    const index = employees.findIndex(e => e.id === id);
    if (index !== -1) {
      const removed = employees.splice(index, 1)[0];
      auditLogs.unshift({
        id: `LOG-0${auditLogs.length + 10}`,
        timestamp: new Date().toISOString(),
        user: "System Admin (HR)",
        action: `Archived Employee Record ${id} (${removed.name})`,
        module: "HRIS"
      });
      res.json({ success: true, message: `Employee ${id} archived` });
    } else {
      res.status(404).json({ error: "Employee not found" });
    }
  });

  // Policies Endpoints
  app.get("/api/v1/policies", (req, res) => {
    res.json(policies);
  });

  app.post("/api/v1/policies", (req, res) => {
    const { title, category, version, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and Content are required." });
    }
    const newPolicy: Policy = {
      id: `POL-00${policies.length + 1}`,
      title,
      category: category || "HR",
      version: version || "v1.0",
      publishDate: new Date().toISOString().split("T")[0],
      content,
      acknowledgedBy: []
    };
    policies.unshift(newPolicy);

    auditLogs.unshift({
      id: `LOG-0${auditLogs.length + 10}`,
      timestamp: new Date().toISOString(),
      user: "System Admin (HR)",
      action: `Published Policy: ${newPolicy.title} (${newPolicy.version})`,
      module: "SETTINGS"
    });

    res.status(201).json(newPolicy);
  });

  app.post("/api/v1/policies/:id/acknowledge", (req, res) => {
    const { id } = req.params;
    const { employeeId } = req.body;
    if (!employeeId) {
      return res.status(400).json({ error: "Employee ID is required." });
    }
    const policy = policies.find(p => p.id === id);
    if (!policy) {
      return res.status(404).json({ error: "Policy not found." });
    }
    if (!policy.acknowledgedBy.includes(employeeId)) {
      policy.acknowledgedBy.push(employeeId);
      const emp = employees.find(e => e.id === employeeId);
      auditLogs.unshift({
        id: `LOG-0${auditLogs.length + 10}`,
        timestamp: new Date().toISOString(),
        user: emp ? emp.name : `Employee ${employeeId}`,
        action: `Acknowledged Policy: ${policy.title} (${policy.version})`,
        module: "HRIS"
      });
    }
    res.json(policy);
  });

  // Attendance Endpoints
  app.get("/api/v1/attendance", (req, res) => {
    res.json(attendance);
  });

  app.post("/api/v1/attendance/check-in", (req, res) => {
    const { employeeId } = req.body;
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const existing = attendance.find(a => a.employeeId === employeeId && a.date === todayStr);
    if (existing) {
      return res.status(400).json({ error: "Already checked in today" });
    }

    const checkInTime = new Date().toTimeString().slice(0, 5); // e.g. "09:15"
    const standardHour = 9;
    const [h, m] = checkInTime.split(":").map(Number);
    const lateMinutes = h > standardHour ? (h - standardHour) * 60 + m : h === standardHour && m > 0 ? m : 0;
    const status = lateMinutes > 15 ? "Late" : "Present";

    const log: AttendanceLog = {
      id: `ATT-0${attendance.length + 100}`,
      employeeId,
      employeeName: emp.name,
      date: todayStr,
      checkIn: checkInTime,
      status,
      overtimeMinutes: 0,
      lateMinutes
    };

    attendance.unshift(log);

    auditLogs.unshift({
      id: `LOG-0${auditLogs.length + 10}`,
      timestamp: new Date().toISOString(),
      user: emp.name,
      action: `Checked In at ${checkInTime} (Status: ${status})`,
      module: "ATTENDANCE"
    });

    res.status(201).json(log);
  });

  app.post("/api/v1/attendance/check-out", (req, res) => {
    const { employeeId } = req.body;
    const todayStr = new Date().toISOString().split("T")[0];
    const log = attendance.find(a => a.employeeId === employeeId && a.date === todayStr);

    if (!log) {
      return res.status(404).json({ error: "Check-in record not found for today" });
    }

    if (log.checkOut) {
      return res.status(400).json({ error: "Already checked out today" });
    }

    const checkOutTime = new Date().toTimeString().slice(0, 5); // e.g. "17:30"
    log.checkOut = checkOutTime;

    // Calculate overtime if staying past 17:00 (standard is 9:00 - 17:00)
    const [h, m] = checkOutTime.split(":").map(Number);
    if (h >= 17) {
      log.overtimeMinutes = (h - 17) * 60 + m;
    }

    auditLogs.unshift({
      id: `LOG-0${auditLogs.length + 10}`,
      timestamp: new Date().toISOString(),
      user: log.employeeName,
      action: `Checked Out at ${checkOutTime} (Overtime: ${log.overtimeMinutes} mins)`,
      module: "ATTENDANCE"
    });

    res.json(log);
  });

  // Leave Management Endpoints
  app.get("/api/v1/leaves", (req, res) => {
    res.json(leaves);
  });

  app.post("/api/v1/leaves", (req, res) => {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body;
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    const newRequest: LeaveRequest = {
      id: `LV-${leaves.length + 105}`,
      employeeId,
      employeeName: emp.name,
      leaveType,
      startDate,
      endDate,
      reason,
      status: "Pending",
      createdAt: new Date().toISOString().split("T")[0]
    };

    leaves.unshift(newRequest);

    auditLogs.unshift({
      id: `LOG-0${auditLogs.length + 10}`,
      timestamp: new Date().toISOString(),
      user: emp.name,
      action: `Submitted Leave Request for ${leaveType} (${startDate} to ${endDate})`,
      module: "LEAVE"
    });

    res.status(201).json(newRequest);
  });

  app.post("/api/v1/leaves/:id/approve", (req, res) => {
    const { id } = req.params;
    const { approver, action } = req.body; // action: 'Approved' | 'Rejected'
    const request = leaves.find(l => l.id === id);

    if (!request) return res.status(404).json({ error: "Leave request not found" });

    request.status = action === "Rejected" ? "Rejected" : "Approved";
    request.approvedBy = approver || "Aarav Sharma";

    auditLogs.unshift({
      id: `LOG-0${auditLogs.length + 10}`,
      timestamp: new Date().toISOString(),
      user: request.approvedBy,
      action: `${request.status} leave request ${id} for ${request.employeeName}`,
      module: "LEAVE"
    });

    res.json(request);
  });

  // Work From Home (WFH) Endpoints
  app.get("/api/v1/wfh", (req, res) => {
    res.json(wfh);
  });

  app.post("/api/v1/wfh", (req, res) => {
    const { employeeId, startDate, endDate, reason } = req.body;
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    const newRequest: WfhRequest = {
      id: `WFH-00${wfh.length + 2}`,
      employeeId,
      employeeName: emp.name,
      startDate,
      endDate,
      reason,
      status: "Pending",
      createdAt: new Date().toISOString().split("T")[0]
    };

    wfh.unshift(newRequest);

    auditLogs.unshift({
      id: `LOG-0${auditLogs.length + 10}`,
      timestamp: new Date().toISOString(),
      user: emp.name,
      action: `Submitted WFH Request (${startDate} to ${endDate})`,
      module: "WFH"
    });

    res.status(201).json(newRequest);
  });

  app.post("/api/v1/wfh/:id/approve", (req, res) => {
    const { id } = req.params;
    const { approver, action } = req.body;
    const request = wfh.find(w => w.id === id);

    if (!request) return res.status(404).json({ error: "WFH request not found" });

    request.status = action === "Rejected" ? "Rejected" : "Approved";
    request.approvedBy = approver || "Aarav Sharma";

    auditLogs.unshift({
      id: `LOG-0${auditLogs.length + 10}`,
      timestamp: new Date().toISOString(),
      user: request.approvedBy,
      action: `${request.status} WFH request ${id} for ${request.employeeName}`,
      module: "WFH"
    });

    res.json(request);
  });

  // Timesheets Endpoints
  app.get("/api/v1/timesheets", (req, res) => {
    res.json(timesheets);
  });

  app.post("/api/v1/timesheets", (req, res) => {
    const { employeeId, task, project, hours, date } = req.body;
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    const newTimesheet: Timesheet = {
      id: `TS-${timesheets.length + 101}`,
      employeeId,
      employeeName: emp.name,
      date: date || new Date().toISOString().split("T")[0],
      task,
      project,
      hours: Number(hours) || 8,
      status: "Submitted"
    };

    timesheets.unshift(newTimesheet);

    auditLogs.unshift({
      id: `LOG-0${auditLogs.length + 10}`,
      timestamp: new Date().toISOString(),
      user: emp.name,
      action: `Submitted Daily Timesheet for project ${project} (${hours} Hours)`,
      module: "TIMESHEET"
    });

    res.status(201).json(newTimesheet);
  });

  // Travel Management Endpoints
  app.get("/api/v1/travel", (req, res) => {
    res.json(travel);
  });

  app.post("/api/v1/travel", (req, res) => {
    const { employeeId, destination, purpose, startDate, endDate, estimatedCost, advanceAmount } = req.body;
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    const newRequest: TravelRequest = {
      id: `TRV-${travel.length + 101}`,
      employeeId,
      employeeName: emp.name,
      destination,
      purpose,
      startDate,
      endDate,
      estimatedCost: Number(estimatedCost) || 0,
      advanceAmount: Number(advanceAmount) || 0,
      status: "Pending",
      expenses: []
    };

    travel.unshift(newRequest);

    auditLogs.unshift({
      id: `LOG-0${auditLogs.length + 10}`,
      timestamp: new Date().toISOString(),
      user: emp.name,
      action: `Created Travel Proposal to ${destination}`,
      module: "TRAVEL"
    });

    res.status(201).json(newRequest);
  });

  app.post("/api/v1/travel/:id/approve", (req, res) => {
    const { id } = req.params;
    const { approver, action } = req.body;
    const request = travel.find(t => t.id === id);

    if (!request) return res.status(404).json({ error: "Travel request not found" });

    request.status = action === "Rejected" ? "Rejected" : "Approved";
    request.approvedBy = approver || "Priya Patel";

    auditLogs.unshift({
      id: `LOG-0${auditLogs.length + 10}`,
      timestamp: new Date().toISOString(),
      user: request.approvedBy,
      action: `${request.status} travel request ${id} to ${request.destination}`,
      module: "TRAVEL"
    });

    res.json(request);
  });

  app.post("/api/v1/travel/:id/settle", (req, res) => {
    const { id } = req.params;
    const { expenses } = req.body; // array of { item, amount }
    const request = travel.find(t => t.id === id);

    if (!request) return res.status(404).json({ error: "Travel request not found" });

    request.expenses = expenses;
    request.status = "Settled";

    const totalExpense = expenses.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);

    auditLogs.unshift({
      id: `LOG-0${auditLogs.length + 10}`,
      timestamp: new Date().toISOString(),
      user: "System Finance",
      action: `Settled Travel Expenses for ${request.employeeName} (Spent: NRs. ${totalExpense})`,
      module: "TRAVEL"
    });

    res.json(request);
  });

  // Assets Management Endpoints
  app.get("/api/v1/assets", (req, res) => {
    res.json(assets);
  });

  app.post("/api/v1/assets", (req, res) => {
    const { name, category, purchaseDate, cost, assignedTo } = req.body;

    const newAsset: Asset = {
      id: `AST-00${assets.length + 1}`,
      code: `AST-${category.toUpperCase().slice(0, 3)}-2026-${assets.length + 1}`,
      name,
      category,
      purchaseDate: purchaseDate || new Date().toISOString().split("T")[0],
      cost: Number(cost) || 0,
      assignedTo: assignedTo || undefined,
      status: "Active",
      maintenanceLogs: []
    };

    assets.unshift(newAsset);

    if (assignedTo) {
      const emp = employees.find(e => e.id === assignedTo);
      if (emp) {
        emp.assignedAssets.push(newAsset.id);
      }
    }

    auditLogs.unshift({
      id: `LOG-0${auditLogs.length + 10}`,
      timestamp: new Date().toISOString(),
      user: "Admin/Assets Officer",
      action: `Registered New Asset ${newAsset.code} (${name})`,
      module: "ASSETS"
    });

    res.status(201).json(newAsset);
  });

  app.post("/api/v1/assets/:id/maintenance", (req, res) => {
    const { id } = req.params;
    const { cost, description } = req.body;
    const asset = assets.find(a => a.id === id);

    if (!asset) return res.status(404).json({ error: "Asset not found" });

    asset.status = "Maintenance";
    asset.maintenanceLogs.unshift({
      date: new Date().toISOString().split("T")[0],
      cost: Number(cost) || 0,
      description
    });

    auditLogs.unshift({
      id: `LOG-0${auditLogs.length + 10}`,
      timestamp: new Date().toISOString(),
      user: "Asset Maintenance Team",
      action: `Moved asset ${asset.code} to maintenance (${description})`,
      module: "ASSETS"
    });

    res.json(asset);
  });

  app.post("/api/v1/assets/:id/resolve-maintenance", (req, res) => {
    const { id } = req.params;
    const asset = assets.find(a => a.id === id);

    if (!asset) return res.status(404).json({ error: "Asset not found" });

    asset.status = "Active";

    auditLogs.unshift({
      id: `LOG-0${auditLogs.length + 10}`,
      timestamp: new Date().toISOString(),
      user: "Asset Maintenance Team",
      action: `Resolved maintenance for asset ${asset.code} to Active`,
      module: "ASSETS"
    });

    res.json(asset);
  });

  // Fleet Management Endpoints
  app.get("/api/v1/fleet", (req, res) => {
    res.json(vehicles);
  });

  app.post("/api/v1/fleet/logs", (req, res) => {
    const { vehicleId, type, date, liters, cost, mileage, route, purpose, miles } = req.body;
    const vehicle = vehicles.find(v => v.id === vehicleId);

    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    const logDate = date || new Date().toISOString().split("T")[0];

    if (type === "fuel") {
      vehicle.fuelLogs.unshift({
        date: logDate,
        liters: Number(liters) || 0,
        cost: Number(cost) || 0,
        mileage: Number(mileage) || 0
      });

      auditLogs.unshift({
        id: `LOG-0${auditLogs.length + 10}`,
        timestamp: new Date().toISOString(),
        user: vehicle.driverName,
        action: `Logged ${liters}L fuel purchase for vehicle ${vehicle.plateNumber}`,
        module: "FLEET"
      });
    } else if (type === "trip") {
      vehicle.trips.unshift({
        date: logDate,
        route,
        purpose,
        miles: Number(miles) || 0
      });

      auditLogs.unshift({
        id: `LOG-0${auditLogs.length + 10}`,
        timestamp: new Date().toISOString(),
        user: vehicle.driverName,
        action: `Logged trip to ${route} (${miles} Miles)`,
        module: "FLEET"
      });
    }

    res.json(vehicle);
  });

  // Settings Endpoints
  app.get("/api/v1/settings", (req, res) => {
    res.json(organizationSettings);
  });

  app.post("/api/v1/settings", (req, res) => {
    organizationSettings = {
      ...organizationSettings,
      ...req.body
    };

    auditLogs.unshift({
      id: `LOG-0${auditLogs.length + 10}`,
      timestamp: new Date().toISOString(),
      user: "Super Admin",
      action: "Updated general NGO organization settings & policies",
      module: "SETTINGS"
    });

    res.json(organizationSettings);
  });

  // Audit Logs Endpoint
  app.get("/api/v1/logs", (req, res) => {
    res.json(auditLogs);
  });


  // 2. VITE DEV VS PRODUCTION SERVING
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite development middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production static build...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NGO Full-Stack MIS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start full-stack NGO server:", err);
});
