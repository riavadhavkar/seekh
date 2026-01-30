import Image from "next/image";
import Timeline from "./(home)/timeline";
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen size-full py-8 px-8 pb-16">
      <Timeline />
    </div>
  );
}