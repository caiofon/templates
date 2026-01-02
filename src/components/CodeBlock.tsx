import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
}

const CodeBlock = ({ code, language, filename }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-[hsl(var(--code-bg))]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-terminal-yellow/60" />
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
        </div>
      </div>

      {/* Code content */}
      <pre className="p-4 overflow-x-auto">
        <code className="font-mono text-sm text-foreground leading-relaxed whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
