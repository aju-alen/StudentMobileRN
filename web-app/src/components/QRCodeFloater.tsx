import { useState } from 'react';
import AppDownloadQR from '../assets/app-download.svg';

const QRCodeFloater = () => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white shadow-lg rounded-xl p-4 flex flex-col items-center border border-gray-200">
      <button
        className="absolute top-1 right-1 text-gray-400 hover:text-gray-700 text-xl font-bold focus:outline-none"
        onClick={() => setVisible(false)}
        aria-label="Close QR floater"
      >
        ×
      </button>
      <img src={AppDownloadQR} alt="Scan to download app" className="w-24 h-24 mb-2" />
      <span className="text-xs text-gray-600">Get the app</span>
    </div>
  );
};

export default QRCodeFloater; 