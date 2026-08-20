import { useState, useEffect, useRef } from 'react';
import Vapi from '@vapi-ai/web';
import { useRouter } from 'next/navigation';

export function useInterview() {
  const router = useRouter();
  const [isCallActive, setIsCallActive] = useState(false);
  const [aiStatus, setAiStatus] = useState<'idle' | 'listening' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState<{ role: string; text: string }[]>([]);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const activeCallIdRef = useRef<string | null>(null);
  
  const vapiRef = useRef<any>(null);

  useEffect(() => {
    // Only instantiate on client side
    if (!vapiRef.current) {
        vapiRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "");
    }
    const vapi = vapiRef.current;

    const onCallStart = () => {
      setIsCallActive(true);
      setAiStatus('listening');
    };

    const onSpeechStart = () => setAiStatus('speaking');
    const onSpeechEnd = () => setAiStatus('listening');
    
    const onMessage = (message: any) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        setTranscript(prev => [...prev, { role: message.role, text: message.transcript }]);
      }
    };
    
    const onCallEnd = () => {
      setIsCallActive(false);
      setAiStatus('idle');
      if (activeCallIdRef.current) {
        router.push(`/dashboard?call_id=${activeCallIdRef.current}`);
      }
    };

    vapi.on('call-start', onCallStart);
    vapi.on('speech-start', onSpeechStart);
    vapi.on('speech-end', onSpeechEnd);
    vapi.on('message', onMessage);
    vapi.on('call-end', onCallEnd);

    return () => {
      vapi.off('call-start', onCallStart);
      vapi.off('speech-start', onSpeechStart);
      vapi.off('speech-end', onSpeechEnd);
      vapi.off('message', onMessage);
      vapi.off('call-end', onCallEnd);
    };
  }, []);

  const startInterview = async () => {
    if (!vapiRef.current) return;
    try {
      setTranscript([]);
      const call = await vapiRef.current.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "");
      if (call && call.id) {
        setActiveCallId(call.id);
        activeCallIdRef.current = call.id;
      }
    } catch (err) {
      console.error("Failed to start Vapi call", err);
    }
  };

  const endInterview = () => {
    if (vapiRef.current) {
        vapiRef.current.stop();
    }
  };

  return {
    isCallActive,
    aiStatus,
    transcript,
    activeCallId,
    startInterview,
    endInterview
  };
}
