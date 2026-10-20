import Image from "next/image";

type AppHeaderProps = {
  /** Kleines Label über dem Titel, z. B. «Gemeinde Altdorf» oder Abteilung */
  eyebrow: string;
  /** Anwendungsname, z. B. «EWK Scankontrolle» */
  title: string;
};

/**
 * App-Header Variante B (Webapp).
 * Spezifikation: docs/header-standard-altdorf.md
 */
export function AppHeader({ eyebrow, title }: AppHeaderProps) {
  return (
    <header className="ad-app-header">
      <div className="ad-page-shell ad-app-header__inner">
        <div className="ad-app-header__id">
          <span className="ad-app-header__eyebrow">{eyebrow}</span>
          <h1 className="ad-app-header__title">{title}</h1>
        </div>
        <Image
          className="ad-app-header__logo"
          src="/logo-altdorf.png"
          alt="Gemeinde Altdorf"
          width={2416}
          height={635}
          priority
        />
      </div>
    </header>
  );
}
