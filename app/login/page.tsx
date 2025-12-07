"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Github } from "lucide-react";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [gitHubLoading, setGitHubLoading] = useState(false);
  const [lastLoginUsed, setLastLoginUsed] = useState<string | null>(null);

  useEffect(() => {
    setLastLoginUsed(localStorage.getItem("lastLoginUsed"));
  }, []);

  const handleGitHubLogin = async () => {
    setGitHubLoading(true);
    localStorage.setItem("lastLoginUsed", "github");

    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        scopes: "repo read:user user:email",
      },
    });
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-base font-semibold text-white">
            Syntax<span className="text-chart-2">Note</span>
          </h1>
          <h2 className="text-3xl font-bold text-white">Welcome back</h2>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <div className="relative">
            {lastLoginUsed === "github" && (
              <span className="absolute -top-6 right-4 bg-green-900 text-chart-2 z-50 text-xs px-2.5 py-1 rounded-t-sm">
                Last used
              </span>
            )}

            <Button
              onClick={handleGitHubLogin}
              variant={gitHubLoading ? "secondary" : "outline"}
              disabled={gitHubLoading}
              className="w-full relative hover:cursor-pointer"
            >
              {gitHubLoading && <Spinner />}
              Sign in with GitHub
              <svg
                className="w-5 h-5 mr-1"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white text-sm">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=""
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-white text-sm">
                Password
              </Label>
              <a href="#" className="text-sm text-zinc-400 hover:text-zinc-300">
                Forgot your password?
              </a>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-400"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full hover:cursor-pointer">
            Sign in
          </Button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center">
          <span className="text-zinc-400 text-sm">
            Don't have an account?{" "}
            <a href="/signup" className="text-white hover:underline">
              Sign up
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
