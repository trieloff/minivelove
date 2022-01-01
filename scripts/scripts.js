/*
 * Copyright 2021 Alexandre Capt. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global window, document, sessionStorage, Image */

/**
 * log RUM if part of the sample.
 * @param {string} checkpoint identifies the checkpoint in funnel
 * @param {Object} data additional data for RUM sample
 */

 const RUM_GENERATION = 'blog-gen-6-clicktargets';

 export function sampleRUM(checkpoint, data = {}) {
   try {
     window.hlx = window.hlx || {};
     if (!window.hlx.rum) {
       const usp = new URLSearchParams(window.location.search);
       const weight = (usp.get('rum') === 'on') ? 1 : 100; // with parameter, weight is 1. Defaults to 100.
       // eslint-disable-next-line no-bitwise
       const hashCode = (s) => s.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0);
       const id = `${hashCode(window.location.href)}-${new Date().getTime()}-${Math.random().toString(16).substr(2, 14)}`;
       const random = Math.random();
       const isSelected = (random * weight < 1);
       // eslint-disable-next-line object-curly-newline
       window.hlx.rum = { weight, id, random, isSelected };
     }
     const { random, weight, id } = window.hlx.rum;
     if (random && (random * weight < 1)) {
       const sendPing = () => {
         // eslint-disable-next-line object-curly-newline, max-len
         const body = JSON.stringify({ weight, id, referer: window.location.href, generation: RUM_GENERATION, checkpoint, ...data });
         const url = `https://rum.hlx3.page/.rum/${weight}`;
         // eslint-disable-next-line no-unused-expressions
         navigator.sendBeacon(url, body);
       };
       sendPing();
       // special case CWV
       if (checkpoint === 'cwv') {
         // eslint-disable-next-line import/no-unresolved
         import('./web-vitals-module-2-1-2.js').then((mod) => {
           const storeCWV = (measurement) => {
             data.cwv = {};
             data.cwv[measurement.name] = measurement.value;
             sendPing();
           };
           mod.getCLS(storeCWV);
           mod.getFID(storeCWV);
           mod.getLCP(storeCWV);
         });
       }
     }
   } catch (e) {
     // something went wrong
   }
 }
 
 sampleRUM.mediaobserver = (window.IntersectionObserver) ? new IntersectionObserver((entries) => {
   entries
     .filter((entry) => entry.isIntersecting)
     .forEach((entry) => {
       sampleRUM.mediaobserver.unobserve(entry.target); // observe only once
       const target = sampleRUM.targetselector(entry.target);
       const source = sampleRUM.sourceselector(entry.target);
       sampleRUM('viewmedia', { target, source });
     });
 }, { threshold: 0.25 }) : { observe: () => {} };
 
 sampleRUM.blockobserver = (window.IntersectionObserver) ? new IntersectionObserver((entries) => {
   entries
     .filter((entry) => entry.isIntersecting)
     .forEach((entry) => {
       sampleRUM.blockobserver.unobserve(entry.target); // observe only once
       const target = sampleRUM.targetselector(entry.target);
       const source = sampleRUM.sourceselector(entry.target);
       sampleRUM('viewblock', { target, source });
     });
 }, { threshold: 0.25 }) : { observe: () => {} };
 
 sampleRUM.observe = ((elements) => {
   elements.forEach((element) => {
     if (element.tagName.toLowerCase() === 'img'
     || element.tagName.toLowerCase() === 'video'
     || element.tagName.toLowerCase() === 'audio'
     || element.tagName.toLowerCase() === 'iframe') {
       sampleRUM.mediaobserver.observe(element);
     } else {
       sampleRUM.blockobserver.observe(element);
     }
   });
 });
 
 sampleRUM.sourceselector = (element) => {
   if (element === document.body || element === document.documentElement) {
     return undefined;
   }
   if (element.id) {
     return `#${element.id}`;
   }
   if (element.getAttribute('data-block-name')) {
     return `.${element.getAttribute('data-block-name')}`;
   }
   return sampleRUM.sourceselector(element.parentElement);
 };
 
 sampleRUM.targetselector = (element) => {
   let value = element.getAttribute('href') || element.currentSrc || element.getAttribute('src');
   if (value && value.startsWith('https://')) {
     // resolve relative links
     value = new URL(value, window.location).href;
   }
   return value;
 };
 
 sampleRUM('top');
 window.addEventListener('load', () => sampleRUM('load'));
 document.addEventListener('click', (event) => {
   sampleRUM('click', {
     target: sampleRUM.targetselector(event.target),
     source: sampleRUM.sourceselector(event.target),
   });
 });
 
 const olderror = window.onerror;
 window.onerror = (event, source, line) => {
   sampleRUM('error', { source, target: line });
   // keep the old error handler around
   if (typeof olderror === 'function') {
     olderror(event, source, line);
   } else {
     throw new Error(event);
   }
 };

