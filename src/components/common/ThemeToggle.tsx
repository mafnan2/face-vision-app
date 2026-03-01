import { useDispatch } from "react-redux";
import { toggleTheme } from "../../features/ui/uiSlice";

export default function ThemeToggle() {
  const dispatch = useDispatch();

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:scale-105 transition-all"
    >
      Toggle Theme
    </button>
  );
}