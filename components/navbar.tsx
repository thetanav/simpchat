import { Settings2Icon, DownloadIcon } from "lucide-react";
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
      <nav className="fixed top-3 right-3 left-3 justify-between flex items-center z-50">
        <div className="pl-3">
          <SidebarTrigger />
        </div>
        <div className="bg-card/80 backdrop-blur-md border shadow flex rounded-xl items-center p-1">
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
        </div>
      </nav>
    </TooltipProvider>
  );
}
