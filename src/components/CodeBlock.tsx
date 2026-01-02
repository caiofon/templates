import { useState } from "react";
import { Check, Copy, ChevronDown, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  maxHeight?: string;
}

const CodeBlock = ({ 
  code, 
  language, 
  filename, 
  collapsible = false,
  defaultExpanded = true,
  maxHeight = "500px"
}: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [fullscreen, setFullscreen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Fullscreen overlay */}
      {fullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm p-4 overflow-auto"
          onClick={() => setFullscreen(false)}
        >
          <div 
            className="max-w-6xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-lg overflow-hidden border border-border bg-[hsl(var(--code-bg))]">
              <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border sticky top-0">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-[hsl(var(--terminal-yellow))]/60" />
                    <div className="w-3 h-3 rounded-full bg-accent/60" />
                  </div>
                  {filename && (
                    <span className="text-xs text-muted-foreground font-mono ml-3">
                      {filename}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground uppercase">{language}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-primary/10"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-accent" />
                    ) : (
                      <Copy className="w-3 h-3 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-primary/10"
                    onClick={() => setFullscreen(false)}
                  >
                    <Minimize2 className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </div>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className="font-mono text-sm text-foreground leading-relaxed whitespace-pre">
                  {code}
                </code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Normal view */}
      <div className="rounded-lg overflow-hidden border border-border bg-[hsl(var(--code-bg))] transition-all duration-300">
        {/* Header */}
        <div 
          className={cn(
            "flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border",
            collapsible && "cursor-pointer hover:bg-secondary/70"
          )}
          onClick={collapsible ? () => setExpanded(!expanded) : undefined}
        >
          <div className="flex items-center gap-2">
            {collapsible && (
              <ChevronDown className={cn(
                "w-4 h-4 text-muted-foreground transition-transform duration-200",
                !expanded && "-rotate-90"
              )} />
            )}
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--terminal-yellow))]/60" />
              <div className="w-3 h-3 rounded-full bg-accent/60" />
            </div>
            {filename && (
              <span className="text-xs text-muted-foreground font-mono ml-3">
                {filename}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase">{language}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-primary/10"
              onClick={(e) => { e.stopPropagation(); handleCopy(); }}
            >
              {copied ? (
                <Check className="w-3 h-3 text-accent" />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-primary/10"
              onClick={(e) => { e.stopPropagation(); setFullscreen(true); }}
            >
              <Maximize2 className="w-3 h-3 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Code content */}
        <div className={cn(
          "overflow-hidden transition-all duration-300",
          expanded ? "max-h-none" : "max-h-0"
        )}>
          <pre 
            className="p-4 overflow-x-auto overflow-y-auto"
            style={{ maxHeight: maxHeight }}
          >
            <code className="font-mono text-sm text-foreground leading-relaxed whitespace-pre">
              {code}
            </code>
          </pre>
        </div>
      </div>
    </>
  );
};

export default CodeBlock;
