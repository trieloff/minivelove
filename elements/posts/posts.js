class Posts extends HTMLElement {
    constructor() {
      super();
      // TODO: filtering, pagination, etc.
      fetch(`${this.getAttribute('value')}.json`).then(async (res) => {
        const val = await res.json();

        const searchParams = new URL(window.location).searchParams;
        val.data
        .map(({Filename, Title, Colors, Tags, Image}) => ({Filename, Title, 
            Colors: Colors.split(',').map(c => c.trim()), 
            Tags: Tags.split(',').map(t => t.trim()),
            Image}))
        .filter(({Colors}) => !searchParams.has('color') || Colors.some(color => color === searchParams.get('color')))
        .filter(({Tags}) => !searchParams.has('tag') || Tags.some(tag => tag === searchParams.get('tag')))
        .reduce((parent, {Filename, Title, Colors, Tags, Image}) => {
          const card = document.createElement('article');
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

          const categories = card.querySelector('ul.categories');
          const colors = card.querySelector('ul.colors');

          Colors.forEach(color => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="/colors?color=${color}" class="${color}">${color}</a>`;
            colors.appendChild(li);
          });

          Tags.forEach(tag => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="/tags?tag=${tag}">${tag}</a>`;
            categories.appendChild(li);
          });

          card.className = 'post';
          parent.appendChild(card);
          return parent;
        }, this);
      });
    }
  }
  
  customElements.define('helix-posts', Posts);