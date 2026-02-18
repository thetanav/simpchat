import { Settings2Icon, PenSquareIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import Link from "next/link";
import { SidebarTrigger } from "./ui/sidebar";

export default function Navbar() {
  return (
    <TooltipProvider>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-12 px-3 bg-background/80 backdrop-blur-sm border-b border-border/40">
        <div className="flex items-center gap-1.5">
          <SidebarTrigger />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                <Link href="/">
                  <PenSquareIcon className="w-4 h-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>New chat</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          <span className="text-sm font-semibold text-foreground">
            Simp
          </span>
        </Link>

        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                <Link href="/settings">
                  <Settings2Icon className="w-4 h-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </nav>
    </TooltipProvider>
  );
}
