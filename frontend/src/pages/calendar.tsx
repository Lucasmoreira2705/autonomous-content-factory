import { ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, StatusBadge } from "@/components/common";

const days = ["SEG 21", "TER 22", "QUA 23", "QUI 24", "SEX 25", "SÁB 26", "DOM 27"];

export function CalendarPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="PLANEJAMENTO"
        title="Calendário"
        description="Organize os slots de 10h, 15h e 20h sem conflitos entre plataformas."
        action={
          <div className="calendar-nav">
            <Button variant="outline" size="icon" aria-label="Semana anterior"><ChevronLeft size={18} /></Button>
            <b>21–27 Set</b>
            <Button variant="outline" size="icon" aria-label="Próxima semana"><ChevronRight size={18} /></Button>
          </div>
        }
      />
      <section className="calendar-board">
        <div className="calendar-header"><span>Horário</span>{days.map((day) => <b key={day}>{day}</b>)}</div>
        {["10:00", "15:00", "20:00"].map((time, row) => (
          <div className="calendar-line" key={time}>
            <strong><Clock3 size={14} />{time}</strong>
            {days.map((day, col) => (
              <div className="calendar-slot" key={day}>
                {(col + row) % 3 !== 2 && (
                  <article className={`calendar-event event-${(col + row) % 4}`}>
                    <small>{col % 2 ? "Multi" : "Shorts"}</small>
                    <span>{["Uma decisão de milhões", "O detalhe que ninguém viu", "A tecnologia escondida"][row]}</span>
                    <StatusBadge tone="blue">Agendado</StatusBadge>
                  </article>
                )}
              </div>
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}
