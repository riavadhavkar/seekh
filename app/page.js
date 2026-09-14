import Timeline from "./(home)/timeline";
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen size-full py-4 px-4 sm:px-8 pb-4">
      <header className="pb-2 shrink-0 flex items-center gap-3">
        <span className="text-3xl" aria-hidden>
          🦕
        </span>
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground">
            seekh
          </h1>
          <p className="text-xs text-foreground/70 mt-0.5">
            tap a dino to hear its name and learn when it lived!
          </p>
        </div>
      </header>
      <Timeline />
    </div>
  );
}