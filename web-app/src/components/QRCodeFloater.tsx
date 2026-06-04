import { useEffect, useState } from 'react';
import AppDownloadQR from '../assets/app-download.svg';

const APP_STORE_URL =
  'https://apps.apple.com/in/app/coach-academ/id6745173635';
const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.rise.coachacadem&hl=en';

const getDownloadUrl = () => {
  if (typeof navigator === 'undefined') return APP_STORE_URL;
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return PLAY_STORE_URL;
  if (/iPad|iPhone|iPod/i.test(ua)) return APP_STORE_URL;
  return APP_STORE_URL;
};

const QRCodeFloater = () => {
  const [visible, setVisible] = useState(true);
  const [downloadUrl, setDownloadUrl] = useState(APP_STORE_URL);

  useEffect(() => {
    setDownloadUrl(getDownloadUrl());
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 rounded-2xl p-4 pt-7 md:p-6 flex flex-col items-center shadow-xl border border-[#205072] bg-[#205072] min-w-[11rem] max-md:min-w-0">
      <button
        className="absolute top-2 right-2.5 text-white/80 hover:text-white text-2xl font-bold leading-none focus:outline-none"
        onClick={() => setVisible(false)}
        aria-label="Close QR floater"
      >
        ×
      </button>
      <div className="hidden md:block rounded-xl border border-white/30 bg-white p-3 mb-3 shadow-md">
        <img src={AppDownloadQR} alt="Scan to download app" className="w-36 h-36" />
      </div>
      <a
        href={downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="md:hidden text-base font-semibold text-white hover:text-white/90 underline underline-offset-2"
      >
        Get the app
      </a>
      <span className="hidden md:block text-base font-semibold text-white">
        Get the app
      </span>
    </div>
  );
};

export default QRCodeFloater;
