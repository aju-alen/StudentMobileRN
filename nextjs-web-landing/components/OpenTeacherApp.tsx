'use client';

import { useEffect } from 'react';
import { getPreferredStoreUrl } from '@/lib/store';

export default function OpenTeacherApp({ teacherId }: { teacherId: string }) {
  useEffect(() => {
    if (!teacherId) return;

    const appLink = `coachacadem://teacher/${encodeURIComponent(teacherId)}`;
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
  }, [teacherId]);

  return null;
}
