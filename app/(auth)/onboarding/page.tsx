"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { updateUserPreferences } from "@/app/(app)/actions";
import { toast } from "sonner";
import {
  BookOpen,
  Newspaper,
  Video,
  Podcast,
  Bell,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

const contentCategories = [
  { id: "news", label: "News", icon: Newspaper },
  { id: "articles", label: "Articles", icon: BookOpen },
  { id: "videos", label: "Videos", icon: Video },
  { id: "podcasts", label: "Podcasts", icon: Podcast },
];

const preferredFormats = [
  { id: "short", label: "Short Reads (2-5 min)" },
  { id: "medium", label: "Medium Reads (5-10 min)" },
  { id: "long", label: "Long Reads (10+ min)" },
];

const languages = [
  { id: "en", label: "English" },
  { id: "es", label: "Spanish" },
  { id: "fr", label: "French" },
  { id: "de", label: "German" },
];

const timezones = [
  { id: "UTC", label: "UTC" },
  { id: "EST", label: "Eastern Time" },
  { id: "PST", label: "Pacific Time" },
  { id: "GMT", label: "Greenwich Mean Time" },
];

const notificationPreferences = [
  { id: "daily", label: "Daily Digest" },
  { id: "weekly", label: "Weekly Summary" },
  { id: "new_content", label: "New Content Alerts" },
  { id: "achievements", label: "Achievement Updates" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    categories: [] as string[],
    preferredFormats: [] as string[],
    readingLevel: "medium",
    notificationPreferences: [] as string[],
    dailyDigest: false,
    weeklyDigest: false,
    language: "en",
    timezone: "UTC",
  });

  const handleCategoryToggle = (categoryId: string) => {
    setPreferences((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const handleFormatToggle = (formatId: string) => {
    setPreferences((prev) => ({
      ...prev,
      preferredFormats: prev.preferredFormats.includes(formatId)
        ? prev.preferredFormats.filter((id) => id !== formatId)
        : [...prev.preferredFormats, formatId],
    }));
  };

  const handleNotificationToggle = (notificationId: string) => {
    setPreferences((prev) => ({
      ...prev,
      notificationPreferences: prev.notificationPreferences.includes(notificationId)
        ? prev.notificationPreferences.filter((id) => id !== notificationId)
        : [...prev.notificationPreferences, notificationId],
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await updateUserPreferences(preferences);
      if (response.success) {
        toast.success("Preferences saved successfully!");
        router.push("/");
      }
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {contentCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <div
                    key={category.id}
                    className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
                      preferences.categories.includes(category.id)
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => handleCategoryToggle(category.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="font-medium">{category.label}</span>
                    </div>
                    {preferences.categories.includes(category.id) && (
                      <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-primary" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid gap-4">
              {preferredFormats.map((format) => (
                <div
                  key={format.id}
                  className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
                    preferences.preferredFormats.includes(format.id)
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => handleFormatToggle(format.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{format.label}</span>
                    {preferences.preferredFormats.includes(format.id) && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Preferred Language</Label>
                <select
                  className="w-full rounded-md border p-2"
                  value={preferences.language}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, language: e.target.value }))
                  }
                >
                  {languages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <select
                  className="w-full rounded-md border p-2"
                  value={preferences.timezone}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, timezone: e.target.value }))
                  }
                >
                  {timezones.map((tz) => (
                    <option key={tz.id} value={tz.id}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid gap-4">
              {notificationPreferences.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
                    preferences.notificationPreferences.includes(notification.id)
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => handleNotificationToggle(notification.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-primary" />
                      <span className="font-medium">{notification.label}</span>
                    </div>
                    {preferences.notificationPreferences.includes(notification.id) && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-[600px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {step === 1 && "What content interests you?"}
            {step === 2 && "How do you prefer to consume content?"}
            {step === 3 && "Language & Timezone"}
            {step === 4 && "Notification Preferences"}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 1 && "Select the types of content you'd like to see"}
            {step === 2 && "Choose your preferred content formats"}
            {step === 3 && "Set your language and timezone preferences"}
            {step === 4 && "Choose how you want to stay updated"}
          </CardDescription>
        </CardHeader>
        <CardContent>{renderStep()}</CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep((prev) => prev - 1)}
              disabled={isLoading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              className="ml-auto"
              onClick={() => setStep((prev) => prev + 1)}
              disabled={isLoading}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              className="ml-auto"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Complete Setup"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 