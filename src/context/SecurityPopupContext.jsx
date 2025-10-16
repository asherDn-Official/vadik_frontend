import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import SecurityPopup from "../components/common/SecurityPopup";

const SecurityPopupContext = createContext(null);

export function SecurityPopupProvider({ children }) {
  const [state, setState] = useState({
    isOpen: false,
    targetMode: "LIVE",
    isLoading: false,
  });

  const confirmRef = useRef(null);
  const cancelRef = useRef(null);

  const closePopup = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false, isLoading: false }));
    confirmRef.current = null;
    cancelRef.current = null;
  }, []);

  const openPopup = useCallback(({ targetMode = "LIVE", onConfirm, onCancel }) => {
    confirmRef.current = onConfirm || null;
    cancelRef.current = onCancel || null;
    setState({
      isOpen: true,
      targetMode,
      isLoading: false,
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    const confirmAction = confirmRef.current;

    if (!confirmAction) {
      closePopup();
      return;
    }

    try {
      const result = confirmAction();

      if (result && typeof result.then === "function") {
        setState((prev) => ({ ...prev, isLoading: true }));
        try {
          await result;
        } catch (error) {
          console.error("Security popup confirm action failed:", error);
          throw error;
        } finally {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    } catch (error) {
      console.error("Security popup confirm handler failed:", error);
    } finally {
      closePopup();
    }
  }, [closePopup]);

  const handleCancel = useCallback(() => {
    if (cancelRef.current) {
      try {
        cancelRef.current();
      } catch (error) {
        console.error("Security popup cancel handler failed:", error);
      }
    }

    closePopup();
  }, [closePopup]);

  const value = useMemo(
    () => ({
      openPopup,
      closePopup,
      isPopupOpen: state.isOpen,
      isPopupLoading: state.isLoading,
    }),
    [closePopup, openPopup, state.isLoading, state.isOpen]
  );

  return (
    <SecurityPopupContext.Provider value={value}>
      {children}
      {state.isOpen && (
        <SecurityPopup
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isLoading={state.isLoading}
          targetMode={state.targetMode}
        />
      )}
    </SecurityPopupContext.Provider>
  );
}

export const useSecurityPopup = () => {
  const context = useContext(SecurityPopupContext);

  if (!context) {
    throw new Error("useSecurityPopup must be used within a SecurityPopupProvider");
  }

  return context;
};