import React, { useState } from "react";
import { AlertTriangle, Sparkles, Send, ShieldAlert, Navigation2, FilePlus, RefreshCw, Activity } from "lucide-react";
import { StadiumSector, IncidentReport, SectorStatus } from "../types";

interface StaffSectionProps {
  sectors: StadiumSector[];
  incidents: IncidentReport[];
  onSubmitIncident: (report: IncidentReport) => void;
  onUpdateSectorStatus: (id: string, status: SectorStatus, crowdLevel: number) => void;
  announceText: (text: string) => void;
}

export const StaffSection: React.FC<StaffSectionProps> = ({
  sectors,
  incidents,
  onSubmitIncident,
  onUpdateSectorStatus,
  announceText,
}) => {
  // Incident Form State
  const [incType, setIncType] = useState<"medical" | "crowd" | "security" | "facility" | "other">("facility");
  const [incSector, setIncSector] = useState("Sector B - East Gate");
  const [incDesc, setIncDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resource Allocation Board
  const [securityStatus, setSecurityStatus] = useState("Standby");
  const [medicalStatus, setMedicalStatus] = useState("Standby");
  const [cleaningStatus, setCleaningStatus] = useState("Standby");

  // Local Gate Optimization Simulator
  const [optimizingGate, setOptimizingGate] = useState(false);

  const handleIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incDesc.trim() || isSubmitting) return;

    setIsSubmitting(true);
    announceText("Triage analyst evaluating safety inputs.");

    try {
      const response = await fetch("/api/copilot/incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: incType,
          sector: incSector,
          description: incDesc,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const newReport: IncidentReport = {
          id: "inc-" + Date.now(),
          type: incType,
          sector: incSector,
          description: incDesc,
          status: "reported",
          timestamp: "Just Now",
          aiPriority: data.priority || "medium",
          aiRecommendation: data.recommendation || "Safety team advised. Monitor crowd parameters.",
        };

        onSubmitIncident(newReport);

        // Auto update sector statuses based on AI's parsed recommendations!
        const matchingSector = sectors.find((s) => incSector.includes(s.name.split(" - ")[0]));
        if (matchingSector && data.suggestedSectorStatus) {
          onUpdateSectorStatus(
            matchingSector.id,
            data.suggestedSectorStatus as SectorStatus,
            Math.min(matchingSector.crowdLevel + 10, 100)
          );
        }

        setIncDesc("");
        announceText(`Incident successfully registered. AI Priority level classified as: ${data.priority}`);
      } else {
        throw new Error(data.error || "Triage server offline");
      }
    } catch (err: any) {
      // Offline fallback
      const defaultPriority = incType === "security" || incType === "medical" ? "high" : "medium";
      const fallbackReport: IncidentReport = {
        id: "inc-" + Date.now(),
        type: incType,
        sector: incSector,
        description: incDesc,
        status: "reported",
        timestamp: "Just Now",
        aiPriority: defaultPriority as any,
        aiRecommendation: `[Local Backup] Safety wardens notified for ${incSector}. Deploy resources.`,
      };
      onSubmitIncident(fallbackReport);
      setIncDesc("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOptimizeGates = async () => {
    setOptimizingGate(true);
    announceText("Initiating computer-vision simulation modeling gate outflows...");
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Optimize congested Sector C status
    onUpdateSectorStatus("sec-c", "crowded", 78);
    setOptimizingGate(false);
    announceText("Optimization complete. Sector C flow balancing redirects open. Crowding level reduced to 78%.");
  };

  const handleDispatchResource = (resource: "security" | "medical" | "cleaning", status: string) => {
    if (resource === "security") setSecurityStatus(status);
    if (resource === "medical") setMedicalStatus(status);
    if (resource === "cleaning") setCleaningStatus(status);
    announceText(`Resource ${resource} reassigned to status: ${status}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Live Incidents Logging & AI Triage */}
      <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-100 dark:border-zinc-800/80 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-2">
            <FilePlus className="w-4 h-4 text-emerald-600" /> Dispatch New Operational Report
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            Report crowding bottlenecks, physical hazards, facility failures, or medical conditions. Real-time Gemini models prioritize and recommend action items.
          </p>

          <form onSubmit={handleIncidentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="staff-inc-type" className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Incident Category</label>
                <select
                  id="staff-inc-type"
                  value={incType}
                  onChange={(e) => setIncType(e.target.value as any)}
                  className="w-full mt-1 text-xs font-semibold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-700 dark:text-zinc-300 outline-none"
                >
                  <option value="facility">Facility Spill / Repair</option>
                  <option value="crowd">Crowd Bottleneck</option>
                  <option value="medical">Medical / First Aid Request</option>
                  <option value="security">Security Alert / Threat</option>
                  <option value="other">Other General Dispatch</option>
                </select>
              </div>

              <div>
                <label htmlFor="staff-inc-loc" className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Sector Location</label>
                <select
                  id="staff-inc-loc"
                  value={incSector}
                  onChange={(e) => setIncSector(e.target.value)}
                  className="w-full mt-1 text-xs font-semibold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-700 dark:text-zinc-300 outline-none"
                >
                  {sectors.map((s) => (
                    <option key={s.id} value={s.name}>{s.name.split(" - ")[0]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="staff-inc-desc" className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Immediate Details / Description</label>
              <textarea
                id="staff-inc-desc"
                required
                rows={3}
                value={incDesc}
                onChange={(e) => setIncDesc(e.target.value)}
                placeholder="Describe specifically what is happening (e.g. Broken barrier lock at South plaza entrance gate S1 causing crowd queues to stall completely)"
                className="w-full mt-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>

            <button
              type="submit"
              id="btn-dispatch-incident"
              disabled={isSubmitting}
              className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Generating AI Structural Triage..." : "Submit Report to AI Triage Optimizer"}</span>
            </button>
          </form>
        </div>

        {/* Live incident list displaying structural results */}
        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2.5">
            Real-Time AI Evaluated Incident Logs
          </h4>
          <div className="space-y-2 max-h-[160px] overflow-y-auto">
            {incidents.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-2">No incidents logged.</p>
            ) : (
              incidents.map((inc) => (
                <div key={inc.id} className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800 flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase">{inc.type}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      inc.aiPriority === "critical" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                      inc.aiPriority === "high" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}>
                      Priority: {inc.aiPriority}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1">{inc.description}</p>
                  <div className="mt-2 text-[10px] bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded text-emerald-800 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30">
                    <strong>AI Recommendation:</strong> {inc.aiRecommendation}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Operations Resource Allocation & Gate optimization column */}
      <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
        {/* Resource allocations panel */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-100 dark:border-zinc-800/80">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-emerald-600" /> Resource Deployment Console
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            Direct field response teams instantly to hot zones depending on safety and sanitation metrics.
          </p>

          <div className="space-y-3.5">
            {/* Security deployment row */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
              <div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">Security Squads</span>
                <span className="text-[10px] text-zinc-500">Status: {securityStatus}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleDispatchResource("security", "Sector C (Supporters)")}
                  id="btn-deploy-sec-c"
                  className="px-2 py-1 bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 text-white rounded text-[10px] font-bold"
                >
                  Send C
                </button>
                <button
                  onClick={() => handleDispatchResource("security", "Standby")}
                  id="btn-sec-standby"
                  className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded text-[10px] font-medium"
                >
                  Standby
                </button>
              </div>
            </div>

            {/* Medical squad */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
              <div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">First Aid Wardens</span>
                <span className="text-[10px] text-zinc-500">Status: {medicalStatus}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleDispatchResource("medical", "Sector B (East plaza)")}
                  id="btn-deploy-med-b"
                  className="px-2 py-1 bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 text-white rounded text-[10px] font-bold"
                >
                  Send B
                </button>
                <button
                  onClick={() => handleDispatchResource("medical", "Standby")}
                  id="btn-med-standby"
                  className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded text-[10px] font-medium"
                >
                  Standby
                </button>
              </div>
            </div>

            {/* Cleaning crew */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">Sanitation Crew</span>
                <span className="text-[10px] text-zinc-500">Status: {cleaningStatus}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleDispatchResource("cleaning", "Sector A (North Entrance)")}
                  id="btn-deploy-clean-a"
                  className="px-2 py-1 bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 text-white rounded text-[10px] font-bold"
                >
                  Send A
                </button>
                <button
                  onClick={() => handleDispatchResource("cleaning", "Standby")}
                  id="btn-clean-standby"
                  className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded text-[10px] font-medium"
                >
                  Standby
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic outflow computer simulation */}
        <div className="bg-gradient-to-br from-zinc-50 to-zinc-100/50 dark:from-zinc-900 dark:to-zinc-950 p-5 rounded-xl border border-zinc-100 dark:border-zinc-800">
          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" /> AI Congestion Prediction & Mitigation
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
            Sector C (South Supporters Zone) is experiencing <strong>92% crowd congestion</strong>. Simulating automatic gate adjustments and route-guide announcements can balance spectator egress safely.
          </p>

          <button
            onClick={handleOptimizeGates}
            id="btn-optimize-gates"
            disabled={optimizingGate}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${optimizingGate ? "animate-spin" : ""}`} />
            <span>{optimizingGate ? "Simulating Outflows..." : "Optimize Gates & Re-Route Egress"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
