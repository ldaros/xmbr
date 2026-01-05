

import { useState, useEffect } from "react"
import { Gamepad2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function ControllerIndicator() {
  const [connected, setConnected] = useState(false)
  const [controllerName, setControllerName] = useState("")

  useEffect(() => {
    const checkGamepad = () => {
      const gamepads = navigator.getGamepads()
      const gamepad = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3]
      if (gamepad) {
        setConnected(true)
        setControllerName(gamepad.id.split("(")[0].trim())
      } else {
        setConnected(false)
        setControllerName("")
      }
    }

    const handleConnect = () => checkGamepad()
    const handleDisconnect = () => checkGamepad()

    window.addEventListener("gamepadconnected", handleConnect)
    window.addEventListener("gamepaddisconnected", handleDisconnect)

    // Poll for initial state
    const interval = setInterval(checkGamepad, 1000)

    return () => {
      window.removeEventListener("gamepadconnected", handleConnect)
      window.removeEventListener("gamepaddisconnected", handleDisconnect)
      clearInterval(interval)
    }
  }, [])

  return (
    <div
      className={cn(
        "absolute top-8 left-8 flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300",
        connected ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40",
      )}
    >
      <Gamepad2 size={16} />
      <span className="text-xs font-medium">
        {connected ? controllerName || "Controller Connected" : "No Controller"}
      </span>
    </div>
  )
}
