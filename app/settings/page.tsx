"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { LoaderCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import { toast } from "sonner";

interface ApiKeys {
  openai?: string;
  google?: string;
  groq?: string;
  perplexity?: string;
  openrouter?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Settings() {
  const { data: session, isPending } = useSession();
  const [apiKeysForm, setApiKeysForm] = useState<ApiKeys>({});
  const [isSaving, setIsSaving] = useState(false);

  const {
    data: fetchedApiKeys,
    isLoading,
    mutate,
  } = useSWR<ApiKeys>(session ? "/api/settings/keys" : null, fetcher);

  useEffect(() => {
    if (fetchedApiKeys) {
      setApiKeysForm(fetchedApiKeys);
    }
  }, [fetchedApiKeys]);

  const handleInputChange = useCallback(
    (service: keyof ApiKeys, value: string) => {
      setApiKeysForm((prev) => ({
        ...prev,
        [service]: value,
      }));
    },
    [],
  );

  const handleSaveApiKeys = useCallback(async () => {
    if (!session) {
      toast.error("You must be signed in to save API keys.");
      return;
    }
    setIsSaving(true);
    try {
      const changesToSave: Record<string, string> = {};

      for (const service of Object.keys(apiKeysForm) as Array<keyof ApiKeys>) {
        const currentKey = apiKeysForm[service];
        const initialKey = fetchedApiKeys?.[service];

        if (currentKey !== undefined && currentKey !== initialKey) {
          changesToSave[service] = currentKey;
        }
      }

      if (Object.keys(changesToSave).length === 0) {
        toast.info("No changes to save.");
        setIsSaving(false);
        return;
      }

      const savePromises = Object.entries(changesToSave).map(
        async ([service, key]) => {
          const res = await fetch("/api/settings/keys", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ service, key }),
          });
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(
              errorData.message || `Failed to save ${service} key.`,
            );
          }
        },
      );

      await Promise.all(savePromises);

      mutate(apiKeysForm, false);
      toast.success("API keys saved successfully!");
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("Error saving API keys:", err);
      toast.error("Failed to save API keys", { description: errMsg });
    } finally {
      setIsSaving(false);
    }
  }, [session, apiKeysForm, fetchedApiKeys, mutate]);

  if (isPending || isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <LoaderCircle className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold">Access Denied</h1>
          <p className="text-sm text-muted-foreground">
            Please sign in to access settings.
          </p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
  };

  const services: (keyof ApiKeys)[] = [
    "openai",
    "google",
    "groq",
    "perplexity",
    "openrouter",
  ];

  return (
    <div className="max-w-xl mx-auto w-full px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account and preferences.
          </p>
        </div>

        {/* Profile Section */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={session.user?.image || undefined}
                  alt={session.user?.name || "User"}
                />
                <AvatarFallback>
                  {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium">{session.user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {session.user?.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Keys Section */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">API Keys</CardTitle>
            <CardDescription className="text-xs">
              Your keys for AI providers. Stored securely.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {services.map((service) => (
              <div key={service} className="space-y-1">
                <Label
                  htmlFor={`${service}-key`}
                  className="text-xs font-medium capitalize">
                  {service}
                </Label>
                <Input
                  id={`${service}-key`}
                  type="password"
                  value={apiKeysForm[service] || ""}
                  onChange={(e) => handleInputChange(service, e.target.value)}
                  placeholder={`sk-...`}
                  className="h-9 text-sm"
                />
              </div>
            ))}
            <Button
              onClick={handleSaveApiKeys}
              disabled={isSaving || !session || isLoading}
              size="sm"
              className="mt-2">
              {isSaving ? "Saving..." : "Save Keys"}
            </Button>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-xs text-muted-foreground">
                  Switch between light and dark mode
                </p>
              </div>
              <ModeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleSignOut}>
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
