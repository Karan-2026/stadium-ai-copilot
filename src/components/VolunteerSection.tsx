import React, { useState } from "react";
import { CheckCircle, AlertCircle, PackageSearch, ClipboardList, HelpCircle, Plus, Globe2, Languages } from "lucide-react";
import { TaskItem, LostItem } from "../types";

interface VolunteerSectionProps {
  tasks: TaskItem[];
  lostItems: LostItem[];
  onCompleteTask: (id: string) => void;
  onAddLostItem: (item: Omit<LostItem, "id" | "status" | "timestamp">) => void;
  onAddTask: (task: Omit<TaskItem, "id" | "status" | "timestamp">) => void;
  announceText: (text: string) => void;
}

const COMMON_PHRASES = [
  { text: "Your entrance gate is on the opposite side. Please turn right.", type: "direction" },
  { text: "Please have your match ticket ready on your phone.", type: "ticketing" },
  { text: "For your safety, please do not block the stairs or exit gates.", type: "safety" },
  { text: "Lost items can be claimed at Sector D main operational booth.", type: "support" }
];

export const VolunteerSection: React.FC<VolunteerSectionProps> = ({
  tasks,
  lostItems,
  onCompleteTask,
  onAddLostItem,
  onAddTask,
  announceText,
}) => {
  // New Task Form State
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newLoc, setNewLoc] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high" | "critical">("medium");

  // Lost Item Form State
  const [showLostForm, setShowLostForm] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemLoc, setItemLoc] = useState("");

  // Translate Assistant State
  const [selectedPhrase, setSelectedPhrase] = useState(COMMON_PHRASES[0].text);
  const [translateLang, setTranslateLang] = useState("es");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  // Form Handlers
  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;
    onAddTask({
      title: newTitle,
      description: newDesc,
      location: newLoc || "Unspecified Sector",
      priority: newPriority,
    });
    setNewTitle("");
    setNewDesc("");
    setNewLoc("");
    setShowTaskForm(false);
    announceText(`New task allocated to volunteer dispatch: ${newTitle}`);
  };

  const handleLostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemDesc) return;
    onAddLostItem({
      itemName,
      description: itemDesc,
      sectorFound: itemLoc || "Sector A",
    });
    setItemName("");
    setItemDesc("");
    setItemLoc("");
    setShowLostForm(false);
    announceText(`New lost item logged in database: ${itemName}`);
  };

  // Live phrase translation via local simulation & secure fallback
  const handleTranslatePhrase = async () => {
    setIsTranslating(true);
    announceText(`Translating phrase to selected language.`);

    // Highly reliable standard lookup for key FIFA phrases, falling back to clean simulated translation
    const localLookup: Record<string, Record<string, string>> = {
      "Your entrance gate is on the opposite side. Please turn right.": {
        es: "Su puerta de entrada está en el lado opuesto. Por favor, gire a la derecha.",
        fr: "Votre porte d'entrée est du côté opposé. Veuillez tourner à droite.",
        pt: "Seu portão de entrada está no lado oposto. Por favor, vire à direita.",
        de: "Ihr Eingangstor befindet sich auf der gegenüberliegenden Seite. Bitte biegen Sie rechts ab.",
        ja: "入口ゲートは反対側にあります。右に曲がってください。",
        ar: "بوابة دخولك تقع في الجانب المقابل. يرجى الاتجاه يميناً."
      },
      "Please have your match ticket ready on your phone.": {
        es: "Por favor, tenga su boleto de partido listo en su teléfono.",
        fr: "Veuillez préparer votre billet de match sur votre téléphone.",
        pt: "Por favor, tenha o seu ingresso do jogo pronto no seu celular.",
        de: "Bitte halten Sie Ihr Spielticket auf Ihrem Handy bereit.",
        ja: "スマートフォンの観戦チケットをご用意ください。",
        ar: "يرجى تجهيز تذكرة المباراة الخاصة بك على هاتفك."
      }
    };

    try {
      const found = localLookup[selectedPhrase]?.[translateLang];
      if (found) {
        setTranslatedText(found);
      } else {
        // Fallback simulate Translation
        const res = await fetch("/api/copilot/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: "volunteer",
            language: translateLang,
            messages: [{ role: "user", content: `Translate this exact phrase: "${selectedPhrase}" into the selected language code. Provide only the translated text, nothing else.` }]
          })
        });
        const data = await res.json();
        setTranslatedText(data.content || "Translation temporarily offline.");
      }
    } catch {
      setTranslatedText("[Mock Connection] Unable to reach cloud translation. Please consult handbooks.");
    } finally {
      setIsTranslating(false);
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "critical": return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50";
      case "high": return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900/50";
      default: return "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Task prioritize component */}
      <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-100 dark:border-zinc-800/80 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-emerald-600" /> AI Task Prioritization Board
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Live tasks dispatched from command operations. Prioritize based on severity.
              </p>
            </div>
            <button
              onClick={() => setShowTaskForm(!showTaskForm)}
              id="btn-toggle-task-form"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Task</span>
            </button>
          </div>

          {/* New Task Form */}
          {showTaskForm && (
            <form onSubmit={handleAddTaskSubmit} className="mb-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="task-title" className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Title</label>
                  <input
                    id="task-title"
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Gate S3 Bottleneck Guide"
                    className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="task-location" className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Location</label>
                  <input
                    id="task-location"
                    type="text"
                    value={newLoc}
                    onChange={(e) => setNewLoc(e.target.value)}
                    placeholder="e.g., Sector C Gate S3"
                    className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="task-desc" className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Task Description</label>
                <textarea
                  id="task-desc"
                  required
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Instructions for the field team..."
                  className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="flex justify-between items-center pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Priority:</span>
                  <label htmlFor="task-priority" className="sr-only">Priority scale</label>
                  <select
                    id="task-priority"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-0.5 text-zinc-700 dark:text-zinc-300 outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <button
                  type="submit"
                  id="btn-submit-task"
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          )}

          {/* Tasks list */}
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-col justify-between gap-3"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {task.title}
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                      {task.description}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-zinc-100/80 dark:border-zinc-800/50 text-[10px] text-zinc-500">
                  <span>📍 {task.location} • {task.timestamp}</span>
                  {task.status === "completed" ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Resolved
                    </span>
                  ) : (
                    <button
                      onClick={() => onCompleteTask(task.id)}
                      id={`btn-complete-task-${task.id}`}
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 text-white rounded text-[10px] font-bold transition-all"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side tools columns */}
      <div className="lg:col-span-5 space-y-6">
        {/* Multilingual Translator Panel */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-100 dark:border-zinc-800/80">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-2">
            <Languages className="w-4 h-4 text-emerald-600" /> Translation Assistant
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            Select standard FIFA operations phrase and instantly translate for international fans.
          </p>

          <div className="space-y-3">
            <div>
              <label htmlFor="select-phrase" className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Operational Directive</label>
              <select
                id="select-phrase"
                value={selectedPhrase}
                onChange={(e) => setSelectedPhrase(e.target.value)}
                className="w-full mt-1 text-xs font-semibold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer"
              >
                {COMMON_PHRASES.map((ph, idx) => (
                  <option key={idx} value={ph.text}>{ph.text}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label htmlFor="select-trans-lang" className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Target Language</label>
                <select
                  id="select-trans-lang"
                  value={translateLang}
                  onChange={(e) => setTranslateLang(e.target.value)}
                  className="w-full mt-1 text-xs font-semibold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-700 dark:text-zinc-300 outline-none"
                >
                  <option value="es">Spanish (Español)</option>
                  <option value="fr">French (Français)</option>
                  <option value="pt">Portuguese (Português)</option>
                  <option value="de">German (Deutsch)</option>
                  <option value="ja">Japanese (日本語)</option>
                  <option value="ar">Arabic (العربية)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  id="btn-translate-phrase"
                  onClick={handleTranslatePhrase}
                  disabled={isTranslating}
                  className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Globe2 className="w-3.5 h-3.5" />
                  <span>{isTranslating ? "Translating..." : "Translate"}</span>
                </button>
              </div>
            </div>

            {translatedText && (
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg">
                <span className="text-[9px] font-bold text-emerald-800 dark:text-emerald-400 uppercase block mb-1">Translated Directive:</span>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 leading-relaxed">
                  {translatedText}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Lost & Found Register */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-100 dark:border-zinc-800/80">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <PackageSearch className="w-4 h-4 text-emerald-600" /> Lost & Found Registry
            </h3>
            <button
              onClick={() => setShowLostForm(!showLostForm)}
              id="btn-toggle-lost-form"
              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase"
            >
              {showLostForm ? "Cancel" : "Add Found Item"}
            </button>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            Search logged wallets, ticketing cards, or phones, and log newly turned-in assets.
          </p>

          {showLostForm && (
            <form onSubmit={handleLostSubmit} className="mb-4 p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50 space-y-3">
              <div>
                <label htmlFor="lost-name" className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Item Name</label>
                <input
                  id="lost-name"
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Blue Backpack"
                  className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="lost-loc" className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Sector/Row Found</label>
                  <input
                    id="lost-loc"
                    type="text"
                    required
                    value={itemLoc}
                    onChange={(e) => setItemLoc(e.target.value)}
                    placeholder="e.g. Sector B Row 14"
                    className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="lost-desc" className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Details</label>
                  <input
                    id="lost-desc"
                    type="text"
                    required
                    value={itemDesc}
                    onChange={(e) => setItemDesc(e.target.value)}
                    placeholder="e.g. Nike emblem, contains keys"
                    className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                id="btn-save-lost-item"
                className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 text-white rounded-lg text-xs font-bold transition"
              >
                Save Found Record
              </button>
            </form>
          )}

          <div className="space-y-2 max-h-[160px] overflow-y-auto">
            {lostItems.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center"
              >
                <div>
                  <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                    {item.itemName}
                  </h4>
                  <span className="text-[10px] text-zinc-500 block leading-tight">
                    {item.description} • Found {item.sectorFound}
                  </span>
                </div>

                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    item.status === "matched"
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400"
                      : "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
