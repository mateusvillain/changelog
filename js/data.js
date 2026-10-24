/**
 * Releases anteriores, carregadas sob demanda pelo botão "Carregar releases anteriores".
 * Conteúdo provisório: substituir por uma fonte real (API/CMS) quando disponível.
 *
 * Formato de cada release:
 *   version     string   "3.0.0"
 *   date        string   ISO "AAAA-MM-DD"
 *   type        string   "novo" | "melhoria" | "correcao"
 *   area        string   rótulo da tag secundária
 *   title       string
 *   description string
 *   author      { name, avatar }
 *   highlights  string[]
 *   cover       { src, width, height } | undefined (imagem decorativa)
 *   url         string
 */
window.CHANGELOG_ARCHIVE = [
  {
    version: "3.0.0",
    date: "2026-08-14",
    type: "novo",
    area: "Plataforma",
    title: "Lumen 3.0: nova interface",
    description: "Uma interface redesenhada do zero, com navegação mais clara, painéis reorganizáveis e uma barra de comandos para encontrar qualquer coisa rapidamente.",
    author: { name: "Ana Souza", avatar: "assets/avatars/ana-souza.jpg" },
    highlights: [
      "Barra de comandos acessível com ⌘K / Ctrl+K",
      "Painéis laterais reorganizáveis",
      "Navegação completa por teclado",
    ],
    url: "releases/v3.0.0",
  },
  {
    version: "2.9.3",
    date: "2026-07-30",
    type: "correcao",
    area: "Exportação",
    title: "Ajustes na exportação",
    description: "Corrigimos problemas de exportação relatados após a última atualização e melhoramos as mensagens de erro.",
    author: { name: "Diego Alves", avatar: "assets/avatars/diego-alves.jpg" },
    highlights: [
      "SVGs exportados mantêm os IDs das camadas",
      "Mensagens de erro mais descritivas",
    ],
    url: "releases/v2.9.3",
  },
  {
    version: "2.9.0",
    date: "2026-07-08",
    type: "melhoria",
    area: "Busca",
    title: "Busca mais inteligente",
    description: "A busca agora entende sinônimos e erros de digitação, e mostra resultados de projetos, arquivos e comentários em um só lugar.",
    author: { name: "Júlia Martins", avatar: "assets/avatars/julia-martins.jpg" },
    highlights: [
      "Tolerância a erros de digitação",
      "Filtros por tipo de conteúdo",
    ],
    url: "releases/v2.9.0",
  },
  {
    version: "2.8.1",
    date: "2026-06-19",
    type: "correcao",
    area: "Editor",
    title: "Estabilidade do editor",
    description: "Melhorias de estabilidade no editor para projetos com muitas páginas.",
    author: { name: "Rafael Lima", avatar: "assets/avatars/rafael-lima.jpg" },
    highlights: [
      "Corrigido salvamento automático em conexões instáveis",
      "Desfazer funciona após trocar de página",
    ],
    url: "releases/v2.8.1",
  },
  {
    version: "2.8.0",
    date: "2026-06-02",
    type: "novo",
    area: "Integrações",
    title: "Integração com o Slack",
    description: "Receba notificações de comentários e menções diretamente nos canais do seu time.",
    author: { name: "Ana Souza", avatar: "assets/avatars/ana-souza.jpg" },
    highlights: [
      "Notificações por canal ou mensagem direta",
      "Respostas a comentários direto do Slack",
    ],
    url: "releases/v2.8.0",
  },
];
