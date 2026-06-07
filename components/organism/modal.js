function Modal({ show, onClose, children }) {
  return (
    <div
      style={{
        transform: show ? "translateX(0%)" : "translateX(-200%)",
      }}
      className="absolute top-0 left-0 w-full h-full z-10 transition-all duration-500"
    >
      {/* DIUBAH: Menggunakan overflow-hidden agar pembungkus modal utama mengunci konten */}
      <div className="container mx-auto max-w-2xl h-[80vh] rounded-3xl bg-slate-800 py-6 px-4 overflow-hidden flex flex-col">
        <button
          onClick={() => {
            onClose(false);
          }}
          className="w-10 h-10 mb-4 font-bold rounded-full bg-slate-600 flex-shrink-0"
        >
          X
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal;