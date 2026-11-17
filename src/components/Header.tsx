import React from "react";
import {
  Book as BookIcon,
  Mic,
  PenTool,
  Users,
  Palette,
  Download,
  PlusCircle,
  Sparkles,
  Sun,
  Smartphone,
} from "lucide-react";
import { Book, BookPaperTheme, AppVibrantTheme } from "../types";

interface HeaderProps {
  currentBook: Book;
  allBooks: Book[];
  onSelectBook: (bookId: string) => void;
  onNewBook: () => void;
  activeTab: "reader" | "dictation" | "editor" | "characters";
  setActiveTab: (tab: "reader" | "dictation" | "editor" | "characters") => void;
  paperTheme: BookPaperTheme;
  setPaperTheme: (theme: BookPaperTheme) => void;
  vibrantTheme: AppVibrantTheme;
  setVibrantTheme: (theme: AppVibrantTheme) => void;
  fontSize: number;
  setFontSize: React.Dispatch<React.SetStateAction<number>>;
  onOpenExport: () => void;
  onOpenAndroidApk: () => void;
  totalWords: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentBook,
  allBooks,
  onSelectBook,
  onNewBook,
  activeTab,
  setActiveTab,
  paperTheme,
  setPaperTheme,
  vibrantTheme,
  setVibrantTheme,
  fontSize,
  setFontSize,
  onOpenExport,
  onOpenAndroidApk,
  totalWords,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-900/90 backdrop-blur-md text-stone-100 border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Book Selector */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-500 p-0.5 shadow-md shadow-rose-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-stone-900 rounded-[14px] flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-400 via-rose-400 to-violet-400 bg-clip-text text-transparent">
                Voz a Libro
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-200 border border-amber-500/30 font-medium">
                {currentBook.genre}
              </span>
            </div>

