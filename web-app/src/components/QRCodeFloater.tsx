import { useState } from 'react';
import AppDownloadQR from '../assets/app-download.svg';

const QRCodeFloater = () => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 rounded-2xl p-6 pt-7 flex flex-col items-center shadow-xl border border-[#205072] bg-[#205072] min-w-[11rem]">
      <button
        className="absolute top-2 right-2.5 text-white/80 hover:text-white text-2xl font-bold leading-none focus:outline-none"
        onClick={() => setVisible(false)}
        aria-label="Close QR floater"
      >
        ×
      </button>
      <div className="rounded-xl border border-white/30 bg-white p-3 mb-3 shadow-md">
        <img src={AppDownloadQR} alt="Scan to download app" className="w-36 h-36" />
      </div>
      <span className="text-base font-semibold text-white">Get the app</span>
    </div>
  );
};

export default QRCodeFloater; 