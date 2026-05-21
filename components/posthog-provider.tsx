'use client';

import { PostHogProvider } from '@saas-maker/posthog-client';
import { useEffect } from 'react';

import { trackReturned, trackSignup } from '@/lib/analytics';
import { installBrowserMonitoring } from '@/lib/foundry-monitoring';

const SEEN_KEY = 'open-historia:seen';

/**
 * Fires the session-level analytics events from the fixed 4-event taxonomy.
 * Open Historia is guest-first (auth is optional), so `signup` means "first
 * ever visit on this browser" and `returned` means a subsequent session.
 */
function useSessionAnalytics() {
  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(SEEN_KEY);
      if (seen) {
        trackReturned();
      } else {
        window.localStorage.setItem(SEEN_KEY, '1');
        trackSignup();
      }
    } catch {
      // localStorage unavailable — skip session attribution silently.
    }
  }, []);
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    return installBrowserMonitoring();
  }, []);

  useSessionAnalytics();

  return <PostHogProvider>{children}</PostHogProvider>;
}
