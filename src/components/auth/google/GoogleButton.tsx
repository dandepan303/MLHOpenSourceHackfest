'use client';

import { useNotification } from '@/components/ui/Notification';
import { config } from '@/lib/config';
import { useEffect, useRef, useState } from 'react';
import { FaGoogle } from 'react-icons/fa';

interface GoogleAccountsConfig {
  client_id: string;
  callback: (response: GoogleAuthResponse) => void;
  auto_select?: boolean;
  itp_support?: boolean;
}

interface GoogleRenderConfig {
  type?: string;
  shape?: string;
  theme?: string;
  text?: string;
  size?: string;
  logo_alignment?: string;
}

interface GoogleAuthResponse {
  credential: string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize?: (config: GoogleAccountsConfig) => void;
          renderButton?: (element: HTMLElement, config: GoogleRenderConfig) => void;
          prompt?: () => void;
        };
      };
    };
    googleAuthCallback?: (response: GoogleAuthResponse) => void;
  }
}

interface CustomGoogleAuthButtonProps {
  handleGoogleAuthCallback: (response: GoogleAuthResponse) => void;
  setStatus: (status: 'page-loading' | 'google-loading' | 'email-loading' | 'null') => void;
  buttonUse: 'signin_with' | 'signup_with' | 'continue_with';
  buttonText: string;
}

export default function CustomGoogleAuthButton({ 
  handleGoogleAuthCallback, 
  setStatus, 
  buttonUse,
  buttonText
}: CustomGoogleAuthButtonProps) {
  const { addNotification, addNotificationStatus } = useNotification();

  const handleGoogleAuthCallbackRef = useRef(handleGoogleAuthCallback);
  const initAttemptedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useCustomButton, setUseCustomButton] = useState(false);

  useEffect(() => {
    handleGoogleAuthCallbackRef.current = handleGoogleAuthCallback;
  }, [handleGoogleAuthCallback]);

  const handleCustomGoogleClick = () => {
    // Check if Google API exists
    if (window.google?.accounts?.id?.prompt) {
      try {
        window.google.accounts.id.prompt();
      } catch {
        addNotification({ message: 'Google authentication is not available', type: 'error'});
  setStatus('null')
      }
    } else {
      console.error('Google Identity Services not available');
setStatus('null')
    }
  };

  useEffect(() => {
    initAttemptedRef.current = false;

    const initializeGoogleAuth = () => {
      if (initAttemptedRef.current) return;

      if (window.google?.accounts?.id) {
        initAttemptedRef.current = true;
        setIsLoading(false);

        try {
          // Set up global callback
          window.googleAuthCallback = (response: GoogleAuthResponse) => {
            handleGoogleAuthCallbackRef.current(response);
          };

          // Initialize Google Auth
          if (typeof window.google.accounts.id.initialize === 'function') {
            window.google.accounts.id.initialize({
              client_id: config.google.client_id,
              callback: window.googleAuthCallback,
              auto_select: false,
              itp_support: true,
            });
          }

          // Try to render the native button first
          setTimeout(() => {
            const nativeContainer = containerRef.current?.querySelector('.google-native-btn') as HTMLElement;
            if (nativeContainer && typeof window?.google?.accounts?.id?.renderButton === 'function') {
              try {
                nativeContainer.innerHTML = '';
                window.google.accounts.id.renderButton(nativeContainer, {
                  type: 'standard',
                  shape: 'pill',
                  theme: 'outline',
                  text: buttonUse,
                  size: 'large',
                  logo_alignment: 'left',
                });
                
                // Apply custom styles to override Google's default styling
                setTimeout(() => {
                  const googleBtn = nativeContainer.querySelector('div[role="button"]') as HTMLElement;
                  if (googleBtn) {
                    googleBtn.style.cssText = `
                      background: #ffffff !important;
                      border: 1px solid #dadce0 !important;
                      border-radius: 8px !important;
                      color: #3c4043 !important;
                      font-weight: 500 !important;
                      font-size: 14px !important;
                      padding: 12px 16px !important;
                      width: 100% !important;
                      max-width: 300px !important;
                      box-sizing: border-box !important;
                      transition: all 0.2s ease !important;
                      font-family: 'Google Sans', Roboto, Arial, sans-serif !important;
                      margin: 0 auto !important;
                      box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1) !important;
                    `;
                    
                    // Add hover effects
                    googleBtn.addEventListener('mouseenter', () => {
                      googleBtn.style.background = '#f8f9fa !important';
                      googleBtn.style.borderColor = '#dadce0 !important';
                      googleBtn.style.boxShadow = '0 2px 6px 0 rgba(0,0,0,0.15) !important';
                    });
                    
                    googleBtn.addEventListener('mouseleave', () => {
                      googleBtn.style.background = '#ffffff !important';
                      googleBtn.style.borderColor = '#dadce0 !important';
                      googleBtn.style.boxShadow = '0 1px 3px 0 rgba(0,0,0,0.1) !important';
                    });

                    // Style the Google logo and text
                    const logo = googleBtn.querySelector('svg, img') as HTMLElement;
                    if (logo) {
                      logo.style.filter = 'none';
                    }
                    
                    const textSpans = googleBtn.querySelectorAll('span');
                    textSpans.forEach(span => {
                      span.style.cssText = `
                        color: #3c4043 !important;
                        font-weight: 500 !important;
                        font-size: 14px !important;
                      `;
                      // Change text content to just "google"
                      if (span.textContent && span.textContent.toLowerCase().includes(buttonText)) {
                        span.textContent = buttonText;
                      }
                    });
                  }
                  
            setStatus('null')
                }, 100);
              } catch {
                console.log('Native Google button failed, using custom button');
                setUseCustomButton(true);
              }
            } else {
              setUseCustomButton(true);
            }
          }, 100);
        } catch {
          console.log('Error initializing Google Auth');
          setUseCustomButton(true);
          addNotification({ message: 'Failed to initialize Google authentication', type: 'error'});
    setStatus('null')
        }
      } else {
        console.log('Google Identity Services not ready, retrying...');
        setTimeout(initializeGoogleAuth, 500);
      }
    };

    const timeoutId = setTimeout(initializeGoogleAuth, 100);

    return () => {
      clearTimeout(timeoutId);
      if (window.googleAuthCallback) {
        delete window.googleAuthCallback;
      }
    };
  }, [buttonUse, setStatus]);

  if (isLoading) {
    return (
      <div className="flex justify-center w-full">
        <div className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg border border-gray-300">
          Loading Google...
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex justify-center w-full">
      {/* Native Google Button Container */}
      {!useCustomButton && (
        <div className="flex justify-center google-native-btn"></div>
      )}
      
      {/* Custom Fallback Button */}
      {useCustomButton && (
        <button
          onClick={handleCustomGoogleClick}
          className="flex gap-3 justify-center items-center px-4 py-3 w-full max-w-xs font-medium text-gray-700 bg-white rounded-lg border border-gray-300 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
        >
          <FaGoogle size={18} className="text-blue-500" />
          <span>Continue with Google</span>
        </button>
      )}
    </div>
  );
}