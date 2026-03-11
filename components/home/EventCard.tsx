import { RainbowBorderCanvas } from "@/components/ui/rainbow-border-canvas";
import { Event, formatDate, formatStatus } from "@/content/events";
import { cn } from "@/lib/utils";

export function EventCard({ event }: { event: Event; }) {
  const hasLink = Boolean(event.link);
  const status = formatStatus(event);
  const isLive = status === "now!";

  return (
    <div
      className={cn(
        "group relative h-full rounded-3xl transition hover:-rotate-1 hover:shadow-sm",
        isLive && "p-[6px]"
      )}
    >
      {isLive && <RainbowBorderCanvas />}

      <div
        className={cn(
          "relative z-10 flex h-full flex-col overflow-hidden rounded-3xl bg-primary/10 px-6 py-6 transition group-hover:bg-primary/15 md:py-4",
          isLive && "rounded-[1.15rem] bg-primary/15"
        )}
      >
        <h3 className="text-base leading-tight font-bold">{event.title}</h3>
        <div className="mt-1.5 flex items-center gap-2 text-xs font-medium">
          <span className={`px-1.5 py-0.5 ${
              status === "past" ? "bg-primary/70 text-onPrimary border-primary" :
              status === "soon!" ? "bg-primary text-onPrimary border-primary" :
              status === "now!" ? "bg-cyan-400 border-cyan-300" :
              status === "planned" ? "text-primary border-2 border-primary"
            : "text-red-400"}`}>
            {status}
          </span>
        </div>
        <p className="mt-3 text-xs">{event.description}</p>
        <div className="flex-grow" />
        {hasLink && (
          <a className="mt-2 text-xs text-primary underline font-medium" href={event.link} target="_blank" rel="noreferrer">
            Slides link
          </a>
        )}
        {event.date && (
          <p className="mt-2 text-xs italic text-primary/80">
            {formatDate(event.date)}
            {event.location && (
              <>
                <br />
                {"@ "}{event.location}
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
