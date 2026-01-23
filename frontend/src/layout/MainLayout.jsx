import { NavLink, Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-xl font-bold leading-tight">
        CloudSec AI
        <span className="block text-sm font-normal text-white-400 italic mt-1">
            One Security Tool for Every Cloud
        </span>
        </h2>

        
        <br></br>
        <nav className="flex flex-col">
        <NavLink to="rag"className="px-3 py-2 rounded hover:bg-gray-800">
            RAG Assistant
        </NavLink>
        <NavLink to="/ingest" className="px-3 py-2 rounded hover:bg-gray-800">
            Document Ingestion
        </NavLink>

        <NavLink to="/policies" className="px-3 py-2 rounded hover:bg-gray-800">
            Policy Analyzer
        </NavLink>

        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 p-6">
        {/* 👇 THIS is where pages render */}
        <Outlet />
      </main>
    </div>
  );
}
