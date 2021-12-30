class Menu extends HTMLElement {
  constructor() {
      super();
      this.innerHTML = `
      <input type="checkbox" class="navigation__checkbox" id="navi-toggle">
  
      <label for="navi-toggle" class="navigation__button">
          <span class="navigation__icon">&nbsp;</span>
      </label>
  
      <div class="navigation__background">&nbsp;</div>
  
      <nav class="navigation__nav">
      </nav>`;

      fetch('/nav').then(async (res) => {
        // console.log('nav html', await res.text());

        const parser = new DOMParser();
        const doc = parser.parseFromString(await res.text(), "text/html");
        this.querySelector('nav').innerHTML = doc.querySelector('ol').outerHTML;
      });
  }
}

customElements.define('custom-menu', Menu);