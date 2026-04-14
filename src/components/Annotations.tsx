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
  Bell,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { Header } from "./Header";
import { Tooltip } from "./Tooltip";
import { TagGroup } from "../types";

interface AnnotationsProps {
  onNavigate: (view: "dashboard" | "trades" | "analytics" | "reports" | "settings" | "daily-journal" | "annotations") => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  openTradeModal: () => void;
  onLogout: () => void;
  instruments: { id: number, name: string, color: string }[];
  setInstruments: (instruments: { id: number, name: string, color: string }[]) => void;
  setups: string[];
  setSetups: (setups: string[]) => void;
  tagGroups: TagGroup[];
  setTagGroups: (groups: TagGroup[]) => void;
  accountSize: string;
  setAccountSize: (size: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
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
    green: isDark ? "bg-accent-green/5 border-accent-green/10 text-accent-green/80 hover:border-accent-green/40" : "bg-green-50 border-green-200 text-green-700 hover:border-green-400",
    blue: isDark ? "bg-blue-900/10 border-blue-900/20 text-blue-400 hover:border-blue-400/40" : "bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-400",
    red: isDark ? "bg-accent-red/10 border-accent-red/20 text-accent-red hover:border-accent-red/40" : "bg-red-50 border-red-200 text-red-700 hover:border-red-400",
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
            isDark ? "text-accent-green hover:text-white" : "text-black hover:text-neutral-600"
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

export default function Annotations({ 
  onNavigate, 
  isDark, 
  setIsDark, 
  openTradeModal, 
  onLogout, 
  tagGroups: groups, 
  setTagGroups: setGroups, 
  instruments, 
  setInstruments, 
  setups, 
  setSetups, 
  accountSize, 
  setAccountSize,
  isCollapsed,
  setIsCollapsed,
  searchQuery,
  setSearchQuery
}: AnnotationsProps) {
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [targetGroupId, setTargetGroupId] = useState<string | null>(null);

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

  const filteredGroups = groups.map(group => ({
    ...group,
    tags: group.tags.filter(tag => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return tag.label.toLowerCase().includes(query);
    })
  })).filter(group => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return group.title.toLowerCase().includes(query) || group.tags.length > 0;
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden transition-all duration-300 flex-1">

        <div className="flex-1 overflow-y-auto pt-24 pb-32 md:pb-24 px-4 md:px-8 custom-scrollbar">
          <div className="w-full space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className={cn("text-2xl font-black tracking-tight", isDark ? "text-white" : "text-black")}>ANNOTATIONS</h2>
              <div className="flex gap-3 w-full sm:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddGroupModal(true)}
                  className={cn(
                    "flex-1 sm:flex-none text-[10px] font-black px-4 py-3 transition-all flex items-center justify-center gap-2 rounded-xl border uppercase tracking-widest",
                    isDark ? "bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700" : "bg-white text-black border-neutral-200 hover:bg-neutral-50 shadow-sm"
                  )}
                >
                  <PlusCircle size={14} />
                  GROUP
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openAddTag()}
                  className={cn(
                    "flex-1 sm:flex-none text-[10px] font-black px-4 py-3 transition-all flex items-center justify-center gap-2 rounded-xl uppercase tracking-widest shadow-lg",
                    isDark ? "bg-accent-green text-black hover:bg-accent-green/80" : "bg-black text-white hover:bg-neutral-800 shadow-lg"
                  )}
                >
                  <TagIcon size={14} />
                  TAG
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <AnimatePresence mode="popLayout">
                {filteredGroups.map(group => (
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
                        isDark ? "bg-black border-zinc-800 text-white focus:ring-1 focus:ring-accent-green" : "bg-neutral-50 border-neutral-200 text-black focus:ring-1 focus:ring-black"
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
                      {filteredGroups.map(g => (
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
                        isDark ? "bg-accent-green text-black hover:bg-accent-green/80" : "bg-black text-white hover:bg-neutral-800"
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
                        isDark ? "bg-accent-green text-black hover:bg-accent-green/80" : "bg-black text-white hover:bg-neutral-800"
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
      </div>
  );
}


