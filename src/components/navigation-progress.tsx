'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useNavigation } from './navigation-context';
import { Progress } from './ui/progress';

/**
 * A navigation progress indicator that shows loading state
 * when navigating between pages. Makes RSC loading feel more SPA-like.
 */
export function NavigationProgress() {
  const { isNavigating } = useNavigation();
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [fastProgress, setFastProgress] = useState(false);

  // Start progress animation when navigation begins
  useEffect(() => {
    let timer: NodeJS.Timeout;

    // If navigation starts, show progress and animate it
    if (isNavigating) {
      setVisible(true);
      setProgress(0);

      // Quickly move to 30% to make it feel responsive
      timer = setTimeout(() => {
        setProgress(30);

        // Then more slowly to 70%
        timer = setTimeout(() => {
          setProgress(70);

          // If it's taking too long, go to 90%
          timer = setTimeout(() => {
            setProgress(90);
          }, 1000);
        }, 500);
      }, 100);

      return () => {
        if (timer) clearTimeout(timer);
      };
    } else {
      // Navigation completed, finish the progress bar
      if (visible) {
        setProgress(100);
        setFastProgress(true);

        // Hide the progress bar after animation completes
        timer = setTimeout(() => {
          setVisible(false);
          setFastProgress(false);
        }, 200);

        return () => {
          if (timer) clearTimeout(timer);
        };
      }
    }
  }, [isNavigating, visible]);

  // Reset progress when pathname changes
  useEffect(() => {
    // When pathname changes, navigation is complete
    if (isNavigating) {
      // Complete progress bar
      setProgress(100);
      setFastProgress(true);

      const timer = setTimeout(() => {
        setVisible(false);
        setFastProgress(false);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [pathname, isNavigating]);

  // Don't render anything if not navigating and not visible
  if (!visible) {
    return null;
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${visible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
      <Progress
        value={progress}
        className={`h-1 rounded-none ${fastProgress ? 'transition-all duration-150' : 'transition-all duration-300'}`}
      />
    </div>
  );
}
