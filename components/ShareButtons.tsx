"use client";

import { useState } from "react";
import { Language, t } from "@/lib/i18n";

const APP_URL = "https://trashreminder.info";

interface Props {
  lang?: Language;
}

export default function ShareButtons({ lang = "en" }: Props) {
  const [copied, setCopied] = useState(false);
  const strings = t[lang] || t.en;

  const shareText = `${strings.shareText} ${APP_URL}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(APP_URL)}`;

  function copyLink() {
    navigator.clipboard.writeText(APP_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-full text-sm transition"
      >
        💬 WhatsApp
      </a>
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-full text-sm transition"
      >
        👍 Facebook
      </a>
      <button
        onClick={copyLink}
        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-full text-sm transition"
      >
        {copied ? "✅ Copied!" : "🔗 Copy Link"}
      </button>
    </div>
  );
}
