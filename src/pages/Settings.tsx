import { useState } from "react";

export default function Settings() {

    const [theme, setTheme] = useState("light");

    const saveSettings = () => {
        localStorage.setItem("theme", theme);
        alert("Settings saved");
    }

    return (
        <div>

            <h2>Settings</h2>

            <label>Theme</label>

            <select onChange={(e) => setTheme(e.target.value)}>

                <option value="light">Light</option>
                <option value="dark">Dark</option>

            </select>

            <button onClick={saveSettings}>
                Save
            </button>

        </div>
    )
}