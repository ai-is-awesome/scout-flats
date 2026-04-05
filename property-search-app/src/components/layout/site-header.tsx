

import { Home } from "lucide-react";

const Header = () => (
  <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
    <div className="container mx-auto px-4 h-14 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <Home className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-heading font-bold text-lg text-foreground">
          ScoutFlats
        </span>
      </div>
      <nav className="flex items-center gap-6 text-sm text-muted-foreground">
        <a
          href="#"
          className="hover:text-foreground transition-colors font-medium"
        >
          Explore
        </a>
        <a href="#" className="hover:text-foreground transition-colors">
          About
        </a>
        <a href="#" className="hover:text-foreground transition-colors">
          Contact
        </a>
      </nav>
    </div>
  </header>
);





export default Header;
