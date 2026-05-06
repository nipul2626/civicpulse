import { create } from "zustand"

/**
 * Global Zustand store for real-time state that SSE events update.
 * Components can subscribe to slices they need without prop drilling.
 */
const useAppStore = create((set, get) => ({
    // ── Heatmap needs ───────────────────────────────────────────────────────────
    heatmapNeeds: [],      // [{ id, lat, lng, urgencyScore, category, status, affectedCount }]
    setHeatmapNeeds: (needs) => set({ heatmapNeeds: needs }),
    addHeatmapNeed: (need) =>
        set((s) => ({ heatmapNeeds: [...s.heatmapNeeds, need] })),
    removeHeatmapNeed: (needId) =>
        set((s) => ({ heatmapNeeds: s.heatmapNeeds.filter((n) => n.id !== needId) })),
    updateHeatmapNeed: (needId, patch) =>
        set((s) => ({
            heatmapNeeds: s.heatmapNeeds.map((n) =>
                n.id === needId ? { ...n, ...patch } : n
            ),
        })),

    // ── Queue status ────────────────────────────────────────────────────────────
    queueStatus: { pendingCount: 0, avgWaitSeconds: 0, providerStatus: "unknown" },
    setQueueStatus: (status) => set({ queueStatus: status }),

    // ── Tasks (coordinator view) ────────────────────────────────────────────────
    tasks: [],
    setTasks: (tasks) => set({ tasks }),
    updateTask: (taskId, patch) =>
        set((s) => ({
            tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
        })),

    // ── Dashboard stats ─────────────────────────────────────────────────────────
    dashboardStats: null,
    setDashboardStats: (stats) => set({ dashboardStats: stats }),

    // ── Activity feed (live events for the sidebar feed) ───────────────────────
    activityFeed: [],      // [{ id, msg, time, type, color }]
    addActivityEvent: (event) =>
        set((s) => ({
            activityFeed: [event, ...s.activityFeed].slice(0, 50), // cap at 50
        })),
    clearActivityFeed: () => set({ activityFeed: [] }),
}))

export default useAppStore