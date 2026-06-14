import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

function ThemeToggle() {

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );

  useEffect(() => {

    document.body.classList.toggle(
      "light",
      theme === "light"
    );

    localStorage.setItem("theme", theme);

  }, [theme]);

  const toggleTheme = () => {

    setTheme(
      theme === "light"
        ? "dark"
        : "light"
    );

  };

  return (

    <button
      className={`theme-toggle ${
        theme === "light"
          ? "light-mode"
          : "dark-mode"
      }`}
      onClick={toggleTheme}
      aria-label="Toggle Theme"
    >

      <div className="theme-slider">

        {

          theme === "light"

          ?

          <Sun size={15} strokeWidth={2.3} />

          :

          <Moon size={15} strokeWidth={2.3} />

        }

      </div>

    </button>

  );

}

export default ThemeToggle;