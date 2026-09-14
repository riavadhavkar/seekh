import Timeline from "./(home)/timeline";
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen size-full py-8 px-8 pb-16">
      <header className="pb-3 shrink-0 flex items-center gap-3">
        <span className="text-4xl" aria-hidden>
          🦕
        </span>
        <div>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight text-foreground">
            seekh
          </h1>
          <p className="text-sm text-foreground/70 mt-0.5">
            Tap a dino to hear its name and learn when it lived!
          </p>
        </div>
      </header>
      <Timeline />
    </div>
  );
}