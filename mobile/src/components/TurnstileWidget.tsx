import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

interface TurnstileWidgetProps {
  siteKey?: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (errorCode?: string) => void;
  theme?: 'light' | 'dark' | 'auto';
  action?: string;
}

export function TurnstileWidget({
  siteKey = process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA',
  onVerify,
  onExpire,
  onError,
  theme = 'light',
}: TurnstileWidgetProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<any>(null);

  // Web Implementation for Expo Web
  if (Platform.OS === 'web') {
    useEffect(() => {
      let isMounted = true;
      const renderWebTurnstile = () => {
        const win = window as any;
        if (!win.turnstile || !containerRef.current) return;

        try {
          win.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme,
            callback: (token: string) => {
              if (isMounted) onVerify(token);
            },
            'expired-callback': () => {
              if (isMounted) onExpire?.();
            },
            'error-callback': (code?: string) => {
              if (isMounted) onError?.(code);
            },
          });
          if (isMounted) setIsLoaded(true);
        } catch (e) {
          console.error('[Turnstile Mobile Web] render error:', e);
        }
      };

      const win = window as any;
      if (win.turnstile) {
        renderWebTurnstile();
      } else {
        const scriptId = 'cf-turnstile-mobile-script';
        if (!document.getElementById(scriptId)) {
          const s = document.createElement('script');
          s.id = scriptId;
          s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
          s.async = true;
          s.defer = true;
          s.onload = () => {
            if (isMounted) renderWebTurnstile();
          };
          document.head.appendChild(s);
        } else {
          document.getElementById(scriptId)?.addEventListener('load', () => {
            if (isMounted) renderWebTurnstile();
          });
        }
      }

      return () => {
        isMounted = false;
      };
    }, [siteKey, theme, onVerify, onExpire, onError]);

    return (
      <View style={styles.webContainer}>
        {/* @ts-ignore */}
        <div ref={containerRef} id="mobile-web-turnstile" />
      </View>
    );
  }

  // Native Implementation via WebView
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: transparent;
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
        </style>
      </head>
      <body>
        <div id="turnstile-box"></div>
        <script>
          function initTurnstile() {
            if (!window.turnstile) {
              setTimeout(initTurnstile, 80);
              return;
            }
            try {
              window.turnstile.render('#turnstile-box', {
                sitekey: '${siteKey}',
                theme: '${theme}',
                callback: function(token) {
                  if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'verify', token: token }));
                  }
                },
                'expired-callback': function() {
                  if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'expire' }));
                  }
                },
                'error-callback': function(err) {
                  if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', code: err }));
                  }
                }
              });
            } catch(e) {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', code: e.message }));
              }
            }
          }
          initTurnstile();
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'verify' && data.token) {
        setIsLoaded(true);
        onVerify(data.token);
      } else if (data.type === 'expire') {
        onExpire?.();
      } else if (data.type === 'error') {
        onError?.(data.code);
      }
    } catch (err) {
      console.warn('Turnstile WebView message parse error:', err);
    }
  };

  return (
    <View style={styles.nativeContainer}>
      <View style={styles.webviewWrapper}>
        <WebView
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          onMessage={handleMessage}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          transparent={true}
        />
      </View>
      {!isLoaded && (
        <View style={styles.statusRow}>
          <ActivityIndicator size="small" color="#0F9D8C" />
          <Text style={styles.statusText}>Cloudflare Turnstile Verification</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    marginVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 65,
  },
  nativeContainer: {
    marginVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  webviewWrapper: {
    width: 300,
    height: 68,
    borderRadius: 8,
    overflow: 'hidden',
  },
  webview: {
    width: 300,
    height: 68,
    backgroundColor: 'transparent',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  statusText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
});
