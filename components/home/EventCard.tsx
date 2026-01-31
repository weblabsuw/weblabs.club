import { Event, formatDate, formatStatus } from "@/content/events";

export function EventCard({ event }: { event: Event; }) {
  const hasLink = Boolean(event.link);
  const status = formatStatus(event);

  return (
    <div className={`group bg-primary/10 rounded-3xl overflow-hidden h-full flex flex-col px-6 md:py-4 py-6 transition hover:shadow-sm hover:-rotate-1 hover:bg-primary/15`}>
      <h3 className="text-base leading-tight font-bold">{event.title}</h3>
      <div className="mt-1.5 flex gap-2 items-center text-xs font-medium">
        <span className={`px-1.5 border-2 ${
            status === "past" || status === "soon!" ? "bg-primary text-onPrimary border-primary" : 
            "text-primary border-primary"}`}>
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
          {event.location && (
            <span className="">
              {event.location} @{" "}
            </span>
          )}
          {formatDate(event.date)}
        </p>
      )}
    </div>
  );
}
