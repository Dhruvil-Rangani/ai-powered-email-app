'use client';

export default function EmailHTMLContent({ html }: { html: string }) {
  return (
    <div
      className="email-html-content bg-white text-black dark:bg-white dark:text-black p-4 rounded-2xl"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
