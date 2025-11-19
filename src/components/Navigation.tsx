import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="w-full bg-background border-b border-border sticky top-0 z-50">
      <div className="container-wide section-padding">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-center h-20 w-full">
          {/* Desktop Navigation - Gecentreerd */}
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

        {/* Mobile Layout */}
        <div className="md:hidden flex items-center justify-between h-20">
          {/* Logo/Brand placeholder - kan later worden toegevoegd */}
          <div className="w-32"></div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="flex items-center justify-center transition-all duration-200"
            style={{
              cursor: 'pointer',
              backgroundColor: 'transparent',
              border: 'none',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              padding: '8px',
              outline: 'none',
              boxShadow: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)';
              e.currentTarget.style.border = '1px solid var(--color-primary)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.querySelector('svg').style.color = 'var(--color-text-inverse)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.border = 'none';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.querySelector('svg').style.color = 'var(--color-text-primary)';
            }}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" style={{ color: 'var(--color-text-primary)', transition: 'color 0.2s ease' }} />
            ) : (
              <Menu className="h-6 w-6" style={{ color: 'var(--color-text-primary)', transition: 'color 0.2s ease' }} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border mt-4">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground py-2",
                  isActive("/") ? "text-foreground" : "text-muted-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/aanbod"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground py-2",
                  isActive("/aanbod") ? "text-foreground" : "text-muted-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Aanbod
              </Link>
              <Link
                to="/verkocht"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground py-2",
                  isActive("/verkocht") ? "text-foreground" : "text-muted-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Verkocht
              </Link>
              <Link
                to="/lpg"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground py-2",
                  isActive("/lpg") ? "text-foreground" : "text-muted-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                LPG
              </Link>
              <Link
                to="/reviews"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground py-2",
                  isActive("/reviews") ? "text-foreground" : "text-muted-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Reviews
              </Link>
              <Link
                to="/contact"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground py-2",
                  isActive("/contact") ? "text-foreground" : "text-muted-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
