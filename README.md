# Orbital Loader (Pure Minimalist & Clean)

> An ultra-clean, production-grade kinetic and multi-orbit loader component with **zero external dependencies**. Self-injects its own scoped CSS, features a 60/120fps centralized animation engine, and can be embedded into **any web page** with a single `<script>` tag.

---

## ✨ Features

- **Pure Minimalist Aesthetic**: Refined hairlines, subtle luminous bloom, harmonic motion, and modern dark/light mode compatibility.
- **Single Drop-in File**: No separate `.css` file needed. `orbital-loader.js` injects all required styles automatically without style pollution.
- **3 Dynamic Modes**:
  1. `kinetic`: Mesmerizing 3-dot harmonic braiding orbital swap dance with global rotation.
  2. `rings`: Concentric planetary orbital rings (1 to 5 tracks) with harmonic Keplerian velocity.
  3. `satellite`: Pulsing core nucleus with an orbiting satellite bead.
- **3 Flexible Integration Methods**:
  - **HTML Utility Classes**: `<div class="orbital-loader size-md"></div>`
  - **Web Component**: `<orbital-loader size="64" speed="1.2"></orbital-loader>`
  - **JavaScript API**: `OrbitalLoader.create('#container', { size: 64 })`
- **Dynamic Live Customization**: Adjust size, orbit count, speed, colors, dot diameter, ring dash pattern, and glow on the fly.
- **Cross-Origin (CORS) Ready**: Host on Express, GitHub Pages, or Cloudflare and embed on any external site.

---

## 🚀 Quick Start (In Any Webpage)

### 1. Include the Script
Add this to your HTML `<head>` or before `</body>`:

```html
<script src="https://your-domain.com/orbital-loader.js"></script>
<!-- Or local copy -->
<script src="./orbital-loader.js"></script>
```

### 2. Add the Component

#### Option A: HTML Utility Classes & Data Attributes
```html
<!-- Simple default (56px) -->
<div class="orbital-loader"></div>

<!-- Preset size classes -->
<div class="orbital-loader size-xs"></div> <!-- 24px: Buttons / micro -->
<div class="orbital-loader size-sm"></div> <!-- 36px: Compact -->
<div class="orbital-loader size-md"></div> <!-- 56px: Default cards -->
<div class="orbital-loader size-lg"></div> <!-- 80px: Modals -->
<div class="orbital-loader size-xl"></div> <!-- 112px: Splash screens -->

<!-- Fully customized via data-attributes -->
<div class="orbital-loader"
     data-size="64"
     data-speed="1.2"
     data-mode="kinetic"
     data-color="minimalist"
     data-rings="true"
     data-ring-style="dashed"
     data-glow="true">
</div>

<!-- Concentric 3-Orbit Ring Loader -->
<div class="orbital-loader"
     data-mode="rings"
     data-orbits="3"
     data-size="72"
     data-color="electric"
     data-speed="1.0">
</div>
```

#### Option B: Web Component `<orbital-loader>`
```html
<!-- Kinetic Mode -->
<orbital-loader size="64" speed="1.2" mode="kinetic"></orbital-loader>

<!-- Concentric Rings Mode -->
<orbital-loader size="80" mode="rings" orbits="3" color="#38bdf8"></orbital-loader>

<!-- Satellite Core Mode -->
<orbital-loader size="50" mode="satellite" color="monochrome"></orbital-loader>
```

#### Option C: JavaScript Programmatic API
```javascript
// Mount into any selector or DOM node
const loader = OrbitalLoader.create('#my-target', {
  size: 64,                         // Diameter in px
  speed: 1.2,                       // Speed multiplier (0.5x, 1x, 2x)
  mode: 'kinetic',                  // 'kinetic' | 'rings' | 'satellite'
  orbits: 3,                        // Number of orbits (for 'rings' mode)
  color: 'minimalist',              // Palette name, hex, array, or 'currentColor'
  rings: true,                      // Show faint orbit guide tracks
  ringStyle: 'dashed',              // 'dashed' | 'solid'
  glow: true,                       // Soft luminous glow
  dotSize: 10                       // Dot diameter in px (or null for auto)
});

// Update options dynamically at runtime
loader.update({ speed: 2.0, color: '#34D399' });

// Convenience helpers
loader.setSize(80);
loader.setSpeed(1.5);
loader.hide();                      // Temporarily hides
loader.show();                      // Resumes visibility
loader.destroy();                   // Cleans up DOM and stops animation loop
```

---

## 🎨 Color Palettes & Custom Colors

