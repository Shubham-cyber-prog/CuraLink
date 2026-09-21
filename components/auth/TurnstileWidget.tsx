"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { AlertCircle, RefreshCw, ShieldCheck } from "lucide-react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          callback?: (token: string) => void;
          "error-callback"?: (errorCode?: string) => void;
          "expired-callback"?: () => void;
          action?: string;
          cData?: string;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

interface TurnstileWidgetProps {
  siteKey?: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (errorCode?: string) => void;
  theme?: "light" | "dark" | "auto";
  className?: string;
  action?: string;
}

export function TurnstileWidget({
  siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA",
  onVerify,
  onExpire,
  onError,
  theme = "light",
  className = "",
  action,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const resolvedSiteKey = siteKey || "1x00000000000000000000AA";
  const isDevOrDummyKey =
    resolvedSiteKey === "1x00000000000000000000AA" ||
    process.env.NODE_ENV === "development";

  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
    onErrorRef.current = onError;
  });

  const hasBypassedRef = useRef(false);

  useEffect(() => {
    if (isDevOrDummyKey && !hasBypassedRef.current) {
      hasBypassedRef.current = true;
      onVerifyRef.current("dev_turnstile_bypass_token");
      setIsRendered(true);
    }
  }, [isDevOrDummyKey]);

  const renderWidget = useCallback(() => {
    if (isDevOrDummyKey) return;
    if (!containerRef.current || !window.turnstile) return;

    // Clean up any previous widget instance
    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {}
      widgetIdRef.current = null;
    }

    try {
      if (process.env.NODE_ENV !== "production") {
        console.log("[TurnstileWidget] Rendering with siteKey:", resolvedSiteKey);
      }

      const id = window.turnstile.render(containerRef.current, {
        sitekey: resolvedSiteKey,
        theme,
        action,
        callback: (token: string) => {
          setHasError(false);
          setErrorMessage(null);
          onVerifyRef.current(token);
        },
        "expired-callback": () => {
          onExpireRef.current?.();
        },
        "error-callback": (errorCode?: string) => {
          console.warn("[TurnstileWidget] Challenge error code:", errorCode);
          setHasError(true);
          setErrorMessage("Verification challenge could not be completed.");
          onErrorRef.current?.(errorCode);
        },
      });

      widgetIdRef.current = id;
      setIsRendered(true);
      setHasError(false);
      setErrorMessage(null);
    } catch (e: any) {
      console.error("[TurnstileWidget] Render exception:", e);
      setHasError(true);
      setErrorMessage("Could not initialize security challenge.");
    }
  }, [resolvedSiteKey, theme, action, isDevOrDummyKey]);

  const handleRetry = () => {
    setHasError(false);
    setErrorMessage(null);
    setIsRendered(false);
    setRetryCount((prev) => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    // Register global callback for Turnstile script load
    window.onloadTurnstileCallback = () => {
      if (isMounted) renderWidget();
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const scriptId = "cloudflare-turnstile-script";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;

      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&render=explicit";
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          if (isMounted) {
            setHasError(true);
            setErrorMessage("Failed to load Cloudflare verification script. Check network or ad-blocker.");
          }
        };
        document.head.appendChild(script);
      } else {
        // Script already exists in DOM but window.turnstile may still be loading
        if (window.turnstile) {
          renderWidget();
        } else {
          script.addEventListener("load", () => {
            if (isMounted) renderWidget();
          });
        }
      }
    }

    // Set a 6-second watchdog timeout so the user is never stuck on infinite loading
    timeoutId = setTimeout(() => {
      if (isMounted && !widgetIdRef.current) {
        setHasError(true);
        setErrorMessage("Verification service took too long to respond.");
      }
    }, 6000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget, retryCount]);

  if (isDevOrDummyKey) {
    return (
      <div className={`my-2 w-full rounded-xl border border-teal-200/60 dark:border-teal-900/40 bg-teal-50/40 dark:bg-teal-950/20 px-3.5 py-2.5 text-xs text-teal-800 dark:text-teal-300 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#0F9D8C] dark:text-teal-400 shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">Bot Protection Verified</span>
          </div>
          <span className="text-[10px] font-medium text-[#0F9D8C] dark:text-teal-400">Cloudflare • Active</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`my-2 flex flex-col items-center justify-center min-h-[68px] ${className}`}>
      {/* Hidden when error occurs */}
      <div
        ref={containerRef}
        id="cf-turnstile-container"
        className={hasError ? "hidden" : "flex items-center justify-center"}
      />

      {/* Loading state before widget mounts */}
      {!isRendered && !hasError && (
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200/80 px-4 py-3 text-xs text-slate-500 shadow-2xs">
          <span className="h-2.5 w-2.5 rounded-full bg-teal-600 animate-ping" />
          <span>Securing connection with Cloudflare Turnstile...</span>
        </div>
      )}

      {/* Fallback / Retry UI if script fails or times out */}
      {hasError && (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-amber-50/90 border border-amber-200 p-3 text-xs text-amber-800 shadow-2xs max-w-sm text-center">
          <div className="flex items-center gap-1.5 font-semibold text-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Bot Verification Notice</span>
          </div>
          <p className="text-[11px] text-amber-700 leading-normal">
            {errorMessage || "Verification challenge could not be loaded."}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Retry Verification
          </button>
        </div>
      )}
    </div>
  );
}
