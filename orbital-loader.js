/**
 * OrbitalLoader - Pure Minimalist (Clean) Kinetic & Multi-Orbit Loader Component
 * 
 * Version: 2.0.0
 * Zero dependencies. Self-contained CSS injection.
 * High-performance centralized RequestAnimationFrame engine.
 * Supports HTML utility classes, custom element (<orbital-loader>), and programmatic JS API.
 * 
 * License: MIT
 */
(function (root, factory) {
  if (root && root.OrbitalLoader) {
    return; // Already initialized; avoid duplicate instances and loops
  }
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.OrbitalLoader = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Inject required styles once
  const STYLE_ID = 'orbital-loader-styles';
  function injectStyles() {
    if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .orbital-loader, orbital-loader {
        --ol-size: 56px;
        --ol-dot: 9px;
        --ol-dist: 20px;
        --ol-color-a: #D8D4F8;
        --ol-color-b: #FBF8ED;
        --ol-color-c: #C7F3E3;
        --ol-ring-color: rgba(255, 255, 255, 0.14);
        --ol-glow: rgba(255, 255, 255, 0.4);
        
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--ol-size);
        height: var(--ol-size);
        box-sizing: border-box;
        vertical-align: middle;
        pointer-events: none;
        user-select: none;
        overflow: visible;
      }

      /* Preset utility size classes */
      .orbital-loader.size-xs { --ol-size: 24px; --ol-dot: 4.5px; --ol-dist: 8px; }
      .orbital-loader.size-sm { --ol-size: 36px; --ol-dot: 6.5px; --ol-dist: 12.5px; }
      .orbital-loader.size-md { --ol-size: 56px; --ol-dot: 9px; --ol-dist: 19.5px; }
      .orbital-loader.size-lg { --ol-size: 80px; --ol-dot: 12px; --ol-dist: 28px; }
      .orbital-loader.size-xl { --ol-size: 112px; --ol-dot: 16px; --ol-dist: 39px; }
      .orbital-loader.size-2xl { --ol-size: 144px; --ol-dot: 20px; --ol-dist: 50px; }

      .ol-canvas-wrap {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .ol-rings-svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: visible;
      }

      .ol-stage {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        will-change: transform;
      }

      .ol-dot {
        position: absolute;
        top: 0;
        left: 0;
        border-radius: 50%;
        will-change: transform, opacity;
        transform: translate(-50%, -50%);
        box-sizing: border-box;
      }

      .ol-hidden {
        display: none !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  // Active instances managed by the centralized loop
  const activeInstances = new Set();
  let rafId = null;
  let lastTimestamp = 0;

  function animationLoop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = Math.min(50, timestamp - lastTimestamp);
    lastTimestamp = timestamp;

    for (const inst of activeInstances) {
      if (!inst.isDestroyed && !inst.isPaused && inst.isVisible) {
        inst._update(delta);
      }
    }

    if (activeInstances.size > 0) {
      rafId = requestAnimationFrame(animationLoop);
    } else {
      rafId = null;
    }
  }

  function startGlobalLoop() {
    if (!rafId && activeInstances.size > 0) {
      lastTimestamp = performance.now();
      rafId = requestAnimationFrame(animationLoop);
    }
  }

  // Default color presets
  const DEFAULT_PALETTES = {
    minimalist: ['#D8D4F8', '#FBF8ED', '#C7F3E3'],
    monochrome: ['#FFFFFF', '#ECEEF2', '#A1A1AA'],
    dark: ['#18181B', '#3F3F46', '#71717A'],
    electric: ['#38BDF8', '#818CF8', '#C084FC'],
    emerald: ['#34D399', '#6EE7B7', '#A7F3D0'],
    sunset: ['#F43F5E', '#FB923C', '#FBBF24'],
    cyber: ['#00F5FF', '#FF007F', '#FFE600']
  };

  /**
   * Helper: parse color specification into array of colors
   */
  function parseColors(colorOpt) {
    if (!colorOpt) return DEFAULT_PALETTES.minimalist;
    if (Array.isArray(colorOpt) && colorOpt.length) return colorOpt;
    if (typeof colorOpt === 'string') {
      const trimmed = colorOpt.trim();
      if (DEFAULT_PALETTES[trimmed.toLowerCase()]) {
        return DEFAULT_PALETTES[trimmed.toLowerCase()];
      }
      if (trimmed.includes(',')) {
        return trimmed.split(',').map(s => s.trim());
      }
      return [trimmed, trimmed, trimmed];
    }
    return DEFAULT_PALETTES.minimalist;
  }

  /**
   * OrbitalLoader Instance Class
   */
  class OrbitalLoaderInstance {
    constructor(target, options = {}) {
      injectStyles();

      // Resolve container element
      if (typeof target === 'string') {
        this.container = document.querySelector(target);
      } else if (target instanceof HTMLElement) {
        this.container = target;
      }

      if (!this.container) {
        throw new Error('[OrbitalLoader] Valid target DOM element or selector is required.');
      }

      this.isDestroyed = false;
      this.isPaused = false;
      this.isVisible = true;

      // Extract attributes if present on element
      const dataset = this.container.dataset || {};
      const elSpeed = this.container.getAttribute('speed') || dataset.speed;
      const elSize = this.container.getAttribute('size') || dataset.size;
      const elMode = this.container.getAttribute('mode') || dataset.mode;
      const elColor = this.container.getAttribute('color') || dataset.color || dataset.palette;
      const elOrbits = this.container.getAttribute('orbits') || dataset.orbits;
      const elRings = this.container.getAttribute('rings') || dataset.rings;
      const elRingStyle = this.container.getAttribute('ring-style') || dataset.ringStyle;
      const elGlow = this.container.getAttribute('glow') || dataset.glow;
      const elDotSize = this.container.getAttribute('dot-size') || dataset.dotSize;

      this.hasExplicitSize = (options.size !== undefined) || (this.container.hasAttribute('size')) || (dataset.size !== undefined);

      // Merge options (JS opts override HTML attributes, which override defaults)
      this.options = {
        size: options.size !== undefined ? options.size : (elSize || null),
        mode: options.mode || elMode || 'kinetic', // 'kinetic' | 'rings' | 'satellite'
        speed: options.speed !== undefined ? parseFloat(options.speed) : (elSpeed ? parseFloat(elSpeed) : 1.0),
        color: options.color || (elColor ? elColor : null),
        orbits: options.orbits !== undefined ? parseInt(options.orbits, 10) : (elOrbits ? parseInt(elOrbits, 10) : 3),
        rings: options.rings !== undefined ? options.rings : (elRings !== undefined ? (elRings === 'true' || elRings === '') : true),
        ringStyle: options.ringStyle || elRingStyle || 'dashed', // 'dashed' | 'solid'
        glow: options.glow !== undefined ? options.glow : (elGlow !== undefined ? (elGlow === 'true' || elGlow === '1') : true),
        glowIntensity: options.glowIntensity !== undefined ? options.glowIntensity : 0.45,
        dotSize: options.dotSize !== undefined ? options.dotSize : (elDotSize ? parseFloat(elDotSize) : null),
        direction: options.direction || 'clockwise', // 'clockwise' | 'counter' | 'alternating'
        distRatio: options.distRatio !== undefined ? options.distRatio : 0.35 // orbit distance relative to size
      };

      // Ensure container has loader class
      if (!this.container.classList.contains('orbital-loader')) {
        this.container.classList.add('orbital-loader');
      }

      this._setupDOM();
      this._applyConfig();

      // Register instance in active set
      activeInstances.add(this);
      startGlobalLoop();

      // Store instance reference on element
      this.container.__orbitalLoader = this;
    }

    _setupDOM() {
      // Clear any prior loader internal elements
      this.container.innerHTML = '';

      // Stage for SVG rings
      this.svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.svgEl.setAttribute('class', 'ol-rings-svg');
      this.container.appendChild(this.svgEl);

      // Stage for dots
      this.stageEl = document.createElement('div');
      this.stageEl.className = 'ol-stage';
      this.container.appendChild(this.stageEl);

      // Kinetic state variables
      this.slots = ['A', 'B', 'C'];
      this.stepIndex = 0;
      this.progress = 0.0;
      this.globalAngle = 0.0;

      // Rings state variables
      this.ringsState = [];
    }

    _applyConfig() {
      const opts = this.options;
      let numSize = 56;
      let sizeVal = '56px';

      if (this.hasExplicitSize && opts.size !== null) {
        sizeVal = typeof opts.size === 'number' ? `${opts.size}px` : opts.size;
        numSize = parseFloat(sizeVal) || 56;
        this.container.style.setProperty('--ol-size', sizeVal);
      } else if (typeof window !== 'undefined') {
        const computed = window.getComputedStyle(this.container);
        const compSize = parseFloat(computed.getPropertyValue('--ol-size'));
        if (compSize && !isNaN(compSize) && compSize > 0) {
          numSize = compSize;
          sizeVal = `${compSize}px`;
        }
      }

      this.numericSize = numSize;
      this.dist = numSize * opts.distRatio;
      this.radius = this.dist / 2;
      this.dotSize = opts.dotSize ? parseFloat(opts.dotSize) : Math.max(3.5, Math.round(numSize * 0.15));

      // Explicit width/height on container and SVG for bulletproof layout
      this.container.style.width = sizeVal;
      this.container.style.height = sizeVal;
      if (this.svgEl) {
        this.svgEl.setAttribute('width', this.numericSize);
        this.svgEl.setAttribute('height', this.numericSize);
        this.svgEl.setAttribute('viewBox', `0 0 ${this.numericSize} ${this.numericSize}`);
      }

      if (this.hasExplicitSize) {
        this.container.style.setProperty('--ol-dot', `${this.dotSize}px`);
        this.container.style.setProperty('--ol-dist', `${this.dist}px`);
      }

      const colors = parseColors(opts.color);
      this.colors = colors;

      // Build internal dots & rings according to mode
      if (opts.mode === 'kinetic') {
        this._buildKineticMode();
      } else if (opts.mode === 'rings') {
        this._buildRingsMode();
      } else if (opts.mode === 'satellite') {
        this._buildSatelliteMode();
      }

      // Initial render tick to position dots immediately without FOUC
      this._update(0);
    }

    _buildKineticMode() {
      this.stageEl.innerHTML = '';
      this.svgEl.innerHTML = '';

      // Draw faint boundary ring if enabled
      if (this.options.rings) {
        const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const c = this.numericSize / 2;
        ring.setAttribute('cx', c);
        ring.setAttribute('cy', c);
        ring.setAttribute('r', this.dist);
        ring.setAttribute('fill', 'none');
        ring.setAttribute('stroke', this.colors[0]);
        ring.setAttribute('stroke-opacity', '0.14');
        ring.setAttribute('stroke-width', '1');
        if (this.options.ringStyle === 'dashed') {
          ring.setAttribute('stroke-dasharray', '3 4');
        }
        this.svgEl.appendChild(ring);
      }

      // Create the 3 kinetic dots
      this.dots = {};
      ['A', 'B', 'C'].forEach((key, idx) => {
        const dot = document.createElement('div');
        dot.className = `ol-dot ol-dot-${key.toLowerCase()}`;
        const color = this.colors[idx % this.colors.length];
        dot.style.width = `${this.dotSize}px`;
        dot.style.height = `${this.dotSize}px`;
        dot.style.backgroundColor = color;

        if (this.options.glow) {
          const glowAlpha = this.options.glowIntensity;
          dot.style.boxShadow = `0 0 ${Math.max(6, this.dotSize * 1.2)}px ${color}`;
        } else {
          dot.style.boxShadow = 'none';
        }

        this.stageEl.appendChild(dot);
        this.dots[key] = dot;
      });
    }

    _buildRingsMode() {
      this.stageEl.innerHTML = '';
      this.svgEl.innerHTML = '';

      const count = Math.max(1, Math.min(6, this.options.orbits || 3));
      const maxR = this.numericSize * 0.44;
      const c = this.numericSize / 2;
      this.ringsState = [];

      for (let i = 0; i < count; i++) {
        const r = maxR * ((i + 1) / count);
        const color = this.colors[i % this.colors.length];

        // Draw track circle
        if (this.options.rings) {
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', c);
          circle.setAttribute('cy', c);
          circle.setAttribute('r', r);
          circle.setAttribute('fill', 'none');
          circle.setAttribute('stroke', color);
          circle.setAttribute('stroke-opacity', (0.10 + (i * 0.03)).toFixed(2));
          circle.setAttribute('stroke-width', '1');
          if (this.options.ringStyle === 'dashed') {
            circle.setAttribute('stroke-dasharray', `${2 + i} ${3 + i}`);
          }
          this.svgEl.appendChild(circle);
        }

        // Orbiting satellite dot
        const dot = document.createElement('div');
        dot.className = 'ol-dot';
        const satSize = this.options.dotSize !== null
          ? this.dotSize
          : Math.max(3, Math.round(this.dotSize * (0.75 + (i * 0.15))));
        dot.style.width = `${satSize}px`;
        dot.style.height = `${satSize}px`;
        dot.style.backgroundColor = color;

        if (this.options.glow) {
          dot.style.boxShadow = `0 0 ${Math.max(4, satSize * 1.2)}px ${color}`;
        }

        this.stageEl.appendChild(dot);

        // Harmonic speed: outer orbits slightly slower or alternating directions
        let dir = 1;
        if (this.options.direction === 'counter') dir = -1;
        else if (this.options.direction === 'alternating') dir = (i % 2 === 0) ? 1 : -1;

        const speedFactor = (1.3 - (i * 0.22)) * dir;

        this.ringsState.push({
          dot,
          r,
          angle: (i * (Math.PI * 2 / count)),
          speedFactor
        });
      }
    }

    _buildSatelliteMode() {
      this.stageEl.innerHTML = '';
      this.svgEl.innerHTML = '';

      const c = this.numericSize / 2;
      const orbitR = this.numericSize * 0.38;

      // Center core nucleus
      const core = document.createElement('div');
      core.className = 'ol-dot ol-core';
      const coreSize = Math.max(5, Math.round(this.dotSize * 1.3));
      core.style.width = `${coreSize}px`;
      core.style.height = `${coreSize}px`;
      core.style.backgroundColor = this.colors[0];
      if (this.options.glow) {
        core.style.boxShadow = `0 0 ${coreSize * 1.5}px ${this.colors[0]}`;
      }
      this.stageEl.appendChild(core);

      // Track ring
      if (this.options.rings) {
        const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        ring.setAttribute('cx', c);
        ring.setAttribute('cy', c);
        ring.setAttribute('r', orbitR);
        ring.setAttribute('fill', 'none');
        ring.setAttribute('stroke', this.colors[1] || this.colors[0]);
        ring.setAttribute('stroke-opacity', '0.15');
        ring.setAttribute('stroke-width', '1');
        if (this.options.ringStyle === 'dashed') {
          ring.setAttribute('stroke-dasharray', '3 4');
        }
        this.svgEl.appendChild(ring);
      }

      // Outer satellite
      const sat = document.createElement('div');
      sat.className = 'ol-dot ol-satellite';
      const satSize = Math.max(3, Math.round(this.dotSize * 0.85));
      sat.style.width = `${satSize}px`;
      sat.style.height = `${satSize}px`;
      sat.style.backgroundColor = this.colors[1] || this.colors[0];
      if (this.options.glow) {
        sat.style.boxShadow = `0 0 ${satSize * 1.4}px ${this.colors[1] || this.colors[0]}`;
      }
      this.stageEl.appendChild(sat);

      this.satelliteState = {
        core,
        sat,
        orbitR,
        angle: 0,
        pulseTime: 0
      };
    }

    _update(delta) {
      if (this.options.mode === 'kinetic') {
        this._updateKinetic(delta);
      } else if (this.options.mode === 'rings') {
        this._updateRings(delta);
      } else if (this.options.mode === 'satellite') {
        this._updateSatellite(delta);
      }
    }

    _updateKinetic(delta) {
      const BASE_DURATION = 1200;
      const duration = BASE_DURATION / (this.options.speed || 1.0);

      this.progress += delta / duration;
      const angularVel = (Math.PI / 3) / duration;
      this.globalAngle += angularVel * delta;

      const D = this.dist;
      const R = this.radius;

      while (this.progress >= 1.0) {
        this.progress -= 1.0;
        const norm = ((this.stepIndex % 6) + 6) % 6;
        const isLeft = (norm % 2 === 0);
        const pair = isLeft ? [0, 1] : [1, 2];
        const s0 = pair[0];
        const s1 = pair[1];
        const temp = this.slots[s0];
        this.slots[s0] = this.slots[s1];
        this.slots[s1] = temp;
        this.stepIndex = (this.stepIndex + 1) % 6;
      }

      const norm = ((this.stepIndex % 6) + 6) % 6;
      const isLeft = (norm % 2 === 0);
      const pairSlots = isLeft ? [0, 1] : [1, 2];
      const stationarySlot = isLeft ? 2 : 0;
      const midX = isLeft ? -R : R;
      const spin = isLeft ? 1 : -1;

      const p = this.progress;
      const lx = (midX - R) + 2 * R * p;
      const ly = -spin * R * Math.sin(Math.PI * p);
      const rx = (midX + R) - 2 * R * p;
      const ry = -ly;
      const sx = stationarySlot === 0 ? -D : (stationarySlot === 1 ? 0 : D);
      const sy = 0;

      const cos = Math.cos(this.globalAngle);
      const sin = Math.sin(this.globalAngle);

      const toG = (x, y) => ({
        x: (x * cos - y * sin).toFixed(2),
        y: (x * sin + y * cos).toFixed(2)
      });

      const pos = {
        [this.slots[pairSlots[0]]]: toG(lx, ly),
        [this.slots[pairSlots[1]]]: toG(rx, ry),
        [this.slots[stationarySlot]]: toG(sx, sy)
      };

      if (this.dots.A) this.dots.A.style.transform = `translate(${pos.A.x}px, ${pos.A.y}px) translate(-50%, -50%)`;
      if (this.dots.B) this.dots.B.style.transform = `translate(${pos.B.x}px, ${pos.B.y}px) translate(-50%, -50%)`;
      if (this.dots.C) this.dots.C.style.transform = `translate(${pos.C.x}px, ${pos.C.y}px) translate(-50%, -50%)`;
    }

    _updateRings(delta) {
      const baseSpeed = 0.0028 * (this.options.speed || 1.0);
      for (let i = 0; i < this.ringsState.length; i++) {
        const ring = this.ringsState[i];
        ring.angle += baseSpeed * ring.speedFactor * delta;
        const x = (Math.cos(ring.angle) * ring.r).toFixed(2);
        const y = (Math.sin(ring.angle) * ring.r).toFixed(2);
        ring.dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      }
    }

    _updateSatellite(delta) {
      if (!this.satelliteState) return;
      const speed = 0.003 * (this.options.speed || 1.0);
      this.satelliteState.angle += speed * delta;
      this.satelliteState.pulseTime += delta * 0.003 * (this.options.speed || 1.0);

      // Orbit satellite
      const x = (Math.cos(this.satelliteState.angle) * this.satelliteState.orbitR).toFixed(2);
      const y = (Math.sin(this.satelliteState.angle) * this.satelliteState.orbitR).toFixed(2);
      this.satelliteState.sat.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;

      // Subtle breath pulse on core
      const pulseScale = 1.0 + 0.12 * Math.sin(this.satelliteState.pulseTime);
      this.satelliteState.core.style.transform = `translate(0px, 0px) translate(-50%, -50%) scale(${pulseScale.toFixed(2)})`;
    }

    // Public API Methods

    /**
     * Update configuration options on the fly
     * @param {Object} newOpts
     */
    update(newOpts = {}) {
      Object.assign(this.options, newOpts);
      this._applyConfig();
      return this;
    }

    /**
     * Set diameter size in px or string
     */
    setSize(size) {
      return this.update({ size });
    }

    /**
     * Set animation speed multiplier (e.g. 1.0, 1.5, 2.0)
     */
    setSpeed(speed) {
      this.options.speed = parseFloat(speed) || 1.0;
      return this;
    }

    /**
     * Set color or palette
     */
    setColor(color) {
      return this.update({ color });
    }

    /**
     * Hide loader
     */
    hide() {
      this.isVisible = false;
      this.container.classList.add('ol-hidden');
      return this;
    }

    /**
     * Show loader
     */
    show() {
      this.isVisible = true;
      this.container.classList.remove('ol-hidden');
      return this;
    }

    /**
     * Pause animation
     */
    pause() {
      this.isPaused = true;
      return this;
    }

    /**
     * Resume animation
     */
    play() {
      this.isPaused = false;
      return this;
    }

    /**
     * Teardown and clean DOM
     */
    destroy() {
      this.isDestroyed = true;
      activeInstances.delete(this);
      if (this.container) {
        delete this.container.__orbitalLoader;
        this.container.innerHTML = '';
      }
    }
  }

  /**
   * Static Factory & Automation Manager
   */
  const OrbitalLoader = {
    version: '2.0.0',

    /**
     * Create an OrbitalLoader instance programmatically
     * @param {string|HTMLElement} target - selector or DOM element
     * @param {Object} options - configuration
     * @returns {OrbitalLoaderInstance}
     */
    create(target, options) {
      return new OrbitalLoaderInstance(target, options);
    },

    /**
     * Get instance attached to an element, if any
     */
    getInstance(element) {
      if (typeof element === 'string') element = document.querySelector(element);
      return element ? element.__orbitalLoader || null : null;
    },

    /**
     * Scan the DOM and initialize elements matching selector
     * Default selector: '.orbital-loader, [data-orbital-loader], orbital-loader'
     */
    init(root = document, selector = '.orbital-loader, [data-orbital-loader]') {
      if (typeof document === 'undefined') return [];
      const nodes = root.querySelectorAll ? root.querySelectorAll(selector) : [];
      const created = [];
      nodes.forEach(el => {
        // Skip custom-elements which handle their own lifecycle
        if (el.tagName.toLowerCase() === 'orbital-loader') return;
        if (!el.__orbitalLoader) {
          created.push(new OrbitalLoaderInstance(el));
        }
      });
      return created;
    },

    /**
     * Destroy all active instances
     */
    destroyAll() {
      for (const inst of Array.from(activeInstances)) {
        inst.destroy();
      }
    },

    /**
     * Built-in Color Palettes
     */
    palettes: DEFAULT_PALETTES
  };

  // Define Web Component <orbital-loader> if supported
  if (typeof customElements !== 'undefined' && !customElements.get('orbital-loader')) {
    class OrbitalLoaderElement extends HTMLElement {
      static get observedAttributes() {
        return ['size', 'speed', 'mode', 'color', 'orbits', 'rings', 'ring-style', 'glow', 'dot-size'];
      }

      connectedCallback() {
        if (!this.__orbitalLoader) {
          this.__orbitalLoader = new OrbitalLoaderInstance(this);
        }
      }

      disconnectedCallback() {
        if (this.__orbitalLoader) {
          this.__orbitalLoader.destroy();
          this.__orbitalLoader = null;
        }
      }

      attributeChangedCallback(name, oldVal, newVal) {
        if (oldVal === newVal || !this.__orbitalLoader) return;
        const map = {
          'ring-style': 'ringStyle',
          'dot-size': 'dotSize'
        };
        const optKey = map[name] || name;
        this.__orbitalLoader.update({ [optKey]: newVal });
      }
    }
    customElements.define('orbital-loader', OrbitalLoaderElement);
  }

  // Auto-init on page load and observe DOM for dynamically added loaders
  if (typeof document !== 'undefined') {
    let observerAttached = false;
    const attachObserver = () => {
      if (observerAttached || typeof MutationObserver === 'undefined' || !document.body) return;
      observerAttached = true;
      const observer = new MutationObserver((mutations) => {
        for (const mut of mutations) {
          if (mut.addedNodes.length) {
            for (const node of mut.addedNodes) {
              if (node.nodeType === 1) { // ELEMENT_NODE
                if (node.matches && (node.matches('.orbital-loader') || node.matches('[data-orbital-loader]'))) {
                  if (!node.__orbitalLoader && node.tagName.toLowerCase() !== 'orbital-loader') {
                    new OrbitalLoaderInstance(node);
                  }
                }
                if (node.querySelectorAll) {
                  const children = node.querySelectorAll('.orbital-loader, [data-orbital-loader]');
                  children.forEach(child => {
                    if (!child.__orbitalLoader && child.tagName.toLowerCase() !== 'orbital-loader') {
                      new OrbitalLoaderInstance(child);
                    }
                  });
                }
              }
            }
          }
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    };

    const runAutoInit = () => {
      injectStyles();
      OrbitalLoader.init();
      attachObserver();
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runAutoInit);
    } else {
      runAutoInit();
    }
  }

  return OrbitalLoader;
});
