class Gallery extends HTMLElement {
    constructor() {
        super();


        this.images = Array.from(this.querySelectorAll('img'));

        const cycleimages = (e) => {
            const goback = e.clientX / e.target.width < 0.4;
            const clicked = e.target;
            const selected = this.querySelector('img.selected');
            const next = this.images.indexOf(selected ) >= 0 && this.images[1 + this.images.indexOf(selected)];
            const previous = this.images.indexOf(selected ) >= 1 && this.images[this.images.indexOf(selected) - 1];
            if (selected) {
                selected.className = '';
            }
            if ((clicked === selected) && next && !goback) {
                next.className = 'selected';
            }else if ((clicked === selected) && previous && goback) {
                previous.className = 'selected';
            } else if (clicked === selected) {
                console.log('deselect');
            } else {
                clicked.className = 'selected';
            }
        }

        this.images.forEach(image => {
            console.log(image);
            image.addEventListener('click', cycleimages);
        });
    }
}

customElements.define('helix-gallery', Gallery);