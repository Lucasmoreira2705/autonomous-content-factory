export const contents = [
  { title: "A decisão que quase quebrou uma gigante", channel: "Negócios", stage: "Motion", status: "PROCESSANDO", progress: 68, platform: "Multi", time: "20:00" },
  { title: "O erro de 30 segundos que custou milhões", channel: "Negócios", stage: "Revisão", status: "REVISÃO", progress: 82, platform: "Shorts", time: "15:00" },
  { title: "A tecnologia escondida dentro do seu bolso", channel: "Tecnologia", stage: "Roteiro", status: "APROVADO", progress: 31, platform: "TikTok", time: "10:00" },
  { title: "Por que algumas empresas somem de repente?", channel: "Negócios", stage: "Criação", status: "CRIANDO", progress: 51, platform: "Instagram", time: "20:00" },
  { title: "O mistério que ficou 27 anos sem resposta", channel: "Mistérios", stage: "Agendamento", status: "AGENDADO", progress: 100, platform: "Multi", time: "10:00" },
];

export const pipeline = [
  { name: "Ideia", count: 5, tone: "purple" }, { name: "Roteiro", count: 3, tone: "blue" }, { name: "Aprovação", count: 2, tone: "amber" },
  { name: "Criação", count: 4, tone: "cyan" }, { name: "Motion", count: 2, tone: "pink" }, { name: "Revisão", count: 1, tone: "amber" },
  { name: "Aprovação final", count: 2, tone: "green" }, { name: "Agendados", count: 8, tone: "blue" }, { name: "Publicados", count: 125, tone: "green" },
];

export const chartData = [
  { day: "Seg", views: 18400, retention: 61 }, { day: "Ter", views: 24600, retention: 68 }, { day: "Qua", views: 21900, retention: 64 },
  { day: "Qui", views: 32800, retention: 72 }, { day: "Sex", views: 40100, retention: 75 }, { day: "Sáb", views: 37600, retention: 73 }, { day: "Dom", views: 45200, retention: 79 },
];
