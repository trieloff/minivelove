class Posts extends HTMLElement {
    constructor() {
      super();

      const url = new URL(window.location);
      const searchParams = url.searchParams;
      const limit = parseInt(searchParams.get('limit') || 10, 10);
      const offset = parseInt(searchParams.get('offset') || 0, 10);
      

      // TODO: filtering, pagination, etc.
      fetch(`${this.getAttribute('value')}.json?limit=${limit}&offset=${offset}`).then(async (res) => {
        const val = await res.json();

        
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
            const myurl = new URL(url.href);
            myurl.searchParams.set('color', color);
            li.innerHTML = `<a href="${myurl.href}" class="${color}">${color}</a>`;
            colors.appendChild(li);
          });

          Tags.forEach(tag => {
            const li = document.createElement('li');
            const myurl = new URL(url.href);
            myurl.searchParams.set('tag', tag);
            li.innerHTML = `<a href="${myurl.href}">${tag}</a>`;
            categories.appendChild(li);
          });

          card.className = 'post';
          parent.appendChild(card);
          return parent;
        }, this);

        const nav = document.createElement('nav');
        this.appendChild(nav);

        if (offset > 0) {
            console.log('adding previous link');
            const more = document.createElement('a');
            url.searchParams.set('limit', limit);
            url.searchParams.set('offset', Math.max(0, offset - limit));
            more.href = url.href;
            more.className = 'previous';
            more.innerHTML = 'previous page';
            nav.appendChild(more);
        }
        if (val.data.length > 0) {
            console.log('adding more link');
            const more = document.createElement('a');
            url.searchParams.set('limit', limit);
            url.searchParams.set('offset', offset + limit);
            more.href = url.href;
            more.className = 'next';
            more.innerHTML = 'next page';
            nav.appendChild(more);
        }
      });
    }
  }
  
  customElements.define('helix-posts', Posts);