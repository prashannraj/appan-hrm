export interface DocumentUpload {
  id: string;
  name: string;
  type: "Citizenship" | "Passport" | "PAN Card" | "License" | "Certificate" | "Other";
  fileUrl: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
}

export interface CompensationComponent {
  id: string;
  name: string;
  type: "percent" | "flat";
  value: number;
  calculatedAmount: number;
}

export interface Employee {
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

export interface LifecycleEvent {
  id: string;
  date: string;
  type: "Onboard" | "Promotion" | "Transfer" | "Salary Revision" | "Confirmation" | "Disciplinary" | "Exit";
  details: string;
  previousValue?: string;
  newValue?: string;
  approvedBy?: string;
}

export interface AttendanceLog {
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

export interface LeaveRequest {
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

export interface WfhRequest {
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

export interface Timesheet {
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

export interface TravelRequest {
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

export interface Asset {
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

export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  driverName: string;
  status: "Available" | "In Trip" | "Maintenance";
  fuelLogs: { date: string; liters: number; cost: number; mileage: number }[];
  trips: { date: string; route: string; purpose: string; miles: number }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
}

export interface OrganizationSettings {
  name: string;
  acronym: string;
  registeredAddress: string;
  email: string;
  phone: string;
  registrationNo: string;
  fiscalYear: string;
  departments: string[];
  designations: string[];
  leavePolicies: { type: string; allocation: number; cashable: boolean }[];
}

export interface DashboardStats {
  totalEmployees: number;
  activeAssets: number;
  maintenanceAssets: number;
  activeVehicles: number;
  pendingLeaves: number;
  pendingTravels: number;
  pendingWfh: number;
  attendanceRate: number;
  totalSalaries: number;
  assetValue: number;
  darbandi: { title: string; approved: number; department: string; filled: number; remaining: number }[];
}
