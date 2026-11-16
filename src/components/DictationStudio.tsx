import React, { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Lightbulb,
  History,
  FileText,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  BookOpen,
  Heart,
  Smile,
  ShieldCheck,
} from "lucide-react";
import { Book, OrganizeResult } from "../types";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

interface DictationStudioProps {
  currentBook: Book;
  onApplyOrganizeResult: (result: OrganizeResult, rawText: string) => void;
  onSelectChapter: (chapterId: string) => void;
  selectedChapterId?: string;
  setSelectedChapterId: (id: string) => void;
}

export const DictationStudio: React.FC<DictationStudioProps> = ({
  currentBook,
  onApplyOrganizeResult,
  onSelectChapter,
  selectedChapterId,
  setSelectedChapterId,
}) => {
  const [dictationMode, setDictationMode] = useState<
    "auto_chronology" | "current_chapter" | "create_chapter" | "dialogue"
  >("auto_chronology");

  const [language, setLanguage] = useState("es-MX");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [continuationPrompts, setContinuationPrompts] = useState<string[]>([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const [manualText, setManualText] = useState("");
  const [lastResult, setLastResult] = useState<OrganizeResult | null>(null);
  const [activeTab, setActiveTab] = useState<"dictate" | "history">("dictate");

  // Speech Recognition Hook
  const {
    isListening,
    transcript,
    interimTranscript,
    audioLevel,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    setManualTranscript,
  } = useSpeechRecognition({
    lang: language,
    onError: (err) => setErrorMessage(err),
  });

  const combinedText = transcript
    ? transcript + (interimTranscript ? " " + interimTranscript : "")
    : manualText;

  // Load continuation prompts
  useEffect(() => {
    async function loadPrompts() {
      try {
        setIsLoadingPrompts(true);
        const res = await fetch("/api/continuation-prompts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            book: currentBook,
            currentChapterId: selectedChapterId,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.prompts)) {
            setContinuationPrompts(data.prompts);
          }
        }
      } catch (err) {
        console.warn("Could not load continuation prompts", err);
      } finally {
        setIsLoadingPrompts(false);
      }
    }

    if (currentBook.chapters.length > 0) {
      loadPrompts();
    }
  }, [currentBook.id, selectedChapterId]);

  // Handle Organize with Gemini
  const handleProcessDictation = async () => {
    const textToProcess = combinedText.trim();
    if (!textToProcess) {
      setErrorMessage("Por favor dicta o escribe algo primero.");
      return;
    }

    if (isListening) {
      stopListening();
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/organize-dictation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dictation: textToProcess,
          book: currentBook,
          mode: dictationMode,
          currentChapterId: selectedChapterId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al acomodar el dictado");
      }

      const result: OrganizeResult = await response.json();
      setLastResult(result);
      onApplyOrganizeResult(result, textToProcess);

      resetTranscript();
      setManualText("");
    } catch (err: any) {
      console.error("Error processing dictation:", err);
      setErrorMessage(
        err?.message || "Ocurrió un error al acomodar el dictado en el libro."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplySampleDictation = (sample: string) => {
    resetTranscript();
    setManualText(sample);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Joyful, Lively Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 shadow-xl border border-white/10 bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-violet-500/20 backdrop-blur-xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-amber-400 to-rose-500 rounded-full blur-3xl opacity-30 pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-br from-violet-500 to-cyan-400 rounded-full blur-3xl opacity-30 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-rose-400 text-stone-950 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Tus palabras exactas, en su lugar</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Sin reescrituras artificiales</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>Dicta libremente y la IA lo acomoda donde va</span>
              <Smile className="w-6 h-6 text-amber-300 shrink-0" />
            </h1>

            <p className="text-stone-200 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Habla tal y como tú eres. Si lo cuentas al revés o saltas de una idea a
              otra, el sistema entiende el orden cronológico y reubica tus párrafos
              en el lugar correcto del libro, <strong>manteniendo exactamente tus palabras y tu voz</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-stone-900/80 p-1 rounded-2xl border border-white/10 flex text-xs font-bold">
              <button
                onClick={() => setActiveTab("dictate")}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition ${
                  activeTab === "dictate"
                    ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md font-bold"
                    : "text-stone-300 hover:text-white"
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>Estudio</span>
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition ${
                  activeTab === "history"
                    ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md font-bold"
                    : "text-stone-300 hover:text-white"
                }`}
              >
                <History className="w-4 h-4" />
                <span>Historial ({currentBook.dictationHistory?.length || 0})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeTab === "dictate" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Voice Center (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Mode selection with cheerful cards */}
            <div className="bg-stone-900/90 border border-white/10 rounded-3xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  ¿Cómo quieres que se acomode este dictado?
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDictationMode("auto_chronology")}
                  className={`text-left p-3.5 rounded-2xl border transition-all ${
                    dictationMode === "auto_chronology"
                      ? "bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-transparent border-amber-400/80 ring-2 ring-amber-400/30 text-white shadow-md"
                      : "bg-stone-850/60 border-white/5 text-stone-300 hover:bg-stone-800"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                    <RefreshCw className="w-4 h-4 text-amber-400 animate-spin-slow" />
                    <span>Acomodo Cronológico (Si dictas al revés)</span>
                  </div>
                  <p className="text-[11px] text-stone-300 mt-1 leading-normal">
                    La IA detecta qué ocurrió primero y qué después, ordenando tus oraciones en su lugar.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDictationMode("current_chapter")}
                  className={`text-left p-3.5 rounded-2xl border transition-all ${
                    dictationMode === "current_chapter"
                      ? "bg-gradient-to-br from-rose-500/20 via-violet-500/20 to-transparent border-rose-400/80 ring-2 ring-rose-400/30 text-white shadow-md"
                      : "bg-stone-850/60 border-white/5 text-stone-300 hover:bg-stone-800"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-rose-300">
                    <BookOpen className="w-4 h-4 text-rose-400" />
                    <span>Añadir al Capítulo Actual</span>
                  </div>
                  <p className="text-[11px] text-stone-300 mt-1 leading-normal">
                    Tus palabras se suman directamente al capítulo que estás escribiendo ahora.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDictationMode("create_chapter")}
                  className={`text-left p-3.5 rounded-2xl border transition-all ${
                    dictationMode === "create_chapter"
                      ? "bg-gradient-to-br from-violet-500/20 via-cyan-500/20 to-transparent border-violet-400/80 ring-2 ring-violet-400/30 text-white shadow-md"
                      : "bg-stone-850/60 border-white/5 text-stone-300 hover:bg-stone-800"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-violet-300">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <span>Crear Nuevo Capítulo</span>
                  </div>
                  <p className="text-[11px] text-stone-300 mt-1 leading-normal">
                    Crea un nuevo capítulo con el título correspondiente para esta nueva escena.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDictationMode("dialogue")}
                  className={`text-left p-3.5 rounded-2xl border transition-all ${
                    dictationMode === "dialogue"
                      ? "bg-gradient-to-br from-cyan-500/20 via-emerald-500/20 to-transparent border-cyan-400/80 ring-2 ring-cyan-400/30 text-white shadow-md"
                      : "bg-stone-850/60 border-white/5 text-stone-300 hover:bg-stone-800"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-cyan-300">
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    <span>Conversación y Diálogo</span>
                  </div>
                  <p className="text-[11px] text-stone-300 mt-1 leading-normal">
                    Ordena los turnos de conversación con raya literaria (—) sin alterar tus palabras.
                  </p>
                </button>
              </div>

              {dictationMode === "current_chapter" && (
                <div className="pt-2 border-t border-white/10 flex items-center gap-3">
                  <span className="text-xs text-stone-300 font-medium">Capítulo destino:</span>
                  <select
                    value={selectedChapterId || currentBook.chapters[0]?.id || ""}
                    onChange={(e) => setSelectedChapterId(e.target.value)}
                    className="bg-stone-800 text-stone-100 text-xs rounded-xl px-3 py-1.5 border border-white/15 focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold"
                  >
                    {currentBook.chapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Radiant Microphone Hub */}
            <div className="bg-stone-900/90 border border-white/10 rounded-3xl p-6 sm:p-7 text-center space-y-6 shadow-2xl relative overflow-hidden">
              {/* Vibrant audio wave meter when listening */}
              {isListening && (
                <div className="absolute inset-x-0 top-0 h-2 bg-stone-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-violet-500 transition-all duration-75"
                    style={{ width: `${Math.max(10, audioLevel)}%` }}
                  />
                </div>
              )}

              {/* Big Vibrant Record Button */}
              <div className="flex flex-col items-center justify-center pt-2">
                <div className="relative">
                  {/* Colorful pulsating glow rings */}
                  {isListening && (
                    <>
                      <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-violet-500 animate-ping opacity-40 pointer-events-none" />
                      <div className="absolute -inset-10 rounded-full bg-rose-500/20 animate-pulse pointer-events-none" />
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (isListening) {
                        stopListening();
                      } else {
                        startListening();
                      }
                    }}
                    disabled={isProcessing}
                    className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all transform shadow-2xl focus:outline-none ${
                      isListening
                        ? "bg-gradient-to-br from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white scale-110 ring-4 ring-rose-400/50 shadow-rose-600/50"
                        : "bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 hover:from-amber-400 hover:via-rose-400 hover:to-violet-500 text-white hover:scale-105 active:scale-95 shadow-rose-500/40"
                    } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-9 h-9 animate-bounce" />
                        <span className="text-[11px] uppercase font-extrabold mt-1 tracking-wider">
                          Pausar
                        </span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-9 h-9" />
                        <span className="text-[11px] uppercase font-extrabold mt-1 tracking-wider">
                          Dictar Voz
                        </span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-4 space-y-1">
                  <p className="text-base font-bold text-white flex items-center justify-center gap-1.5">
                    {isListening ? (
                      <span className="text-rose-400 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                        Escuchando en vivo... ¡habla con libertad!
                      </span>
                    ) : combinedText ? (
                      "Dictado listo. Puedes seguir hablando o acomodarlo en el libro."
                    ) : (
                      "Presiona para dictar y comienza a hablar"
                    )}
                  </p>
                  <p className="text-xs text-stone-300">
                    {isListening
                      ? "La IA escuchará todo y acomodará tus ideas en el orden correcto."
                      : "Tus palabras se mantendrán tal cual, sin cambiarlas."}
                  </p>
                </div>

                {/* Bouncing colorful soundwave bars */}
                {isListening && (
                  <div className="flex items-center gap-1.5 h-8 mt-3">
                    {[16, 32, 60, 95, 80, 50, 75, 100, 85, 45, 65, 90, 70, 35, 20].map(
                      (h, i) => {
                        const colors = [
                          "bg-amber-400",
                          "bg-rose-400",
                          "bg-violet-400",
                          "bg-cyan-400",
                          "bg-emerald-400",
                        ];
                        const barColor = colors[i % colors.length];
                        return (
                          <div
                            key={i}
                            className={`w-1.5 ${barColor} rounded-full transition-all duration-75 shadow-sm`}
                            style={{
                              height: `${Math.max(
                                6,
                                (h * (audioLevel || 25)) / 100
                              )}px`,
                              opacity: audioLevel > 5 ? 1 : 0.5,
                            }}
                          />
                        );
                      }
                    )}
                  </div>
                )}
              </div>

              {/* Dictation Live Box */}
              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between text-xs text-stone-300">
                  <span className="flex items-center gap-1.5 font-bold text-amber-300">
                    <FileText className="w-4 h-4 text-amber-400" />
                    Lo que has dictado:
                  </span>
                  {combinedText && (
                    <button
                      type="button"
                      onClick={() => {
                        resetTranscript();
                        setManualText("");
                      }}
                      className="text-stone-400 hover:text-rose-400 text-xs font-semibold transition"
                    >
                      Borrar texto
                    </button>
                  )}
                </div>

                <textarea
                  value={combinedText}
                  onChange={(e) => {
                    setManualText(e.target.value);
                    setManualTranscript(e.target.value);
                  }}
                  placeholder="Aquí aparecerán tus palabras exactas mientras hablas. También puedes escribir o pegar texto si lo prefieres..."
                  rows={4}
                  className="w-full bg-stone-950/90 border border-white/10 rounded-2xl p-4 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400 leading-relaxed font-sans shadow-inner"
                />

                {interimTranscript && (
                  <div className="text-xs text-amber-300 italic flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>Detectando: "{interimTranscript}"</span>
                  </div>
                )}
              </div>

              {/* Main Action Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-xs text-stone-300 text-left font-medium">
                  {combinedText ? (
                    <span className="text-amber-200">
                      ✨ {combinedText.split(/\s+/).filter(Boolean).length} palabras
                      dictadas
                    </span>
                  ) : (
                    <span>Listo para capturar tus ideas</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleProcessDictation}
                  disabled={isProcessing || !combinedText.trim()}
                  className={`w-full sm:w-auto px-7 py-3 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-xl transition-all transform ${
                    isProcessing || !combinedText.trim()
                      ? "bg-stone-800 text-stone-500 cursor-not-allowed border border-white/5"
                      : "bg-gradient-to-r from-amber-400 via-rose-500 to-violet-500 hover:from-amber-300 hover:via-rose-400 hover:to-violet-400 text-stone-950 font-black shadow-rose-500/30 hover:scale-105 active:scale-95"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                      <span>Acomodando tus palabras en el libro...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-stone-950 fill-current" />
                      <span>Acomodar en el Libro</span>
                      <ArrowRight className="w-4 h-4 text-stone-950" />
                    </>
                  )}
                </button>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <div>
                    <p className="font-bold">{errorMessage}</p>
                    <p className="text-rose-300/80 mt-0.5">
                      También puedes escribir directamente en el cuadro de texto y presionar 'Acomodar en el Libro'.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Cheerful Test Examples */}
            <div className="bg-stone-900/80 border border-white/10 rounded-3xl p-4.5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  Ejemplos rápidos: Prueba cómo acomoda dictados al revés
                </span>
                <span className="text-[11px] text-stone-400 font-medium">
                  Clic para probar
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    handleApplySampleDictation(
                      "Fíjate que al final descubrieron la carta secreta en el desván detrás del viejo baúl, pero espera, antes de eso, cuando él era un niño de ocho años, su abuelo siempre le advertía que nunca abriera el cajón de roble del sótano porque allí guardaba las llaves de la villa..."
                    )
                  }
                  className="text-left p-3.5 rounded-2xl bg-stone-950/70 hover:bg-stone-850 border border-white/5 hover:border-amber-400/40 text-stone-200 transition group"
                >
                  <span className="font-bold text-amber-300 group-hover:text-amber-200 block mb-1">
                    🔄 Dictado al revés (Final primero + Recuerdo anterior):
                  </span>
                  <span className="text-stone-300 line-clamp-2">
                    "Al final descubrieron la carta secreta... pero antes, cuando era niño a los ocho años, su abuelo le advertía..."
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleApplySampleDictation(
                      "Y entonces el forastero empapado por la tormenta golpeó con fuerza la puerta del taller gritando que el río se había desbordado. Aunque dos horas antes, cuando el reloj se paró a las cinco y diecisiete, Don Valerio ya había sentido un frío extraño en la nuca y sabía que algo venía..."
                    )
                  }
                  className="text-left p-3.5 rounded-2xl bg-stone-950/70 hover:bg-stone-850 border border-white/5 hover:border-rose-400/40 text-stone-200 transition group"
                >
                  <span className="font-bold text-rose-300 group-hover:text-rose-200 block mb-1">
                    ⚡ Escena con presagio anterior:
                  </span>
                  <span className="text-stone-300 line-clamp-2">
                    "El forastero golpeó la puerta... aunque dos horas antes cuando el reloj se paró Don Valerio sintió un frío..."
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Inspiration & Recent Placements */}
          <div className="space-y-4">
            {/* Last Reorganization Card */}
            {lastResult && (
              <div className="bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-transparent border border-amber-400/40 rounded-3xl p-5 space-y-3 shadow-xl">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Último Acomodo Realizado</span>
                </div>

                <p className="text-xs text-stone-200 leading-relaxed bg-stone-950/80 p-3 rounded-2xl border border-white/10">
                  {lastResult.analysisSummary}
                </p>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-stone-300 uppercase">
                    Fragmentos ubicados ({lastResult.placements.length})
                  </span>
                  {lastResult.placements.map((p, idx) => (
                    <div
                      key={idx}
                      className="text-xs p-3 rounded-xl bg-stone-900/90 border border-white/10 space-y-1"
                    >
                      <div className="flex items-center justify-between text-amber-300 font-bold">
                        <span>
                          {p.action === "create_chapter"
                            ? `Nuevo Capítulo: ${p.newChapterTitle || "Sin título"}`
                            : `Capítulo existente`}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200">
                          {p.chronologicalContext}
                        </span>
                      </div>
                      <p className="text-stone-300 text-[11px]">
                        {p.placementExplanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inspiration questions */}
            <div className="bg-stone-900/90 border border-white/10 rounded-3xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Ideas para continuar dictando</span>
                </div>
                {isLoadingPrompts && (
                  <RefreshCw className="w-3.5 h-3.5 text-stone-400 animate-spin" />
                )}
              </div>

              <p className="text-xs text-stone-300">
                Preguntas para ayudarte a recordar y dictar el siguiente momento:
              </p>

              <div className="space-y-2">
                {continuationPrompts.length > 0 ? (
                  continuationPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        resetTranscript();
                        setManualText(
                          (prev) => (prev ? prev + " " : "") + `En cuanto a ${prompt.toLowerCase()}: `
                        );
                      }}
                      className="w-full text-left p-3 rounded-2xl bg-stone-950/70 hover:bg-stone-800 border border-white/5 hover:border-amber-400/30 text-xs text-stone-200 hover:text-white transition flex items-start gap-2.5 group"
                    >
                      <span className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 text-stone-950 font-bold flex items-center justify-center shrink-0 text-[11px] group-hover:scale-110 transition">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{prompt}</span>
                    </button>
                  ))
                ) : (
                  <div className="text-xs text-stone-400 py-3 text-center">
                    Cargando preguntas de inspiración...
                  </div>
                )}
              </div>
            </div>

            {/* Book Stats */}
            <div className="bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-violet-500/10 border border-white/10 rounded-3xl p-5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-stone-300">
                <span>Capítulos en tu libro:</span>
                <span className="font-bold text-amber-300 text-sm">
                  {currentBook.chapters.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-stone-300">
                <span>Personajes que mencionaste:</span>
                <span className="font-bold text-rose-300 text-sm">
                  {currentBook.characters.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-stone-300">
                <span>Hitos en la línea de tiempo:</span>
                <span className="font-bold text-violet-300 text-sm">
                  {currentBook.timeline.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Dictation History */
        <div className="bg-stone-900/90 border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" />
              Historial de lo que has dictado
            </h2>
            <span className="text-xs text-stone-400">
              {currentBook.dictationHistory?.length || 0} sesiones
            </span>
          </div>

          {currentBook.dictationHistory && currentBook.dictationHistory.length > 0 ? (
            <div className="space-y-3">
              {currentBook.dictationHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-stone-950/80 border border-white/10 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span className="flex items-center gap-1.5 font-bold text-amber-300">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(item.timestamp).toLocaleString("es-MX", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 text-[11px] font-semibold">
                      {item.mode}
                    </span>
                  </div>

                  <div className="text-xs text-stone-200 bg-stone-900/90 p-3 rounded-xl border border-white/5">
                    <span className="font-bold text-amber-400 block mb-1">
                      Tus palabras exactas:
                    </span>
                    "{item.rawText}"
                  </div>

                  <div className="text-xs text-emerald-300 leading-relaxed">
                    <span className="font-bold text-white">
                      Dónde se acomodó:
                    </span>{" "}
                    {item.explanation}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-stone-400 text-sm">
              Aún no hay dictados registrados. ¡Presiona el botón para comenzar a hablar!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