You can pass built-in palette names, hex arrays, single colors, or CSS `currentColor`:

| Palette / Color | Description | Value |
|---|---|---|
| `'minimalist'` | Soft celestial pastels (Default) | `#D8D4F8`, `#FBF8ED`, `#C7F3E3` |
| `'monochrome'` | Pure crisp white & soft platinum | `#FFFFFF`, `#ECEEF2`, `#A1A1AA` |
| `'electric'` | Cyberpunk cyan, indigo, violet | `#38BDF8`, `#818CF8`, `#C084FC` |
| `'emerald'` | Frosted mints & emerald greens | `#34D399`, `#6EE7B7`, `#A7F3D0` |
| `'sunset'` | Rose, amber & warm glow | `#F43F5E`, `#FB923C`, `#FBBF24` |
| Single Hex | e.g. `'#38BDF8'` | All dots & rings inherit this color |
| Array of Hex | e.g. `['#FF0055', '#00FFFF']` | Custom color distribution |
| `'currentColor'` | Inherits text color of parent | Ideal inside buttons / links |

---

## 🛠 Complete Options Reference

| Option | HTML Attribute | Type | Default | Description |
|---|---|---|---|---|
| `size` | `data-size` / `size` | `number \| string` | `56` | Overall diameter in px (e.g. `48` or `'3rem'`) |
| `speed` | `data-speed` / `speed` | `number` | `1.0` | Animation speed multiplier (e.g. `0.5`, `1.5`) |
| `mode` | `data-mode` / `mode` | `string` | `'kinetic'` | `'kinetic'`, `'rings'`, or `'satellite'` |
| `orbits` | `data-orbits` / `orbits` | `number` | `3` | Number of concentric tracks (1 to 5) for `rings` mode |
| `color` | `data-color` / `color` | `string \| Array`| `'minimalist'`| Palette name, hex, array of hex, or `'currentColor'` |
| `rings` | `data-rings` / `rings` | `boolean` | `true` | Whether orbit trajectory tracks are visible |
| `ringStyle`| `data-ring-style` | `string` | `'dashed'` | Stroke appearance: `'dashed'` or `'solid'` |
| `glow` | `data-glow` / `glow` | `boolean` | `true` | Subtle soft glow around orbiting dots |
| `dotSize` | `data-dot-size` | `number \| null` | `null` (Auto) | Dot diameter in px. Defaults to 15% of size |
| `distRatio`| - | `number` | `0.35` | Orbit track distance ratio relative to size |

---

## 🌐 Deployment Instructions

### 1. Deploy with Express / Node.js
A production-ready server file (`server.js`) with **CORS** enabled is included.

```bash
# Start server
node server.js
```

Or using standard Express:
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS so other websites can link to your orbital-loader.js
app.use(cors());
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Orbital Loader served at http://localhost:${PORT}/orbital-loader.js`);
});
```

Now, any external webpage on any domain can include your loader:
```html
<script src="http://your-server-ip:3000/orbital-loader.js"></script>
<div class="orbital-loader"></div>
```

---

### 2. Deploy to GitHub Pages (Free CDN)
1. Initialize a git repository and push these files:
   ```bash
   git init
   git add .
   git commit -m "feat: Pure minimalist orbital loader"
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. On GitHub, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Branch**, select `main` (root) and click **Save**.
4. GitHub Pages will publish your site at `https://<your-username>.github.io/<repo-name>/`.
5. Now anyone can use:
   ```html
   <script src="https://<your-username>.github.io/<repo-name>/orbital-loader.js"></script>
   <div class="orbital-loader size-md"></div>
   ```

---

### 3. Deploy to Cloudflare Pages / Vercel / Netlify
Because this project is 100% static:
- **Cloudflare Pages**: Connect your Git repo, set Build command to blank, and Output directory to `/`.
- **Vercel**: Run `vercel` in terminal or import repository.
- **Netlify**: Run `netlify deploy --prod` or drag-and-drop the directory.

---

## ⚡ Performance Details

- **Single Global Loop**: Uses one single `requestAnimationFrame` loop regardless of how many loaders are active on the page.
- **Page Visibility Aware**: Automatically pauses when the browser tab is hidden to conserve battery and CPU.
- **Zero Style Leakage**: All injected styles are strictly namespaced under `.orbital-loader` and `orbital-loader`.
- **High-DPI / Retina Crispness**: Renders with sub-pixel SVG coordinates and CSS GPU transforms (`transform: translate3d(...)`) so it stays razor-sharp at any resolution.
