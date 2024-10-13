(function() {
    "use strict"
    const T_DARK = "dark";
    const T_LIGHT = "light";
    let theme = T_LIGHT;
    let storage = localStorage.getItem("theme");
    if (storage !== T_DARK && storage !== T_LIGHT) {
        if (window.matchMedia
            && window.matchMedia("(prefers-color-scheme: dark)").matches
        ) {
            theme = T_DARK;
        }
        localStorage.setItem("theme", theme);
    } else {
        theme = storage;
    }

    document.firstElementChild.className = theme;
    const ThemeSwitcher = document.getElementById("theme-switcher")
    ThemeSwitcher.addEventListener("click", function () {
        if (theme === T_DARK) {
            theme = T_LIGHT;
        } else {
            theme = T_DARK;
        }
        document.firstElementChild.className = theme;
        localStorage.setItem("theme", theme);
    });
}());
