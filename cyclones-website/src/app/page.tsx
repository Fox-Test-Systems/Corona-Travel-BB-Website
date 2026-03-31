import Link from "next/link";
import { mockEvents } from "@/lib/mock-data";

export default function HomePage() {
  const upcomingEvents = mockEvents.slice(0, 3);

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center bg-[#0A0A0F]">
        <div className="absolute inset-0 overflow-hidden">
          {/* Real ballpark photo background */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 pointer-events-none"
            style={{
              backgroundImage: "url('/images/ballpark-night.jpg')",
              filter: "saturate(0.6) brightness(0.7)",
            }}
          />
          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/70 via-transparent to-[#0A0A0F]/90" />
          {/* Colored accent glows */}
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-cyclone-green/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyclone-yellow/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <div className="mb-6">
            <span className="inline-block px-4 py-1.5 bg-cyclone-green/10 border border-cyclone-green/20 rounded-full text-cyclone-green text-sm font-medium">
              ⚾ 2026 Season — Now Accepting Players
            </span>
          </div>

          <div className="relative">
            {/* Cyclone swirl accent behind the name */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-no-repeat bg-center bg-contain pointer-events-none"
              style={{ backgroundImage: "url('/images/cyclone-swirl.svg')" }}
            />
            <h1 className="relative text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-cyclone-green">
              CYCLONES
            </h1>
            <p className="relative mt-2 text-xl sm:text-2xl lg:text-3xl font-semibold tracking-widest uppercase text-cyclone-yellow">
              U9 Travel Baseball
            </p>
          </div>

          <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto">
            Building champions on and off the field. Competitive youth baseball
            with a focus on development, teamwork, and love of the game.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tryouts"
              className="px-8 py-4 bg-cyclone-green text-[#0A0A0F] font-bold rounded-lg hover:bg-cyclone-green-400 transition-colors text-lg"
            >
              Register for Tryouts
            </Link>
            <Link
              href="/schedule"
              className="px-8 py-4 border-2 border-cyclone-yellow text-cyclone-yellow font-bold rounded-lg hover:bg-cyclone-yellow/10 transition-colors text-lg"
            >
              View Schedule
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 bg-[#0A0A0F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-cyclone-yellow text-center mb-12">
            UPCOMING EVENTS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="bg-surface rounded-xl border border-cyclone-green/10 p-6 hover:border-cyclone-green/30 transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                      event.event_type === "game"
                        ? "bg-cyclone-green/10 text-cyclone-green"
                        : event.event_type === "tournament"
                        ? "bg-cyclone-yellow/10 text-cyclone-yellow"
                        : event.event_type === "practice"
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-purple-500/10 text-purple-400"
                    }`}
                  >
                    {event.event_type}
                  </span>
                  {event.is_home_game && (
                    <span className="text-xs text-gray-500">HOME</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {event.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {new Date(event.event_date + "T00:00:00").toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
                <p className="text-gray-500 text-sm">
                  {event.start_time} — {event.location}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/schedule"
              className="inline-block px-6 py-3 border border-cyclone-green/30 text-cyclone-green rounded-lg hover:border-cyclone-green hover:bg-cyclone-green/5 transition-all"
            >
              View Full Schedule →
            </Link>
          </div>
        </div>
      </section>

      {/* Why Cyclones */}
      <section className="py-20 bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-cyclone-yellow text-center mb-12">
            WHY CYCLONES?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "⚾",
                title: "Elite Development",
                desc: "Professional coaching focused on fundamentals, mechanics, and game IQ.",
              },
              {
                icon: "🏆",
                title: "Competitive Play",
                desc: "Tournament-level competition against top teams in the region.",
              },
              {
                icon: "🤝",
                title: "Character First",
                desc: "We build great teammates and leaders, not just great players.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-cyclone-green mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0A0A0F]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Join the{" "}
            <span className="text-cyclone-green">Cyclones</span>?
          </h2>
          <p className="text-gray-400 mb-8">
            Tryouts are open for the 2026 season. Register today and become part
            of something special.
          </p>
          <Link
            href="/tryouts"
            className="inline-block px-8 py-4 bg-cyclone-green text-[#0A0A0F] font-bold rounded-lg hover:bg-cyclone-green-400 transition-colors text-lg"
          >
            Register for Tryouts
          </Link>
        </div>
      </section>
    </>
  );
}
