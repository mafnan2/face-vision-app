import { useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "./app/store";
import Home from "./pages/Home";

function App() {
  const theme = useSelector((state: RootState) => state.ui.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return <Home />;
}

export default App;