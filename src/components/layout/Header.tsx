// import ThemeToggle from "../common/ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-center h-16 px-6 max-w-7xl mx-auto">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          FaceVision AI
        </h1>

        {/* <ThemeToggle /> */}
      </div>
    </header>
  );
}