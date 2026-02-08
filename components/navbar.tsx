import { Settings2Icon, DownloadIcon, BotIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import Link from "next/link";
import { SidebarTrigger } from "./ui/sidebar";

interface NavbarProps {
  onDownload?: () => void;
  hasMessages?: boolean;
}

export default function Navbar({
  onDownload,
  hasMessages,
}: NavbarProps) {
  return (
    <TooltipProvider>
      <nav className="fixed top-3 left-1/2 -translate-x-1/2 justify-between flex items-center z-50 bg-card/80 backdrop-blur-md border shadow rounded-full p-2">
        <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Link href="/" className="flex items-center gap-2">
                <BotIcon className="w-5 h-5 text-primary" />
                <h1 className="text-lg font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">Simp</h1>
            </Link>
        </div>
        <div className="flex items-center">
            {hasMessages && onDownload && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={"ghost"} size={"icon"} onClick={onDownload}>
                    <DownloadIcon
                      className="w-4 h-4"
                      suppressHydrationWarning={true}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download chat as Markdown</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={"ghost"} size={"icon"} asChild>
                  <Link href="/settings">
                    <Settings2Icon
                      className="w-4 h-4"
                      suppressHydrationWarning={true}
                    />
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