            {/* Book selector */}
            <div className="flex items-center gap-2 mt-0.5">
              <select
                value={currentBook.id}
                onChange={(e) => onSelectBook(e.target.value)}
                className="bg-stone-800/90 hover:bg-stone-750 text-stone-100 text-sm font-semibold rounded-lg px-2.5 py-0.5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer max-w-[200px] sm:max-w-[280px] truncate"
              >
                {allBooks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title || "Sin título"}
                  </option>
                ))}
              </select>

              <button
                onClick={onNewBook}
                title="Crear nuevo libro"
                className="p-1 text-stone-400 hover:text-amber-300 hover:bg-stone-800 rounded-lg transition"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs with Vibrant Active States */}
        <nav className="flex items-center bg-stone-850/80 p-1 rounded-2xl border border-white/10 shadow-inner">
          <button
            onClick={() => setActiveTab("dictation")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition ${
              activeTab === "dictation"
                ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md font-bold"
                : "text-stone-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Dictar</span>
          </button>

          <button
            onClick={() => setActiveTab("reader")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition ${
              activeTab === "reader"
                ? "bg-gradient-to-r from-rose-500 to-violet-500 text-white shadow-md font-bold"
                : "text-stone-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <BookIcon className="w-4 h-4" />
            <span>Leer Libro</span>
          </button>

          <button
            onClick={() => setActiveTab("editor")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition ${
              activeTab === "editor"
                ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-md font-bold"
                : "text-stone-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span className="hidden sm:inline">Manuscrito</span>
          </button>

          <button
            onClick={() => setActiveTab("characters")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition ${
              activeTab === "characters"
                ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-md font-bold"
                : "text-stone-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden md:inline">Personajes & Trama</span>
          </button>
        </nav>

        {/* Vibrant Mood Theme & Paper Picker */}
        <div className="flex items-center gap-2.5">
          {/* App Mood Selector */}
          <div className="flex items-center gap-1 bg-stone-850 p-1 rounded-xl border border-white/10" title="Colores de la aplicación">
            <button
              onClick={() => setVibrantTheme("sunset")}
              title="Atardecer Cálido"
              className={`w-5 h-5 rounded-full transition-transform ${
                vibrantTheme === "sunset" ? "ring-2 ring-amber-400 scale-110" : "opacity-60 hover:opacity-100"
              }`}
              style={{ background: "linear-gradient(135deg, #ff5e62, #ff9966)" }}
            />
            <button
              onClick={() => setVibrantTheme("fiesta")}
              title="Fiesta Rosa & Oro"
              className={`w-5 h-5 rounded-full transition-transform ${
                vibrantTheme === "fiesta" ? "ring-2 ring-rose-400 scale-110" : "opacity-60 hover:opacity-100"
              }`}
              style={{ background: "linear-gradient(135deg, #f43f5e, #fbbf24)" }}
            />
            <button
              onClick={() => setVibrantTheme("ocean")}
              title="Brisa Turquesa"
              className={`w-5 h-5 rounded-full transition-transform ${
                vibrantTheme === "ocean" ? "ring-2 ring-cyan-400 scale-110" : "opacity-60 hover:opacity-100"
              }`}
              style={{ background: "linear-gradient(135deg, #06b6d4, #10b981)" }}
            />
            <button
              onClick={() => setVibrantTheme("violet")}
              title="Aurora Violeta"
              className={`w-5 h-5 rounded-full transition-transform ${
                vibrantTheme === "violet" ? "ring-2 ring-violet-400 scale-110" : "opacity-60 hover:opacity-100"
              }`}
              style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}
            />
          </div>

          {/* Book Paper Color Picker */}
          <div className="hidden sm:flex items-center gap-1 bg-stone-850 p-1 rounded-xl border border-white/10" title="Textura de papel del libro">
            <button
              onClick={() => setPaperTheme("classic")}
              title="Crema Dorada"
              className={`w-5 h-5 rounded-full border transition-transform ${
                paperTheme === "classic" ? "ring-2 ring-amber-400 scale-110" : "border-white/20"
              }`}
              style={{ backgroundColor: "#fffdf2" }}
            />
            <button
              onClick={() => setPaperTheme("peach")}
              title="Melocotón Alegre"
              className={`w-5 h-5 rounded-full border transition-transform ${
                paperTheme === "peach" ? "ring-2 ring-rose-400 scale-110" : "border-white/20"
              }`}
              style={{ backgroundColor: "#fff5eb" }}
            />
            <button
              onClick={() => setPaperTheme("mint")}
              title="Menta Fresca"
              className={`w-5 h-5 rounded-full border transition-transform ${
                paperTheme === "mint" ? "ring-2 ring-emerald-400 scale-110" : "border-white/20"
              }`}
              style={{ backgroundColor: "#f0fdf4" }}
            />
            <button
              onClick={() => setPaperTheme("lavender")}
              title="Lavanda Mágica"
              className={`w-5 h-5 rounded-full border transition-transform ${
                paperTheme === "lavender" ? "ring-2 ring-violet-400 scale-110" : "border-white/20"
              }`}
              style={{ backgroundColor: "#faf5ff" }}
            />
          </div>

          {/* Font size */}
          <div className="hidden sm:flex items-center bg-stone-850 rounded-xl border border-white/10 px-1 text-xs">
            <button
              onClick={() => setFontSize((s) => Math.max(14, s - 1))}
              className="px-2 py-1 text-stone-300 hover:text-white"
            >
              A-
            </button>
            <span className="text-amber-400 font-mono text-[11px] px-1">{fontSize}px</span>
            <button
              onClick={() => setFontSize((s) => Math.min(26, s + 1))}
              className="px-2 py-1 text-stone-300 hover:text-white"
            >
              A+
            </button>
          </div>

          {/* Descargar APK / Android */}
          <button
            onClick={onOpenAndroidApk}
            title="Instalar en Android o Descargar APK"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-stone-950 font-extrabold text-xs transition shadow-md shadow-emerald-500/20"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Descargar APK</span>
          </button>

          {/* Export */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-stone-950 font-bold text-xs transition shadow-md shadow-rose-500/10"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
