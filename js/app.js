(() => {
  "use strict";

  const PAGE_SIZE = 4;
  const SVG_NS = "http://www.w3.org/2000/svg";
  const TYPE_LABELS = { new: "New", improvement: "Improvement", fix: "Fix" };
  const shortDate = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  const longDate = new Intl.DateTimeFormat("en-US", {
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

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const archive = Array.isArray(window.CHANGELOG_ARCHIVE) ? window.CHANGELOG_ARCHIVE : [];
  let archiveIndex = 0;
  let activeFilter = "all";

  // Controls that depend on JS are only shown when JS is running.
  document.querySelectorAll("[data-requires-js]").forEach((el) => {
    el.hidden = false;
  });
  if (!archive.length) showDone();

  // End of the entrance animation: from here on the first release goes back to
  // the scroll animation and won't replay the entrance after being filtered.
  const entrance = document.getAnimations().filter((a) => a.animationName === "enter");
  Promise.allSettled(entrance.map((a) => a.finished)).then(() => {
    document.documentElement.dataset.entered = "";
  });

  /* ------------------------------------------------------------------------
     Screen reader status
     Clearing before writing forces the announcement even if the text repeats.
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
     Filters
     ------------------------------------------------------------------------ */
  function matchesFilter(item) {
    return activeFilter === "all" || item.dataset.type === activeFilter;
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

  /* ------------------------------------------------------------------------
     View Transitions
     Each release gets a view-transition-name only during the transition, so
     the browser can animate what moves, enters or leaves. Without support or
     with reduced motion, the update is applied directly.
     ------------------------------------------------------------------------ */
  let currentTransition = null;

  function withViewTransition(update) {
    if (!document.startViewTransition || reducedMotion.matches) {
      update();
      return Promise.resolve();
    }

    const items = [...timeline.querySelectorAll(".timeline__item")];
    items.forEach((item) => {
      item.style.viewTransitionName = `vt-${item.querySelector(".release__title").id}`;
    });

    const transition = document.startViewTransition(update);
    currentTransition = transition;
    // A transition interrupted by another one rejects "ready" (AbortError); that's expected.
    transition.ready.catch(() => {});
    transition.finished.finally(() => {
      // A quick click can start another transition before this one ends;
      // only clear the names if this is still the latest one.
      if (currentTransition !== transition) return;
      items.forEach((item) => {
        item.style.viewTransitionName = "";
      });
    });
    return transition.updateCallbackDone;
  }

  function setFilter(filter) {
    activeFilter = filter;
    filterButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
    });

    let visible = 0;
    withViewTransition(() => {
      visible = applyFilter();
    }).then(() => {
      const releases = pluralize(visible, "release", "releases");
      announce(
        filter === "all"
          ? `Showing all ${releases}.`
          : `Showing ${releases} of type ${TYPE_LABELS[filter]}.`
      );
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.filter !== activeFilter) setFilter(button.dataset.filter);
    });
  });

  /* ------------------------------------------------------------------------
     Rendering releases loaded on demand
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
    slot("date-short").textContent = shortDate.format(date);
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
    slot("link-context").textContent = ` for version ${release.version}`;

    return item;
  }

  // Marks newly inserted items for the staggered entry transition (@starting-style).
  // The mark is removed when the transition ends so the item doesn't animate again
  // when it reappears after a filter.
  function animateEntry(items) {
    items.forEach((item, index) => {
      item.dataset.entering = "";
      item.style.setProperty("--stagger", index);

      const done = (event) => {
        if (event.target !== item || event.propertyName !== "opacity") return;
        delete item.dataset.entering;
        item.style.removeProperty("--stagger");
        item.removeEventListener("transitionend", done);
        item.removeEventListener("transitioncancel", done);
      };
      item.addEventListener("transitionend", done);
      item.addEventListener("transitioncancel", done);
    });
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
    if (!reducedMotion.matches) animateEntry(items.filter((item) => !item.hidden));

    const firstVisible = items.find((item) => !item.hidden);
    const visibleCount = items.filter((item) => !item.hidden).length;
    const finished = archiveIndex >= archive.length;

    let message =
      activeFilter === "all"
        ? `${pluralize(batch.length, "earlier release", "earlier releases")} loaded.`
        : `${pluralize(batch.length, "release", "releases")} loaded, ${visibleCount} of type ${TYPE_LABELS[activeFilter]}.`;
    if (finished) message += " No more releases.";

    // Move focus to the first new release, so keyboard and screen reader users
    // continue reading where the new content appeared.
    if (firstVisible) {
      firstVisible.querySelector(".release__title").focus();
    }

    if (finished) {
      showDone();
      // The button is gone: with no new release to focus, focus the final message.
      if (!firstVisible) {
        doneMessage.setAttribute("tabindex", "-1");
        doneMessage.focus();
      }
    }

    announce(message);
  }

  loadMoreButton.addEventListener("click", loadMore);
})();
