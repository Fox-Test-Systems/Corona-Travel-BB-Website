import type { Metadata } from "next";
import { mockEvents } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Schedule | Cyclones U9 Travel Baseball",
  description: "View the Cyclones U9 game and practice schedule.",
};

const eventTypeColors: Record<string, string> = {
  game: "bg-cyclone-green/10 text-cyclone-green border-cyclone-green/20",
  practice: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  tournament: "bg-cyclone-yellow/10 text-cyclone-yellow border-cyclone-yellow/20",
  tryout: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  other: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export default function SchedulePage() {
  const events = mockEvents;

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative text-center mb-12">
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-no-repeat bg-center bg-contain pointer-events-none opacity-60"
            style={{ backgroundImage: "url('/images/cyclone-swirl.svg')" }}
          />
          <h1 className="relative text-4xl sm:text-5xl font-extrabold text-cyclone-yellow mb-4">
            SCHEDULE
          </h1>
          <p className="relative text-gray-400 text-lg">
            2026 Season — Games, Practices & Tournaments
          </p>
        </div>

        {/* Event type legend */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {Object.entries(eventTypeColors).map(([type, colors]) => (
            <span
              key={type}
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${colors}`}
            >
              {type}
            </span>
          ))}
        </div>

        {/* Events list */}
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-surface rounded-xl border border-cyclone-green/10 p-5 sm:p-6 hover:border-cyclone-green/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Date block */}
                <div className="flex-shrink-0 text-center sm:w-20">
                  <div className="text-cyclone-green text-sm font-medium uppercase">
                    {new Date(event.event_date + "T00:00:00").toLocaleDateString("en-US", {
                      month: "short",
                    })}
                  </div>
                  <div className="text-3xl font-extrabold text-white">
                    {new Date(event.event_date + "T00:00:00").getDate()}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {new Date(event.event_date + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </div>
                </div>

                {/* Event details */}
                <div className="flex-1 sm:border-l sm:border-gray-800 sm:pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                        eventTypeColors[event.event_type] || eventTypeColors.other
                      }`}
                    >
                      {event.event_type}
                    </span>
                    {event.is_home_game && (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-white/5 text-gray-400">
                        HOME
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white">{event.title}</h3>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
                    <span>🕐 {event.start_time}{event.end_time ? ` — ${event.end_time}` : ""}</span>
                    <span>📍 {event.location}</span>
                  </div>
                  {event.description && (
                    <p className="mt-2 text-sm text-gray-500">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            No events scheduled yet. Check back soon!
          </div>
        )}
      </div>
    </div>
  );
}
