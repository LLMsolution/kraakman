import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="w-full bg-background border-b border-border sticky top-0 z-50">
      <div className="container-wide section-padding">
        <div className="flex items-center justify-center h-20">
          <div className="flex items-center gap-8">
            <Link 
              to="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground relative py-2",
                isActive("/") ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Home
              {isActive("/") && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
              )}
            </Link>
            <Link 
              to="/aanbod"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground relative py-2",
                isActive("/aanbod") ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Aanbod
              {isActive("/aanbod") && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
              )}
            </Link>
            <Link 
              to="/verkocht"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground relative py-2",
                isActive("/verkocht") ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Verkocht
              {isActive("/verkocht") && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
              )}
            </Link>
            <Link 
              to="/lpg"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground relative py-2",
                isActive("/lpg") ? "text-foreground" : "text-muted-foreground"
              )}
            >
              LPG
              {isActive("/lpg") && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
              )}
            </Link>
            <Link 
              to="/reviews"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground relative py-2",
                isActive("/reviews") ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Reviews
              {isActive("/reviews") && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
              )}
            </Link>
            <Link 
              to="/contact"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground relative py-2",
                isActive("/contact") ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Contact
              {isActive("/contact") && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
