"use client";

import { useEffect, useRef, useState } from "react";
import { RepoHeader } from "@/components/repo-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Stars,
  Code,
  UsersRound,
  GitBranchPlus,
  Bot,
  Send,
  Sparkles,
  Loader2,
  User,
  PencilRuler,
} from "lucide-react";
import OverviewContent from "@/components/overview-content";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ReadMeContent from "@/components/readme-content";

type RepoPageClientProps = {
  repo: any;
  contents: any;
  commits: any;
  stats: {
    totalFiles: number;
    directories: number;
    linesOfCode: number;
    contributors: number;
    weeklyCommits: number;
    commitPercentageChange: number;
  };
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function RepoPageClient({
  repo,
  contents,
  commits,
  stats,
}: RepoPageClientProps) {
  const [chatBotModalOpen, setChatBotModalOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hi! I'm your AI assistant for the ${repo.name} repository. I can help you understand the codebase, explain features, and answer questions about how things work. What would you like to know?`,
      timestamp: new Date(),
    },
  ]);

  const suggestedQuestions = [
    "How do I set up authentication?",
    "What's the project structure?",
    "How do I add a new API route?",
    "How does the payment flow work?",
  ];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (content: string = input) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const responses: Record<string, string> = {
      "How do I set up authentication?": `To set up authentication in this project:

1. **Configure NextAuth.js** in \`app/api/auth/[...nextauth]/route.ts\`
2. **Add providers** like Google, GitHub, or email/password
3. **Set environment variables** in \`.env.local\`:
   - \`NEXTAUTH_SECRET\`
   - Provider-specific keys

The auth middleware is already configured to protect routes under \`/dashboard\`.`,
      "What's the project structure?": `The project follows a modular structure:

- \`app/\` - Next.js App Router pages
- \`components/\` - Reusable React components  
- \`lib/\` - Utilities and configurations
- \`prisma/\` - Database schema
- \`types/\` - TypeScript definitions

Key files:
- \`middleware.ts\` - Route protection
- \`prisma/schema.prisma\` - Database models`,
      default: `That's a great question about the repository! Based on my analysis of the codebase, I can help you understand how this works. The project uses modern best practices with Next.js 14 and TypeScript. Would you like me to dive deeper into any specific area?`,
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: responses[content] || responses.default,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  return (
    <div className="fade-up">
      <Sheet open={chatBotModalOpen} onOpenChange={setChatBotModalOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg p-0 flex flex-col"
        >
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex flex-row gap-4 items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-chart-2/10">
                <Bot className="text-chart-2" size={18} />
              </div>
              <div className="flex flex-col gap-0.5">
                <SheetTitle>Repo Assistant</SheetTitle>
                <SheetDescription>
                  Ask anything about {repo.name}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Messages area with manual overflow */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback
                      className={
                        message.role === "assistant"
                          ? "bg-chart-2/10 text-chart-2"
                          : "bg-secondary"
                      }
                    >
                      {message.role === "assistant" ? (
                        <Sparkles className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/50"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-chart-2/10 text-primary">
                      <Sparkles className="w-4 h-4 text-chart-2" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-secondary/50 rounded-2xl px-4 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}

              {/* Invisible div to scroll to */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {messages.length === 1 && (
            <div className="px-6 py-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2">
                Suggested questions:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question) => (
                  <Button
                    key={question}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-1.5 px-2.5"
                    onClick={() => handleSend(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="px-6 py-4 border-t">
            <div className="flex gap-3 items-center">
              <Input
                className="h-10 flex-1"
                placeholder="Type your message…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                onClick={() => handleSend()}
                disabled={!input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* RED CHAT BOT BUTTON */}
      <Button
        size="lg"
        onClick={() => setChatBotModalOpen(true)}
        className="fixed bottom-3 right-3 z-50 hover:cursor-pointer"
      >
        <Bot />
        <p>Repo Chat Bot</p>
      </Button>
      <div className="h-screen bg-background flex flex-col">
        <RepoHeader repo={repo} />

        <div className="w-full px-4 py-4 overflow-y-scroll grid grid-cols-4 gap-4">
          <Card className="col-span-3">
            <CardHeader>
              <div className="flex flex-row justify-between">
                <div className="flex flex-row gap-4 items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-chart-2/10">
                    <Stars className="text-chart-2" size={18} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <CardTitle>AI-Generated Documentation</CardTitle>
                    <CardDescription>
                      Auto-generated docs based on your repository
                    </CardDescription>
                  </div>
                </div>
                <Button className="w-max">
                  <PencilRuler />
                  Generate Docs
                </Button>
              </div>
            </CardHeader>
            <CardContent className="">
              <ScrollArea className="h-[80vh]">
                <Tabs
                  suppressHydrationWarning
                  defaultValue="overview"
                  className="w-full"
                >
                  <TabsList
                    suppressHydrationWarning
                    className="grid w-full grid-cols-5"
                  >
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="gettingStarted">
                      Getting Started
                    </TabsTrigger>
                    <TabsTrigger value="architecture">Architecture</TabsTrigger>
                    <TabsTrigger value="readME">ReadME</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 mt-2">
                    <OverviewContent />
                  </TabsContent>

                  <TabsContent value="readME" className="space-y-4 mt-2">
                    <ReadMeContent />
                  </TabsContent>
                </Tabs>
              </ScrollArea>
            </CardContent>
          </Card>
          <div className="col-span-1 flex gap-4 flex-col">
            <Card className="gap-4 h-max">
              <div className="flex flex-row justify-between px-6">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Files
                </p>
                <FileText className="text-chart-2" size={16} />
              </div>
              <div className="flex flex-col gap-0.5 px-6">
                <p className="font-semibold text-xl">{stats.totalFiles}</p>
                <p className="text-xs font-regular text-muted-foreground">
                  Across {stats.directories} directories
                </p>
              </div>
            </Card>
            <Card className="gap-4 h-max">
              <div className="flex flex-row justify-between px-6">
                <p className="text-sm font-medium text-muted-foreground">
                  Lines of Code
                </p>
                <Code className="text-chart-2" size={16} />
              </div>
              <div className="flex flex-col gap-0.5 px-6">
                <p className="font-semibold text-xl">{stats.linesOfCode}k</p>
                <p className="text-xs font-regular text-muted-foreground">
                  Across all files
                </p>
              </div>
            </Card>

            <Card className="gap-4 h-max">
              <div className="flex flex-row justify-between px-6">
                <p className="text-sm font-medium text-muted-foreground">
                  Contributors
                </p>
                <UsersRound className="text-chart-2" size={16} />
              </div>
              <div className="flex flex-col gap-0.5 px-6">
                <p className="font-semibold text-xl">{stats.contributors}</p>
                <p className="text-xs font-regular text-muted-foreground">
                  Total contributors
                </p>
              </div>
            </Card>
            <Card className="gap-4 h-max">
              <div className="flex flex-row justify-between px-6">
                <p className="text-sm font-medium text-muted-foreground">
                  Weekly Commits
                </p>
                <GitBranchPlus className="text-chart-2" size={16} />
              </div>
              <div className="flex flex-col gap-0.5 px-6">
                <p className="font-semibold text-xl">{stats.weeklyCommits}</p>
                <p className="text-xs font-regular text-muted-foreground">
                  {stats.commitPercentageChange > 0 ? "+" : ""}
                  {stats.commitPercentageChange}% from last week
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
