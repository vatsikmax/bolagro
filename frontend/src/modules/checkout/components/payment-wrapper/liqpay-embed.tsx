import React, { useEffect, useRef } from "react"

interface LiqPayEmbedProps {
  data: string
  signature: string
  language?: "en" | "uk" | "ru"
  mode?: "embed" | "popup"
  onCallback?: (data: any) => void
  onReady?: () => void
  onClose?: () => void
}

declare global {
  interface Window {
    LiqPayCheckoutCallback?: () => void
    LiqPayCheckout?: any
  }
}

const LiqPayEmbed: React.FC<LiqPayEmbedProps> = ({
  data,
  signature,
  language = "ua",
  mode = "embed",
  onCallback,
  onReady,
  onClose,
}) => {
  const widgetRef = useRef<HTMLDivElement>(null)
  const checkoutInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!data || !signature) return

    const initLiqPay = () => {
      if (window.LiqPayCheckout) {
        // Clean up previous instance
        if (checkoutInstanceRef.current) {
          try {
            checkoutInstanceRef.current.destroy?.()
          } catch (e) {
            console.warn("Failed to destroy previous LiqPay instance:", e)
          }
        }

        // Clear widget content
        if (widgetRef.current) {
          widgetRef.current.innerHTML = ""
        }

        // Create new instance
        checkoutInstanceRef.current = window.LiqPayCheckout.init({
          data,
          signature,
          embedTo: "#liqpay_checkout",
          language,
          mode,
        })
          .on("liqpay.callback", function (responseData: any) {
            onCallback?.(responseData)
          })
          .on("liqpay.ready", function () {
            onReady?.()
          })
          .on("liqpay.close", function () {
            onClose?.()
          })
      }
    }

    // Load script if not loaded
    let script = document.querySelector(
      'script[src="https://static.liqpay.ua/libjs/checkout.js"]'
    ) as HTMLScriptElement | null

    if (!script) {
      script = document.createElement("script")
      script.src = "https://static.liqpay.ua/libjs/checkout.js"
      script.async = true
      script.onload = initLiqPay
      document.body.appendChild(script)
    } else {
      // Script already loaded, initialize immediately
      initLiqPay()
    }

    return () => {
      // Cleanup on unmount or prop change
      if (checkoutInstanceRef.current) {
        try {
          checkoutInstanceRef.current.destroy?.()
        } catch (e) {
          console.warn("Failed to destroy LiqPay instance:", e)
        }
      }
      if (widgetRef.current) {
        widgetRef.current.innerHTML = ""
      }
    }
  }, [data, signature, language, mode, onCallback, onReady, onClose])

  return <div id="liqpay_checkout" ref={widgetRef}></div>
}

export default LiqPayEmbed
