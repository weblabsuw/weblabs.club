import Link from "next/link";
import { config } from "@/content/config";

export function Footer() {
  return (
    <footer className="px-4 pt-4 pb-8 container max-w-5xl flex flex-col sm:flex-row justify-between gap-4 items-center md:items-end border-t-2 border-onSurface/10 bg-onPrimary/50">
      <div className="flex gap-4 text-sm sm:text-xs">
        <Link
          href="/about"
          className="opacity-75 hover:opacity-100 text-primary font-medium transition-opacity"
        >
          About
        </Link>

        {config.socials.discord && (
          <Link
            href={config.socials.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-75 hover:opacity-100 text-primary font-medium transition-opacity"
          >
            Discord ↗
          </Link>
        )}

        {config.socials.instagram && (
          <Link
            href={config.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-75 hover:opacity-100 text-primary font-medium transition-opacity"
          >
            Insta ↗
          </Link>
        )}
      </div>

      <div className="group text-sm sm:text-xs">
        Made with ❤️ and <span className="group-hover:hidden">🧀</span>
        <span className="hidden group-hover:inline">🍺</span> by WebLabs
      </div>
    </footer>
  );
}
