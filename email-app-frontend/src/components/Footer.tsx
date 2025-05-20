export default function Footer() {
  return (
    <footer className="border-t border-slate-800 px-6 py-10 text-center text-sm text-slate-400">
      © {new Date().getFullYear()} DiceMail. Built by the OG Dhruvil Rangani
      <code className="block text-sm text-slate-400">
        View source on <a className="text-indigo-400 underline" href="https://github.com/Dhruvil-Rangani/ai-powered-email-app">GitHub</a>
      </code>
    </footer>
  );
}
