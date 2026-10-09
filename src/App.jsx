// import './App.css'
// import ReportPage from './pages/Dashboard.jsx'
// import Navbar from './components/Navbar'
// import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
// // import PerceptionDashboard from './components/PerceptionDashboard.jsx'
// import BrandPerceptionSidebar from './components/BrandPerceptionSidebar.jsx'
// import Dashboard from './components/Dashboard.jsx'
// import WebSummary from './components/WebSummary'
// import WebIncidents from "./components/WebIncidents";
// import Sidebar from "./components/Sidebar.jsx"

// // ── Brand Perception Layout ───────────────────────────────────────────────────
// function BrandPerceptionLayout() {
//   return (
//     <div className="flex flex-col h-screen overflow-hidden bg-[#f9fafb]">
//       <Navbar name="Social Media Governance" />
//       <div className="flex flex-1 min-h-0 overflow-hidden">
//         <BrandPerceptionSidebar />
//         <main className="flex-1 overflow-y-auto">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   )
// }

// // ── Brand Infringement Layout (unchanged) ─────────────────────────────────────
// function BrandInfringementLayout() {
//   return (
//     <div className="flex h-screen flex-col bg-neutral-100 text-neutral-900">
//       <Navbar name="Digital Impersonation" />
//       <div className="flex min-h-0 flex-1">
//         <Sidebar />
//         <div className="min-w-0 flex-1 overflow-auto">
//           <Outlet />
//         </div>
//       </div>
//     </div>
//   )
// }

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>

  
//         <Route path="/" element={<Navigate to="/brand-perception" replace />} />

//         <Route path="/brand-perception" element={<BrandPerceptionLayout />}>
//           <Route index element={<ReportPage />} />                        
//           {/* <Route path="dashboard" element={<PerceptionDashboard/>} />     */}
//         </Route>

//         <Route element={<BrandInfringementLayout />}>
//           <Route path="/brand_infridgement" element={<Dashboard />} />
//           <Route path="/web-summary" element={<WebSummary />} />
//           <Route path="/web-incidents" element={<WebIncidents />} />
//         </Route>


//         <Route path="*" element={<Navigate to="/brand-perception" replace />} />

//       </Routes>
//     </BrowserRouter>
//   )
// }

// export default App




























import { useState } from 'react'
import './App.css'
import ReportPage from './pages/Dashboard.jsx'
import Navbar from './components/Navbar'
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Index from './pages/Index';
import Dashboard  from './components/Dashboard.jsx';
import WebSummary from './components/WebSummary';
import WebIncidents from "./components/WebIncidents";
import Sidebar from "./components/Sidebar.jsx"
// Module 3 — Material Price Movement Analytics
import MpmLayout from "./mpm/MpmLayout.jsx";
import LiveMonitor from "./mpm/pages/LiveMonitor.jsx";
import Investigation, { IncidentList } from "./mpm/pages/Investigation.jsx";
import ReportView, { ReportList, AlertsLog, MpmSettings } from "./mpm/pages/Reports.jsx";

function BrandPerceptionLayout() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Navbar name="Brand Perception AI - Early Signals" />
      <ReportPage />
    </div>
  )
}

function BrandInfringementLayout() {
  return (
    <div className="flex h-screen flex-col bg-neutral-100 text-neutral-900">
      <Navbar name="Digital Impersonation" />

      <div className="flex min-h-0 flex-1">
        <Sidebar />

        <div className="min-w-0 flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    // <BrowserRouter>
      <BrowserRouter basename="/Social-Media-Governance-AI">
      <Routes>

        <Route path="/" element={<Index />} />

        <Route
          path="/brand-perception"
          element={<BrandPerceptionLayout />}
        />

        {/* Nested Routes */}
        <Route element={<BrandInfringementLayout />}>
          <Route path="/brand_infridgement" element={<Dashboard />} />
          <Route path="/web-summary" element={<WebSummary />} />
          <Route path="/web-incidents" element={<WebIncidents />} />
        </Route>

        {/* Module 3 — Material Price Movement Analytics */}
        <Route path="/market-monitor" element={<MpmLayout />}>
          <Route index element={<LiveMonitor />} />
          <Route path="incidents" element={<IncidentList />} />
          <Route path="incident/:id" element={<Investigation />} />
          <Route path="reports" element={<ReportList />} />
          <Route path="report/:id" element={<ReportView />} />
          <Route path="alerts" element={<AlertsLog />} />
          <Route path="settings" element={<MpmSettings />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}


export default App