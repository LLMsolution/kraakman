import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type AuthStatus = "loading" | "authorized" | "unauthorized";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setStatus("unauthorized"); return; }
      const { data } = await supabase.rpc("is_admin", { user_id: session.user.id });
      setStatus(data ? "authorized" : "unauthorized");
    };
    checkAdmin();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  if (status === "unauthorized") return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
