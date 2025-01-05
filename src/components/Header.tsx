import { Plus, Folder, UserCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

function UserActions() {
  return (
    <div className="flex gap-2">
      <Button>Connect Wallet</Button>

      <Button variant="outline" size="icon">
        <UserCircle />
      </Button>
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <UserCircle /> Flow3
    </div>
  );
}

function Nav() {
  return (
    <nav>
      <ul className="flex gap-2">
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/auth">Auth</Link>
        </li>
      </ul>
    </nav>
  );
}

export default function Header() {
  return (
    <header>
      <div className="inner-column wide flex items-center justify-between">
        <Logo />

        <Nav />

        <UserActions />
      </div>
    </header>
  );
}
