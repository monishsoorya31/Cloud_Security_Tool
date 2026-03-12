import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layout/MainLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>

          {/* 👇 THIS was missing */}
          <Route index element={<Navigate to="/rag" replace />} />

          <Route path="rag" element={<></>} />
          <Route path="policies" element={<></>} />
          <Route path="knowledge-base" element={<></>} />


        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
