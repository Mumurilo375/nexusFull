import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";
import { AccessibilityInfo } from "react-native";

// Keep motion off until the device preference is known.
const MotionContext = createContext(true);

export function MotionProvider({ children }: PropsWithChildren) {
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    let active = true;
    let preferenceChanged = false;
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", (value) => {
      preferenceChanged = true;
      setReduceMotion(value);
    });

    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (active && !preferenceChanged) setReduceMotion(value);
    }).catch(() => { /* Keep the accessible fallback if the platform cannot read the preference. */ });

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return <MotionContext.Provider value={reduceMotion}>{children}</MotionContext.Provider>;
}

export function useReduceMotion() {
  return useContext(MotionContext);
}
