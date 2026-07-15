import React, { useState } from "react";
import { LeaveRequest, WfhRequest, Employee } from "../types";
import { Calendar, User, FileText, Check, X, ShieldAlert, Sparkles, Send, MapPin, Laptop } from "lucide-react";

interface LeaveModuleProps {
  leaves: LeaveRequest[];
  wfh: WfhRequest[];
  employees: Employee[];
  onAddLeave: (req: Partial<LeaveRequest>) => void;
  onAddWfh: (req: Partial<WfhRequest>) => void;
  onApproveLeave: (id: string, action: "Approved" | "Rejected") => void;
  onApproveWfh: (id: string, action: "Approved" | "Rejected") => void;
  currentUserRole: string;
}

export default function LeaveModule({ 
  leaves, wfh, employees, onAddLeave, onAddWfh, onApproveLeave, onApproveWfh, currentUserRole 
}: LeaveModuleProps) {
  const [activeTab, setActiveTab] = useState<"leaves" | "wfh">("leaves");
  const [selectedEmpId, setSelectedEmpId] = useState("");
  
  // Leave Form States
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [leaveStart, setLeaveStart] = useState("");
  const [leaveEnd, setLeaveEnd] = useState("");
  const [leaveReason, setLeaveReason] = useState("");

  // WFH Form States
  const [wfhStart, setWfhStart] = useState("");
  const [wfhEnd, setWfhEnd] = useState("");
  const [wfhReason, setWfhReason] = useState("");

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !leaveStart || !leaveEnd || !leaveReason) {
      alert("Please populate all leave parameters.");
      return;
    }
    onAddLeave({
      employeeId: selectedEmpId,
      leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      reason: leaveReason
    });
    // Reset
    setLeaveStart("");
    setLeaveEnd("");
    setLeaveReason("");
  };

  const handleWfhSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !wfhStart || !wfhEnd || !wfhReason) {
      alert("Please populate all WFH parameters.");
      return;
    }
    onAddWfh({
      employeeId: selectedEmpId,
      startDate: wfhStart,
      endDate: wfhEnd,
      reason: wfhReason
    });
    // Reset
    setWfhStart("");
    setWfhEnd("");
    setWfhReason("");
  };

  const isWorkflowAuthorized = ["super-admin", "hr-manager", "dept-head"].includes(currentUserRole);

  return (
    <div className="space-y-6" id="leave-module-root">
      {/* Sub Module Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start w-fit">
        <button
          onClick={() => setActiveTab("leaves")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "leaves" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Calendar className="h-4 w-4" />
          Leave Allocation & Approvals
        </button>
        <button
          onClick={() => setActiveTab("wfh")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "wfh" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Laptop className="h-4 w-4" />
          Work From Home (WFH) Logs
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Submit Forms */}
        <div className="lg:col-span-1 space-y-6">
          {activeTab === "leaves" ? (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Calendar className="h-4.5 w-4.5 text-blue-600" /> Apply for Official Leave
              </h3>
              <form onSubmit={handleLeaveSubmit} className="space-y-3.5 text-xs text-slate-600">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Applying Employee</label>
                  <select
                    value={selectedEmpId}
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded bg-white outline-none"
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} [{e.id}]</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Leave Category</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded bg-white outline-none"
                  >
                    <option>Casual Leave</option>
                    <option>Sick Leave</option>
                    <option>Maternity Leave</option>
                    <option>Paternity Leave</option>
                    <option>Special Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={leaveStart}
                      onChange={(e) => setLeaveStart(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={leaveEnd}
                      onChange={(e) => setLeaveEnd(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Reason for Absence</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide explanatory justification for review"
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  Submit Leave Request
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Laptop className="h-4.5 w-4.5 text-blue-600" /> Lodge WFH Application
              </h3>
              <form onSubmit={handleWfhSubmit} className="space-y-3.5 text-xs text-slate-600">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Employee Filing</label>
                  <select
                    value={selectedEmpId}
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded bg-white outline-none"
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} [{e.id}]</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={wfhStart}
                      onChange={(e) => setWfhStart(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={wfhEnd}
                      onChange={(e) => setWfhEnd(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Task Deliverables & Reason</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="List key tasks you will deliver remotely"
                    value={wfhReason}
                    onChange={(e) => setWfhReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  Submit WFH Request
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Side: Approval Queue & History */}
        <div className="lg:col-span-2">
          {activeTab === "leaves" ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Leave Approvals & Workflows</h3>
                  <p className="text-[11px] text-slate-500">Multi-level authorization hierarchy</p>
                </div>
                {!isWorkflowAuthorized && (
                  <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5" /> Employee View
                  </span>
                )}
              </div>

              <div className="divide-y divide-slate-100 overflow-y-auto max-h-[450px]">
                {leaves.map((req) => (
                  <div key={req.id} className="p-5 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                          {req.id}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{req.employeeName}</span>
                        <span className="text-[10px] font-mono text-slate-400">({req.employeeId})</span>
                      </div>
                      
                      <p className="text-slate-700"><span className="font-bold text-slate-800">Type:</span> {req.leaveType} &bull; <span className="font-semibold text-slate-600">{req.startDate} to {req.endDate}</span></p>
                      <p className="text-slate-500 text-[11px] leading-relaxed italic">"{req.reason}"</p>
                      
                      {req.approvedBy && (
                        <p className="text-[10px] text-slate-400">Approved by: <span className="font-semibold text-slate-600">{req.approvedBy}</span></p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        req.status === "Approved" 
                          ? "bg-blue-50 text-blue-700 border border-blue-100" 
                          : req.status === "Rejected"
                          ? "bg-red-50 text-red-700 border border-red-100"
                          : "bg-amber-50 text-amber-700 border border-amber-100 animate-pulse"
                      }`}>
                        {req.status}
                      </span>

                      {req.status === "Pending" && isWorkflowAuthorized && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => onApproveLeave(req.id, "Approved")}
                            className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded shadow-sm transition-all"
                            title="Approve Leave"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onApproveLeave(req.id, "Rejected")}
                            className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded shadow-sm transition-all"
                            title="Reject Leave"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {leaves.length === 0 && (
                  <p className="text-center py-12 text-slate-400">No leaves requests found.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">WFH Dispatch Monitor</h3>
                  <p className="text-[11px] text-slate-500">Monitor active remote operations</p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 overflow-y-auto max-h-[450px]">
                {wfh.map((req) => (
                  <div key={req.id} className="p-5 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                          {req.id}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{req.employeeName}</span>
                      </div>
                      
                      <p className="text-slate-700"><span className="font-semibold text-slate-600">{req.startDate} to {req.endDate}</span></p>
                      <p className="text-slate-500 text-[11px] leading-relaxed italic">Deliverables: "{req.reason}"</p>
                      
                      {req.approvedBy && (
                        <p className="text-[10px] text-slate-400">Approved by: <span className="font-semibold text-slate-600">{req.approvedBy}</span></p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        req.status === "Approved" 
                          ? "bg-blue-50 text-blue-700 border border-blue-100" 
                          : req.status === "Rejected"
                          ? "bg-red-50 text-red-700 border border-red-100"
                          : "bg-amber-50 text-amber-700 border border-amber-100 animate-pulse"
                      }`}>
                        {req.status}
                      </span>

                      {req.status === "Pending" && isWorkflowAuthorized && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => onApproveWfh(req.id, "Approved")}
                            className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded shadow-sm transition-all"
                            title="Approve WFH"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onApproveWfh(req.id, "Rejected")}
                            className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded shadow-sm transition-all"
                            title="Reject WFH"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {wfh.length === 0 && (
                  <p className="text-center py-12 text-slate-400">No remote WFH records log.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
