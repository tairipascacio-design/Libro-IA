import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  List,
  Sparkles,
  Maximize2,
  Mic,
  Bookmark,
} from "lucide-react";
import { Book, BookChapter, BookPaperTheme } from "../types";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";

interface RealisticBookViewProps {
  currentBook: Book;
  paperTheme: BookPaperTheme;
  fontSize: number;
  onGoToDictationForChapter: (chapterId: string) => void;
  selectedChapterId?: string;
  setSelectedChapterId: (id: string) => void;
}

export const RealisticBookView: React.FC<RealisticBookViewProps> = ({
  currentBook,
  paperTheme,
  fontSize,
  onGoToDictationForChapter,
  selectedChapterId,
  setSelectedChapterId,
}) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [showToc, setShowToc] = useState(false);
  const [isTwoPageView, setIsTwoPageView] = useState(true);

  // Speech Synthesis Hook for audiobook listening
  const {
    isPlaying,
    isPaused,
    voices,
    selectedVoice,
    setSelectedVoice,
    rate,
    setRate,
    speak,
    pause,
    resume,
    stop,
    isSupported: isTtsSupported,
  } = useSpeechSynthesis();

  // Sync selected chapter
  useEffect(() => {
    if (selectedChapterId) {
      const idx = currentBook.chapters.findIndex((c) => c.id === selectedChapterId);
      if (idx !== -1) {
        setCurrentChapterIndex(idx);
      }
    } else if (currentBook.chapters.length > 0) {
      setSelectedChapterId(currentBook.chapters[0].id);
    }
  }, [selectedChapterId, currentBook.chapters]);

  const activeChapter: BookChapter | undefined =
    currentBook.chapters[currentChapterIndex] || currentBook.chapters[0];

  // Divide chapter content into pages (approximate 250-350 words per page depending on font size)
  const pages = useMemo(() => {
    if (!activeChapter) return [[""]];
    const paragraphs = activeChapter.content.split("\n\n").filter(Boolean);

    if (paragraphs.length === 0) {
      return [["Aún no hay contenido en este capítulo. ¡Dicta para comenzar!"]];
    }

    const calculatedPages: string[][] = [];
    let currentPage: string[] = [];
    let currentWordCount = 0;
    // Words per page adjusts based on fontSize
    const wordsPerPage = Math.max(160, Math.floor(400 - (fontSize - 16) * 15));

    paragraphs.forEach((p) => {
      const words = p.split(/\s+/).length;
      if (currentWordCount + words > wordsPerPage && currentPage.length > 0) {
        calculatedPages.push(currentPage);
        currentPage = [p];
        currentWordCount = words;
      } else {
        currentPage.push(p);
        currentWordCount += words;
      }
    });

    if (currentPage.length > 0) {
      calculatedPages.push(currentPage);
    }

    return calculatedPages;
  }, [activeChapter, fontSize]);

  const [pagePairIndex, setPagePairIndex] = useState(0);

  // Reset page pair index when chapter changes
  useEffect(() => {
    setPagePairIndex(0);
    stop();
  }, [currentChapterIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevPage();
      } else if (e.key === "ArrowRight") {
        handleNextPage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pagePairIndex, pages.length, currentChapterIndex]);

  const handleNextPage = () => {
    const step = isTwoPageView ? 2 : 1;
    if (pagePairIndex + step < pages.length) {
      setPagePairIndex((prev) => prev + step);
    } else if (currentChapterIndex < currentBook.chapters.length - 1) {
      // Jump to next chapter
      const nextIdx = currentChapterIndex + 1;
      setCurrentChapterIndex(nextIdx);
      setSelectedChapterId(currentBook.chapters[nextIdx].id);
    }
  };

  const handlePrevPage = () => {
    const step = isTwoPageView ? 2 : 1;
    if (pagePairIndex - step >= 0) {
      setPagePairIndex((prev) => prev - step);
    } else if (currentChapterIndex > 0) {
      // Jump to prev chapter
      const prevIdx = currentChapterIndex - 1;
      setCurrentChapterIndex(prevIdx);
      setSelectedChapterId(currentBook.chapters[prevIdx].id);
    }
  };

  const leftPageIndex = pagePairIndex;
  const rightPageIndex = isTwoPageView ? pagePairIndex + 1 : null;

  const leftPageContent = pages[leftPageIndex] || [];
  const rightPageContent = rightPageIndex !== null ? pages[rightPageIndex] || null : null;

  // Handle Speech Synthesis Playback
  const handleTogglePlayback = () => {
    if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    } else if (activeChapter) {
      speak(activeChapter.content);
    }
  };

  // Paper Theme class
  const paperThemeClass =
    paperTheme === "classic"
      ? "paper-classic"
      : paperTheme === "peach"
      ? "paper-peach"
      : paperTheme === "mint"
      ? "paper-mint"
      : "paper-lavender";

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 space-y-4">
      {/* Top Reading Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-300">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowToc(!showToc)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 transition font-medium"
          >
            <List className="w-3.5 h-3.5 text-amber-400" />
            <span>Índice del libro</span>
          </button>

          <span className="text-stone-500 hidden sm:inline">|</span>

          <div className="flex items-center gap-2">
            <span className="text-stone-400">Capítulo:</span>
            <select
              value={activeChapter?.id || ""}
              onChange={(e) => {
                const idx = currentBook.chapters.findIndex((c) => c.id === e.target.value);
                if (idx !== -1) {
                  setCurrentChapterIndex(idx);
                  setSelectedChapterId(e.target.value);
                }
              }}
              className="bg-stone-800 text-stone-200 rounded px-2 py-1 border border-stone-700 focus:outline-none focus:border-amber-500 font-medium"
            >
              {currentBook.chapters.map((ch, idx) => (
                <option key={ch.id} value={ch.id}>
                  {ch.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Two page toggle */}
          <button
            onClick={() => setIsTwoPageView(!isTwoPageView)}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 transition"
            title="Cambiar vista a dos páginas o una página"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>{isTwoPageView ? "2 Páginas" : "1 Página"}</span>
          </button>

          {/* Quick jump to dictation for this chapter */}
          {activeChapter && (
            <button
              onClick={() => onGoToDictationForChapter(activeChapter.id)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold transition shadow-sm"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Dictar a este capítulo</span>
            </button>
          )}
        </div>
      </div>

      {/* Table of Contents Drawer/Modal */}
      {showToc && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <h3 className="font-display-book text-base text-stone-100 font-bold flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-400" />
              Índice General — {currentBook.title}
            </h3>
            <button
              onClick={() => setShowToc(false)}
              className="text-stone-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-stone-800"
            >
              Cerrar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {currentBook.chapters.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => {
                  setCurrentChapterIndex(idx);
                  setSelectedChapterId(ch.id);
                  setShowToc(false);
                }}
                className={`text-left p-3 rounded-xl border transition flex items-start justify-between gap-3 ${
                  idx === currentChapterIndex
                    ? "bg-amber-950/40 border-amber-500/60 text-amber-300"
                    : "bg-stone-950/40 border-stone-800 text-stone-300 hover:bg-stone-800"
                }`}
              >
                <div>
                  <span className="font-semibold block">{ch.title}</span>
                  <span className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                    {ch.summary || ch.content.slice(0, 80) + "..."}
                  </span>
                </div>
                <span className="text-stone-500 font-mono shrink-0">
                  {ch.content.split(/\s+/).filter(Boolean).length} palabras
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Realistic Book Spread Container */}
      <div className="relative select-text">
        {/* Book Outer Binder Shadow */}
        <div className="rounded-2xl p-2 sm:p-5 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 shadow-2xl border border-stone-800/80">
          <div
            className={`rounded-xl overflow-hidden grid ${
              isTwoPageView && rightPageContent !== null
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1"
            } shadow-2xl border border-stone-300/20`}
          >
            {/* Left Page (or Single Page) */}
            <div
              className={`p-6 sm:p-12 transition-colors duration-200 flex flex-col justify-between min-h-[540px] sm:min-h-[620px] ${paperThemeClass} ${
                isTwoPageView && rightPageContent !== null
                  ? "book-gutter-left md:border-r md:border-stone-400/30"
                  : ""
              }`}
            >
              {/* Running Top Header */}
              <div className="border-b border-current/15 pb-2 mb-6 flex items-center justify-between text-[11px] uppercase tracking-widest opacity-60 font-cinzel">
                <span>{currentBook.title}</span>
                <span>{currentBook.author}</span>
              </div>

              {/* Page Content */}
              <div className="flex-1 font-book leading-relaxed text-justify space-y-4">
                {/* If first page of chapter, show artistic chapter title */}
                {pagePairIndex === 0 && (
                  <div className="text-center my-4 space-y-2">
                    <span className="text-xs uppercase tracking-widest text-current/70 font-cinzel block">
                      ❦ ❦ ❦
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display-book font-bold tracking-tight">
                      {activeChapter?.title}
                    </h2>
                    <div className="w-16 h-0.5 bg-current/25 mx-auto mt-2" />
                  </div>
                )}

                {leftPageContent.map((paragraph, pIdx) => (
                  <p
                    key={pIdx}
                    style={{ fontSize: `${fontSize}px` }}
                    className={`leading-relaxed ${
                      pagePairIndex === 0 && pIdx === 0
                        ? "book-drop-cap"
                        : "indent-6 sm:indent-8"
                    }`}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Page Number Footer */}
              <div className="pt-4 mt-6 border-t border-current/10 flex items-center justify-between text-xs font-mono opacity-50">
                <span>{currentBook.genre}</span>
                <span>Página {pagePairIndex * 2 + 1}</span>
              </div>
            </div>

            {/* Right Page (Two Page Mode) */}
            {isTwoPageView && rightPageContent !== null && (
              <div
                className={`p-6 sm:p-12 transition-colors duration-200 flex flex-col justify-between min-h-[540px] sm:min-h-[620px] ${paperThemeClass} book-gutter-right hidden md:flex`}
              >
                {/* Running Top Header */}
                <div className="border-b border-current/15 pb-2 mb-6 flex items-center justify-between text-[11px] uppercase tracking-widest opacity-60 font-cinzel">
                  <span>{activeChapter?.title}</span>
                  <span>{currentBook.title}</span>
                </div>

                {/* Page Content */}
                <div className="flex-1 font-book leading-relaxed text-justify space-y-4">
                  {rightPageContent.map((paragraph, pIdx) => (
                    <p
                      key={pIdx}
                      style={{ fontSize: `${fontSize}px` }}
                      className="leading-relaxed indent-6 sm:indent-8"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Page Number Footer */}
                <div className="pt-4 mt-6 border-t border-current/10 flex items-center justify-between text-xs font-mono opacity-50">
                  <span>Página {pagePairIndex * 2 + 2}</span>
                  <span>Capítulo {currentChapterIndex + 1}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Page Turn Buttons */}
        <div className="flex items-center justify-between mt-3 px-2">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={pagePairIndex === 0 && currentChapterIndex === 0}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition ${
              pagePairIndex === 0 && currentChapterIndex === 0
                ? "bg-stone-900 text-stone-600 border border-stone-800 cursor-not-allowed"
                : "bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700"
            }`}
          >
            <ChevronLeft className="w-4 h-4 text-amber-400" />
            <span>Página anterior</span>
          </button>

          <span className="text-xs text-stone-400 font-mono">
            Capítulo {currentChapterIndex + 1} de {currentBook.chapters.length} •
            Página {pagePairIndex + 1} de {pages.length}
          </span>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={
              pagePairIndex + (isTwoPageView ? 2 : 1) >= pages.length &&
              currentChapterIndex >= currentBook.chapters.length - 1
            }
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition ${
              pagePairIndex + (isTwoPageView ? 2 : 1) >= pages.length &&
              currentChapterIndex >= currentBook.chapters.length - 1
                ? "bg-stone-900 text-stone-600 border border-stone-800 cursor-not-allowed"
                : "bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700"
            }`}
          >
            <span>Siguiente página</span>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Audiobook Player Dock at Bottom */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">
              Audiolibro Integrado
            </span>
            <p className="text-xs text-stone-200 font-medium">
              {isPlaying
                ? `Leyendo en voz alta: ${activeChapter?.title}`
                : isPaused
                ? "Lectura en pausa"
                : `Escuchar ${activeChapter?.title} con voz`}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Rate switcher */}
          <button
            onClick={() => {
              const rates = [0.85, 1.0, 1.25];
              const nextIndex = (rates.indexOf(rate) + 1) % rates.length;
              setRate(rates[nextIndex]);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-stone-300 hover:text-white text-xs font-mono font-semibold"
            title="Velocidad de lectura"
          >
            {rate}x
          </button>

          {/* Voice selector */}
          {voices.length > 0 && (
            <select
              value={selectedVoice?.name || ""}
              onChange={(e) => {
                const voice = voices.find((v) => v.name === e.target.value);
                if (voice) setSelectedVoice(voice);
              }}
              className="bg-stone-800 text-stone-300 text-xs rounded-lg px-2.5 py-1.5 border border-stone-700 focus:outline-none focus:border-amber-500 max-w-[140px] truncate"
            >
              {voices
                .filter((v) => v.lang.startsWith("es") || v.lang.startsWith("en"))
                .map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
            </select>
          )}

          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={handleTogglePlayback}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pausar</span>
              </>
            ) : isPaused ? (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Reanudar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Reproducir</span>
              </>
            )}
          </button>

          {(isPlaying || isPaused) && (
            <button
              onClick={stop}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
              title="Detener audio"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
