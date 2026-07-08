import { useEffect, useState } from "react";

export interface BlockedItem {
  id: string;
  name: string;
  type: "app" | "website";
  identifier: string; // app name or domain
  addedDate: string;
}

export interface BlockSession {
  id: string;
  startTime: number; // timestamp
  duration: number; // minutes
  isActive: boolean;
  blockedItems: BlockedItem[];
  emergencyExitUsed: boolean;
  emergencyExitPenalty: number; // minutes added as penalty
  notes: string;
}

const STORAGE_KEY = "student_survival_blocking";
const SESSION_KEY = "student_survival_block_session";

export const useDistractionBlocker = () => {
  const [blockedItems, setBlockedItems] = useState<BlockedItem[]>([]);
  const [activeSession, setActiveSession] = useState<BlockSession | null>(null);
  const [blockHistory, setBlockHistory] = useState<BlockSession[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setBlockedItems(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse blocked items:", e);
      }
    }

    const sessionStored = localStorage.getItem(SESSION_KEY);
    if (sessionStored) {
      try {
        setActiveSession(JSON.parse(sessionStored));
      } catch (e) {
        console.error("Failed to parse active session:", e);
      }
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blockedItems));
  }, [blockedItems]);

  useEffect(() => {
    if (activeSession) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(activeSession));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [activeSession]);

  const addBlockedItem = (name: string, type: "app" | "website", identifier: string) => {
    const newItem: BlockedItem = {
      id: Date.now().toString(),
      name,
      type,
      identifier,
      addedDate: new Date().toISOString().split("T")[0],
    };
    setBlockedItems([...blockedItems, newItem]);
    return newItem;
  };

  const removeBlockedItem = (itemId: string) => {
    setBlockedItems(blockedItems.filter((item) => item.id !== itemId));
  };

  const startBlockingSession = (
    durationMinutes: number,
    selectedItems: BlockedItem[]
  ): BlockSession => {
    const session: BlockSession = {
      id: Date.now().toString(),
      startTime: Date.now(),
      duration: durationMinutes,
      isActive: true,
      blockedItems: selectedItems,
      emergencyExitUsed: false,
      emergencyExitPenalty: 0,
      notes: "",
    };

    setActiveSession(session);
    return session;
  };

  const useEmergencyExit = (reason: string): number => {
    if (!activeSession) return 0;

    // Penalty: 2x the remaining time
    const elapsed = (Date.now() - activeSession.startTime) / (1000 * 60);
    const remaining = activeSession.duration - elapsed;
    const penalty = Math.ceil(remaining * 2);

    const updated = {
      ...activeSession,
      emergencyExitUsed: true,
      emergencyExitPenalty: penalty,
      notes: reason,
      isActive: false,
    };

    setBlockHistory([...blockHistory, updated]);
    setActiveSession(null);

    return penalty;
  };

  const endBlockingSession = (notes: string = "") => {
    if (!activeSession) return;

    const updated = {
      ...activeSession,
      isActive: false,
      notes,
    };

    setBlockHistory([...blockHistory, updated]);
    setActiveSession(null);
  };

  const getSessionStatus = () => {
    if (!activeSession) {
      return {
        isBlocking: false,
        timeRemaining: 0,
        blockedCount: 0,
        message: "No active blocking session",
      };
    }

    const elapsed = (Date.now() - activeSession.startTime) / (1000 * 60);
    const remaining = Math.max(0, activeSession.duration - elapsed);

    return {
      isBlocking: activeSession.isActive && remaining > 0,
      timeRemaining: Math.ceil(remaining),
      blockedCount: activeSession.blockedItems.length,
      message:
        remaining > 0
          ? `Blocking ${activeSession.blockedItems.length} item${activeSession.blockedItems.length !== 1 ? "s" : ""} for ${Math.ceil(remaining)} more minutes`
          : "Blocking session complete",
    };
  };

  const getBlockStats = () => {
    const totalSessions = blockHistory.length;
    const successfulSessions = blockHistory.filter(
      (s) => !s.emergencyExitUsed
    ).length;
    const emergencyExits = blockHistory.filter(
      (s) => s.emergencyExitUsed
    ).length;
    const totalPenaltyMinutes = blockHistory.reduce(
      (sum, s) => sum + s.emergencyExitPenalty,
      0
    );
    const totalBlockedTime = blockHistory.reduce(
      (sum, s) => sum + s.duration,
      0
    );

    return {
      totalSessions,
      successfulSessions,
      successRate:
        totalSessions > 0
          ? Math.round((successfulSessions / totalSessions) * 100)
          : 0,
      emergencyExits,
      totalPenaltyMinutes,
      totalBlockedTime,
      shameFactor: emergencyExits > 0 ? emergencyExits * 10 : 0, // Shame score 💀
    };
  };

  return {
    blockedItems,
    activeSession,
    blockHistory,
    addBlockedItem,
    removeBlockedItem,
    startBlockingSession,
    useEmergencyExit,
    endBlockingSession,
    getSessionStatus,
    getBlockStats,
  };
};
