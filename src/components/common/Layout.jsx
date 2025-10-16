import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { SecurityPopupProvider } from "../../context/SecurityPopupContext";

function Layout() {
  return (
    <SecurityPopupProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 bg-[#F4F5F9]">
          <Outlet />
        </main>
      </div>
    </SecurityPopupProvider>
  );
}

export default Layout;
