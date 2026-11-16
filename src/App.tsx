/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { Header } from "./components/Header";
import { RealisticBookView } from "./components/RealisticBookView";
import { DictationStudio } from "./components/DictationStudio";
import { ChapterEditor } from "./components/ChapterEditor";
import { CharactersTimelineModal } from "./components/CharactersTimelineModal";
import { ExportModal } from "./components/ExportModal";
import { NewBookModal } from "./components/NewBookModal";
import { ReorganizationModal } from "./components/ReorganizationModal";
import {
  Book,
  BookChapter,
  BookPaperTheme,
  AppVibrantTheme,
  OrganizeResult,
  Character,
  TimelineEvent,
  DictationLog,
} from "./types";
import {
  loadBooksFromStorage,
  saveBooksToStorage,
  loadActiveBookId,
  saveActiveBookId,
  DEFAULT_SAMPLE_BOOK,
} from "./utils/storage";

export default function App() {
  const [books, setBooks] = useState<Book[]>(() => loadBooksFromStorage());
  const [activeBookId, setActiveBookId] = useState<string>(() => loadActiveBookId());

  const [activeTab, setActiveTab] = useState<
    "dictation" | "reader" | "editor" | "characters"
  >("dictation");

  const [vibrantTheme, setVibrantTheme] = useState<AppVibrantTheme>("sunset");
  const [paperTheme, setPaperTheme] = useState<BookPaperTheme>("classic");
  const [fontSize, setFontSize] = useState<number>(18);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");

  const [showExportModal, setShowExportModal] = useState(false);
  const [showNewBookModal, setShowNewBookModal] = useState(false);

  // Modal after reorganization
  const [reorganizationData, setReorganizationData] = useState<{
    result: OrganizeResult;
    rawText: string;
  } | null>(null);

  // Find active book
  const currentBook = useMemo(() => {
    return books.find((b) => b.id === activeBookId) || books[0] || DEFAULT_SAMPLE_BOOK;
  }, [books, activeBookId]);

  // Persist books when updated
  useEffect(() => {
    saveBooksToStorage(books);
  }, [books]);

  // Persist active book ID
  useEffect(() => {
    if (currentBook) {
      saveActiveBookId(currentBook.id);
      if (
        !selectedChapterId ||
        !currentBook.chapters.some((c) => c.id === selectedChapterId)
      ) {
        if (currentBook.chapters.length > 0) {
          setSelectedChapterId(currentBook.chapters[0].id);
        }
      }
    }
  }, [currentBook?.id]);

  // Total words calculation
  const totalWords = useMemo(() => {
    return currentBook.chapters.reduce((sum, ch) => {
      const words = ch.content.split(/\s+/).filter(Boolean).length;
      return sum + words;
    }, 0);
  }, [currentBook.chapters]);

  // Update book helper
  const updateCurrentBook = (updates: Partial<Book>) => {
    setBooks((prevBooks) =>
      prevBooks.map((b) =>
        b.id === currentBook.id
          ? { ...b, ...updates, updatedAt: new Date().toISOString() }
          : b
      )
    );
  };

  // Switch book
  const handleSelectBook = (bookId: string) => {
    setActiveBookId(bookId);
    const target = books.find((b) => b.id === bookId);
    if (target && target.chapters.length > 0) {
      setSelectedChapterId(target.chapters[0].id);
    }
  };

  // Create new book
  const handleCreateBook = (newBook: Book) => {
    setBooks((prev) => [newBook, ...prev]);
    setActiveBookId(newBook.id);
    if (newBook.chapters.length > 0) {
      setSelectedChapterId(newBook.chapters[0].id);
    }
    setActiveTab("dictation");
  };

  // Chapter operations
  const handleUpdateChapter = (
    chapterId: string,
    updates: Partial<BookChapter>
  ) => {
    const updatedChapters = currentBook.chapters.map((ch) =>
      ch.id === chapterId
        ? { ...ch, ...updates, updatedAt: new Date().toISOString() }
        : ch
    );
    updateCurrentBook({ chapters: updatedChapters });
  };

  const handleAddChapter = () => {
    const nextOrder = currentBook.chapters.length + 1;
    const newChapter: BookChapter = {
      id: `ch-${Date.now()}`,
      order: nextOrder,
      title: `Capítulo ${nextOrder}: Nuevo Capítulo`,
      summary: "Capítulo creado para continuar la obra.",
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updateCurrentBook({ chapters: [...currentBook.chapters, newChapter] });
    setSelectedChapterId(newChapter.id);
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (currentBook.chapters.length <= 1) return;
    const filtered = currentBook.chapters.filter((c) => c.id !== chapterId);
    updateCurrentBook({ chapters: filtered });
    if (selectedChapterId === chapterId && filtered.length > 0) {
      setSelectedChapterId(filtered[0].id);
    }
  };

  const handleReorderChapter = (chapterId: string, direction: "up" | "down") => {
    const list = [...currentBook.chapters];
    const index = list.findIndex((c) => c.id === chapterId);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // renumber orders
    const updated = list.map((c, idx) => ({ ...c, order: idx + 1 }));
    updateCurrentBook({ chapters: updated });
  };

  // Apply Organize Result from Dictation Studio
  const handleApplyOrganizeResult = (
    result: OrganizeResult,
    rawText: string
  ) => {
    let chapters = [...currentBook.chapters];
    let newlyCreatedChapterId: string | undefined;

    // Process placements
    result.placements.forEach((placement) => {
      if (placement.action === "create_chapter") {
        const nextOrder = placement.newChapterOrder || chapters.length + 1;
        const newChId = `ch-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        newlyCreatedChapterId = newChId;
        const newChapter: BookChapter = {
          id: newChId,
          order: nextOrder,
          title: placement.newChapterTitle || `Capítulo ${nextOrder}`,
          summary: placement.placementExplanation,
          content: placement.polishedText.trim(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Insert at target order or append
        if (placement.newChapterOrder && placement.newChapterOrder <= chapters.length) {
          chapters.splice(placement.newChapterOrder - 1, 0, newChapter);
        } else {
          chapters.push(newChapter);
        }
      } else {
        // Find existing chapter
        const targetId = placement.targetChapterId || selectedChapterId || chapters[0]?.id;
        const targetIndex = chapters.findIndex((c) => c.id === targetId);

        if (targetIndex !== -1) {
          const target = chapters[targetIndex];
          const existingContent = target.content.trim();

          let newContent = "";
          if (placement.action === "insert") {
            // Chronologically before existing text
            newContent = existingContent
              ? `${placement.polishedText.trim()}\n\n${existingContent}`
              : placement.polishedText.trim();
          } else {
            // Default append
            newContent = existingContent
              ? `${existingContent}\n\n${placement.polishedText.trim()}`
              : placement.polishedText.trim();
          }

          chapters[targetIndex] = {
            ...target,
            content: newContent,
            updatedAt: new Date().toISOString(),
          };
        } else if (chapters.length > 0) {
          // Fallback to first chapter
          chapters[0] = {
            ...chapters[0],
            content: (chapters[0].content ? chapters[0].content + "\n\n" : "") + placement.polishedText.trim(),
            updatedAt: new Date().toISOString(),
          };
        }
      }
    });

    // Re-index order numbers
    chapters = chapters.map((c, idx) => ({ ...c, order: idx + 1 }));

    // Extract characters
    let characters = [...currentBook.characters];
    if (result.newCharacters && result.newCharacters.length > 0) {
      result.newCharacters.forEach((nc) => {
        if (!characters.some((c) => c.name.toLowerCase() === nc.name.toLowerCase())) {
          characters.push({
            id: `char-${Date.now()}-${Math.random()}`,
            name: nc.name,
            role: nc.role,
            description: nc.description,
          });
        }
      });
    }

    // Extract timeline
    let timeline = [...currentBook.timeline];
    if (result.newTimelineEvents && result.newTimelineEvents.length > 0) {
      result.newTimelineEvents.forEach((ne) => {
        timeline.push({
          id: `tl-${Date.now()}-${Math.random()}`,
          timeContext: ne.timeContext,
          event: ne.event,
        });
      });
    }

    // Dictation history log
    const logItem: DictationLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      rawText: rawText,
      mode: "Reorganización Inteligente",
      explanation: result.analysisSummary,
      placementsCount: result.placements.length,
    };

    updateCurrentBook({
      chapters,
      characters,
      timeline,
      title: result.suggestedTitle || currentBook.title,
      synopsis: result.suggestedSynopsis || currentBook.synopsis,
      dictationHistory: [logItem, ...(currentBook.dictationHistory || [])],
    });

    if (newlyCreatedChapterId) {
      setSelectedChapterId(newlyCreatedChapterId);
    }

    // Show reorganization details modal to author
    setReorganizationData({ result, rawText });
  };

  const handleGoToDictationForChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setActiveTab("dictation");
  };

  return (
    <div
      className={`min-h-screen text-stone-100 flex flex-col antialiased selection:bg-rose-400 selection:text-stone-950 theme-${vibrantTheme}`}
      style={{ background: "var(--bg-gradient)" }}
    >
      {/* App Header */}
      <Header
        currentBook={currentBook}
        allBooks={books}
        onSelectBook={handleSelectBook}
        onNewBook={() => setShowNewBookModal(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        paperTheme={paperTheme}
        setPaperTheme={setPaperTheme}
        vibrantTheme={vibrantTheme}
        setVibrantTheme={setVibrantTheme}
        fontSize={fontSize}
        setFontSize={setFontSize}
        onOpenExport={() => setShowExportModal(true)}
        totalWords={totalWords}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === "dictation" && (
          <DictationStudio
            currentBook={currentBook}
            onApplyOrganizeResult={handleApplyOrganizeResult}
            onSelectChapter={(id) => {
              setSelectedChapterId(id);
              setActiveTab("reader");
            }}
            selectedChapterId={selectedChapterId}
            setSelectedChapterId={setSelectedChapterId}
          />
        )}

        {activeTab === "reader" && (
          <RealisticBookView
            currentBook={currentBook}
            paperTheme={paperTheme}
            fontSize={fontSize}
            onGoToDictationForChapter={handleGoToDictationForChapter}
            selectedChapterId={selectedChapterId}
            setSelectedChapterId={setSelectedChapterId}
          />
        )}

        {activeTab === "editor" && (
          <ChapterEditor
            currentBook={currentBook}
            onUpdateChapter={handleUpdateChapter}
            onAddChapter={handleAddChapter}
            onDeleteChapter={handleDeleteChapter}
            onReorderChapter={handleReorderChapter}
            selectedChapterId={selectedChapterId}
            setSelectedChapterId={setSelectedChapterId}
            onGoToDictation={handleGoToDictationForChapter}
          />
        )}

        {activeTab === "characters" && (
          <CharactersTimelineModal
            currentBook={currentBook}
            onUpdateBook={updateCurrentBook}
          />
        )}
      </main>

      {/* Reorganization Modal (Shown after dictation is structured) */}
      {reorganizationData && (
        <ReorganizationModal
          result={reorganizationData.result}
          rawText={reorganizationData.rawText}
          onClose={() => setReorganizationData(null)}
          onViewChapter={(chId) => {
            if (chId) setSelectedChapterId(chId);
            setActiveTab("reader");
            setReorganizationData(null);
          }}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          currentBook={currentBook}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* New Book Modal */}
      {showNewBookModal && (
        <NewBookModal
          onClose={() => setShowNewBookModal(false)}
          onCreateBook={handleCreateBook}
        />
      )}
    </div>
  );
}
