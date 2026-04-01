import React, { useState, useEffect, ReactNode } from "react";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  BarChart3, 
  FileText, 
  Settings, 
  Search, 
  Moon, 
  Sun, 
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Tag as TagIcon,
  BookOpen,
  ClipboardList,
  AlertTriangle,
  User,
  X,
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

interface TagData {
  id: string;
  label: string;
  color: string;
  bold?: boolean;
}

interface TagGroup {
  id: string;
  title: string;
  tags: TagData[];
}

interface AnnotationsProps {
  onNavigate: (view: "dashboard" | "trades" | "analytics" | "reports" | "settings" | "daily-journal" | "landing" | "annotations") => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  openTradeModal: () => void;
}

interface TagItemProps {
  label: string;
  color: string;
  bold?: boolean;
  isDark: boolean;
  onDelete: () => void;
}

const TagItem = ({ label, color, bold, isDark, onDelete }: TagItemProps) => {
  const colorClasses: Record<string, string> = {
    amber: isDark ? "bg-amber-900/10 border-amber-900/20 text-amber-500/90 hover:border-amber-500/40" : "bg-amber-50 border-amber-200 text-amber-700 hover:border-amber-400",
    cyan: isDark ? "bg-cyan-900/10 border-cyan-900/20 text-cyan-500/90 hover:border-cyan-500/40" : "bg-cyan-50 border-cyan-200 text-cyan-700 hover:border-cyan-400",
    turquoise: isDark ? "bg-[#00BCD4]/10 border-[#00BCD4]/20 text-[#00BCD4] hover:border-[#00BCD4]/40" : "bg-cyan-50 border-[#00BCD4]/20 text-[#00838F] hover:border-[#00BCD4]/40",
    indigo: isDark ? "bg-indigo-900/10 border-indigo-900/20 text-indigo-400 hover:border-indigo-400/40" : "bg-indigo-50 border-indigo-200 text-indigo-700 hover:border-indigo-400",
    green: isDark ? "bg-[#00FF41]/5 border-[#00FF41]/10 text-[#00FF41]/80 hover:border-[#00FF41]/40" : "bg-green-50 border-green-200 text-green-700 hover:border-green-400",
    blue: isDark ? "bg-blue-900/10 border-blue-900/20 text-blue-400 hover:border-blue-400/40" : "bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-400",
    red: isDark ? "bg-[#E01E37]/10 border-[#E01E37]/20 text-[#E01E37] hover:border-[#E01E37]/40" : "bg-red-50 border-red-200 text-red-700 hover:border-red-400",
    zinc: isDark ? "bg-zinc-800/30 border-zinc-800/50 text-zinc-400 hover:border-zinc-400/40" : "bg-neutral-100 border-neutral-200 text-neutral-600 hover:border-neutral-400",
  };

  return (
    <div className={cn(
      "px-3 py-2.5 rounded-xl text-sm border transition-all hover:scale-[1.02] cursor-default flex justify-between items-center group/item",
      colorClasses[color] || colorClasses.zinc,
      bold ? "font-black" : "font-medium"
    )}>
      <span>{label}</span>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className={cn(
          "opacity-0 group-hover/item:opacity-100 transition-opacity p-1 rounded-full",
          isDark ? "hover:bg-white/10" : "hover:bg-black/5"
        )}
      >
        <X size={12} />
      </button>
    </div>
  );
};

interface TagGroupCardProps {
  title: string;
  children: ReactNode;
  isDark: boolean;
  onAddTag: () => void;
}

const TagGroupCard = ({ title, children, isDark, onAddTag }: TagGroupCardProps) => {
  return (
    <div className={cn(
      "border rounded-2xl flex flex-col h-full overflow-hidden shadow-xl group transition-all",
      isDark ? "bg-zinc-900/30 border-zinc-800/50" : "bg-white border-neutral-200"
    )}>
      <div className={cn(
        "p-4 border-b flex justify-between items-center",
        isDark ? "border-zinc-800/50 bg-zinc-900/20" : "border-neutral-100 bg-neutral-50"
      )}>
        <h4 className={cn("text-xs font-black uppercase tracking-widest", isDark ? "text-zinc-400" : "text-neutral-500")}>{title}</h4>
        <button 
          onClick={onAddTag}
          className={cn(
            "opacity-0 group-hover:opacity-100 transition-opacity",
            isDark ? "text-[#00FF41] hover:text-white" : "text-black hover:text-neutral-600"
          )}
        >
          <PlusCircle size={14} />
        </button>
      </div>
      <div className="p-4 space-y-2">
        {children}
      </div>
    </div>
  );
};

