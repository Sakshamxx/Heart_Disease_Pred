import { Brand } from "@/components/visuals/Logo";
import { NAV_LINKS } from "@/lib/content";

const TECH = "Python · Scikit-learn · FastAPI · Next.js · React · TypeScript · Tailwind CSS";

export function Footer() {
  return (
    <footer className="bg-burgundy-deep text-bg/80">
      <div className="container-x grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Brand light />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-bg/65">
            An educational machine learning project that estimates the likelihood of heart disease from seven health
            indicators. Predictions come from a trained scikit-learn model served by a FastAPI backend.
          </p>
        </div>
        <div>
          <h3 className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-blush/80">Navigate</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="transition-colors hover:text-blush">{l.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-blush/80">Built with</h3>
          <p className="mt-5 text-sm leading-relaxed text-bg/65">{TECH}</p>
        </div>
      </div>
      <div className="border-t border-bg/10">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-bg/55 sm:flex-row sm:justify-between">
          <p>© 2026 CardioSense. Educational project.</p>
          <p>Not a medical device. Not a diagnosis.</p>
        </div>
      </div>
    </footer>
  );
}
