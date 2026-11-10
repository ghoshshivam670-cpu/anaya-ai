import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DemoWorkbench } from "@/components/demo/DemoWorkbench";

export default function DemoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-[#f5f5f7]">
        <DemoWorkbench />
      </main>
      <Footer />
    </div>
  );
}
