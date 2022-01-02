class Posts extends HTMLElement {
  constructor() {
    super();

    console.log(this);
    // populate with table rows
    this.data = Array.from(this.querySelectorAll('helix-value')).map(e => ({ Filename: new URL(e.textContent, window.location).pathname }));
    
    const url = new URL(window.location);
    const searchParams = url.searchParams;
    const limit = parseInt(searchParams.get("limit") || 10, 10);
    const offset = parseInt(searchParams.get("offset") || 0, 10);

    this.nav = document.createElement('nav');
    this.append(this.nav);


    console.log(this.data);

    // TODO: filtering, pagination, etc.
    if (this.getAttribute('value')) {
      fetch(
        `${this.getAttribute("value")}.json?limit=${limit}&offset=${offset}`
      ).then(async (res) => {
        const val = await res.json();

        this.data.push(...val.data);
        await this.fetchMeta();

        await this.renderPosts();
        this.updateNavigation();
      });
    } else {
      this.fetchMeta().then(() => {
        console.log('meta', this.data);
        this.renderPosts()
      })
      this.updateNavigation();
    }
  }

  async updateNavigation() {
    const url = new URL(window.location);
    const searchParams = url.searchParams;
    const limit = parseInt(searchParams.get("limit") || 10, 10);
    const offset = parseInt(searchParams.get("offset") || 0, 10);

    this.nav.innerHTML = '';
    if (offset > 0) {
      console.log("adding previous link");
      const more = document.createElement("a");
      url.searchParams.set("limit", limit);
      url.searchParams.set("offset", Math.max(0, offset - limit));
      more.href = url.href;
      more.className = "previous";
      more.innerHTML = "previous page";
      this.nav.appendChild(more);
    }
    if (this.data.length > 0) {
      console.log("adding more link");
      const more = document.createElement("a");
      url.searchParams.set("limit", limit);
      url.searchParams.set("offset", offset + limit);
      more.href = url.href;
      more.className = "next";
      more.innerHTML = "next page";
      this.nav.appendChild(more);
    }
  }

  async renderPosts() {
    const url = new URL(window.location);
    const searchParams = url.searchParams;

    this.data
    .filter(
      ({ Colors }) =>
        !searchParams.has("color") ||
        Colors.some((color) => color === searchParams.get("color"))
    )
    .filter(
      ({ Tags }) =>
        !searchParams.has("tag") ||
        Tags.some((tag) => tag === searchParams.get("tag"))
    )
    .reduce((parent, { Filename, Title, Colors, Tags, Image }) => {
      const card = document.createElement("article");
      card.innerHTML = `
      <a href="${Filename}" class="details">
        <picture class="thumbnail">
            <img src="${Image}" alt="${Title}" class="image">
        </picture>
        <h3>${Title}</h3>
    </a>

    <ul class="categories">
    </ul>

    <ul class="colors">
    </ul>
    `;

      const categories = card.querySelector("ul.categories");
      const colors = card.querySelector("ul.colors");

      Colors.forEach((color) => {
        const li = document.createElement("li");
        const myurl = new URL(url.href);
        myurl.searchParams.set("color", color);
        li.innerHTML = `<a href="${myurl.href}" class="${color}">${color}</a>`;
        colors.appendChild(li);
      });

      Tags.forEach((tag) => {
        const li = document.createElement("li");
        const myurl = new URL(url.href);
        myurl.searchParams.set("tag", tag);
        li.innerHTML = `<a href="${myurl.href}">${tag}</a>`;
        categories.appendChild(li);
      });

      card.className = "post";
      this.nav.before(card);
      return parent;
    }, this);
  }

  async fetchMeta() {
    this.data = (await Promise.all(this.data.map(async ({ Filename }) => {
      const htmlres = await fetch(new URL(Filename, window.location));

      if (!htmlres.ok) {
        return false;
      }
      const parser = new DOMParser();
      const doc = parser.parseFromString(await htmlres.text(), "text/html");

      return Array.from(doc.querySelectorAll('head meta')).reduce((m, e) => {
        const property = e.getAttribute('name') || e.getAttribute('property');
        const content = e.getAttribute('content');
        switch (typeof m[property]) {
          case 'string': m[property] = [m[property], content]; break;
          case 'object': m[property].push(content); break;
          default: m[property] = content; break;
        }
        return m;
      }, { Filename });
    })))
    .filter(e => !!e)
    .map(e => {
      // console.log('e', e);
      return e;
    })
    .map(m => ({
      Filename: m.Filename,
      Title: m['og:title'],
      Colors: m.colors.split(",").map((c) => c.trim()),
      Tags: m['article:tag'],
      Image: m['og:image'],
    }));
  }
}

customElements.define("helix-posts", Posts);
