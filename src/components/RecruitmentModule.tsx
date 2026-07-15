import React, { useState } from "react";
import { Employee } from "../types";
import { 
  UserPlus, CheckCircle, Trash, Award, Briefcase, Sparkles,
  ClipboardList, ChevronRight, AlertCircle, RefreshCw, X, ShieldCheck, Play
} from "lucide-react";

interface RecruitmentModuleProps {
  employees: Employee[];
  onAddEmployee: (emp: Partial<Employee>) => void;
  onRemoveEmployee: (id: string) => void;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  gender: string;
  stage: "Applied" | "Interview" | "Offered" | "Onboarded";
  education: string;
  experience: string;
}

export default function RecruitmentModule({ employees, onAddEmployee, onRemoveEmployee }: RecruitmentModuleProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: "CAN-001",
      name: "Sandeep Pokhrel",
      email: "sandeep@gmail.com",
      phone: "+977-9841203456",
      designation: "Field Officer",
      department: "Programs",
      gender: "Male",
      stage: "Applied",
      education: "Master of Public Health (MPH)",
      experience: "4 years monitoring remote nutrition programs"
    },
    {
      id: "CAN-002",
      name: "Manisha Lama",
      email: "manisha@gmail.com",
      phone: "+977-9811029348",
      designation: "Communication Specialist",
      department: "Operations",
      gender: "Female",
      stage: "Interview",
      education: "B.A. in Media and Journalism",
      experience: "3 years running local community radio campaigns"
    },
    {
      id: "CAN-003",
      name: "Pradip Adhikari",
      email: "pradip@gmail.com",
      phone: "+977-9852034110",
      designation: "Finance Associate",
      department: "Finance",
      gender: "Male",
      stage: "Offered",
      education: "M.B.A. in Financial Accounting",
      experience: "5 years auditing local partner cooperatives"
    }
  ]);

  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [candName, setCandName] = useState("");
  const [candEmail, setCandEmail] = useState("");
  const [candPhone, setCandPhone] = useState("");
  const [candRole, setCandRole] = useState("Field Officer");
  const [candDept, setCandDept] = useState("Programs");
  const [candEdu, setCandEdu] = useState("B.A. in Social Studies");
  const [candExp, setCandExp] = useState("1-2 years field project coordinate");

  // Offboarding state variables
  const [selectedOffboardId, setSelectedOffboardId] = useState("");
  const [exitReason, setExitReason] = useState("Contract Completion");
  const [assetsReturned, setAssetsReturned] = useState(false);
  const [financeCleared, setFinanceCleared] = useState(false);
  const [exitInterviewDone, setExitInterviewDone] = useState(false);

  const handleAddCandidateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candName || !candEmail) return;

    const newCand: Candidate = {
      id: `CAN-${Date.now()}`,
      name: candName,
      email: candEmail,
      phone: candPhone,
      designation: candRole,
      department: candDept,
      gender: "Male",
      stage: "Applied",
      education: candEdu,
      experience: candExp
    };

    setCandidates([...candidates, newCand]);
    setCandName("");
    setCandEmail("");
    setCandPhone("");
    setShowAddCandidate(false);
  };

  const handlePromoteCandidate = (id: string) => {
    setCandidates(candidates.map(cand => {
      if (cand.id !== id) return cand;
      
      let nextStage: "Applied" | "Interview" | "Offered" | "Onboarded" = "Applied";
      if (cand.stage === "Applied") nextStage = "Interview";
      else if (cand.stage === "Interview") nextStage = "Offered";
      else if (cand.stage === "Offered") nextStage = "Onboarded";

      return { ...cand, stage: nextStage };
    }));
  };

  // Convert Candidate directly into HRIS roster
  const handleOnboardSubmit = (cand: Candidate) => {
    const freshEmployee: Partial<Employee> = {
      name: cand.name,
      email: cand.email,
      phone: cand.phone,
      gender: cand.gender,
      dob: "1995-08-10",
      maritalStatus: "Single",
      address: "Kathmandu, Nepal",
      emergencyContact: "+977-9801002233",
      citizenshipNo: "61245-A",
      passportNo: "",
      joinDate: new Date().toISOString().split("T")[0],
      probationMonths: 3,
      contractType: "Permanent",
      department: cand.department,
      designation: cand.designation,
      salaryBasic: 50000,
      salaryAllowances: 8000,
      salaryDeductions: 4000,
      pan: "305982541",
      ssf: "SSF-305-192",
      cit: "3500",
      taxInfo: "10% Bracket",
      education: cand.education,
      experience: cand.experience,
      dependents: ""
    };

    onAddEmployee(freshEmployee);
    
    // Remove candidate from recruiter board upon completion
    setCandidates(candidates.filter(c => c.id !== cand.id));
    alert(`Candidate "${cand.name}" has been successfully onboarded! Active employee record created dynamically inside HRIS Employees Database.`);
  };

  // Offboard handler
  const handleOffboardStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffboardId) return;

    if (!assetsReturned || !financeCleared || !exitInterviewDone) {
      alert("Error: All exit clearances (Assets returned, Finance cleared, and Exit interview) must be completed before terminating an employee.");
      return;
    }

    const emp = employees.find(e => e.id === selectedOffboardId);
    if (!emp) return;

    // Delete or mark offboarded
    onRemoveEmployee(selectedOffboardId);
    setSelectedOffboardId("");
    setAssetsReturned(false);
    setFinanceCleared(false);
    setExitInterviewDone(false);

    alert(`Employee "${emp.name}" [${emp.id}] has been offboarded. Corporate hardware checked back in and statutory final accounts settled.`);
  };

  return (
    <div className="space-y-6" id="recruitment-module-root">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recruiter Kanban pipeline */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Briefcase className="h-4.5 w-4.5 text-blue-600 animate-pulse" /> Unified Recruiter Board
              </h3>
              <p className="text-[11px] text-slate-400">Track, review, and onboard job applicants into the central employee ledger.</p>
            </div>
            <button
              onClick={() => setShowAddCandidate(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition-all flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" /> Add Applicant
            </button>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            
            {/* COLUMN 1: Applied */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3 min-h-[350px]">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700 text-xs uppercase font-mono tracking-wider">Applied</span>
                <span className="h-5 w-5 bg-slate-200 text-slate-700 font-bold rounded-full flex items-center justify-center text-[10px]">
                  {candidates.filter(c => c.stage === "Applied").length}
                </span>
              </div>

              <div className="space-y-2.5">
                {candidates.filter(c => c.stage === "Applied").map(c => (
                  <div key={c.id} className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm space-y-2 hover:border-blue-400 transition-all">
                    <div>
                      <strong className="text-slate-800 text-xs block">{c.name}</strong>
                      <span className="text-[10px] text-slate-500 font-mono block">{c.designation} • {c.department}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-2">
                      <strong>Edu:</strong> {c.education}
                    </div>
                    <button
                      onClick={() => handlePromoteCandidate(c.id)}
                      className="w-full mt-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[10px] flex items-center justify-center gap-0.5 transition-all"
                    >
                      Promote to Interview <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 2: Interview */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3 min-h-[350px]">
              <div className="flex justify-between items-center">
                <span className="font-bold text-amber-700 text-xs uppercase font-mono tracking-wider">Interview</span>
                <span className="h-5 w-5 bg-amber-100 text-amber-700 font-bold rounded-full flex items-center justify-center text-[10px]">
                  {candidates.filter(c => c.stage === "Interview").length}
                </span>
              </div>

              <div className="space-y-2.5">
                {candidates.filter(c => c.stage === "Interview").map(c => (
                  <div key={c.id} className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm space-y-2 hover:border-amber-400 transition-all">
                    <div>
                      <strong className="text-slate-800 text-xs block">{c.name}</strong>
                      <span className="text-[10px] text-slate-500 font-mono block">{c.designation} • {c.department}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      <strong>Experience:</strong> {c.experience}
                    </div>
                    <div className="flex gap-1 pt-1">
                      <button
                        onClick={() => handlePromoteCandidate(c.id)}
                        className="flex-1 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-[10px] flex items-center justify-center gap-0.5 transition-all"
                      >
                        Approve Offer <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 3: Offered */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3 min-h-[350px]">
              <div className="flex justify-between items-center">
                <span className="font-bold text-emerald-700 text-xs uppercase font-mono tracking-wider">Offered</span>
                <span className="h-5 w-5 bg-emerald-100 text-emerald-700 font-bold rounded-full flex items-center justify-center text-[10px]">
                  {candidates.filter(c => c.stage === "Offered").length}
                </span>
              </div>

              <div className="space-y-2.5">
                {candidates.filter(c => c.stage === "Offered").map(c => (
                  <div key={c.id} className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm space-y-2 hover:border-emerald-400 transition-all">
                    <div className="p-1.5 bg-emerald-50 rounded text-[10px] text-emerald-800 font-bold flex items-center gap-1 mb-1">
                      <Sparkles className="h-3.5 w-3.5 shrink-0" /> Pending Employee Agreement
                    </div>
                    <div>
                      <strong className="text-slate-800 text-xs block">{c.name}</strong>
                      <span className="text-[10px] text-slate-500 font-mono block">{c.designation} • {c.department}</span>
                    </div>
                    <button
                      onClick={() => handleOnboardSubmit(c)}
                      className="w-full mt-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded text-[10px] flex items-center justify-center gap-1 transition-all"
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Auto-Onboard Staff
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Offboarding Clearance Station */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <ClipboardList className="h-4.5 w-4.5 text-blue-600" /> Exit Clearance Station
            </h3>
            <p className="text-[11px] text-slate-400">Offboard staff with standard verification exit checklists.</p>
          </div>

          <form onSubmit={handleOffboardStaffSubmit} className="space-y-3.5 text-xs text-slate-600">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Active Employee</label>
              <select
                required
                value={selectedOffboardId}
                onChange={(e) => setSelectedOffboardId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="">-- Choose Employee --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} [{emp.id}]</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Reason for Separation</label>
              <select
                value={exitReason}
                onChange={(e) => setExitReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded text-xs bg-white outline-none"
              >
                <option value="Contract Completion">Contract Completion</option>
                <option value="Resignation Submitted">Resignation Submitted</option>
                <option value="Redundancy Release">Redundancy Release</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Verification checklist boxes */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
              <p className="font-bold text-[10px] uppercase text-slate-400">Exit Clearance Verification Tasks</p>
              
              <label className="flex items-center gap-2 font-medium text-slate-700 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={assetsReturned}
                  onChange={(e) => setAssetsReturned(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 h-4 w-4"
                />
                <span>Hardware & Assets Handed In</span>
              </label>

              <label className="flex items-center gap-2 font-medium text-slate-700 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={financeCleared}
                  onChange={(e) => setFinanceCleared(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 h-4 w-4"
                />
                <span>Finance & Petty Cash Audited</span>
              </label>

              <label className="flex items-center gap-2 font-medium text-slate-700 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={exitInterviewDone}
                  onChange={(e) => setExitInterviewDone(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 h-4 w-4"
                />
                <span>Formal Exit Interview Held</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!selectedOffboardId}
              className="w-full py-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold rounded-lg shadow transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Trash className="h-3.5 w-3.5" /> Terminate & Offboard Staff
            </button>
          </form>
        </div>

      </div>

      {/* Add Candidate Modal */}
      {showAddCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowAddCandidate(false)}
              className="absolute right-4 top-4 p-1.5 hover:bg-slate-100 rounded text-slate-400"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1 pb-2 border-b border-slate-100">
              <UserPlus className="h-4.5 w-4.5 text-blue-600" /> New Candidate Application Form
            </h3>

            <form onSubmit={handleAddCandidateSubmit} className="space-y-3 pt-3 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={candName}
                    onChange={(e) => setCandName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded outline-none"
                    placeholder="Candidate full name"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Email</label>
                  <input
                    type="email"
                    required
                    value={candEmail}
                    onChange={(e) => setCandEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded outline-none"
                    placeholder="email@gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Phone</label>
                  <input
                    type="text"
                    required
                    value={candPhone}
                    onChange={(e) => setCandPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded outline-none"
                    placeholder="+977-98..."
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Role Designation</label>
                  <input
                    type="text"
                    required
                    value={candRole}
                    onChange={(e) => setCandRole(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Department</label>
                  <select
                    value={candDept}
                    onChange={(e) => setCandDept(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded outline-none bg-white font-medium"
                  >
                    <option value="Programs">Programs</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Highest Education Degree</label>
                  <input
                    type="text"
                    required
                    value={candEdu}
                    onChange={(e) => setCandEdu(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Candidate Experience Summary</label>
                  <textarea
                    required
                    value={candExp}
                    onChange={(e) => setCandExp(e.target.value)}
                    rows={2}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded outline-none resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow flex items-center justify-center gap-1 cursor-pointer"
              >
                Add Applicant Card
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
