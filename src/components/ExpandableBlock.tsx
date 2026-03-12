import { useState, ReactNode } from "react";
import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ExpandableBlockProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const ExpandableBlock = ({
  title,
  children,
  className = "",
}: ExpandableBlockProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className={`relative ${className}`}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="absolute top-2 right-2 z-10 h-8 w-8 bg-background/80 hover:bg-background"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        {children}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="max-w-4xl h-[90vh] flex flex-col overflow-hidden"
        >
          <DialogHeader className="shrink-0">
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpandableBlock;
