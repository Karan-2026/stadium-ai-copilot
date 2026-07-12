import React, { useState } from "react";
import { Search, MapPin, Navigation, Clock, MessageSquare, Send, Globe, Compass } from "lucide-react";
import { StadiumSector, QueueItem, CopilotMessage } from "../types";
import { LANGUAGES } from "../utils/stadiumData";

interface FanSectionProps {
  selectedSector: StadiumSector;
  allQueues: QueueItem[];
  announceText: (text: string) => void;
}

export const FanSection: React.FC<FanSectionProps> = ({
  selectedSector,
  allQueues,
  announceText,
}) => {
  // Seat Finder State
  const [blockInput, setBlockInput] = useState("");
  const [rowInput, setRowInput] = useState("");
  const [seatInput, setSeatInput] = useState("");
  const [navigationSteps, setNavigationSteps] = useState<string[]>([]);

  // Queue State
  const [queueSearch, setQueueSearch] = useState("");
  const [queueFilter, setQueueFilter] = useState<"all" | "food" | "restroom" | "gate">("all");

  // AI Copilot State
  const [chatLanguage, setChatLanguage] = useState("en");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<CopilotMessage[]>([
    {
      id: "m-init",
      role: "assistant",
      content: "Hello! I am your FIFA 2026 AI Venue Guide. Ask me for directions, food stand recommendations, restrooms, or transportation options.",
      timestamp: "Just now"
    }
  ]);
  const [isSending, setIsSending] = useState(false);

  // Seat Finder Handler
  const handleFindSeat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockInput || !rowInput) {
      announceText("Please enter block and row numbers.");
      return;
    }

    const steps = [
      `Enter through Gate ${selectedSector.gates[0] || "nearest gate"} based on your ticket.`,
      `Head to Section Concourse Level ${parseInt(blockInput) > 200 ? "2" : "1"}.`,
      `Navigate to Block ${blockInput}, Row ${rowInput}.`,
      `Your Seat ${seatInput || "is near aisle"} is marked with blue accessibility indicators.`
    ];
    setNavigationSteps(steps);
    announceText(`Routing steps generated for Block ${blockInput}. Enter through gate ${selectedSector.gates[0]}`);
  };

  // AI Concierge Chat Handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSending) return;

    const userMsg: CopilotMessage = {
      id: "m-" + Date.now(),
      role: "user",
      content: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsSending(true);
    announceText("Sending inquiry to FIFA AI Concierge.");

    try {
      const response = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "fan",
          messages: [...chatMessages, userMsg].map(m => ({ role: m.role, content: m.content })),
          language: LANGUAGES.find(l => l.code === chatLanguage)?.label || "English"
        })
      });

      const data = await response.json();
      if (response.ok && data.content) {
        const assistantMsg: CopilotMessage = {
          id: "m-" + Date.now(),
          role: "assistant",
          content: data.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages((prev) => [...prev, assistantMsg]);
        announceText(`New guidance received from AI: ${data.content.substring(0, 50)}`);
      } else {
        throw new Error(data.error || "Failed payload communication");
      }
    } catch (err: any) {
      // Local fallback
      const assistantMsg: CopilotMessage = {
        id: "m-" + Date.now(),
        role: "assistant",
        content: `[Local Assist] Our servers are currently busy. To reach your seat in ${selectedSector.name}, proceed to ${selectedSector.gates[0]}. RESTROOMS are located in concourse Blocks 102 and 214. FOOD queue wait is approximately 10 minutes.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsSending(false);
    }
  };

  // Filter Queues
  const filteredQueues = allQueues.filter((q) => {
    if (q.sectorId !== selectedSector.id) return false;
    const matchesSearch = q.name.toLowerCase().includes(queueSearch.toLowerCase());
    const matchesFilter = queueFilter === "all" || q.type === queueFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Overview Alert */}
      <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
            Connected Sector: {selectedSector.name}
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {selectedSector.description} Live density check: <strong className="text-zinc-700 dark:text-zinc-300">{selectedSector.crowdLevel}% occupancy</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Navigation & Seat Finder Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-100 dark:border-zinc-800/80 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2 mb-3">
              <Compass className="w-4 h-4 text-emerald-600" /> Dynamic Seat Finder
            </h3>

            <form onSubmit={handleFindSeat} className="grid grid-cols-3 gap-2.5 mb-4">
              <div>
                <label htmlFor="input-block" className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                  Block
                </label>
                <input
                  id="input-block"
                  type="text"
                  placeholder="104"
                  value={blockInput}
                  onChange={(e) => setBlockInput(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="input-row" className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                  Row
                </label>
                <input
                  id="input-row"
                  type="text"
                  placeholder="H"
                  value={rowInput}
                  onChange={(e) => setRowInput(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="input-seat" className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                  Seat (Opt)
                </label>
                <input
                  id="input-seat"
                  type="text"
                  placeholder="14"
                  value={seatInput}
                  onChange={(e) => setSeatInput(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                id="btn-route-finder"
                className="col-span-3 mt-1.5 w-full py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Calculate Best Route</span>
              </button>
            </form>

            {navigationSteps.length > 0 && (
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 rounded-lg border border-emerald-100/50 dark:border-emerald-900/30">
                <h4 className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-2">
                  🚶 Custom Route Guidance
                </h4>
                <ol className="space-y-2 list-decimal list-inside text-xs text-zinc-700 dark:text-zinc-300">
                  {navigationSteps.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Sector Facilities
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-zinc-50 dark:bg-zinc-800 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                <span className="block font-bold text-zinc-900 dark:text-zinc-100">{selectedSector.amenities.food}</span>
                <span className="text-[10px] text-zinc-500">Food Stalls</span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                <span className="block font-bold text-zinc-900 dark:text-zinc-100">{selectedSector.amenities.restrooms}</span>
                <span className="text-[10px] text-zinc-500">Restrooms</span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800 flex flex-col justify-center items-center">
                <span className="text-xs">{selectedSector.amenities.accessibility ? "♿ Yes" : "❌ No"}</span>
                <span className="text-[10px] text-zinc-500">Access Ramp</span>
              </div>
            </div>
          </div>
        </div>

        {/* Queue and Wait Times Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-100 dark:border-zinc-800/80 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" /> Queue Prediction Tracker
              </h3>
            </div>

            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                <label htmlFor="queue-search" className="sr-only">Search amenities</label>
                <input
                  id="queue-search"
                  type="text"
                  placeholder="Search restrooms, food..."
                  value={queueSearch}
                  onChange={(e) => setQueueSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <label htmlFor="queue-filter" className="sr-only">Filter queue type</label>
              <select
                id="queue-filter"
                value={queueFilter}
                onChange={(e) => setQueueFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none"
              >
                <option value="all">All</option>
                <option value="gate">Gates</option>
                <option value="food">Food</option>
                <option value="restroom">Restrooms</option>
              </select>
            </div>

            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {filteredQueues.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-500">
                  No queue matching parameters.
                </div>
              ) : (
                filteredQueues.map((q) => (
                  <div
                    key={q.id}
                    className="p-2.5 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/80 flex justify-between items-center"
                  >
                    <div>
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {q.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 block uppercase font-medium">
                        {q.type} • {selectedSector.name.split("-")[0]}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {q.waitMinutes} mins
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          q.status === "low"
                            ? "bg-emerald-500"
                            : q.status === "medium"
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 italic mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            * Sensors refresh wait predictions every 60 seconds based on Bluetooth crowd scanners.
          </div>
        </div>
      </div>

      {/* Multilingual AI Concierge Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-100 dark:border-zinc-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" /> Multilingual AI Concierge
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Ask questions in your native language about transport routes, ticket assistance, or food.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-zinc-500" />
            <label htmlFor="fan-language-select" className="sr-only">Choose AI Language</label>
            <select
              id="fan-language-select"
              value={chatLanguage}
              onChange={(e) => setChatLanguage(e.target.value)}
              className="text-xs font-semibold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-zinc-700 dark:text-zinc-300 outline-none"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Message Logs */}
        <div className="space-y-3 max-h-[220px] overflow-y-auto mb-4 p-3 bg-zinc-50 dark:bg-zinc-950/50 rounded-lg border border-zinc-100 dark:border-zinc-900">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs ${
                  msg.role === "user"
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium"
                    : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-100 dark:border-zinc-700/80"
                }`}
              >
                {msg.content}
              </div>
              <span className="text-[9px] text-zinc-400 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}
          {isSending && (
            <div className="flex items-center gap-2 text-xs text-zinc-400 italic">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>AI is crafting multilingual response...</span>
            </div>
          )}
        </div>

        {/* Chat Input form */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <label htmlFor="fan-copilot-input" className="sr-only">Type your question</label>
          <input
            id="fan-copilot-input"
            type="text"
            placeholder="e.g. How do I get to the Metro terminal from north gate?"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={isSending}
            className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
            required
          />
          <button
            type="submit"
            id="btn-fan-send-chat"
            disabled={isSending}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
