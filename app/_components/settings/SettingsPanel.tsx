"use client";

import { useSettings } from "@/app/_hooks/useSettings";

const OG_GIF_URL = "https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif";

function SettingToggle({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (value: boolean) => void }) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3.5 sm:px-5">
            <label htmlFor={id} className="text-sm font-medium text-primary">
                {label}
            </label>
            <button id={id} type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? "bg-accent" : "bg-white/15"}`}>
                <span className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} aria-hidden />
            </button>
        </div>
    );
}

export default function SettingsPanel() {
    const { theme, setTheme, showRatings, setShowRatings, ogMode, setOgMode } = useSettings();

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-semibold text-primary sm:text-3xl">Settings</h1>

            <div className="flex flex-col gap-3">
                <SettingToggle id="light-mode" label="Light mode" checked={theme === "light"} onChange={(on) => setTheme(on ? "light" : "dark")} />
                <SettingToggle id="show-ratings" label="Show ratings" checked={showRatings} onChange={setShowRatings} />
                <SettingToggle id="og-mode" label="OG" checked={ogMode} onChange={setOgMode} />
            </div>

            {ogMode && (
                <div className="overflow-hidden">
                    <img src={OG_GIF_URL} alt="OG" className="mx-auto w-full max-w-md" loading="lazy" />
                </div>
            )}
        </div>
    );
}
