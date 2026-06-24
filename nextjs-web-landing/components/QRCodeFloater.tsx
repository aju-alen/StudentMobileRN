'use client';

import { useEffect, useState } from 'react';
import {
  APP_DOWNLOAD_QR,
  APP_STORE_URL,
  PLAY_STORE_URL,
} from '@/lib/constants';

const getDownloadUrl = () => {
  if (typeof navigator === 'undefined') return APP_STORE_URL;
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return PLAY_STORE_URL;
  if (/iPad|iPhone|iPod/i.test(ua)) return APP_STORE_URL;
  return APP_STORE_URL;
};

export default function QRCodeFloater() {
  const [visible, setVisible] = useState(true);
  const [downloadUrl, setDownloadUrl] = useState(APP_STORE_URL);

  useEffect(() => {
    setDownloadUrl(getDownloadUrl());
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center rounded-2xl border border-[#205072] bg-[#205072] p-4 pt-7 shadow-xl max-md:min-w-0 md:left-auto md:right-6 md:min-w-[9rem] md:translate-x-0 md:p-4">
      <button
        className="absolute top-2 right-2.5 text-white/80 hover:text-white text-2xl font-bold leading-none focus:outline-none"
        onClick={() => setVisible(false)}
        aria-label="Close QR floater"
      >
        ×
      </button>
      <span className="hidden md:block text-sm font-semibold text-white mb-2">
        Get the app
      </span>
      <div className="hidden md:block rounded-lg border border-white/30 bg-white p-2 shadow-md">
        <img
          src={APP_DOWNLOAD_QR}
          alt="Scan to download app"
          className="w-24 h-24"
        />
      </div>

      <a
        href={downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="md:hidden text-base font-semibold text-white hover:text-white/90 underline underline-offset-2"
      >
        Get the app
      </a>
    </div>
  );
}
