"use client";

import { useState,useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, ExternalLink, Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface FileViewerProps {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  isOpen: boolean;
  onClose: () => void;
}

export function FileViewer({
  fileName,
  fileUrl,
  fileSize,
  isOpen,
  onClose,
}: FileViewerProps) {
  const [fileContent, setFileContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const getFileLanguage = (name: string): string => {
    const ext = name.split(".").pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      js: "javascript",
      jsx: "jsx",
      ts: "typescript",
      tsx: "tsx",
      py: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      cs: "csharp",
      go: "go",
      rs: "rust",
      rb: "ruby",
      php: "php",
      html: "html",
      css: "css",
      scss: "scss",
      json: "json",
      xml: "xml",
      yml: "yaml",
      yaml: "yaml",
      md: "markdown",
      sql: "sql",
      sh: "bash",
      bash: "bash",
    };
    return langMap[ext || ""] || "text";
  };

  const fetchFileContent = async () => {
    if (fileContent) return; // Already fetched

    setIsLoading(true);
    try {
      const response = await fetch(fileUrl);
      const text = await response.text();
      setFileContent(text);
    } catch (error) {
      console.error("Error fetching file:", error);
      setFileContent("Error loading file content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([fileContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Fetch content when dialog opens
  if (isOpen && !fileContent && !isLoading) {
    fetchFileContent();
  }

  useEffect(() => {
    if (isOpen) {
      setFileContent("");
      fetchFileContent();
    }
  }, [fileName, fileUrl, isOpen]);


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] p-6 border bg-background rounded-xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate">{fileName}</span>
            <Badge variant="secondary">{formatFileSize(fileSize)}</Badge>
          </DialogTitle>
          <DialogDescription>
            File preview with syntax highlighting
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!fileContent || isLoading}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!fileContent || isLoading}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(fileUrl, "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in GitHub
          </Button>
        </div>

        <ScrollArea className="h-[60vh] w-full overflow-scroll rounded-md border">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading file...</p>
            </div>
          ) : fileContent ? (
            <SyntaxHighlighter
              language={getFileLanguage(fileName)}
              style={vscDarkPlus}
              showLineNumbers
              customStyle={{
                margin: 0,
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
              }}
            >
              {fileContent}
            </SyntaxHighlighter>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No content to display</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
