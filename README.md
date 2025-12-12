-------------------
steps to run locally:
1. clone repository
2. run: npm install webpack webpack-cli webpack-dev-server --save-dev
3. from /frontend run: npm run dev
4. it will give you an option to view local or via network
5. from /backed run python api.py

Demo: https://youtu.be/-Kla6kXHFe4?si=f6t6dNVcDx70VC4B

# File Structure 

```mermaid
flowchart TD
  root["ManageableF/"]

  root --> app["app/ — Next.js frontend (app router)"]
  app --> app_routes["routed views"]
  app_routes --> home["home/ — dashboard"]
  app_routes --> tasks["tasks/ — unified task inbox"]
  app_routes --> login["login/, signin/, signup/ — auth flows"]
  app_routes --> school["school/ & notes/ — notes hub"]
  app_routes --> workspace["workspace/ — per-note editor"]
  app_routes --> cooldown["cooldown/ — post-study reflection"]
  app_routes --> revision["revision/ — flashcards & session flow"]

  app --> app_shared["shared UI & logic"]
  app_shared --> components["components/ — reusable UI pieces"]
  app_shared --> utils["utils/ — helpers (notes, tasks, flashcards)"]
  app_shared --> styles["styles/ & globals.css — styling"]
  app_shared --> api_routes["api/ — Next.js API routes (flashcards)"]
  app_shared --> layout["layout.js & page.js — root layout/landing"]

  root --> backend["backend/ — Flask API"]
  backend --> api_py["api.py — route definitions"]
  backend --> canvas_utils["canvasAPI_utils.py — Canvas integration"]
  backend --> scheduler["category_task_scheduler.py — task duration & roadmap"]
  backend --> oauth["oauth_canvas.py — OAuth helper"]
  backend --> reqs["requirements.txt"]

  root --> public["public/ — static assets (images, fonts, covers)"]
  root --> docs_dir["docs/ — project reports & diagrams"]
  root --> config["config files — README.md, package*.json, eslint/postcss configs"]
```
--------------------
<<<<<<< HEAD
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# Manageable
Project for capstone fall 2025
>>>>>>> f32acbefbf3408afbfcfc89e0e25cf9575aea583
