/**
 * @file use-focus-altar.ts
 * @description Decoupled Custom React Hook managing Focus Altar session lifecycle,
 *              timer ticks, Void Mana consumption, and audio/IPC synchronization.
 * 
 * DESIGN FOR COLLABORATOR:
 * - This hook isolates ALL business logic and timer intervals away from the UI.
 * - Any component can simply call `const { session, startSession, ... } = useFocusAltar(...)`
 *   and render its own custom visual controls without touching interval or IPC code.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FocusDuration,
  FocusSessionState,
  FocusCompletionResult,
  RealmType,
} from '@roost/core-gamify';
import {
  startFocusSessionNative,
  tickFocusSessionNative,
  pauseFocusSessionNative,
  resumeFocusSessionNative,
  completeFocusSessionNative,
  abandonFocusSessionNative,
  getActiveFocusSessionNative,
} from '../api/ipc-bridge.ts';
import {
  playMechanicalClick,
  playCelestialChime,
} from '../audio/sound-fx.ts';

export interface UseFocusAltarOptions {
  onSessionCompleted?: (result: FocusCompletionResult) => void;
  onSessionAbandoned?: (session: FocusSessionState) => void;
}

export function useFocusAltar(options: UseFocusAltarOptions = {}) {
  const [session, setSession] = useState<FocusSessionState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check on mount if a session is already active in backend
  useEffect(() => {
    getActiveFocusSessionNative()
      .then((active) => {
        if (active) setSession(active);
      })
      .catch((err) => console.warn('Failed to recover active focus session:', err));
  }, []);

  // Timer Tick Engine: ticks every 1 second when active
  useEffect(() => {
    if (session && session.status === 'active') {
      timerRef.current = setInterval(async () => {
        try {
          const updated = await tickFocusSessionNative(1);
          setSession(updated);

          // Auto-complete when timer hits zero
          if (updated.remainingSeconds <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            const result = await completeFocusSessionNative();
            setSession(null);
            playCelestialChime();
            options.onSessionCompleted?.(result);
          }
        } catch (err: any) {
          console.error('Focus tick failed:', err);
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [session?.status, options]);

  // Start new focus session
  const startSession = useCallback(
    async (
      durationMinutes: FocusDuration,
      realm: RealmType,
      label: string,
      ambientSoundscape?: 'void_drone' | 'celestial_rain' | 'deep_binaural' | 'none'
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        playMechanicalClick();
        const newSession = await startFocusSessionNative(durationMinutes, realm, label, ambientSoundscape);
        setSession(newSession);
        return newSession;
      } catch (err: any) {
        const msg = err?.message || String(err);
        setError(msg);
        console.error('Could not start focus session:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Pause active session
  const pauseSession = useCallback(async () => {
    if (!session || session.status !== 'active') return;
    try {
      playMechanicalClick();
      const updated = await pauseFocusSessionNative();
      setSession(updated);
    } catch (err: any) {
      setError(err?.message || String(err));
    }
  }, [session]);

  // Resume paused session
  const resumeSession = useCallback(async () => {
    if (!session || session.status !== 'paused') return;
    try {
      playMechanicalClick();
      const updated = await resumeFocusSessionNative();
      setSession(updated);
    } catch (err: any) {
      setError(err?.message || String(err));
    }
  }, [session]);

  // Complete manually or when timer finishes
  const completeSession = useCallback(async () => {
    if (!session) return;
    try {
      const result = await completeFocusSessionNative();
      setSession(null);
      playCelestialChime();
      options.onSessionCompleted?.(result);
      return result;
    } catch (err: any) {
      setError(err?.message || String(err));
    }
  }, [session, options]);

  // Abandon session early
  const abandonSession = useCallback(async () => {
    if (!session) return;
    try {
      playMechanicalClick();
      const abandoned = await abandonFocusSessionNative();
      setSession(null);
      options.onSessionAbandoned?.(abandoned);
      return abandoned;
    } catch (err: any) {
      setError(err?.message || String(err));
    }
  }, [session, options]);

  // Helper formatting for UI
  const formatTimeRemaining = (): string => {
    if (!session) return '00:00';
    const minutes = Math.floor(session.remainingSeconds / 60);
    const seconds = session.remainingSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const calculateProgressPercent = (): number => {
    if (!session || session.totalDurationSeconds === 0) return 0;
    return Math.min(100, Math.round((session.elapsedSeconds / session.totalDurationSeconds) * 100));
  };

  return {
    session,
    isFocusing: session?.status === 'active',
    isPaused: session?.status === 'paused',
    timeRemainingFormatted: formatTimeRemaining(),
    progressPercent: calculateProgressPercent(),
    isLoading,
    error,
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    abandonSession,
  };
}
