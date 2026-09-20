import { AlertTriangle, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, StatusBadge } from "@/components/common";
import { useApiResource } from "@/hooks/use-api-resource";
import { api, type CalendarSlotView } from "@/lib/api";

function startOfWeek(date = new Date()) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function weekDays() {
  const start = startOfWeek();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function sameDay(a: Date, value: string) {
  const b = new Date(value);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function slotAt(slots: CalendarSlotView[], day: Date, hour: number) {
  return slots.filter((slot) => sameDay(day, slot.scheduled_at) && new Date(slot.scheduled_at).getHours() === hour);
}

const hours = [10, 15, 20];

export function CalendarPage() {
  const { data: slots, loading, error } = useApiResource(api.calendar, []);
  const days = weekDays();
  const rangeLabel = `${days[0].toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} – ${days[6].toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="PLANEJAMENTO"
        title="Calendário"
        description="Slots reais persistidos no backend. Nenhum agendamento é inventado no frontend."
        action={
          <div className="calendar-nav">
            <Button variant="outline" size="icon" aria-label="Semana anterior" disabled><ChevronLeft size={18} /></Button>
            <b>{rangeLabel}</b>
            <Button variant="outline" size="icon" aria-label="Próxima semana" disabled><ChevronRight size={18} /></Button>
          </div>
        }
      />
      {error && <div className="connection-error"><AlertTriangle size={16} /><div><strong>Backend indisponível</strong><span>Não foi possível carregar os agendamentos.</span></div></div>}
      <section className="calendar-board">
        <div className="calendar-header">
          <span>Horário</span>
          {days.map((day) => <b key={day.toISOString()}>{day.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" }).toUpperCase()}</b>)}
        </div>
        {hours.map((hour) => (
          <div className="calendar-line" key={hour}>
            <strong><Clock3 size={14} />{String(hour).padStart(2, "0")}:00</strong>
            {days.map((day) => {
              const events = slotAt(slots, day, hour);
              return (
                <div className="calendar-slot" key={day.toISOString()}>
                  {events.map((slot) => (
                    <article className="calendar-event" key={slot.id}>
                      <small>{slot.platform} · {slot.channel}</small>
                      <span>{slot.video_id || "Slot disponível"}</span>
                      <StatusBadge tone="blue">{slot.status}</StatusBadge>
                    </article>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </section>
      {!loading && !slots.length && <div className="empty-state">Nenhum slot de publicação cadastrado.</div>}
    </div>
  );
}
