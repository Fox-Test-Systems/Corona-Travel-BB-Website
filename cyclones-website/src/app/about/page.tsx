import type { Metadata } from "next";
import { mockCoaches } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "About | Cyclones U9 Travel Baseball",
  description:
    "Learn about the Cyclones U9 travel baseball program, our philosophy, and coaching staff.",
};

export default function AboutPage() {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="relative text-center mb-16">
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-no-repeat bg-center bg-contain pointer-events-none opacity-60"
            style={{ backgroundImage: "url('/images/cyclone-swirl.svg')" }}
          />
          <h1 className="relative text-4xl sm:text-5xl font-extrabold text-cyclone-yellow mb-4">
            ABOUT THE CYCLONES
          </h1>
          <p className="relative text-gray-400 text-lg max-w-2xl mx-auto">
            More than a team — a family committed to developing young athletes
            and building character through the game of baseball.
          </p>
        </div>

        {/* Program Philosophy */}
        <section className="mb-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-cyclone-green mb-6 text-center">
              OUR PHILOSOPHY
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                The Cyclones U9 Travel Baseball program is built on the belief
                that every young player deserves the opportunity to develop their
                skills in a competitive, supportive environment. We focus on
                <strong className="text-white"> fundamentals first</strong> —
                proper throwing mechanics, hitting technique, fielding
                positioning, and base running.
              </p>
              <p>
                But baseball is more than mechanics. We teach our players to be
                <strong className="text-white"> great teammates</strong>, to show
                <strong className="text-white"> respect</strong> for opponents
                and umpires, and to develop the
                <strong className="text-white"> mental toughness</strong> that
                will serve them on and off the diamond.
              </p>
              <p>
                Every player gets meaningful development time. Every player is
                valued. Every player leaves better than they came.
              </p>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-cyclone-green mb-8 text-center">
            CORE VALUES
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🎯",
                title: "Development",
                desc: "Age-appropriate training that builds skills progressively and safely.",
              },
              {
                icon: "💪",
                title: "Compete",
                desc: "Play hard, play smart, and never give up. We compete with class.",
              },
              {
                icon: "🤝",
                title: "Teamwork",
                desc: "Individual talent wins games. Teamwork wins championships.",
              },
              {
                icon: "❤️",
                title: "Love the Game",
                desc: "Above all, we want players to fall in love with baseball.",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="bg-surface rounded-xl border border-cyclone-green/10 p-6 text-center hover:border-cyclone-green/30 transition-all"
              >
                <div className="text-3xl mb-3">{value.icon}</div>
                <h3 className="text-lg font-bold text-cyclone-yellow mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-400 text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Coaching Staff */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-cyclone-green mb-8 text-center">
            COACHING STAFF
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockCoaches.map((coach) => (
              <div
                key={coach.id}
                className="bg-surface rounded-xl border border-cyclone-green/10 overflow-hidden hover:border-cyclone-green/30 transition-all"
              >
                {/* Coach photo placeholder */}
                <div className="w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-cyclone-green/10 flex items-center justify-center">
                    <span className="text-3xl">👨‍🏫</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white">
                    {coach.name}
                  </h3>
                  <p className="text-cyclone-yellow text-sm font-medium mb-3">
                    {coach.title}
                  </p>
                  {coach.bio && (
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {coach.bio}
                    </p>
                  )}
                  {coach.years_experience && (
                    <p className="mt-3 text-xs text-gray-500">
                      {coach.years_experience} years coaching experience
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
