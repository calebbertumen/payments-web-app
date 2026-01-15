import { useQuery } from "@tanstack/react-query"

export function useUnreadNotificationCount() {
  return useQuery<{ unreadCount: number }>({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const res = await fetch("/api/notifications/unread-count")
      if (!res.ok) throw new Error("Failed to fetch unread count")
      return res.json()
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data fresh for 10 seconds
  })
}

