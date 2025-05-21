'use client';

import { useEffect, useState } from 'react';

export default function EmailHTMLContent({ html }: { html: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="email-html-content bg-white text-black dark:bg-white dark:text-black p-4 rounded-2xl animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    );
  }

  return (
    <div
      className="email-html-content bg-white text-black dark:bg-white dark:text-black p-4 rounded-2xl"
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning
    />
  );
}
