import type { Metadata } from "next";
import { TryoutForm } from "@/components/forms/TryoutForm";

export const metadata: Metadata = {
  title: "Tryouts | Cyclones U9 Travel Baseball",
  description:
    "Register for Cyclones U9 travel baseball tryouts. Open to all players.",
};

export default function TryoutsPage() {
  return (
    <div className="py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative text-center mb-12">
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-no-repeat bg-center bg-contain pointer-events-none opacity-60"
            style={{ backgroundImage: "url('/images/cyclone-swirl.svg')" }}
          />
          <h1 className="relative text-4xl sm:text-5xl font-extrabold text-cyclone-yellow mb-4">
            TRYOUT REGISTRATION
          </h1>
          <p className="relative text-gray-400 text-lg">
            Register your player for Cyclones U9 tryouts. We&apos;ll be in
            touch with details.
          </p>
          <div className="relative mt-4 inline-block px-4 py-2 bg-cyclone-green/10 border border-cyclone-green/20 rounded-lg">
            <span className="text-cyclone-green text-sm font-medium">
              📅 Next Tryout: May 10, 2026 — 9:00 AM
            </span>
          </div>
        </div>

        <TryoutForm />
      </div>
    </div>
  );
}
