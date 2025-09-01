import { RouterProvider } from "@tanstack/react-router";
import { router } from "@/router";
import { useAuth } from "@/hooks/useAuth";
import { AuthProvider } from "@/auth";
import { Toaster } from "@/components/ui/sonner";

function InnerApp() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

function App() {
  return (
    <>
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
      <Toaster />
    </>
  );
}

export default App;
