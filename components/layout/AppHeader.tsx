import Image from "next/image";

export function AppHeader() {
  return (
    <header className="ad-app-header">
      <div className="ad-page-shell ad-app-header__inner">
        <div className="ad-app-header__id">
          <span className="ad-app-header__eyebrow">Prozess & Digital</span>
          <h1 className="ad-app-header__title">Projektcockpit Prozessentwicklung</h1>
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
