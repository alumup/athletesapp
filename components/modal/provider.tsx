"use client";

import Modal from ".";
import { ReactNode, createContext, useContext, useState } from "react";

interface ModalContextProps {
  show: (content: ReactNode) => void;
  hide: () => void;
  isModalOpen: boolean;
  updateModalContent: (content: ReactNode) => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const [showModal, setShowModal] = useState(false);

  const show = (content: ReactNode) => {
    setModalContent(content);
    setShowModal(true);
  };

  const hide = () => {
    setShowModal(false);
    setTimeout(() => {
      setModalContent(null);
    }, 300); // Adjust this timeout as per your transition duration
  };

  const updateModalContent = (content: ReactNode) => {
    setModalContent(content);
  };

  return (
    <ModalContext.Provider
      value={{ show, hide, isModalOpen: showModal, updateModalContent }}
    >
      {children}
      {showModal && (
        <Modal showModal={showModal} setShowModal={setShowModal}>
          {modalContent}
        </Modal>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}
