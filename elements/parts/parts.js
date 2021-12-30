class Parts extends HTMLElement {
    constructor() {
        super();

        this.categories = {
            saddle: 'saddle',
            seatpost: 'saddle',
            tyres: 'wheels',
            hubs: 'wheels',
            frame: 'frame',
            fork: 'frame',
            stem: 'cockpit',
        };

        this.parts = Array.from(this.querySelectorAll(':scope > *'))
        .map(e => ({
            name: e.tagName.toLowerCase().replace(/^[^-]+-/, ''),
            element: e,
        }))
        .map(e => ({
            ...e,
            category: this.categories[e.name] || 'other'
        }))
        .sort((a, b) => a.category > b.category);

        const table = document.createElement('table');

        this.parts.forEach((part, i) => {
            if (i === 0 || part.category !== this.parts[i - 1].category) {
                const thr = document.createElement('tr');
                const th = document.createElement('th');
                th.colSpan = 2;
                th.textContent = part.category;
                th.className = part.category;
                thr.append(th);
                table.append(thr);
            }
            const tr = document.createElement('tr');
            const td1 = document.createElement('td');
            const td2 = document.createElement('td');

            td1.textContent = part.name;
            td2.innerHTML = part.element.innerHTML;

            tr.classList.add(part.name);
            tr.classList.add(part.category);
            tr.append(td1);
            tr.append(td2);

            table.append(tr);
        });

        console.log(this.innerHTML = table.outerHTML);
    }
}

customElements.define('helix-parts', Parts);