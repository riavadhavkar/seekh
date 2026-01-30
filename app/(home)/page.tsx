import Image from "next/image";
import Timeline from "./timeline";
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center size-full py-8 px-8 pb-16 gap-8">
      <Timeline />
    </div>
  );
}