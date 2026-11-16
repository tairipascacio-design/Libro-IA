import React, { useState } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Wand2,
  FileText,
  Clock,
  BookOpen,
  Mic,
} from "lucide-react";
import { Book, BookChapter } from "../types";

interface ChapterEditorProps {
  currentBook: Book;
  onUpdateChapter: (chapterId: string, updated: Partial<BookChapter>) => void;
  onAddChapter: () => void;
  onDeleteChapter: (chapterId: string) => void;
  onReorderChapter: (chapterId: string, direction: "up" | "down") => void;
  selectedChapterId?: string;
  setSelectedChapterId: (id: string) => void;
  onGoToDictation: (chapterId: string) => void;
}

export const ChapterEditor: React.FC<ChapterEditorProps> = ({
  currentBook,
  onUpdateChapter,
  onAddChapter,
  onDeleteChapter,
  onReorderChapter,
  selectedChapterId,
  setSelectedChapterId,
  onGoToDictation,
}) => {
  const activeChapter =
    currentBook.chapters.find((c) => c.id === selectedChapterId) ||
    currentBook.chapters[0];

  const [isPolishing, setIsPolishing] = useState(false);
  const [polishInstruction, setPolishInstruction] = useState(
    "Enriquecer el estilo literario, descripciones sensoriales y ritmo de lectura"
  );
  const [polishedPreview, setPolishedPreview] = useState<string | null>(null);

  const wordCount = activeChapter?.content
    ? activeChapter.content.split(/\s+/).filter(Boolean).length
    : 0;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  const handleRefineWithAI = async () => {
    if (!activeChapter?.content.trim()) return;
    setIsPolishing(true);
    setPolishedPreview(null);
    try {
      const res = await fetch("/api/refine-chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: activeChapter.content,
          bookGenre: currentBook.genre,
          instruction: polishInstruction,
        }),
      });
      if (!res.ok) throw new Error("Error al refinar");
      const data = await res.json();
      setPolishedPreview(data.refinedText);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleApplyPolished = () => {
    if (polishedPreview && activeChapter) {
      onUpdateChapter(activeChapter.id, { content: polishedPreview });
      setPolishedPreview(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chapters Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Capítulos ({currentBook.chapters.length})
            </h3>
            <button
              onClick={onAddChapter}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-stone-950 font-bold transition shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {currentBook.chapters.map((ch, idx) => {
              const isSelected = ch.id === activeChapter?.id;
              return (
                <div
                  key={ch.id}
                  onClick={() => setSelectedChapterId(ch.id)}
                  className={`group p-3.5 rounded-2xl border text-left cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? "bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-transparent border-amber-400/80 ring-2 ring-amber-400/30 text-white shadow-md"
                      : "bg-stone-900/80 border-white/10 text-stone-300 hover:bg-stone-850 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-semibold text-xs line-clamp-1">
                      {ch.title || `Capítulo ${idx + 1}`}
                    </span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReorderChapter(ch.id, "up");
                        }}
                        disabled={idx === 0}
                        className="p-1 hover:text-amber-400 disabled:opacity-30"
                        title="Subir"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReorderChapter(ch.id, "down");
                        }}
                        disabled={idx === currentBook.chapters.length - 1}
                        className="p-1 hover:text-amber-400 disabled:opacity-30"
                        title="Bajar"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2 font-mono">
                    <span>
                      {ch.content.split(/\s+/).filter(Boolean).length} palabras
                    </span>
                    <span>Cap. {idx + 1}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chapter Prose Editor Area (Right 3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {activeChapter ? (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 space-y-4">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
                <input
                  type="text"
                  value={activeChapter.title}
                  onChange={(e) =>
                    onUpdateChapter(activeChapter.id, { title: e.target.value })
                  }
                  placeholder="Título del Capítulo..."
                  className="bg-transparent text-lg sm:text-xl font-bold font-display-book text-stone-100 focus:outline-none focus:border-b focus:border-amber-500 flex-1"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onGoToDictation(activeChapter.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition"
                  >
                    <Mic className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dictarle a este cap.</span>
                  </button>

                  {currentBook.chapters.length > 1 && (
                    <button
                      onClick={() => onDeleteChapter(activeChapter.id)}
                      className="p-1.5 rounded-lg bg-stone-800 hover:bg-red-950/60 text-stone-400 hover:text-red-400 border border-stone-700 transition"
                      title="Eliminar este capítulo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* AI Polishing Bar */}
              <div className="bg-stone-950/80 border border-white/10 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                    Ajustar y dar formato al capítulo
                  </span>

                  <div className="flex items-center gap-1.5">
                    <select
                      value={polishInstruction}
                      onChange={(e) => setPolishInstruction(e.target.value)}
                      className="bg-stone-800 text-stone-200 text-xs rounded-xl px-3 py-1.5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                    >
                      <option value="Corregir únicamente puntuación y orden de párrafos manteniendo las palabras exactas del autor">
                        ✨ Mantener mis palabras exactas y ordenar párrafos
                      </option>
                      <option value="Ajustar y estructurar diálogos con guiones largos (—) sin cambiar el vocabulario">
                        💬 Formatear diálogos con raya (—)
                      </option>
                      <option value="Enriquecer descripciones y ritmo literario conservando la voz del autor">
                        🌟 Enriquecer ritmo y sensorialidad
                      </option>
                      <option value="Corrección de ortografía y puntuación básica">
                        ✍️ Corrección ortográfica limpia
                      </option>
                    </select>

                    <button
                      type="button"
                      onClick={handleRefineWithAI}
                      disabled={isPolishing || !activeChapter.content.trim()}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-stone-950 font-bold text-xs transition disabled:opacity-50 flex items-center gap-1.5 shadow-md"
                    >
                      {isPolishing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Ajustando...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Acomodar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Polished Preview Diff Notice */}
                {polishedPreview && (
                  <div className="p-3 bg-stone-900 rounded-lg border border-amber-500/40 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-amber-300 font-semibold">
                      <span>Vista previa de versión pulida</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleApplyPolished}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Aplicar cambios</span>
                        </button>
                        <button
                          onClick={() => setPolishedPreview(null)}
                          className="px-2 py-1 text-stone-400 hover:text-stone-200"
                        >
                          Descartar
                        </button>
                      </div>
                    </div>
                    <div className="max-h-36 overflow-y-auto font-book text-stone-300 leading-relaxed bg-stone-950 p-2 rounded">
                      {polishedPreview}
                    </div>
                  </div>
                )}
              </div>

              {/* Textarea for chapter body */}
              <div className="space-y-1">
                <textarea
                  value={activeChapter.content}
                  onChange={(e) =>
                    onUpdateChapter(activeChapter.id, {
                      content: e.target.value,
                    })
                  }
                  rows={16}
                  placeholder="Escribe o edita el texto del capítulo aquí..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-sm font-book leading-relaxed text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Bottom word count stats */}
              <div className="flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-stone-800 font-mono">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    {wordCount.toLocaleString()} palabras
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />~
                    {readingTimeMin} min de lectura
                  </span>
                </div>
                <span>
                  Última edición:{" "}
                  {new Date(activeChapter.updatedAt).toLocaleTimeString("es-MX", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-stone-500">
              Selecciona o crea un capítulo para editar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
