"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

// Types for cookie preferences
interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface CookieConsentProps {
  privacyPolicyUrl?: string;
}

export function CookieConsent({ privacyPolicyUrl = '/privacy' }: CookieConsentProps) {
  const [open, setOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    functional: true,
    analytics: true,
    marketing: false,
  });

  // Check for existing cookie consent on mount
  useEffect(() => {
    const consentCookie = getCookie('cookie_consent');
    if (!consentCookie) {
      setTimeout(() => {
        setShowBanner(true);
      }, 1000); // Delay showing the banner by 1 second
    }
  }, []);

  // Handle accepting all cookies
  const acceptAll = () => {
    setPreferences({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    });

    saveConsent({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    });

    setShowBanner(false);
  };

  // Handle accepting only necessary cookies
  const acceptNecessary = () => {
    setPreferences({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    });

    saveConsent({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    });

    setShowBanner(false);
  };

  // Handle customizing cookie preferences
  const customizePreferences = () => {
    setOpen(true);
  };

  // Handle saving preferences from the customization dialog
  const savePreferences = () => {
    saveConsent(preferences);
    setOpen(false);
    setShowBanner(false);
  };

  // Handle changing individual preferences
  const handlePreferenceChange = (name: keyof CookiePreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save consent to cookie
  const saveConsent = (prefs: CookiePreferences) => {
    const consentValue = JSON.stringify(prefs);
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 6); // Consent valid for 6 months

    document.cookie = `cookie_consent=${consentValue}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;

    // In a real application, you would now apply the actual consent preferences
    // For example, if analytics is true, initialize analytics scripts
    // This is a simplified example
    if (prefs.analytics) {
      console.log('Analytics cookies enabled - would initialize analytics');
    }

    if (prefs.marketing) {
      console.log('Marketing cookies enabled - would initialize marketing tools');
    }
  };

  // Helper to get a cookie value
  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;

    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${name}=`));

    return cookieValue ? cookieValue.split('=')[1] : null;
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 p-4 z-50 animate-in slide-in-from-bottom">
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle>Cookie Consent</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => setShowBanner(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic.
              By clicking "Accept All", you consent to our use of cookies.
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-wrap justify-end gap-2 pt-0">
            <Button
              variant="link"
              size="sm"
              asChild
            >
              <Link href={privacyPolicyUrl}>Privacy Policy</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={customizePreferences}
            >
              Customize
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={acceptNecessary}
            >
              Necessary Only
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={acceptAll}
            >
              Accept All
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader className="mb-4">
            <SheetTitle>Cookie Preferences</SheetTitle>
            <SheetDescription>
              Customize your cookie preferences. Necessary cookies are always enabled as they are essential for the website to function properly.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-start space-x-3 space-y-0">
              <Checkbox
                id="necessary"
                checked={preferences.necessary}
                disabled // Always required
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="necessary" className="font-medium">
                  Necessary Cookies
                </Label>
                <p className="text-sm text-muted-foreground">
                  These cookies are essential for the website to function properly.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 space-y-0">
              <Checkbox
                id="functional"
                checked={preferences.functional}
                onCheckedChange={(checked) =>
                  handlePreferenceChange('functional', checked === true)
                }
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="functional" className="font-medium">
                  Functional Cookies
                </Label>
                <p className="text-sm text-muted-foreground">
                  These cookies enable personalized features and functionality.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 space-y-0">
              <Checkbox
                id="analytics"
                checked={preferences.analytics}
                onCheckedChange={(checked) =>
                  handlePreferenceChange('analytics', checked === true)
                }
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="analytics" className="font-medium">
                  Analytics Cookies
                </Label>
                <p className="text-sm text-muted-foreground">
                  These cookies help us understand how visitors interact with the website.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 space-y-0">
              <Checkbox
                id="marketing"
                checked={preferences.marketing}
                onCheckedChange={(checked) =>
                  handlePreferenceChange('marketing', checked === true)
                }
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="marketing" className="font-medium">
                  Marketing Cookies
                </Label>
                <p className="text-sm text-muted-foreground">
                  These cookies are used to track visitors across websites to display relevant advertisements.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePreferences}>
              Save Preferences
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
