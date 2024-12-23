import React from "react";
import clickSound from "@/app/_assets/audio/click.wav";
interface ModalProps {
  isOpen: null | number;
  setOpen: (id: number) => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, setOpen, children }) => {
  if (!isOpen) return null;

  const handleClose = () => {
    const audio = new Audio(clickSound);
    audio.play();
    setOpen(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-[24px] pt-[200px]">
      <div
        className="fixed inset-0 cursor-pointer bg-black opacity-50"
        onClick={handleClose}
      ></div>
      <div className="relative z-10 min-w-[300px] rounded-[12px] bg-background p-6 text-white shadow-lg">
        <button
          className="absolute right-2 top-1 text-[24px] text-white"
          onClick={handleClose}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
