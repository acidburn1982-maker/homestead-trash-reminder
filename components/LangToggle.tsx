"use client";

import { useRouter } from "next/navigation";
import { Language } from "@/lib/i18n";

const LANG_FLAGS: Record<Language, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  ht: "🇭🇹",
};

const LANGS: Language[] = ["en", "es", "ht"];

interface Props {
  currentLang: Language;
}

export default function LangToggle({ currentLang }: Props) {
  const router = useRouter();

  function switchLang(lang: Language) {
    const params = new URLSearchParams(window.location.search);
    if (lang === "en") {
      params.delete("lang");
    } else {
      params.set("lang", lang);
    }
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  return (
    <div className="flex gap-1">
      {LANGS.map((lang) => (
        <button
          key={lang}
          onClick={() => switchLang(lang)}
          className={`px-2 py-1 rounded text-xs font-bold transition ${
            currentLang === lang
              ? "bg-white text-blue-800"
              : "text-blue-200 hover:text-white"
          }`}
          aria-label={`Switch to ${lang}`}
        >
          {LANG_FLAGS[lang]} {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
