import { SidebarProvider } from "./components/SidebarContext";

export default function AdminLayout({ children }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}