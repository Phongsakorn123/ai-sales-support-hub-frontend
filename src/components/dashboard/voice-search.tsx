"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AiOrb from "./ai-orb";

type RecognitionResult = { 0: { transcript: string }; isFinal: boolean };
type RecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<RecognitionResult>;
};
type RecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type RecognitionConstructor = new () => RecognitionInstance;
type SpeechWindow = Window & {
  SpeechRecognition?: RecognitionConstructor;
  webkitSpeechRecognition?: RecognitionConstructor;
};

type VoiceStatus = "idle" | "listening" | "error";

const errorMessages: Record<string, string> = {
  "not-allowed":
    "Microphone permission was denied. Allow microphone access in your browser settings and try again.",
  "service-not-allowed":
    "Microphone permission was denied. Allow microphone access in your browser settings and try again.",
  "no-speech": "No speech was detected. Click the orb and try speaking again.",
  "audio-capture":
    "No microphone was found. Connect a microphone and try again.",
  network:
    "The browser's speech service could not be reached. Check your connection and try again.",
};

function getRecognitionConstructor(): RecognitionConstructor | undefined {
  const speechWindow = window as SpeechWindow;
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
}

export default function VoiceSearch({
  language,
  onSubmitQuery,
}: {
  language: string;
  onSubmitQuery: (query: string) => void;
}) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const recognitionRef = useRef<RecognitionInstance | null>(null);

  const detach = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.onstart = null;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    recognition.abort();
    recognitionRef.current = null;
  }, []);

  useEffect(() => detach, [detach]);

  function stop(): void {
    recognitionRef.current?.stop();
  }

  function start(): void {
    if (recognitionRef.current) return;
    const Recognition = getRecognitionConstructor();
    if (!Recognition) {
      setStatus("error");
      setError(
        "Voice search is unavailable: this browser does not support the Web Speech API. Try Chrome, Edge, or Safari, or use the text search.",
      );
      return;
    }

    const recognition = new Recognition();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onstart = () => setStatus("listening");
    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i += 1) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text.trim());
      setSubmitted(false);
    };
    recognition.onerror = (event) => {
      if (event.error === "aborted") return;
      setStatus("error");
      setError(
        errorMessages[event.error] ??
          `Voice recognition failed (${event.error}).`,
      );
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setStatus((current) => (current === "error" ? current : "idle"));
    };

    setError("");
    setSubmitted(false);
    setTranscript("");
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setStatus("error");
      setError("Voice recognition could not start. Please try again.");
    }
  }

  const listening = status === "listening";
  const statusText = listening
    ? "Listening… speak your product search"
    : "Click the orb to start voice search";

  return (
    <div className="mt-6 rounded-2xl border border-white/[0.07] bg-[#080d1b] px-4 py-5 text-center">
      <h3 className="text-sm font-semibold text-slate-100">Voice Search</h3>
      <button
        aria-label={listening ? "Stop voice search" : "Start voice search"}
        aria-pressed={listening}
        className="voice-orb-button mt-2"
        onClick={listening ? stop : start}
        type="button"
      >
        <AiOrb compact decorative listening={listening} />
      </button>
      <p
        aria-live="polite"
        className="-mt-2 text-sm font-medium text-cyan-200"
        role="status"
      >
        {statusText}
      </p>
      <p className="mt-1 text-[11px] text-slate-500">
        Listening language: {language === "th-TH" ? "ไทย (Thai)" : "English"} —
        change it at the top right. Speech recognition depends on your browser
        and microphone permission.
      </p>

      {error && (
        <p className="mx-auto mt-3 max-w-md text-xs text-rose-300" role="alert">
          {error}
        </p>
      )}

      <div
        aria-live="polite"
        className="mx-auto mt-4 min-h-14 max-w-xl rounded-xl border border-cyan-300/15 bg-cyan-400/[0.04] px-4 py-3 text-sm text-slate-100"
      >
        {transcript || (
          <span className="text-slate-500">
            Your recognized speech will appear here.
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {listening && (
          <button
            className="h-9 rounded-xl border border-white/10 px-4 text-xs font-semibold text-slate-200 transition hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            onClick={stop}
            type="button"
          >
            Stop listening
          </button>
        )}
        <button
          className="h-9 rounded-xl bg-indigo-500 px-4 text-xs font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!transcript || listening}
          onClick={() => {
            onSubmitQuery(transcript);
            setSubmitted(true);
          }}
          type="button"
        >
          Use in Quick Search
        </button>
      </div>
      {submitted && (
        <p className="mt-2 text-xs text-slate-400" role="status">
          Transcript sent to Quick Search above.
        </p>
      )}
    </div>
  );
}
