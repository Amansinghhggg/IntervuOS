import { Link } from "react-router-dom";
import ForkLogo from "./ForkLogo";
import { Button } from "../components/Button";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)] h-16 flex items-center">
      <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center transition-transform group-hover:scale-105 duration-300 shadow-md shadow-[var(--primary)]/30 p-1.5">
            <ForkLogo className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-black text-[var(--text-primary)] tracking-wide">
            ForkTalent
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="glow" size="sm">
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
