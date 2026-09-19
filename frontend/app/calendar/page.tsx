import { ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/ui";

const days=["SEG 21","TER 22","QUA 23","QUI 24","SEX 25","SÁB 26","DOM 27"];

export default function CalendarPage(){
  return <div className="page-stack"><PageHeader eyebrow="PLANEJAMENTO" title="Calendário" description="Organize os slots de 10h, 15h e 20h sem conflitos entre plataformas." action={<div className="calendar-nav"><button className="icon-button"><ChevronLeft size={18}/></button><b>21–27 Set</b><button className="icon-button"><ChevronRight size={18}/></button></div>}/>
  <section className="calendar-board"><div className="calendar-header"><span>Horário</span>{days.map(d=><b key={d}>{d}</b>)}</div>{["10:00","15:00","20:00"].map((time,row)=><div className="calendar-line" key={time}><strong><Clock3 size={14}/>{time}</strong>{days.map((day,col)=><div className="calendar-slot" key={day}>{(col+row)%3!==2&&<article className={`calendar-event event-${(col+row)%4}`}><small>{col%2?"Multi":"Shorts"}</small><span>{["Uma decisão de milhões","O detalhe que ninguém viu","A tecnologia escondida"][row]}</span><StatusBadge tone="blue">Agendado</StatusBadge></article>}</div>)}</div>)}</section></div>
}
