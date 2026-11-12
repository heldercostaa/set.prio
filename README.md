<div align="center">

![Language](https://img.shields.io/badge/language-typescript-yellow?logo=typescript&logoColor=white)
[![React](https://img.shields.io/badge/react-222?logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-222?logo=tailwindcss&logoColor=06B6D4)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/vite-222?logo=vite&logoColor=646CFF)](https://vite.dev)
[![Vercel](https://img.shields.io/badge/vercel-222?logo=vercel&logoColor=white)](https://setprio.vercel.app)
[![Maintainer](https://img.shields.io/badge/maintainer-%40heldercostaa-teal?logo=superuser&logoColor=white)](https://github.com/heldercostaa)
[![LinkedIn](https://img.shields.io/badge/linkedin-blue.svg?logo=linkedin)](https://linkedin.com/in/heldercostaa/)
[![Support](https://img.shields.io/badge/support-give_a_star-ffd33d?logo=github)](https://github.com/heldercostaa/set.prio/stargazers)

<br />
<a href="https://setprio.vercel.app">
  <img src="./public/brand.svg" alt="set.priority logo" width="336" height="83">
</a>
<p align="center">
  Discover artists, prioritize performances, and share your festival plan.
  <br />
  <a href="#local-setup-instructions"><strong>Run the project locally »</strong></a>
  <br />
  <br />
  <a href="https://setprio.vercel.app">Live Application</a>
  ·
  <a href="https://github.com/heldercostaa/set.prio/issues">Report a Bug</a>
</p>
</div>

> [!NOTE]
> Your plan stays in the current browser. No backend, account, or API keys are required.

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#features">Features</a></li>
    <li><a href="#local-setup-instructions">Local Setup Instructions</a></li>
  </ol>
</details>

## About The Project

<div align="center">
  <picture>
    <source media="(prefers-reduced-motion: reduce)" srcset="./docs/screenshots/readme-desktop.png" />
    <img src="./docs/demos/priority-board.gif" alt="Dragging an artist to a new priority, filtering genres, and opening export options" width="95%" />
  </picture>
</div>
<br />

set.priority is a personal planner for deciding which artists to see. Organize performances by priority, explore recommended recordings, and keep ratings and notes. The bundled artist catalog covers Tomorrowland Brasil.

<p align="center">
  <picture>
    <source media="(prefers-reduced-motion: reduce)" srcset="./docs/screenshots/readme-mobile-board.png" />
    <img src="./docs/demos/mobile-planner.gif" alt="Choosing a day, rating a recommended set, and changing a priority on mobile" width="200" />
  </picture>
  <img src="./docs/screenshots/readme-mobile-details.png" alt="Artist details and rating controls" width="200" />
  <img src="./docs/screenshots/readme-mobile-saturday.png" alt="Saturday priority board on mobile" width="200" />
</p>

### Built With

[![React](https://img.shields.io/badge/React-222?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-222?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-222?logo=vite&logoColor=646CFF)](https://vite.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-222?logo=tailwindcss&logoColor=06B6D4)](https://tailwindcss.com)
[![Radix UI](https://img.shields.io/badge/Radix%20UI-222?logo=radixui)](https://www.radix-ui.com)
[![Motion](https://img.shields.io/badge/Motion-222)](https://motion.dev)
[![Zustand](https://img.shields.io/badge/Zustand-222)](https://zustand.docs.pmnd.rs)

## Features

- Prioritize performances by day, with nearby floating drag targets
- Search artists and filter by multiple genres
- Preview sets, mark watched recordings with ratings, and keep comments
- Share the plan as a PNG, CSV, or Notion table
- English and Brazilian Portuguese, with a dark interface
- Browser-local saving and a confirmed reset action

## Local Setup Instructions

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/heldercostaa/set.prio.git set-prio
   cd set-prio
   ```

2. **Install Dependencies**: Use the Node version in `.nvmrc` and pnpm version in `package.json`.

   ```bash
   nvm use
   pnpm install --frozen-lockfile
   ```

3. **Run Development Server**:

   ```bash
   pnpm dev
   ```

> [!TIP]
> Use `pnpm build` and `pnpm preview` to check the production build. Testing, catalog sources, and screenshot refresh commands are in the [development notes](./docs/development.md).
