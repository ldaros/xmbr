

import { useEffect, useRef, useCallback } from "react"

interface GamepadState {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  cross: boolean // A/X button
  circle: boolean // B button
  triangle: boolean // Y button
  square: boolean // X button
  l1: boolean
  r1: boolean
  l2: boolean
  r2: boolean
  start: boolean
  select: boolean
}

interface UseGamepadOptions {
  onUp?: () => void
  onDown?: () => void
  onLeft?: () => void
  onRight?: () => void
  onCross?: () => void
  onCircle?: () => void
  onTriangle?: () => void
  onSquare?: () => void
  onL1?: () => void
  onR1?: () => void
  onStart?: () => void
  onSelect?: () => void
  repeatDelay?: number
  repeatRate?: number
}

export function useGamepad(options: UseGamepadOptions) {
  const {
    onUp,
    onDown,
    onLeft,
    onRight,
    onCross,
    onCircle,
    onTriangle,
    onSquare,
    onL1,
    onR1,
    onStart,
    onSelect,
    repeatDelay = 400,
    repeatRate = 150,
  } = options

  const prevState = useRef<GamepadState>({
    up: false,
    down: false,
    left: false,
    right: false,
    cross: false,
    circle: false,
    triangle: false,
    square: false,
    l1: false,
    r1: false,
    l2: false,
    r2: false,
    start: false,
    select: false,
  })

  const repeatTimers = useRef<Record<string, NodeJS.Timeout | null>>({})
  const initialDelayTimers = useRef<Record<string, NodeJS.Timeout | null>>({})

  const clearTimers = useCallback((key: string) => {
    if (repeatTimers.current[key]) {
      clearInterval(repeatTimers.current[key]!)
      repeatTimers.current[key] = null
    }
    if (initialDelayTimers.current[key]) {
      clearTimeout(initialDelayTimers.current[key]!)
      initialDelayTimers.current[key] = null
    }
  }, [])

  const startRepeat = useCallback(
    (key: string, callback: () => void) => {
      callback()
      clearTimers(key)
      initialDelayTimers.current[key] = setTimeout(() => {
        repeatTimers.current[key] = setInterval(callback, repeatRate)
      }, repeatDelay)
    },
    [clearTimers, repeatDelay, repeatRate],
  )

  useEffect(() => {
    let animationId: number

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads()
      const gamepad = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3]

      if (gamepad) {
        // D-pad and left stick
        const leftStickX = gamepad.axes[0]
        const leftStickY = gamepad.axes[1]
        const deadzone = 0.5

        const state: GamepadState = {
          up: gamepad.buttons[12]?.pressed || leftStickY < -deadzone,
          down: gamepad.buttons[13]?.pressed || leftStickY > deadzone,
          left: gamepad.buttons[14]?.pressed || leftStickX < -deadzone,
          right: gamepad.buttons[15]?.pressed || leftStickX > deadzone,
          cross: gamepad.buttons[0]?.pressed,
          circle: gamepad.buttons[1]?.pressed,
          square: gamepad.buttons[2]?.pressed,
          triangle: gamepad.buttons[3]?.pressed,
          l1: gamepad.buttons[4]?.pressed,
          r1: gamepad.buttons[5]?.pressed,
          l2: gamepad.buttons[6]?.pressed,
          r2: gamepad.buttons[7]?.pressed,
          select: gamepad.buttons[8]?.pressed,
          start: gamepad.buttons[9]?.pressed,
        }

        // Handle directional inputs with repeat
        const directions = [
          { key: "up", pressed: state.up, callback: onUp },
          { key: "down", pressed: state.down, callback: onDown },
          { key: "left", pressed: state.left, callback: onLeft },
          { key: "right", pressed: state.right, callback: onRight },
        ]

        directions.forEach(({ key, pressed, callback }) => {
          const wasPressed = prevState.current[key as keyof GamepadState]
          if (pressed && !wasPressed && callback) {
            startRepeat(key, callback)
          } else if (!pressed && wasPressed) {
            clearTimers(key)
          }
        })

        // Handle button presses (no repeat)
        const buttons = [
          { key: "cross", pressed: state.cross, callback: onCross },
          { key: "circle", pressed: state.circle, callback: onCircle },
          { key: "triangle", pressed: state.triangle, callback: onTriangle },
          { key: "square", pressed: state.square, callback: onSquare },
          { key: "l1", pressed: state.l1, callback: onL1 },
          { key: "r1", pressed: state.r1, callback: onR1 },
          { key: "start", pressed: state.start, callback: onStart },
          { key: "select", pressed: state.select, callback: onSelect },
        ]

        buttons.forEach(({ key, pressed, callback }) => {
          const wasPressed = prevState.current[key as keyof GamepadState]
          if (pressed && !wasPressed && callback) {
            callback()
          }
        })

        prevState.current = state
      }

      animationId = requestAnimationFrame(pollGamepad)
    }

    animationId = requestAnimationFrame(pollGamepad)

    return () => {
      cancelAnimationFrame(animationId)
      Object.keys(repeatTimers.current).forEach(clearTimers)
    }
  }, [
    onUp,
    onDown,
    onLeft,
    onRight,
    onCross,
    onCircle,
    onTriangle,
    onSquare,
    onL1,
    onR1,
    onStart,
    onSelect,
    startRepeat,
    clearTimers,
  ])
}
