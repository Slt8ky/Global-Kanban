# Global Kanban 📄

## 📝 Project Overview
A real-time collaborative Kanban workspace application built with Next.js and Supabase. Users authenticate via Google OAuth, create or join multi-member workspaces using shareable invite links, and organize tasks across dynamic drag-and-drop boards (`TO DO`, `IN PROGRESS`, `DONE`) synced seamlessly with optimistic updates.

## 📸 Project Screenshots
![alt text](<public/Screenshot 2026-08-08 120039.png>)
![alt text](<public/Screenshot 2026-08-08 120044.png>)
![alt text](<public/Screenshot 2026-08-08 120053.png>)
![alt text](<public/Screenshot 2026-08-08 120100.png>)

## 🌐 Live Demo & Deployment
Experience the live application deployed on Vercel:
- **Preview Website:** [https://global-kanban-rust.vercel.app/](https://global-kanban-rust.vercel.app/)

> [!TIP]
> Log in with your Google account on the preview deployment to test real-time workspace creation, member invites, and dynamic task drag-and-drop!

## 🛠️ Technology Stack
- Frontend: **Next.js** (App Router), **React**, **TypeScript**
- Styling & UI: **Tailwind CSS**, **Radix UI / Shadcn UI components**, **GSAP**, **Lucide Icons**
- State & Realtime Sync: **SWR** (Optimistic UI mutations), **dnd-kit** (Drag and Drop engine)
- Auth & Database: **Supabase** (Google OAuth + PostgreSQL database via `@supabase/ssr` & Server Actions)
- Package Manager: **pnpm**

## ✨ Core Features
- **Google OAuth authentication 🔐** with custom server action callback handling
- **Workspace management 🏢**: Create workspaces, invite members via shareable URLs, leave, or delete workspaces
- **Interactive Kanban board 📋**: Drag and drop tasks across `TO DO`, `IN PROGRESS`, and `DONE` columns
- **Task assignment & filtering 👥**: Assign single or multiple members to tasks, and filter task views using **Focus Mode**
- **Member management table 📊**: View member task stats and kick users from owned workspaces

## 🤝 Client Interaction
- Drag and drop task cards directly into target status columns with immediate optimistic feedback.
- Toggle **Focus Mode** to isolate and display only tasks assigned to the current logged-in user.
- Generate copyable invite links to seamlessly bring new members into the active workspace.

## 📋 Development Workflow
1. Set up **Next.js App Router** with **Supabase Server/Client** integration.
2. Implement **Google OAuth flow** and user profile upsert routes (`/app/api/user`).
3. Build **workspace schema & server actions** for creating, joining via `invite_id`, and managing workspace members.
4. Implement **dnd-kit integration** with **SWR optimistic updates** for real-time task status changes.
5. Build member table using `@tanstack/react-table` with row selection and kick functionality.

## 📚 Key Learnings
- Managing complex optimistic UI states with SWR `mutate` while dragging items across custom columns.
- Handling server action execution state cleanly via React's `useTransition` and `useActionState`.
- Constructing relational Supabase query builders for complex nested task assignments and workspace member relationships.
- Managing deep link routing parameters (`invite_id` and `workspace_id`) via Next.js client-side search parameter listeners.

## ⚙️ Project Startup Guide
### 1. Environment setup
`pnpm i`  
`cp .env.example .env.local`  
Fill all required secret keys inside `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SECRET_KEY=your_supabase_service_role_key
```

### 2. Run Web Dev Mode 💻
`pnpm dev`  

### 3. Build for Production 🌐
`pnpm build`  
`pnpm start`  

> [!TIP]
> Use the **Focus Mode** button in the workspace toolbar to filter out tasks that are not assigned to you 🎯
