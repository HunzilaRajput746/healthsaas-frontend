import { useEffect, useRef, useState, useCallback } from 'react'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'

interface WSEvent {
  event: string
  data: any
}

export function useAdminWebSocket(clinicId: string | undefined) {
  const wsRef = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<WSEvent | null>(null)
  const reconnectTimer = useRef<NodeJS.Timeout>()
  const mountedRef = useRef(true)

  const connect = useCallback(() => {
    if (!clinicId || !mountedRef.current) return

    const ws = new WebSocket(`${WS_URL}/ws/admin/${clinicId}`)
    wsRef.current = ws

    ws.onopen = () => {
      if (mountedRef.current) {
        setIsConnected(true)
        console.log('🔌 Admin WebSocket connected')
      }
    }

    ws.onmessage = (e) => {
      try {
        const parsed: WSEvent = JSON.parse(e.data)
        if (mountedRef.current && parsed.event !== 'pong') {
          setLastEvent(parsed)
        }
      } catch {}
    }

    ws.onclose = () => {
      if (mountedRef.current) {
        setIsConnected(false)
        // Auto-reconnect after 3s
        reconnectTimer.current = setTimeout(connect, 3000)
      }
    }

    ws.onerror = () => {
      ws.close()
    }

    // Heartbeat ping every 30s to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('ping')
      }
    }, 30000)

    return () => clearInterval(pingInterval)
  }, [clinicId])

  useEffect(() => {
    mountedRef.current = true
    connect()

    return () => {
      mountedRef.current = false
      clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
    }
  }, [connect])

  return { isConnected, lastEvent }
}
