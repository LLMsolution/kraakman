import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-secondary)]">
      <div className="text-center max-w-md mx-auto px-4">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-[var(--color-primary)] mb-2">404</h1>
          <div className="h-1 w-24 bg-[var(--color-primary)] mx-auto"></div>
        </div>

        {/* Error Message */}
        <h2 className="mb-4 text-3xl font-bold text-[var(--color-text-primary)]">
          Pagina niet gevonden
        </h2>
        <p className="mb-8 text-lg text-[var(--color-text-muted)] leading-relaxed">
          Sorry, de pagina die u zoekt bestaat niet of is verplaatst.
          Controleer de URL of ga terug naar de homepagina.
        </p>

        {/* Home Button */}
        <Link to="/">
          <Button
            variant="default"
            size="default"
            className="w-full sm:w-auto"
          >
            <Home className="h-4 w-4 mr-2" />
            Terug naar homepagina
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
