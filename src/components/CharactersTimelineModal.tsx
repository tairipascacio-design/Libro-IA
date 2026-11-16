import React, { useState } from "react";
import { Users, Clock, Plus, Trash2, Edit2, Check, Sparkles, BookOpen } from "lucide-react";
import { Book, Character, TimelineEvent } from "../types";

interface CharactersTimelineProps {
  currentBook: Book;
  onUpdateBook: (updated: Partial<Book>) => void;
}

export const CharactersTimelineModal: React.FC<CharactersTimelineProps> = ({
  currentBook,
  onUpdateBook,
}) => {
  const [activeTab, setActiveTab] = useState<"characters" | "timeline">("characters");

  // Character form state
  const [newCharName, setNewCharName] = useState("");
  const [newCharRole, setNewCharRole] = useState("");
  const [newCharDesc, setNewCharDesc] = useState("");

  // Timeline form state
  const [newTlTime, setNewTlTime] = useState("");
  const [newTlEvent, setNewTlEvent] = useState("");

  const handleAddCharacter = () => {
    if (!newCharName.trim()) return;
    const newChar: Character = {
      id: `char-${Date.now()}`,
      name: newCharName.trim(),
      role: newCharRole.trim() || "Personaje secundario",
      description: newCharDesc.trim() || "Sin descripción",
    };
    onUpdateBook({
      characters: [...currentBook.characters, newChar],
    });
    setNewCharName("");
    setNewCharRole("");
    setNewCharDesc("");
  };

  const handleDeleteCharacter = (id: string) => {
    onUpdateBook({
      characters: currentBook.characters.filter((c) => c.id !== id),
    });
  };

  const handleAddTimeline = () => {
    if (!newTlEvent.trim()) return;
    const newEvent: TimelineEvent = {
      id: `tl-${Date.now()}`,
      timeContext: newTlTime.trim() || "En el curso de la historia",
      event: newTlEvent.trim(),
    };
    onUpdateBook({
      timeline: [...currentBook.timeline, newEvent],
    });
    setNewTlTime("");
    setNewTlEvent("");
  };

  const handleDeleteTimeline = (id: string) => {
    onUpdateBook({
      timeline: currentBook.timeline.filter((t) => t.id !== id),
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Tab bar */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("characters")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm ${
              activeTab === "characters"
                ? "bg-gradient-to-r from-amber-400 to-rose-500 text-stone-950"
                : "text-stone-300 hover:text-white bg-stone-900 hover:bg-stone-850"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Ficha de Personajes ({currentBook.characters.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("timeline")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm ${
              activeTab === "timeline"
                ? "bg-gradient-to-r from-rose-500 to-violet-500 text-white"
                : "text-stone-300 hover:text-white bg-stone-900 hover:bg-stone-850"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Línea Temporal de Hechos ({currentBook.timeline.length})</span>
          </button>
        </div>

        <span className="text-xs text-stone-400 hidden sm:inline">
          La IA actualiza esto automáticamente al dictar
        </span>
      </div>

      {activeTab === "characters" ? (
        <div className="space-y-6">
          {/* Add Character Form */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Añadir Personaje al Reparto
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nombre del personaje (ej: Don Valerio)"
                value={newCharName}
                onChange={(e) => setNewCharName(e.target.value)}
                className="bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                placeholder="Rol o arquetipo (ej: Protagonista, Maestro relojero)"
                value={newCharRole}
                onChange={(e) => setNewCharRole(e.target.value)}
                className="bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <textarea
              placeholder="Descripción breve, motivaciones o rasgos particulares..."
              value={newCharDesc}
              onChange={(e) => setNewCharDesc(e.target.value)}
              rows={2}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
            <div className="text-right">
              <button
                onClick={handleAddCharacter}
                disabled={!newCharName.trim()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-stone-950 font-black text-xs transition shadow-md disabled:opacity-40"
              >
                Guardar Personaje
              </button>
            </div>
          </div>

          {/* Characters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentBook.characters.map((char) => (
              <div
                key={char.id}
                className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-2 relative group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-display-book font-bold text-base text-stone-100">
                      {char.name}
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 inline-block mt-1 font-medium">
                      {char.role}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteCharacter(char.id)}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-800 transition"
                    title="Eliminar personaje"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed pt-2">
                  {char.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Timeline Tab */
        <div className="space-y-6">
          {/* Add Timeline Event Form */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Añadir Hito Cronológico
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Momento temporal (ej: Hace diez años, 5:17 PM)"
                value={newTlTime}
                onChange={(e) => setNewTlTime(e.target.value)}
                className="bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                placeholder="¿Qué sucedió en la historia?"
                value={newTlEvent}
                onChange={(e) => setNewTlEvent(e.target.value)}
                className="sm:col-span-2 bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="text-right">
              <button
                onClick={handleAddTimeline}
                disabled={!newTlEvent.trim()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-violet-500 hover:from-rose-400 hover:to-violet-400 text-white font-black text-xs transition shadow-md disabled:opacity-40"
              >
                Añadir a la Línea de Tiempo
              </button>
            </div>
          </div>

          {/* Timeline List */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-500/30">
            {currentBook.timeline.map((item) => (
              <div key={item.id} className="relative group">
                <span className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-stone-900" />
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {item.timeContext}
                    </span>
                    <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-sans">
                      {item.event}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteTimeline(item.id)}
                    className="p-1 rounded text-stone-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                    title="Eliminar hito"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
