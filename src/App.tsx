import { Route, Routes } from "react-router-dom";
import TopNav from "./components/TopNav";
import {
  ApprovedPage,
  CallPage,
  CallsPage,
  DataManagementPage,
  ReportsPage,
  SubscribePage,
  DashboardPage,
} from "./pages";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="bg-background min-h-screen flex flex-col font-sans">
      <TopNav />
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/data-management" element={<DataManagementPage />} />
            <Route path="/subscribe-page" element={<SubscribePage />} />
            <Route path="/approved-page" element={<ApprovedPage />} />
            <Route path="/reports-page" element={<ReportsPage />} />
            <Route path="/calls-page" element={<CallsPage />} />
            <Route path="/call-page/:id" element={<CallPage/>}/>
          </Routes>
        </div>
      </main>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}

export default App;

