import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Compass, MessageSquare, ShieldAlert, Languages, 
  PackageSearch, FilePlus, RefreshCw, Activity, 
  ShieldCheck, Search, HelpCircle, ArrowRight, Zap
} from "lucide-react";
import { StakeholderRole } from "../types";

interface NavigationAction {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  role: StakeholderRole;
  elementId: string;
  color: string;
  category: "fan" | "volunteer" | "staff" | "organizer";
}

interface CommandDeckProps {
  onNavigate: (role: StakeholderRole, elementId: string) => void;
}

export const CommandDeck: React.FC<CommandDeckProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "fan" | "volunteer" | "staff" | "organizer">("all");

  const actions: NavigationAction[] = [
    {
      id: "nav-seat-finder",
      title: "Seat Finder & Routes",
      desc: "Calculate dynamic navigation step-by-step to your stadium seat.",
      icon: <Compass className="w-4 h-4" />,
      role: "fan",
      elementId: "input-block",
      color: "from-blue-500/10 to-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/30",
      category: "fan",
    },
    {
      id: "nav-ai-concierge",
      title: "Multilingual Fan Chat",
      desc: "Ask the Gemini-powered AI Guide for directions, services, and food.",
      icon: <MessageSquare className="w-4 h-4" />,
      role: "fan",
      elementId: "fan-copilot-input",
      color: "from-sky-500/10 to-sky-600/10 text-sky-600 dark:text-sky-400 border-sky-200/50 dark:border-sky-800/30",
      category: "fan",
    },
    {
      id: "nav-queue-checker",
      title: "Bluetooth Line Predictions",
      desc: "Compare dynamic wait times for restrooms, gates, and concessions.",
      icon: <Activity className="w-4 h-4" />,
      role: "fan",
      elementId: "queue-search",
      color: "from-teal-500/10 to-teal-600/10 text-teal-600 dark:text-teal-400 border-teal-200/50 dark:border-teal-800/30",
      category: "fan",
    },
    {
      id: "nav-task-board",
      title: "Volunteer Task Dispatch",
      desc: "Manage tasks, complete assignments, or dispatch manual volunteers.",
      icon: <FilePlus className="w-4 h-4" />,
      role: "volunteer",
      elementId: "btn-toggle-task-form",
      color: "from-emerald-500/10 to-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/30",
      category: "volunteer",
    },
    {
      id: "nav-translate",
      title: "Multilingual Translator",
      desc: "Translate key stadium directives to Spanish, French, Arabic, etc.",
      icon: <Languages className="w-4 h-4" />,
      role: "volunteer",
      elementId: "select-phrase",
      color: "from-violet-500/10 to-violet-600/10 text-violet-600 dark:text-violet-400 border-violet-200/50 dark:border-violet-800/30",
      category: "volunteer",
    },
    {
      id: "nav-lost-found",
      title: "Lost & Found Registry",
      desc: "Register found wallets, phones, or search the digital repository.",
      icon: <PackageSearch className="w-4 h-4" />,
      role: "volunteer",
      elementId: "btn-toggle-lost-form",
      color: "from-purple-500/10 to-purple-600/10 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/30",
      category: "volunteer",
    },
    {
      id: "nav-incident-dispatch",
      title: "AI Incident Triage",
      desc: "Dispatch facility hazards, security issues, or medical emergencies.",
      icon: <ShieldAlert className="w-4 h-4" />,
      role: "staff",
      elementId: "staff-inc-type",
      color: "from-rose-500/10 to-rose-600/10 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/30",
      category: "staff",
    },
    {
      id: "nav-gate-optimization",
      title: "Gate Outflow Simulator",
      desc: "Simulate and auto-balance heavy Sector C crowd egress levels.",
      icon: <RefreshCw className="w-4 h-4" />,
      role: "staff",
      elementId: "btn-optimize-gates",
      color: "from-amber-500/10 to-amber-600/10 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/30",
      category: "staff",
    },
    {
      id: "nav-emergency-terminal",
      title: "Emergency Decision Support",
      desc: "Trigger simulated high-impact stadium crises for AI protocols.",
      icon: <ShieldCheck className="w-4 h-4" />,
      role: "organizer",
      elementId: "emergency-scenario-select",
      color: "from-red-500/10 to-red-600/10 text-red-600 dark:text-red-400 border-red-200/50 dark:border-red-800/30",
      category: "organizer",
    },
    {
      id: "nav-offset-panel",
      title: "Sustainability Scorecard",
      desc: "Check waste diversion kg, transport metrics, and energy offset.",
      icon: <Zap className="w-4 h-4" />,
      role: "organizer",
      elementId: "btn-simulate-sorting",
      color: "from-green-500/10 to-green-600/10 text-green-600 dark:text-green-400 border-green-200/50 dark:border-green-800/30",
      category: "organizer",
    },
  ];

  // Filtering actions
  const filteredActions = actions.filter((action) => {
    const matchesCategory = activeCategory === "all" || action.category === activeCategory;
    const matchesSearch = 
      action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm space-y-5">
      {/* Top Header line with Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-zinc-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>🎯 Venue Command Launcher & Quick Navigator</span>
          </h3>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
            Instantly switch tabs, auto-scroll, flash, and focus deep components inside any of the stakeholder terminals.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search navigators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* Categories Switcher pill buttons */}
      <div className="flex flex-wrap gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-3" role="tablist">
        {(["all", "fan", "volunteer", "staff", "organizer"] as const).map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
              activeCategory === cat
                ? "bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 shadow-sm"
                : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
            }`}
          >
            {cat === "all" ? "🌐 Show All" : cat === "fan" ? "📣 Fan" : cat === "volunteer" ? "🤝 Volunteer" : cat === "staff" ? "🛠️ Staff" : "🎛️ Command"}
          </button>
        ))}
      </div>

      {/* Grid of Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredActions.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs text-zinc-500 italic">
            No matching tools found. Try searching for "AI", "Route", "Incident", or "Emergency".
          </div>
        ) : (
          filteredActions.map((action) => (
            <motion.button
              key={action.id}
              onClick={() => onNavigate(action.role, action.elementId)}
              whileHover={{ scale: 1.015, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`text-left p-3.5 rounded-xl border flex flex-col justify-between h-[115px] bg-gradient-to-br transition-all cursor-pointer hover:shadow-md ${action.color}`}
            >
              <div className="flex justify-between items-start w-full gap-2">
                <span className="p-1.5 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800 shadow-sm">
                  {action.icon}
                </span>
                <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded-md bg-white/70 dark:bg-black/40 border border-zinc-200/30">
                  {action.role}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-extrabold tracking-tight mt-2 flex items-center gap-1.5">
                  <span>{action.title}</span>
                  <ArrowRight className="w-3 h-3 text-current animate-pulse shrink-0" />
                </h4>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium line-clamp-2 leading-relaxed mt-0.5">
                  {action.desc}
                </p>
              </div>
            </motion.button>
          ))
        )}
      </div>

      {/* Integrated Interactive Operational Walkthrough Stepper */}
      <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
        <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide flex items-center gap-1.5 mb-2.5">
          <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" /> Live Interactive Scenario Simulator Flowchart
        </h4>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-3.5 leading-relaxed">
          How do stadium operations connect together? Click any step below to switch roles and see the sequence live!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-center text-xs">
          <button
            onClick={() => onNavigate("fan", "fan-copilot-input")}
            className="p-2.5 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200/40 dark:border-zinc-800 hover:border-emerald-500 transition-all text-left flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block font-bold mb-1">Step 1: Spectator</span>
              <p className="font-bold text-[11px] text-zinc-800 dark:text-zinc-100">Ask AI & Locate Seats</p>
            </div>
            <span className="text-[9px] text-zinc-400 mt-2 block">Try Fan Portal →</span>
          </button>

          <button
            onClick={() => onNavigate("staff", "staff-inc-type")}
            className="p-2.5 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200/40 dark:border-zinc-800 hover:border-emerald-500 transition-all text-left flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 block font-bold mb-1">Step 2: Venue Staff</span>
              <p className="font-bold text-[11px] text-zinc-800 dark:text-zinc-100">AI Incident Triage</p>
            </div>
            <span className="text-[9px] text-zinc-400 mt-2 block">Try Staff Portal →</span>
          </button>

          <button
            onClick={() => onNavigate("volunteer", "btn-toggle-task-form")}
            className="p-2.5 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200/40 dark:border-zinc-800 hover:border-emerald-500 transition-all text-left flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 block font-bold mb-1">Step 3: Volunteer</span>
              <p className="font-bold text-[11px] text-zinc-800 dark:text-zinc-100">Task Resolve & Help</p>
            </div>
            <span className="text-[9px] text-zinc-400 mt-2 block">Try Volunteer Board →</span>
          </button>

          <button
            onClick={() => onNavigate("organizer", "emergency-scenario-select")}
            className="p-2.5 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200/40 dark:border-zinc-800 hover:border-emerald-500 transition-all text-left flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-mono text-red-600 dark:text-red-400 block font-bold mb-1">Step 4: Commander</span>
              <p className="font-bold text-[11px] text-zinc-800 dark:text-zinc-100">Tactical Emergency AI</p>
            </div>
            <span className="text-[9px] text-zinc-400 mt-2 block">Try Command Center →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
