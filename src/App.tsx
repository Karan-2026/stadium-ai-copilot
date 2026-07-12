import { useState, useEffect } from "react";
import { Users, ShieldAlert, ClipboardList, Settings, Sparkles, Volume2, HelpCircle, Sun, Moon } from "lucide-react";
import { StakeholderRole, StadiumSector, QueueItem, TaskItem, LostItem, IncidentReport, SectorStatus } from "./types";
import { STADIUM_SECTORS, INITIAL_QUEUES, INITIAL_TASKS, INITIAL_LOST_ITEMS, INITIAL_INCIDENTS } from "./utils/stadiumData";
import { StadiumLayoutMap } from "./components/StadiumLayoutMap";
import { AccessibilityControl } from "./components/AccessibilityControl";
import { CommandDeck } from "./components/CommandDeck";
import { TestRunner } from "./components/TestRunner";
import { FanSection } from "./components/FanSection";
import { VolunteerSection } from "./components/VolunteerSection";
import { StaffSection } from "./components/StaffSection";
import { OrganizerSection } from "./components/OrganizerSection";

export default function App() {
  // Active Stakeholder Portal Role
  const [activeRole, setActiveRole] = useState<StakeholderRole>("fan");

  // App Global Database States (Simulated live synchronization)
  const [selectedSectorId, setSelectedSectorId] = useState("sec-a");
  const [sectors, setSectors] = useState<StadiumSector[]>(STADIUM_SECTORS);
  const [queues, setQueues] = useState<QueueItem[]>(INITIAL_QUEUES);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [lostItems, setLostItems] = useState<LostItem[]>(INITIAL_LOST_ITEMS);
  const [incidents, setIncidents] = useState<IncidentReport[]>(INITIAL_INCIDENTS);

  // Theme & Dark mode state (defaults to dark for stunning stadium operations HUD, but fully switchable)
  const [darkMode, setDarkMode] = useState(true);

  // Accessibility States
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "extra-large">("normal");
  const [screenReaderActive, setScreenReaderActive] = useState(false);
  const [vocalAnnouncement, setVocalAnnouncement] = useState("");

  // Sync dark theme class on document mount/change
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Helper helper to announce screen reader vocals visually and audibly
  const announceText = (text: string) => {
    setVocalAnnouncement(text);
    if (screenReaderActive && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Automated layout-nav switch, element high-vis glow, and focus trigger
  const triggerQuickNav = (role: StakeholderRole, elementId: string) => {
    setActiveRole(role);
    announceText(`Navigating to ${role} workspace.`);

    // Wait for state-driven render cycle to compile before selecting element
    setTimeout(() => {
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        
        // Apply temporary premium highlight border pulse
        el.classList.add("ring-4", "ring-emerald-500", "ring-offset-2", "scale-[1.015]", "transition-all", "duration-500");
        setTimeout(() => {
          el.classList.remove("ring-4", "ring-emerald-500", "ring-offset-2", "scale-[1.015]");
        }, 2200);

        // Autofocus form fields
        if (el.tagName === "INPUT" || el.tagName === "SELECT" || el.tagName === "TEXTAREA") {
          (el as HTMLElement).focus();
        }
      }
    }, 120);
  };

  // Synchronize state additions
  const handleCompleteTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "completed" as const } : t))
    );
    const completed = tasks.find((t) => t.id === taskId);
    if (completed) {
      announceText(`Task "${completed.title}" has been successfully completed by volunteer dispatcher.`);
    }
  };

  const handleAddLostItem = (item: Omit<LostItem, "id" | "status" | "timestamp">) => {
    const newItem: LostItem = {
      ...item,
      id: "lost-" + Date.now(),
      status: "reported",
      timestamp: "Just Now",
    };
    setLostItems((prev) => [newItem, ...prev]);
    announceText(`New lost item registered: ${item.itemName} logged in ${item.sectorFound}.`);
  };

  const handleAddTask = (task: Omit<TaskItem, "id" | "status" | "timestamp">) => {
    const newTask: TaskItem = {
      ...task,
      id: "task-" + Date.now(),
      status: "pending",
      timestamp: "Just Now",
    };
    setTasks((prev) => [newTask, ...prev]);
    announceText(`New task dispatched: ${task.title}. Priority level: ${task.priority}.`);
  };

  const handleAddIncident = (report: IncidentReport) => {
    setIncidents((prev) => [report, ...prev]);

    // Automatically convert high priority incidents into dispatched tasks for the Volunteer Board!
    const taskTitle = `Incident Dispatch: ${report.type.toUpperCase()} in ${report.sector.split(" - ")[0]}`;
    const newTask: TaskItem = {
      id: "task-auto-" + Date.now(),
      title: taskTitle,
      description: `AI Dispatch Recommendation: ${report.aiRecommendation}. Details: ${report.description}`,
      location: report.sector,
      priority: report.aiPriority,
      status: "pending",
      timestamp: "Just Now",
    };
    setTasks((prev) => [newTask, ...prev]);
    announceText(`Incident logged. Generated automated Volunteer Task Dispatch: "${taskTitle}".`);
  };

  const handleUpdateSectorStatus = (id: string, status: SectorStatus, crowdLevel: number) => {
    setSectors((prev) =>
      prev.map((sec) => (sec.id === id ? { ...sec, status, crowdLevel } : sec))
    );
    const target = sectors.find((s) => s.id === id);
    if (target) {
      announceText(`${target.name.split(" - ")[0]} status updated to ${status} with ${crowdLevel}% occupancy.`);
    }
  };

  // Access active sector
  const activeSector = sectors.find((sec) => sec.id === selectedSectorId) || sectors[0];

  // Font-size helper classes
  const getFontSizeClass = () => {
    switch (fontSize) {
      case "large": return "text-[115%] leading-relaxed";
      case "extra-large": return "text-[130%] leading-loose";
      default: return "text-[100%]";
    }
  };

  return (
    <div className={`min-h-screen ${highContrast ? "bg-black text-white" : "bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50"} ${getFontSizeClass()} transition-colors duration-200`}>
      {/* Skip Navigation Link for WCAG Screen Readers */}
      <a
        href="#main-portal-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 px-4 py-2 rounded-lg text-xs font-bold z-50 shadow-md outline-none"
      >
        Skip to main content
      </a>

      {/* Header section with FIFA style */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white font-black tracking-tighter text-sm">
              F26
            </div>
            <div>
              <h1 className="text-sm font-black text-zinc-950 dark:text-white uppercase tracking-tight flex items-center gap-1.5">
                <span>FIFA World Cup 2026</span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded">
                  VENUE COPILOT
                </span>
              </h1>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                Stadium Command & Operations Control Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Header Theme Toggle */}
            <button
              onClick={() => {
                const next = !darkMode;
                setDarkMode(next);
                announceText(next ? "Dark mode activated" : "Light mode activated");
              }}
              className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
              aria-label="Toggle Theme"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            <div className="hidden sm:flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded font-bold font-mono uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE FEED SYNCED</span>
            </div>
          </div>
        </div>
      </header>

      {/* Screen Reader simulated Vocal Alert Bar */}
      {vocalAnnouncement && (
        <div
          id="vocal-reader-announcer"
          className="bg-emerald-600 dark:bg-emerald-700 text-white px-4 py-2.5 text-xs font-semibold flex items-center gap-2.5 shadow-sm relative transition-all animate-fadeIn"
          role="status"
          aria-live="assertive"
        >
          <Volume2 className="w-4 h-4 shrink-0 animate-pulse" />
          <span className="flex-1">
            <strong>Voice Assistant Screen Alert:</strong> "{vocalAnnouncement}"
          </span>
          <button
            onClick={() => setVocalAnnouncement("")}
            className="text-[10px] hover:underline bg-emerald-700 dark:bg-emerald-800 px-2.5 py-1 rounded transition"
            aria-label="Dismiss vocal alert"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid Portal */}
      <main id="main-portal-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Core Accessibility Bar */}
        <AccessibilityControl
          highContrast={highContrast}
          setHighContrast={setHighContrast}
          fontSize={fontSize}
          setFontSize={setFontSize}
          screenReaderActive={screenReaderActive}
          setScreenReaderActive={setScreenReaderActive}
          announceText={announceText}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* Central Smart Command & Navigation deck */}
        <CommandDeck onNavigate={triggerQuickNav} />

        {/* Stakeholder Segment Switcher Grid */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-2 border border-zinc-200/60 dark:border-zinc-800/80 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          <div className="flex items-center gap-2 px-2.5">
            <Users className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Select Stakeholder Portal:
            </span>
          </div>

          <nav className="grid grid-cols-2 md:flex md:flex-wrap gap-1.5" aria-label="Stakeholder Portal Switcher">
            {/* Fan */}
            <button
              id="tab-btn-fan"
              onClick={() => {
                setActiveRole("fan");
                announceText("Viewing Fan experience portal.");
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                activeRole === "fan"
                  ? "bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow"
                  : "bg-transparent text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-transparent"
              }`}
              aria-current={activeRole === "fan" ? "page" : undefined}
            >
              <span>📣 Fan Portal</span>
            </button>

            {/* Volunteer */}
            <button
              id="tab-btn-volunteer"
              onClick={() => {
                setActiveRole("volunteer");
                announceText("Viewing Volunteer terminal dashboard.");
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                activeRole === "volunteer"
                  ? "bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow"
                  : "bg-transparent text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-transparent"
              }`}
              aria-current={activeRole === "volunteer" ? "page" : undefined}
            >
              <span>🤝 Volunteer Terminal</span>
            </button>

            {/* Staff */}
            <button
              id="tab-btn-staff"
              onClick={() => {
                setActiveRole("staff");
                announceText("Viewing Venue Staff control monitors.");
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                activeRole === "staff"
                  ? "bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow"
                  : "bg-transparent text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-transparent"
              }`}
              aria-current={activeRole === "staff" ? "page" : undefined}
            >
              <span>🛠️ Venue Staff</span>
            </button>

            {/* Organizer */}
            <button
              id="tab-btn-organizer"
              onClick={() => {
                setActiveRole("organizer");
                announceText("Viewing Organizer command center.");
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                activeRole === "organizer"
                  ? "bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow"
                  : "bg-transparent text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-transparent"
              }`}
              aria-current={activeRole === "organizer" ? "page" : undefined}
            >
              <span>🎛️ Command Center</span>
            </button>
          </nav>
        </div>

        {/* Dynamic Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Layout Map (Always active in left panel of layout for Fans, Staff, and Organizers to provide contextual crowd metrics!) */}
          <div className="lg:col-span-1 h-full">
            <StadiumLayoutMap
              sectors={sectors}
              selectedSectorId={selectedSectorId}
              onSelectSector={(id) => {
                setSelectedSectorId(id);
                const target = sectors.find((s) => s.id === id);
                if (target) {
                  announceText(`Selected stadium sector updated to ${target.name}`);
                }
              }}
              accessibilityHighContrast={highContrast}
            />
          </div>

          {/* Active Portal Workspace Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm min-h-[480px] flex flex-col justify-between">
              <div>
                <header className="mb-5 pb-3 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                  <div>
                    <h2 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                      {activeRole === "fan" && "📣 Fan Experience Portal"}
                      {activeRole === "volunteer" && "🤝 Volunteer Support Terminal"}
                      {activeRole === "staff" && "🛠️ Venue Staff & Flow Monitor"}
                      {activeRole === "organizer" && "🎛️ Command & Control Center"}
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      {activeRole === "fan" && "Locate seats, track lines, find restrooms, or ask multilingual AI for guidance."}
                      {activeRole === "volunteer" && "Real-time task prioritizer, lost & found catalogs, and instant fan translator."}
                      {activeRole === "staff" && "Monitor heatmaps, deploy security, mop hazards, or simulate and optimize gate flow."}
                      {activeRole === "organizer" && "Strategic emergency action plans, sustainability scorecards, and sector occupancies."}
                    </p>
                  </div>
                </header>

                {/* Sub section routing */}
                {activeRole === "fan" && (
                  <FanSection
                    selectedSector={activeSector}
                    allQueues={queues}
                    announceText={announceText}
                  />
                )}

                {activeRole === "volunteer" && (
                  <VolunteerSection
                    tasks={tasks}
                    lostItems={lostItems}
                    onCompleteTask={handleCompleteTask}
                    onAddLostItem={handleAddLostItem}
                    onAddTask={handleAddTask}
                    announceText={announceText}
                  />
                )}

                {activeRole === "staff" && (
                  <StaffSection
                    sectors={sectors}
                    incidents={incidents}
                    onSubmitIncident={handleAddIncident}
                    onUpdateSectorStatus={handleUpdateSectorStatus}
                    announceText={announceText}
                  />
                )}

                {activeRole === "organizer" && (
                  <OrganizerSection
                    sectors={sectors}
                    announceText={announceText}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Programmatic Test Runner Suite */}
        <TestRunner />
      </main>

      {/* Simple, Professional, Accessible Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 mt-12 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>© FIFA World Cup 2026 Venue Operations Platform. Powered by Server-Side Gemini 3.5 models.</p>
        </div>
      </footer>
    </div>
  );
}
