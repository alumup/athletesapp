"use client";

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from "react";
import FocusTrap from "focus-trap-react";
import { AnimatePresence, motion } from "framer-motion";
import Leaflet from "./leaflet";
import useWindowSize from "@/lib/hooks/use-window-size";

export default function Modal({
  children,
  showModal,
  setShowModal,
}: {
  children: React.ReactNode;
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}) {
  const desktopModalRef = useRef(null);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowModal(false);
      }
    },
    [setShowModal],
  );

  useEffect(() => {
    // Disable scrolling when the Leaflet is open
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Clean up function to re-enable scrolling when the component unmounts
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  const { isMobile, isDesktop } = useWindowSize();

  return (
    <div className="relative z-30 h-screen w-full">
      <AnimatePresence>
        {showModal && (
          <>
            {isMobile && <Leaflet setShow={setShowModal}>{children}</Leaflet>}
            {isDesktop && (
              <>
                <FocusTrap focusTrapOptions={{ initialFocus: false }}>
                  <motion.div
                    ref={desktopModalRef}
                    key="desktop-modal"
                    className="fixed inset-0 z-40 hidden min-h-screen items-center justify-center md:flex"
                    initial={{ scale: 1 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                    onMouseDown={(e) => {
                      if (desktopModalRef.current === e.target) {
                        setShowModal(false);
                      }
                    }}
                  >
                    <div className="max-h-screen overflow-y-auto">
                      {children}
                    </div>
                  </motion.div>
                </FocusTrap>
                <motion.div
                  key="desktop-backdrop"
                  className="fixed inset-0 z-30 bg-gray-100 bg-opacity-30 backdrop-blur"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowModal(false)}
                />
              </>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
