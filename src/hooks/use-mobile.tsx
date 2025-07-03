
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Initialize with server-safe check
    if (typeof window === "undefined") return false
    return window.innerWidth < MOBILE_BREAKPOINT
  })

  React.useEffect(() => {
    // Ensure we're in browser environment
    if (typeof window === "undefined") return

    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Add event listener with debounce for performance
    let timeoutId: number | null = null
    const handleResize = () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
      timeoutId = window.setTimeout(checkIfMobile, 100)
    }

    // Set initial value
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", handleResize)
    
    // Clean up the event listener
    return () => {
      window.removeEventListener("resize", handleResize)
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [])

  return isMobile
}
