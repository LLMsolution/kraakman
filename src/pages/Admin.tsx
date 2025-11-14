import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Custom styling om te matchen met de rest van de site
const inputClass = "h-12 border border-[#030303] bg-[#F1EFEC] focus:border-[#030303] focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:border-[#030303] transition-none px-4 py-3";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/admin/dashboard");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/admin/dashboard");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Fout bij inloggen",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Check if user is admin
    if (data.user) {
      const { data: isAdminData, error: adminError } = await supabase.rpc('is_admin', {
        user_id: data.user.id
      });

      if (adminError || !isAdminData) {
        await supabase.auth.signOut();
        toast({
          title: "Toegang geweigerd",
          description: "Je hebt geen admin rechten.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Ingelogd",
        description: "Je wordt doorgestuurd naar het dashboard.",
      });
      navigate("/admin/dashboard");
    }

    setLoading(false);
  };


  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="w-full max-w-md p-8" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-primary)' }}>

        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Admin Login</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>Log in met je admin account.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>E-mail</Label>
            <Input
              className={inputClass}
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@voorbeeld.nl"
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Wachtwoord</Label>
            <Input
              className={inputClass}
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            className="w-full btn-primary"
            disabled={loading}
          >
            {loading ? "Inloggen..." : "Inloggen"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Admin;
