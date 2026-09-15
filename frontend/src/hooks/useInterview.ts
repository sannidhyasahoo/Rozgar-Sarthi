import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import { useRouter } from 'next/navigation';
import type { CodingFollowUpContext } from '@/lib/codingApi';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export interface CodingFollowUpOptions {
  assessmentId: string;
  context: CodingFollowUpContext;
}

export function useInterview() {
  const router = useRouter();
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [aiStatus, setAiStatus] = useState<'idle' | 'listening' | 'speaking' | 'error'>('idle');
  const [transcript, setTranscript] = useState<{ role: string; text: string }[]>([]);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const activeCallIdRef = useRef<string | null>(null);
  
  const vapiRef = useRef<any>(null);

  useEffect(() => {
    if (!vapiRef.current) {
      const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "";
      if (!publicKey) {
        console.error("[Vapi] NEXT_PUBLIC_VAPI_PUBLIC_KEY is not set!");
        return;
      }
      vapiRef.current = new Vapi(publicKey);
    }
    const vapi = vapiRef.current;

    const onCallStart = () => {
      console.log("[Vapi] Call started successfully");
      setIsConnecting(false);
      setIsCallActive(true);
      setAiStatus('listening');
      setErrorMessage(null);
    };

    const onSpeechStart = () => setAiStatus('speaking');
    const onSpeechEnd = () => setAiStatus('listening');
    
    const onMessage = (message: any) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        setTranscript(prev => [...prev, { role: message.role, text: message.transcript }]);
      }
    };
    
    const onCallEnd = () => {
      console.log("[Vapi] Call ended");
      setIsCallActive(false);
      setAiStatus('idle');
      if (activeCallIdRef.current) {
        router.push(`/dashboard?call_id=${activeCallIdRef.current}`);
      }
    };

    const onError = (error: any) => {
      console.warn("[Vapi] Error event received:", JSON.stringify(error, null, 2));
      const msg = error?.error?.message || error?.message || "Connection failed. Please try again.";
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setAiStatus('error');
      setIsConnecting(false);
    };

    vapi.on('call-start', onCallStart);
    vapi.on('speech-start', onSpeechStart);
    vapi.on('speech-end', onSpeechEnd);
    vapi.on('message', onMessage);
    vapi.on('call-end', onCallEnd);
    vapi.on('error', onError);

    return () => {
      vapi.off('call-start', onCallStart);
      vapi.off('speech-start', onSpeechStart);
      vapi.off('speech-end', onSpeechEnd);
      vapi.off('message', onMessage);
      vapi.off('call-end', onCallEnd);
      vapi.off('error', onError);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startInterview = useCallback(async (
    profile?: any,
    codingFollowUp?: CodingFollowUpOptions
  ) => {
    if (!vapiRef.current) {
      setErrorMessage("Vapi SDK not initialized. Check your NEXT_PUBLIC_VAPI_PUBLIC_KEY.");
      return;
    }
    
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "";
    if (!assistantId) {
      setErrorMessage("NEXT_PUBLIC_VAPI_ASSISTANT_ID is not set.");
      return;
    }

    setIsConnecting(true);
    setTranscript([]);
    setErrorMessage(null);
    setAiStatus('idle');
    
    let assistantOverrides: { firstMessage?: string } = {};
    if (codingFollowUp) {
      assistantOverrides = {
        firstMessage: codingFollowUp.context.suggestedFollowUpQuestion,
      };
      console.log("[Vapi] Starting optional coding solution follow-up");
    } else if (profile && profile.name) {
      const firstName = profile.name.split(' ')[0];
      const targetRole = profile.targetRole || 'Backend Engineer';
      
      let context = 'software engineering';
      if (profile.experience && profile.experience.length > 0) {
        context = profile.experience[0].company;
      } else if (profile.projects && profile.projects.length > 0) {
        context = profile.projects[0];
      }
      
      const dynamicGreeting = `Hi ${firstName}, I'm your interviewer for the ${targetRole} position. To start off, could you tell me about your ${context} experience?`;
      assistantOverrides = {
        firstMessage: dynamicGreeting
      };
      console.log("[Vapi] Using dynamic greeting:", dynamicGreeting);
    }
    
    console.log("[Vapi] Starting call with assistant:", assistantId);

    try {
      // The Vapi SDK can reject with `undefined` — we must handle that gracefully
      const call = await vapiRef.current.start(assistantId, assistantOverrides);
      console.log("[Vapi] Call object returned:", call);
      if (call && call.id) {
        if (codingFollowUp) {
          try {
            const registration = await fetch(`${BACKEND}/api/interview/coding-context`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                callId: call.id,
                assessmentId: codingFollowUp.assessmentId,
              }),
            });
            if (!registration.ok) {
              const body = await registration.json().catch(() => null);
              throw new Error(
                body?.detail || `Coding context registration failed: ${registration.status}`
              );
            }
          } catch (registrationError: any) {
            console.error("[Vapi] Coding context registration failed:", registrationError);
            vapiRef.current.stop();
            activeCallIdRef.current = null;
            setActiveCallId(null);
            setIsCallActive(false);
            setIsConnecting(false);
            setAiStatus('error');
            setErrorMessage(
              registrationError?.message ||
                "Could not attach coding evidence to this interview. Please retry."
            );
            return;
          }
        }
        setActiveCallId(call.id);
        activeCallIdRef.current = call.id;
      } else if (codingFollowUp) {
        vapiRef.current.stop();
        setIsCallActive(false);
        setIsConnecting(false);
        setAiStatus('error');
        setErrorMessage(
          "The voice call started without a call ID, so coding context could not be attached."
        );
      }
    } catch (err: any) {
      // Vapi SDK often rejects with `undefined` — the real error comes through the 'error' event
      console.warn("[Vapi] start() rejected:", err);
      setIsConnecting(false);
      if (err !== undefined) {
        const msg = err?.message || err?.error?.message || "Failed to start call.";
        setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
      // Don't re-throw — this prevents the Next.js Unhandled Error overlay
    }
  }, []);

  const endInterview = useCallback(() => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
  }, []);

  return {
    isCallActive,
    isConnecting,
    aiStatus,
    transcript,
    activeCallId,
    errorMessage,
    startInterview,
    endInterview
  };
}
