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
          <ul class="navigation__list">
              <li class="navigation__item"><a href="#" class="navigation__link"><span>01</span>About Us</a></li>
              <li class="navigation__item"><a href="#" class="navigation__link"><span>02</span>Your benfits</a></li>
              <li class="navigation__item"><a href="#" class="navigation__link"><span>03</span>Popular tours</a></li>
              <li class="navigation__item"><a href="#" class="navigation__link"><span>04</span>Stories</a></li>
              <li class="navigation__item"><a href="#" class="navigation__link"><span>05</span>Book now</a></li>
          </ul>
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