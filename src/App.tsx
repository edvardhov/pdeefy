import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useHealthCheck } from "@/hooks/useHealthCheck";
import { Dashboard } from "@/pages/Dashboard";
import { Landing } from "@/pages/Landing";
import { ToolWorkspace } from "@/pages/ToolWorkspace";

function AppShell() {
  useHealthCheck();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <MarketingLayout>
            <Landing />
          </MarketingLayout>
        }
      />
      <Route
        path="/tools"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />
      <Route
        path="/tool/:id"
        element={
          <Layout>
            <ToolWorkspace />
          </Layout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/pdeefy">
      <ThemeProvider>
        <TooltipProvider>
          <AppShell />
          <Toaster richColors position="bottom-right" />
        </TooltipProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