/**
 * Creates a tag with the given name and attributes.
 * @param {string} name The tag name
 * @param {object} attrs An object containing the attributes
 * @returns {Element} The new tag
 */
 export function createTag(name, attrs) {
    const el = document.createElement(name);
    if (typeof attrs === 'object') {
      for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
      }
    }
    return el;
  }
  
  /**
   * Loads a CSS file.
   * @param {string} href The path to the CSS file
   */
  export function loadCSS(href) {
    if (!document.querySelector(`head > link[href="${href}"]`)) {
      const link = document.createElement('link');
      link.setAttribute('rel', 'stylesheet');
      link.setAttribute('href', href);
      link.onload = () => {
      };
      link.onerror = () => {
      };
      document.head.appendChild(link);
    }
  }
  
  export function loadScript(url, callback, type) {
    const $head = document.querySelector('head');
    const $script = createTag('script', { src: url });
    if (type) {
      $script.setAttribute('type', type);
    }
    $head.append($script);
    $script.onload = callback;
    return $script;
  }
  
  /**
   * Retrieves the content of a metadata tag.
   * @param {string} name The metadata name (or property)
   * @returns {string} The metadata value
   */
  export function getMetadata(name) {
    const attr = name && name.includes(':') ? 'property' : 'name';
    const $meta = document.head.querySelector(`meta[${attr}="${name}"]`);
    return $meta && $meta.content;
  }
  
  /**
   * Adds one or more URLs to the dependencies for publishing.
   * @param {string|[string]} url The URL(s) to add as dependencies
   */
  export function addPublishDependencies(url) {
    const urls = Array.isArray(url) ? url : [url];
    window.hlx = window.hlx || {};
    if (window.hlx.dependencies && Array.isArray(window.hlx.dependencies)) {
      window.hlx.dependencies.concat(urls);
    } else {
      window.hlx.dependencies = urls;
    }
  }
  
  /**
   * Sanitizes a name for use as class name.
   * @param {*} name The unsanitized name
   * @returns {string} The class name
   */
  export function toClassName(name) {
    return name && typeof name === 'string'
      ? name.toLowerCase().replace(/[^0-9a-z]/gi, '-')
      : '';
  }
  
  /**
   * Wraps each section in an additional {@code div}.
   * @param {[Element]} $sections The sections
   */
  function wrapSections($sections) {
    $sections.forEach(($div) => {
      if (!$div.id) {
        const $wrapper = createTag('div', { class: 'section-wrapper' });
        $div.parentNode.appendChild($wrapper);
        $wrapper.appendChild($div);
      }
    });
  }
  
  /**
   * Decorates all blocks in a container element by turning them into custom elements.
   * @param {Element} $main The container element
   */
   export function decorateBlocks($main) {
    Array.from($main.querySelectorAll('div.section-wrapper > div > div[class]'))
      .forEach(($block) => {
        const blockName = $block.className;
        // $block.classList.add('block');
        $block.setAttribute('data-block-name', blockName);
        const customEl = Array
          .from($block.querySelectorAll(':scope > div'))
          .reduce((cel, row) => {
            const divs = Array.from(row.querySelectorAll(':scope > div'));
            const name = divs.length === 1 ? `value` : divs[0].textContent.toLowerCase();
            const textVal = row.querySelector(':scope > div:last-child').innerText;
            const innerHTML = row.querySelector(':scope > div:last-child > *') && row.querySelector(':scope > div:last-child').innerHTML;
            if (!innerHTML) {
              cel.setAttribute(name, textVal);
            } else {
              const valEl = document.createElement(`helix-${name}`);
              valEl.innerHTML = innerHTML;
              cel.appendChild(valEl);
            }
            return cel;
        }, document.createElement(`helix-${blockName}`))
        customEl.setAttribute('data-block-name', blockName);
        $block.parentElement.replaceChild(customEl, $block);
    });
  }
  
  /**
   * Loads JS and CSS for a block.
   * @param {Element} $block The block element
   */
  export async function loadBlock($block) {
    const blockName = $block.getAttribute('data-block-name') || $block.tagName.toLowerCase().replace(/^[^-]+-/, '');
    try {
      /* const mod = await import(`/blocks/${blockName}/${blockName}.js`);
      if (mod.default) {
        await mod.default($block, blockName, document);
      } */
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(`failed to load module for ${blockName}`, err);
    }
    console.log('loading', blockName);
    import(`/elements/${blockName}/${blockName}.js`);
    loadCSS(`/elements/${blockName}/${blockName}.css`);
  }
  
  /**
   * Loads JS and CSS for all blocks in a container element.
   * @param {Element} $main The container element
   */
  async function loadBlocks($main) {
    $main
      .querySelectorAll('div.section-wrapper > div > *[data-block-name]')
      .forEach(async ($block) => loadBlock($block));
  }
  
  /**
   * Extracts the config from a block.
   * @param {Element} $block The block element
   * @returns {object} The block config
   */
  export function readBlockConfig($block) {
    const config = {};
    $block.querySelectorAll(':scope > div').forEach(($row) => {
      if ($row.children) {
        const $cols = [...$row.children];
        if ($cols[1]) {
          const $value = $cols[1];
          const name = toClassName($cols[0].textContent);
          let value = '';
          if ($value.querySelector('a')) {
            const $as = [...$value.querySelectorAll('a')];
            if ($as.length === 1) {
              value = $as[0].href;
            } else {
              value = $as.map(($a) => $a.href);
            }
          } else if ($value.querySelector('p')) {
            const $ps = [...$value.querySelectorAll('p')];
            if ($ps.length === 1) {
              value = $ps[0].textContent;
            } else {
              value = $ps.map(($p) => $p.textContent);
            }
          } else value = $row.children[1].textContent;
          config[name] = value;
        }
      }
    });
    return config;
  }
  
  /**
   * Official Google WEBP detection.
   * @param {Function} callback The callback function
   */
  function checkWebpFeature(callback) {
    const webpSupport = sessionStorage.getItem('webpSupport');
    if (!webpSupport) {
      const kTestImages = 'UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
      const img = new Image();
      img.onload = () => {
        const result = (img.width > 0) && (img.height > 0);
        window.webpSupport = result;
        sessionStorage.setItem('webpSupport', result);
        callback();
      };
      img.onerror = () => {
        sessionStorage.setItem('webpSupport', false);
        window.webpSupport = false;
        callback();
      };
      img.src = `data:image/webp;base64,${kTestImages}`;
    } else {
      window.webpSupport = (webpSupport === 'true');
      callback();
    }
  }
  
  /**
   * Returns an image URL with optimization parameters
   * @param {string} url The image URL
   */
  export function getOptimizedImageURL(src) {
    const url = new URL(src, window.location.href);
    console.log('optimizing', url.href);
    let result = src;
    const { pathname, search } = url;
    if (pathname.includes('media_')) {
      const usp = new URLSearchParams(search);
      usp.delete('auto');
      if (!window.webpSupport) {
        if (pathname.endsWith('.png')) {
          usp.set('format', 'png');
        } else if (pathname.endsWith('.gif')) {
          usp.set('format', 'gif');
        } else {
          usp.set('format', 'pjpg');
        }
      } else {
        usp.set('format', 'webply');
      }
      result = `${src.split('?')[0]}?${usp.toString()}`;
    }
    return (result);
  }
  
  /**
   * Resets an elelemnt's attribute to the optimized image URL.
   * @see getOptimizedImageURL
   * @param {Element} $elem The element
   * @param {string} attrib The attribute
   */
  function resetOptimizedImageURL($elem, attrib) {
    const src = $elem.getAttribute(attrib);
    if (src) {
      const oSrc = getOptimizedImageURL(src);
      if (oSrc !== src) {
        $elem.setAttribute(attrib, oSrc);
      }
    }
  }
  
  /**
   * WEBP Polyfill for older browser versions.
   * @param {Element} $elem The container element
   */
  export function webpPolyfill($elem) {
    if (!window.webpSupport) {
      $elem.querySelectorAll('img').forEach(($img) => {
        resetOptimizedImageURL($img, 'src');
      });
      $elem.querySelectorAll('picture source').forEach(($source) => {
        resetOptimizedImageURL($source, 'srcset');
      });
    }
  }
  
  /**
   * Decorates the main element.
   * @param {Element} $main The main element
   */
  export function decorateMain($main) {
    wrapSections($main.querySelectorAll(':scope > div'));
    checkWebpFeature(() => {
      webpPolyfill($main);
    });
    decorateBlocks($main);
  }

  function addMenu(main) {
    const menu = document.createElement('custom-menu');

    const h1 = document.createElement('h1');
    h1.innerHTML = `<a href="/"><span id="mini">mini</span><span id="velo">velos</span>.bike</a>`;
    main.prepend(h1);
    main.prepend(menu);
    loadBlock(menu);
  }
  
  /**
   * Sets the trigger for the LCP (Largest Contentful Paint) event.
   * @see https://web.dev/lcp/
   * @param {Document} doc The document
   * @param {Function} postLCP The callback function
   */
  function setLCPTrigger(doc, postLCP) {
    const $lcpCandidate = doc.querySelector('main > div:first-of-type img');
    if ($lcpCandidate) {
      if ($lcpCandidate.complete) {
        postLCP();
      } else {
        $lcpCandidate.addEventListener('load', () => {
          postLCP();
        });
        $lcpCandidate.addEventListener('error', () => {
          postLCP();
        });
      }
    } else {
      postLCP();
    }
  }

  
  /**
   * Decorates the page.
   * @param {Window} win The window
   */
  async function decoratePage(win = window) {
    const doc = win.document;
    const $main = doc.querySelector('main');
    const $header = doc.querySelector('header');
    const $footer = doc.querySelector('footer');
    if ($main) {
      addMenu($header);
      decorateMain($main);
      setLCPTrigger(doc, async () => {
        loadCSS('/styles/lazy-styles.css');
        // post LCP actions go here
        await loadBlocks($main);
        document.querySelector('html').lang = 'en';
      });
      doc.querySelector('body').classList.add('appear');
    }
  }
  
  decoratePage(window);