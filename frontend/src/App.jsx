import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layout/MainLayout";
import RagPage from "./pages/RagPage";
import IngestPage from "./pages/IngestPage";
import PolicyPage  from "./pages/PolicyPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          
          {/* 👇 THIS was missing */}
          <Route index element={<Navigate to="/rag" replace />} />

          <Route path="rag" element={<RagPage />} />
          <Route path="ingest" element={<IngestPage />} />
          <Route path="policies" element={<PolicyPage />} />


        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