export default function Annotations({ onNavigate, isDark, setIsDark, openTradeModal }: AnnotationsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [targetGroupId, setTargetGroupId] = useState<string | null>(null);

  const [groups, setGroups] = useState<TagGroup[]>([
    {
      id: "1",
      title: "General Tags",
      tags: [
        { id: "g1", label: "Liquidity Sweep", color: "amber" },
        { id: "g2", label: "CHoCH", color: "cyan" },
        { id: "g3", label: "BoS", color: "turquoise" },
        { id: "g4", label: "Order Block Tap", color: "indigo" },
        { id: "g5", label: "FVG Mitigation", color: "green" },
        { id: "g6", label: "Premium Zone Entry", color: "blue" },
      ]
    },
    {
      id: "2",
      title: "Exit Tags",
      tags: [
        { id: "e1", label: "TP Hit", color: "green", bold: true },
        { id: "e2", label: "SL Hit", color: "red", bold: true },
        { id: "e3", label: "Break-even", color: "zinc" },
        { id: "e4", label: "Liquidity Target", color: "turquoise" },
        { id: "e5", label: "Time Stop", color: "zinc" },
        { id: "e6", label: "News Exit", color: "red" },
      ]
    },
    {
      id: "3",
      title: "Process Tags",
      tags: [
        { id: "p1", label: "Patience", color: "zinc" },
        { id: "p2", label: "Checked All Boxes", color: "amber" },
      ]
    }
  ]);

  useEffect(() => {
    // Global theme management is handled in App.tsx
  }, []);

  const handleNewGroup = () => {
    if (!newGroupName.trim()) return;
    setGroups([...groups, {
      id: Date.now().toString(),
      title: newGroupName.trim(),
      tags: []
    }]);
    setNewGroupName("");
    setShowAddGroupModal(false);
  };

  const handleDeleteTag = (groupId: string, tagId: string) => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          tags: group.tags.filter(tag => tag.id !== tagId)
        };
      }
      return group;
    }));
  };

  const handleAddTag = () => {
    if (!newTagName.trim() || !targetGroupId) return;
    
    const colors = ["amber", "cyan", "turquoise", "indigo", "green", "blue", "red", "zinc"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    setGroups(groups.map(group => {
      if (group.id === targetGroupId) {
        return {
          ...group,
          tags: [...group.tags, {
            id: Date.now().toString(),
            label: newTagName.trim(),
            color
          }]
        };
      }
      return group;
    }));
    setNewTagName("");
    setShowAddTagModal(false);
    setTargetGroupId(null);
  };

  const openAddTag = (groupId?: string) => {
    setTargetGroupId(groupId || groups[0]?.id || null);
    setShowAddTagModal(true);
  };

  return (
    <div className={cn(
      "flex min-h-screen font-body selection:bg-[#00FF41] selection:text-black transition-colors duration-500",
      isDark ? "bg-black text-white" : "bg-white text-black"
    )}>
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isCollapsed ? 80 : 224 }}
        className={cn(
          "hidden md:flex flex-col h-screen fixed left-0 border-r z-40 transition-colors duration-300 overflow-hidden",
          isDark ? "bg-black border-white/10" : "bg-white border-neutral-200"
        )}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="mb-8 px-2 overflow-hidden">
            <h1 className={cn(
              "font-black italic tracking-tighter transition-all duration-300 leading-none", 
              isDark ? "text-white" : "text-black",
              isCollapsed ? "text-lg" : "text-xl"
            )}>
              {isCollapsed ? "SA" : "Sovereign Analyst"}
            </h1>
            {!isCollapsed && (
              <p className="text-[10px] mt-1 uppercase tracking-[0.2em] font-bold text-accent-green">
                Premium Tier
              </p>
            )}
          </div>

          <nav className="flex-1 space-y-2">
            <NavItem 
              icon={<LayoutDashboard size={18} />} 
              label="Dashboard" 
              isCollapsed={isCollapsed}
              onClick={() => onNavigate("dashboard")}
              isDark={isDark} 
            />
            <NavItem 
              icon={<FileText size={18} />} 
              label="Daily Journal" 
              isCollapsed={isCollapsed}
              onClick={() => onNavigate("daily-journal")}
              isDark={isDark} 
            />
            <NavItem 
              icon={<ArrowLeftRight size={18} />} 
              label="Trades" 
              isCollapsed={isCollapsed}
              onClick={() => onNavigate("trades")}
              isDark={isDark} 
            />
            <NavItem 
              icon={<BarChart3 size={18} />} 
              label="Analytics" 
              isCollapsed={isCollapsed}
              onClick={() => onNavigate("analytics")}
              isDark={isDark} 
            />
            <NavItem 
              icon={<ClipboardList size={18} />} 
              label="Reports" 
              isCollapsed={isCollapsed}
              onClick={() => onNavigate("reports")}
              isDark={isDark} 
            />
            <NavItem 
              icon={<TagIcon size={18} />} 
              label="Annotations" 
              active 
              isCollapsed={isCollapsed}
              onClick={() => onNavigate("annotations")}
              isDark={isDark} 
            />
          </nav>

          <div className="mt-auto space-y-2">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "w-full flex items-center justify-center py-3 transition-all duration-200 group rounded-xl",
                isDark ? "text-neutral-400 hover:text-white hover:bg-white/5" : "text-neutral-500 hover:text-black hover:bg-neutral-100"
              )}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <ChevronLeft size={18} className={cn("transition-transform duration-300", isCollapsed && "rotate-180")} />
            </button>

            <NavItem 
              icon={<Settings size={18} />} 
              label="Settings" 
              isCollapsed={isCollapsed}
              isDark={isDark} 
              onClick={() => onNavigate("settings")}
            />
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className={cn(
        "flex flex-col h-screen overflow-hidden transition-all duration-300 flex-1",
        isCollapsed ? "md:ml-20" : "md:ml-56",
        isDark ? "bg-black" : "bg-neutral-50"
      )}>
        <header className={cn(
          "fixed top-0 right-0 z-50 flex justify-between items-center px-8 h-20 border-b backdrop-blur-md transition-all duration-300",
          isCollapsed ? "left-0 md:left-20" : "left-0 md:left-56",
          isDark ? "border-white/10 bg-black/80" : "border-neutral-200 bg-white/80"
        )}>
          <div className="flex items-center gap-4">
            <h2 className={cn("text-[10px] font-bold uppercase tracking-[0.3em] opacity-70", isDark ? "text-white" : "text-black")}>Annotations</h2>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDark(!isDark)}
              className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isDark ? "bg-white/5 text-white hover:bg-white/10" : "bg-neutral-100 text-black hover:bg-neutral-200"
              )}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openTradeModal}
              className={cn(
                "px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all",
                isDark ? "bg-accent-green text-black hover:shadow-[0_0_20px_rgba(0,255,65,0.3)]" : "bg-black text-white hover:bg-neutral-800 shadow-lg"
              )}
            >
              New Trade
            </motion.button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pt-24 pb-24 px-4 md:px-8 custom-scrollbar">
          <div className="w-full space-y-12">
            <div className="flex justify-end items-center">
              <div className="flex gap-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddGroupModal(true)}
                  className={cn(
                    "text-[10px] font-black px-6 py-3 transition-all flex items-center gap-2 rounded-xl border uppercase tracking-widest",
                    isDark ? "bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700" : "bg-white text-black border-neutral-200 hover:bg-neutral-50 shadow-sm"
                  )}
                >
                  <PlusCircle size={14} />
                  NEW GROUP
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openAddTag()}
                  className={cn(
                    "text-[10px] font-black px-6 py-3 transition-all flex items-center gap-2 rounded-xl uppercase tracking-widest shadow-lg",
                    isDark ? "bg-[#00FF41] text-black hover:bg-[#00D736]" : "bg-black text-white hover:bg-neutral-800 shadow-lg"
                  )}
                >
                  <TagIcon size={14} />
                  NEW TAG
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <AnimatePresence mode="popLayout">
                {groups.map(group => (
                  <motion.div
                    key={group.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="h-full"
                  >
                    <TagGroupCard 
                      title={group.title} 
                      isDark={isDark}
                      onAddTag={() => openAddTag(group.id)}
                    >
                      <div className="space-y-3">
                        {group.tags.map(tag => (
                          <div key={tag.id}>
                            <TagItem 
                              label={tag.label} 
                              color={tag.color} 
                              bold={tag.bold}
                              isDark={isDark}
                              onDelete={() => handleDeleteTag(group.id, tag.id)}
                            />
                          </div>
                        ))}
                      </div>
                    </TagGroupCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showAddTagModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={cn(
                  "border p-8 rounded-2xl w-full max-w-md shadow-2xl",
                  isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
                )}
              >
                <h4 className={cn("text-xl font-bold mb-6", isDark ? "text-white" : "text-black")}>Add New Tag</h4>
                <div className="space-y-4">
                  <div>
                    <label className={cn("block text-[10px] uppercase tracking-widest font-bold mb-2", isDark ? "text-zinc-500" : "text-neutral-500")}>Tag Name</label>
                    <input 
                      autoFocus
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      className={cn(
                        "w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all",
                        isDark ? "bg-black border-zinc-800 text-white focus:ring-1 focus:ring-[#00FF41]" : "bg-neutral-50 border-neutral-200 text-black focus:ring-1 focus:ring-black"
                      )}
                      placeholder="e.g. Break of Structure"
                    />
                  </div>
                  <div>
                    <label className={cn("block text-[10px] uppercase tracking-widest font-bold mb-2", isDark ? "text-zinc-500" : "text-neutral-500")}>Target Group</label>
                    <select 
                      value={targetGroupId || ""}
                      onChange={(e) => setTargetGroupId(e.target.value)}
                      className={cn(
                        "w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all appearance-none",
                        isDark ? "bg-black border-zinc-800 text-white focus:ring-1 focus:ring-[#00FF41]" : "bg-neutral-50 border-neutral-200 text-black focus:ring-1 focus:ring-black"
                      )}
                    >
                      {groups.map(g => (
                        <option key={g.id} value={g.id}>{g.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => setShowAddTagModal(false)}
                      className={cn(
                        "flex-1 px-4 py-3 rounded-xl border transition-all text-sm font-bold",
                        isDark ? "border-zinc-800 text-zinc-400 hover:bg-zinc-800" : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                      )}
                    >
                      CANCEL
                    </button>
                    <button 
                      onClick={handleAddTag}
                      className={cn(
                        "flex-1 px-4 py-3 rounded-xl transition-all text-sm font-bold",
                        isDark ? "bg-[#00FF41] text-black hover:bg-[#00D736]" : "bg-black text-white hover:bg-neutral-800"
                      )}
                    >
                      CREATE TAG
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add Group Modal */}
        <AnimatePresence>
          {showAddGroupModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={cn(
                  "border p-8 rounded-2xl w-full max-w-md shadow-2xl",
                  isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
                )}
              >
                <h4 className={cn("text-xl font-bold mb-6", isDark ? "text-white" : "text-black")}>Create Tag Group</h4>
                <div className="space-y-4">
                  <div>
                    <label className={cn("block text-[10px] uppercase tracking-widest font-bold mb-2", isDark ? "text-zinc-500" : "text-neutral-500")}>Group Name</label>
                    <input 
                      autoFocus
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNewGroup()}
                      className={cn(
                        "w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all",
                        isDark ? "bg-black border-zinc-800 text-white focus:ring-1 focus:ring-[#00FF41]" : "bg-neutral-50 border-neutral-200 text-black focus:ring-1 focus:ring-black"
                      )}
                      placeholder="e.g. Risk Management"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => setShowAddGroupModal(false)}
                      className={cn(
                        "flex-1 px-4 py-3 rounded-xl border transition-all text-sm font-bold",
                        isDark ? "border-zinc-800 text-zinc-400 hover:bg-zinc-800" : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                      )}
                    >
                      CANCEL
                    </button>
                    <button 
                      onClick={handleNewGroup}
                      className={cn(
                        "flex-1 px-4 py-3 rounded-xl transition-all text-sm font-bold",
                        isDark ? "bg-[#00FF41] text-black hover:bg-[#00D736]" : "bg-black text-white hover:bg-neutral-800"
                      )}
                    >
                      CREATE GROUP
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, isDark, isCollapsed }: { icon: ReactNode, label: string, active?: boolean, onClick: () => void, isDark: boolean, isCollapsed: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center transition-all duration-200 group rounded-xl overflow-hidden whitespace-nowrap",
        isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3",
        active 
          ? (isDark ? "bg-white/10 text-accent-green" : "bg-neutral-100 text-black font-bold")
          : (isDark ? "text-neutral-400 hover:text-white hover:bg-white/5" : "text-neutral-500 hover:text-black hover:bg-neutral-100")
      )}
    >
      <span className={cn(
        "transition-colors",
        active ? "text-accent-green" : "group-hover:text-accent-green"
      )}>
        {icon}
      </span>
      {!isCollapsed && <span className="font-medium text-sm tracking-tight">{label}</span>}
    </button>
  );
}

