import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Code, Loader2 } from "lucide-react";

export default function ReadMeContent() {
  const [readmeContent, setReadmeContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReadme = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://raw.githubusercontent.com/harjotsk03/anchorfunds/main/README.md"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch README");
        }

        const text = await response.text();
        setReadmeContent(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchReadme();
  }, []);

  const formatMarkdown = (markdown: string) => {
    let html = markdown;

    // Headers
    html = html.replace(
      /^### (.*$)/gim,
      '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>'
    );
    html = html.replace(
      /^## (.*$)/gim,
      '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>'
    );
    html = html.replace(
      /^# (.*$)/gim,
      '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>'
    );

    // Bold
    html = html.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold">$1</strong>'
    );

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Code blocks
    html = html.replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      '<pre class="bg-secondary p-3 rounded-lg my-3 overflow-x-auto"><code class="text-sm">$2</code></pre>'
    );

    // Inline code
    html = html.replace(
      /`([^`]+)`/g,
      '<code class="bg-secondary px-1.5 py-0.5 rounded text-sm font-mono">$1</code>'
    );

    // Links
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Unordered lists
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-4 mb-1">$1</li>');

    // Line breaks
    html = html.replace(/\n\n/g, "<br/><br/>");
    html = html.replace(/\n/g, "<br/>");

    return html;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">
            Error Loading README
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <CardTitle className="py-0 mb-1.5">README.md</CardTitle>
      <CardDescription>
        Project documentation and setup instructions
      </CardDescription>

      <Tabs defaultValue="formatted" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="formatted">
            <FileText className="w-4 h-4 mr-2" />
            Formatted
          </TabsTrigger>
          <TabsTrigger value="raw">
            <Code className="w-4 h-4 mr-2" />
            Raw Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="formatted" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: formatMarkdown(readmeContent),
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raw" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <pre className="bg-secondary p-4 rounded-lg overflow-x-auto max-w-full">
                <code className="text-sm font-mono whitespace-pre-wrap break-words block">
                  {readmeContent}
                </code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
