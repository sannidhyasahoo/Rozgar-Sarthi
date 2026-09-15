import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import { useRouter } from 'next/navigation';

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
      const rawKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "";
      const publicKey = rawKey.replace(/^["']|["']$/g, '').trim();
      
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
      let msg = error?.error?.message || error?.message || (typeof error === 'string' ? error : "Connection failed. Please try again.");
      
      if (typeof msg === 'string' && msg.includes("Does Not Exist")) {
        msg = "The configured Vapi Assistant ID was not found in your Vapi account. Please create an assistant on dashboard.vapi.ai and update NEXT_PUBLIC_VAPI_ASSISTANT_ID in frontend/.env.";
      }
      
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

  const startInterview = useCallback(async (profile?: any) => {
    if (!vapiRef.current) {
      setErrorMessage("Vapi SDK not initialized. Check your NEXT_PUBLIC_VAPI_PUBLIC_KEY.");
      return;
    }
    
    const rawAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "";
    const assistantId = rawAssistantId.replace(/^["']|["']$/g, '').trim();

    setIsConnecting(true);
    setTranscript([]);
    setErrorMessage(null);
    setAiStatus('idle');
    
    const firstName = profile?.name ? profile.name.split(' ')[0] : 'Candidate';
    const targetRole = profile?.targetRole || 'Software Engineer';
    
    let context = 'software engineering';
    if (profile?.experience && profile.experience.length > 0) {
      context = profile.experience[0].company || profile.experience[0].role || 'software engineering';
    } else if (profile?.projects && profile.projects.length > 0) {
      context = profile.projects[0];
    }
    
    const dynamicGreeting = `Hi ${firstName}, I'm your interviewer for the ${targetRole} position. To start off, could you tell me about your ${context} experience?`;

    console.log("[Vapi] Starting call with assistant:", assistantId || "inline-config");

    try {
      let call: any;
      if (assistantId && assistantId !== "777d274b-28d4-4556-8ceb-ba38cd2e43d8") {
        call = await vapiRef.current.start(assistantId, {
          firstMessage: dynamicGreeting
        });
      } else {
        // Fallback: Start with dynamic inline assistant using the active Vapi Public Key
        console.log("[Vapi] Using dynamic inline assistant configuration");
        call = await vapiRef.current.start({
          name: "Rozgar Sarthi Technical Interviewer",
          firstMessage: dynamicGreeting,
          model: {
            provider: "openai",
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are an encouraging and insightful technical interviewer for Rozgar Sarthi assessing a candidate for a ${targetRole} role. Ask one question at a time, listen carefully to candidate answers, and ask relevant follow-ups.`
              }
            ]
          },
          voice: {
            provider: "11labs",
            voiceId: "21m00Tcm4TlvDq8ikWAM"
          }
        });
      }

      console.log("[Vapi] Call object returned:", call);
      if (call && call.id) {
        setActiveCallId(call.id);
        activeCallIdRef.current = call.id;
      }
    } catch (err: any) {
      console.warn("[Vapi] start() rejected:", err);
      setIsConnecting(false);
      if (err !== undefined) {
        let msg = err?.message || err?.error?.message || "Failed to start call.";
        if (typeof msg === 'string' && msg.includes("Does Not Exist")) {
          msg = "The configured Assistant ID does not exist in your Vapi account. Please create an assistant on dashboard.vapi.ai and update your frontend/.env file.";
        }
        setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
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
