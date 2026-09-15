import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const APP_STORE_URL = 'https://apps.apple.com/us/app/coach-academ/id6745173635';
const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.rise.coachacadem&hl=en';

function getPreferredStoreUrl(userAgent = navigator.userAgent): string {
  return /Android/i.test(userAgent) ? PLAY_STORE_URL : APP_STORE_URL;
}

const TeacherProfileRedirect = () => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const appLink = teacherId ? `coachacadem://teacher/${teacherId}` : '';

  useEffect(() => {
    if (!appLink) return;

    let storeTimer: number | undefined;

    const cancelStoreRedirect = () => {
      if (storeTimer !== undefined) {
        window.clearTimeout(storeTimer);
        storeTimer = undefined;
      }
    };

    const openTimer = window.setTimeout(() => {
      window.location.href = appLink;
      storeTimer = window.setTimeout(() => {
        if (document.visibilityState === 'visible') {
          window.location.href = getPreferredStoreUrl();
        }
      }, 1500);
    }, 50);

    const onHide = () => {
      if (document.visibilityState !== 'visible') {
        cancelStoreRedirect();
      }
    };

    window.addEventListener('pagehide', cancelStoreRedirect);
    window.addEventListener('blur', cancelStoreRedirect);
    document.addEventListener('visibilitychange', onHide);

    return () => {
      window.clearTimeout(openTimer);
      cancelStoreRedirect();
      window.removeEventListener('pagehide', cancelStoreRedirect);
      window.removeEventListener('blur', cancelStoreRedirect);
      document.removeEventListener('visibilitychange', onHide);
    };
  }, [appLink]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-sm sm:text-base font-semibold uppercase tracking-wide text-[#24bcc7] mb-3">
          Coach Academ
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">
          Open this teacher profile in the app
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Opening the app now. If nothing happens, you will be sent to the store
          for this device, or tap Open in App or install it.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <a
            href={appLink}
            className="text-center bg-[#205072] hover:bg-[#24bcc7] text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Open in App
          </a>
          <a
            href={APP_STORE_URL}
            className="text-center border-2 border-[#205072] text-[#205072] hover:bg-[#205072] hover:text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            App Store
          </a>
          <a
            href={PLAY_STORE_URL}
            className="text-center border-2 border-[#205072] text-[#205072] hover:bg-[#205072] hover:text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Google Play
          </a>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfileRedirect;
