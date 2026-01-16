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
import { ModeToggle } from "@/components/theme_toggle";
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
  // Add other services here as needed
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Settings() {
  const { data: session, isPending } = useSession();
  const [apiKeysForm, setApiKeysForm] = useState<ApiKeys>({});
  const [isSaving, setIsSaving] = useState(false);

  const { data: fetchedApiKeys, error, isLoading, mutate } = useSWR<ApiKeys>(
    session ? "/api/settings/keys" : null,
    fetcher
  );

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
    []
  );

  const handleSaveApiKeys = useCallback(async () => {
    if (!session) {
      toast.error("You must be signed in to save API keys.");
      return;
    }
    setIsSaving(true);
    try {
      // Create a temporary object to hold changes
      const changesToSave: Record<string, string> = {};

      for (const service of Object.keys(apiKeysForm) as Array<keyof ApiKeys>) {
        const currentKey = apiKeysForm[service];
        const initialKey = fetchedApiKeys?.[service];
        
        // Only save if the key has changed or is new (not empty and different from initial)
        if (currentKey !== undefined && currentKey !== initialKey) {
          changesToSave[service] = currentKey;
        }
      }

      if (Object.keys(changesToSave).length === 0) {
        toast.info("No changes to save.");
        setIsSaving(false);
        return;
      }

      const savePromises = Object.entries(changesToSave).map(async ([service, key]) => {
          const res = await fetch("/api/settings/keys", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ service, key }),
          });
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(
              errorData.message || `Failed to save ${service} key.`
            );
          }
      });
      
      await Promise.all(savePromises);

      mutate(apiKeysForm, false); // Optimistically update SWR cache
      toast.success("API keys saved successfully!");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("Error saving API keys:", err);
      toast.error("Failed to save API keys", { description: errMsg });
    } finally {
      setIsSaving(false);
    }
  }, [session, apiKeysForm, fetchedApiKeys, mutate]);

  if (isPending || isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <LoaderCircle className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">
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
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage
                  src={session.user?.image || undefined}
                  alt={session.user?.name || "User"}
                />
                <AvatarFallback>
                  {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{session.user?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {session.user?.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Keys Section */}
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Manage your personal API keys for various AI services.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {services.map((service) => (
              <div key={service}>
                <Label htmlFor={`${service}-key`} className="capitalize">
                  {service} API Key
                </Label>
                <Input
                  id={`${service}-key`}
                  type="password"
                  value={apiKeysForm[service] || ""}
                  onChange={(e) => handleInputChange(service, e.target.value)}
                  placeholder={`Enter your ${service} API Key`}
                  className="mt-1"
                />
              </div>
            ))}
            <Button
              onClick={handleSaveApiKeys}
              disabled={isSaving || !session || isLoading}
            >
              {isSaving ? "Saving..." : "Save API Keys"}
            </Button>
          </CardContent>
        </Card>

        {/* Pro Subscription Section */}
        <Card>
          <CardHeader>
            <CardTitle>Pro Subscription</CardTitle>
            <CardDescription>
              Upgrade to Pro for enhanced features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label>Pro Plan</Label>
                <p className="text-sm text-muted-foreground">
                  $1 for a month (coming soon)
                </p>
              </div>
              <Button disabled>Coming Soon</Button>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how the application looks and feels.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred theme
                </p>
              </div>
              <ModeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Account Section */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleSignOut}>
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
