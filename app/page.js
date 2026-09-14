import Timeline from "./(home)/timeline";
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen size-full py-8 px-8 pb-16">
      <header className="pb-2 shrink-0">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          seekh
        </h1>
        <p className="text-sm text-white/70 mt-1">
          A chronological journey through the dinosaurs — Triassic to Cretaceous.
        </p>
      </header>
      <Timeline />
    </div>
  );
}