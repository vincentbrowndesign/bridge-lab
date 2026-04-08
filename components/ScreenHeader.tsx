type ScreenHeaderProps = {
  eyebrow: string;
  title: string;
  right?: React.ReactNode;
};

export default function ScreenHeader({
  eyebrow,
  title,
  right,
}: ScreenHeaderProps) {
  return (
    <header className="screenHeader">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="screenTitle">{title}</h1>
      </div>

      {right ? <div>{right}</div> : null}
    </header>
  );
}