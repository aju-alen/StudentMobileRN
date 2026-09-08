'use client';

import { useEffect, useState } from 'react';
import { APP_STORE_URL } from '@/lib/constants';
import { getPreferredStoreUrl } from '@/lib/store';

type StoreDownloadLinkProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
};

export default function StoreDownloadLink({
  className,
  children,
  onClick,
}: StoreDownloadLinkProps) {
  const [href, setHref] = useState(APP_STORE_URL);

  useEffect(() => {
    setHref(getPreferredStoreUrl());
  }, []);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={onClick}
    >
      {children}
    </a>
  );
}
