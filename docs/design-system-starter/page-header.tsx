type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

/**
 * Seitenüberschrift mit Eyebrow und optionalem Lead-Text.
 * Roter Akzentstreifen links (border-brand-rose-strong).
 */
export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="space-y-3 border-l-4 border-brand-rose-strong pl-5">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      {description ? (
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
