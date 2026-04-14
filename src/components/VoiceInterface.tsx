import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, X, Zap, Volume2, VolumeX, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import { askGemini } from "../services/geminiService";

interface VoiceInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  systemInstruction?: string;
}

export function VoiceInterface({ isOpen, onClose, isDark, systemInstruction }: VoiceInterfaceProps) {
  const [status, setStatus] = useState<'Connecting' | 'Listening' | 'Speaking' | 'Idle'>('Connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const isMutedRef = useRef(isMuted);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (isOpen) {
      const initVoice = async () => {
        setStatus('Connecting');
        await startAudioAnalysis();
        initSpeechRecognition();
        setStatus('Listening');
      };
      initVoice();
      return () => {
        stopAudioAnalysis();
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      };
    }
  }, [isOpen]);

  const initSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = async (event: any) => {
      if (isMutedRef.current) return;
      
      const text = event.results[event.results.length - 1][0].transcript;
      if (text.trim()) {
        handleVoiceInput(text);
      }
    };

    recognitionRef.current.onend = () => {
      if (isOpen && !isMutedRef.current) {
        recognitionRef.current.start();
      }
    };

    recognitionRef.current.start();
  };

  const handleVoiceInput = async (text: string) => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setStatus('Speaking');
    try {
      const response = await askGemini(text, systemInstruction);
      speak(response);
    } catch (err) {
      console.error("Voice Mode Error:", err);
      setStatus('Listening');
      if (recognitionRef.current && !isMutedRef.current) {
        recognitionRef.current.start();
      }
    }
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setStatus('Listening');
      if (recognitionRef.current && !isMutedRef.current) {
        recognitionRef.current.start();
      }
    };
    window.speechSynthesis.speak(utterance);
  };

  const startAudioAnalysis = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setVolume(average);
          animationFrameRef.current = requestAnimationFrame(updateVolume);
        }
      };
      updateVolume();
    } catch (err: any) {
      console.warn("Mic visualizer failed:", err);
    }
  };

  const stopAudioAnalysis = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    analyserRef.current = null;
    setVolume(0);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl"
    >
      <div className="relative w-full max-w-lg p-8 flex flex-col items-center gap-12">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-0 right-0 p-4 text-white/40 hover:text-white transition-colors"
        >
          <X size={32} />
        </button>

        {/* Gemini Spark Logo */}
        <div className="relative">
          <motion.div
            animate={{ 
              scale: status === 'Speaking' ? [1, 1.1, 1] : 1,
              rotate: status === 'Connecting' ? 360 : 0
            }}
            transition={{ 
              repeat: Infinity, 
              duration: status === 'Connecting' ? 2 : 1,
              ease: "linear"
            }}
            className={cn(
              "w-32 h-32 rounded-full flex items-center justify-center shadow-2xl relative z-10",
              isDark ? "bg-accent-green text-black" : "bg-white text-black"
            )}
          >
            {status === 'Connecting' ? <Loader2 size={48} className="animate-spin" /> : <Zap size={48} />}
          </motion.div>

          {/* Audio Visualizer Rings */}
          <AnimatePresence>
            {(status === 'Listening' || status === 'Speaking') && (
              <>
                <motion.div
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ 
                    scale: 1 + (volume / 100) * 0.5,
                    opacity: 0.2
                  }}
                  className="absolute inset-0 rounded-full bg-accent-green blur-2xl"
                />
                <motion.div
                  initial={{ scale: 1, opacity: 0.3 }}
                  animate={{ 
                    scale: 1 + (volume / 100) * 1,
                    opacity: 0.1
                  }}
                  className="absolute inset-0 rounded-full bg-accent-green blur-3xl"
                />
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Status Text */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">
            {status === 'Connecting' ? 'Establishing Neural Link...' : 
             status === 'Listening' ? 'Gemini is Listening' : 
             status === 'Speaking' ? 'Gemini is Speaking' : 'Idle'}
          </h2>
          <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em]">
            WebRTC Low Latency Stream Active
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all",
              isMuted ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
            )}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          
          <button
            className="w-20 h-20 rounded-full bg-accent-green text-black flex items-center justify-center shadow-[0_0_30px_rgba(0,255,65,0.3)] hover:scale-110 transition-transform"
          >
            <Zap size={32} />
          </button>

          <button
            className="w-16 h-16 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <Volume2 size={24} />
          </button>
        </div>

        {/* Strategy Indicator */}
        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
          <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
            Trading Mode: NQ PB Theory Active
          </span>
        </div>
      </div>
    </motion.div>
  );
}
