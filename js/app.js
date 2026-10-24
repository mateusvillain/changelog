(() => {
  "use strict";

  const PAGE_SIZE = 4;
  const SVG_NS = "http://www.w3.org/2000/svg";
  const MONTHS_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const TYPE_LABELS = { novo: "Novo", melhoria: "Melhoria", correcao: "Correção" };
  const longDate = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const timeline = document.getElementById("timeline");
  const status = document.getElementById("timeline-status");
  const template = document.getElementById("release-template");
  const filterButtons = document.querySelectorAll("[data-filter]");
  const loadMoreButton = document.querySelector(".load-more");
  const emptyMessage = document.querySelector(".timeline__empty");
  const doneMessage = document.querySelector(".timeline__done");

  if (!timeline || !template) return;

  const archive = Array.isArray(window.CHANGELOG_ARCHIVE) ? window.CHANGELOG_ARCHIVE : [];
  let archiveIndex = 0;
  let activeFilter = "todos";

  // Controles que dependem de JS só aparecem quando o JS está ativo.
  document.querySelectorAll("[data-requires-js]").forEach((el) => {
    el.hidden = false;
  });
  if (!archive.length) showDone();

  /* ------------------------------------------------------------------------
     Status para leitores de tela
     Limpar antes de escrever força o anúncio mesmo quando o texto se repete.
     ------------------------------------------------------------------------ */
  function announce(message) {
    status.textContent = "";
    window.setTimeout(() => {
      status.textContent = message;
    }, 100);
  }

  function pluralize(count, singular, plural) {
    return `${count} ${count === 1 ? singular : plural}`;
  }

  /* ------------------------------------------------------------------------
     Filtros
     ------------------------------------------------------------------------ */
  function matchesFilter(item) {
    return activeFilter === "todos" || item.dataset.type === activeFilter;
  }

  function applyFilter() {
    let visible = 0;
    timeline.querySelectorAll(".timeline__item").forEach((item) => {
      const show = matchesFilter(item);
      item.hidden = !show;
      if (show) visible += 1;
    });
    emptyMessage.hidden = visible > 0;
    return visible;
  }

  function setFilter(filter) {
    activeFilter = filter;
    filterButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
    });

    const visible = applyFilter();
    const releases = pluralize(visible, "release", "releases");
    announce(
      filter === "todos"
        ? `Mostrando todas as ${releases}.`
        : `Mostrando ${releases} do tipo ${TYPE_LABELS[filter]}.`
    );
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.filter !== activeFilter) setFilter(button.dataset.filter);
    });
  });

  /* ------------------------------------------------------------------------
     Renderização de releases carregadas sob demanda
     ------------------------------------------------------------------------ */
  function slug(version) {
    return `release-v${version.replace(/\./g, "-")}`;
  }

  function icon(name, size) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "icon");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    const use = document.createElementNS(SVG_NS, "use");
    use.setAttribute("href", `#icon-${name}`);
    svg.append(use);
    return svg;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function renderRelease(release) {
    const fragment = template.content.cloneNode(true);
    const item = fragment.querySelector(".timeline__item");
    const article = item.querySelector(".release");
    const slot = (name) => item.querySelector(`[data-slot="${name}"]`);
    const id = slug(release.version);
    const date = new Date(`${release.date}T00:00:00Z`);

    item.dataset.type = release.type;
    article.setAttribute("aria-labelledby", id);

    const title = item.querySelector(".release__title");
    title.id = id;
    title.textContent = release.title;
    item.querySelector(".release__description").textContent = release.description;

    item.querySelector(".release__date").setAttribute("datetime", release.date);
    slot("date-short").textContent =
      `${String(date.getUTCDate()).padStart(2, "0")} ${MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
    slot("date-long").textContent = longDate.format(date);
    slot("version").textContent = `v${release.version}`;

    item.querySelector(".release__avatar").src = release.author.avatar;
    slot("author").textContent = release.author.name;

    const tags = item.querySelector(".tags");
    tags.append(
      el("li", `tag tag--${release.type}`, TYPE_LABELS[release.type]),
      el("li", "tag", release.area)
    );

    if (release.cover) {
      const cover = el("img", "release__cover");
      Object.assign(cover, {
        src: release.cover.src,
        alt: "",
        width: release.cover.width,
        height: release.cover.height,
        loading: "lazy",
        decoding: "async",
      });
      tags.after(cover);
    }

    const highlights = item.querySelector(".highlights");
    release.highlights.forEach((text) => {
      const li = el("li", "highlights__item");
      li.append(icon("check", 16), document.createTextNode(text));
      highlights.append(li);
    });

    const link = item.querySelector(".release__link");
    link.href = release.url;
    slot("link-context").textContent = ` da versão ${release.version}`;

    return item;
  }

  function showDone() {
    loadMoreButton.hidden = true;
    doneMessage.hidden = false;
  }

  function loadMore() {
    const batch = archive.slice(archiveIndex, archiveIndex + PAGE_SIZE);
    if (!batch.length) return;

    const items = batch.map(renderRelease);
    timeline.append(...items);
    archiveIndex += batch.length;
    applyFilter();

    const firstVisible = items.find((item) => !item.hidden);
    const visibleCount = items.filter((item) => !item.hidden).length;
    const finished = archiveIndex >= archive.length;

    let message =
      activeFilter === "todos"
        ? `${pluralize(batch.length, "release anterior carregada", "releases anteriores carregadas")}.`
        : `${pluralize(batch.length, "release carregada", "releases carregadas")}, ${visibleCount} do tipo ${TYPE_LABELS[activeFilter]}.`;
    if (finished) message += " Não há mais releases.";

    // Leva o foco para a primeira release nova, para quem navega por teclado
    // ou leitor de tela continuar a leitura de onde o conteúdo apareceu.
    if (firstVisible) {
      firstVisible.querySelector(".release__title").focus();
    }

    if (finished) {
      showDone();
      // O botão sumiu: sem uma release nova para focar, o foco vai para a mensagem final.
      if (!firstVisible) {
        doneMessage.setAttribute("tabindex", "-1");
        doneMessage.focus();
      }
    }

    announce(message);
  }

  loadMoreButton.addEventListener("click", loadMore);
})();
