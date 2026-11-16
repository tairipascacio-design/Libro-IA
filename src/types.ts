export type BookGenre =
  | "Novela de Ficción"
  | "Autobiografía / Memorias"
  | "Misterio y Suspenso"
  | "Desarrollo Personal / Ensayo"
  | "Fantasía / Ciencia Ficción"
  | "Crónica / Periodismo"
  | "Cuentos y Relatos"
  | "Poesía y Prosa Poética";

export type BookTone =
  | "Literario y Evocador"
  | "Intimo y Emocional"
  | "Dinámico y de Suspenso"
  | "Reflexivo y Filosófico"
  | "Cálido y Conversacional"
  | "Épico y Poético";

export type AppVibrantTheme = "sunset" | "fiesta" | "ocean" | "violet";

export type BookPaperTheme = "classic" | "peach" | "mint" | "lavender";

export interface BookChapter {
  id: string;
  order: number;
  title: string;
  summary?: string;
  content: string;
  wordCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
}

export interface TimelineEvent {
  id: string;
  timeContext: string;
  event: string;
  chapterId?: string;
}

export interface DictationLog {
  id: string;
  timestamp: string;
  rawText: string;
  mode: string;
  explanation: string;
  placementsCount: number;
}

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  genre: BookGenre;
  tone: BookTone;
  synopsis: string;
  chapters: BookChapter[];
  characters: Character[];
  timeline: TimelineEvent[];
  dictationHistory: DictationLog[];
  createdAt: string;
  updatedAt: string;
}

export interface DictationPlacement {
  action: "append" | "insert" | "create_chapter" | "update_chapter";
  targetChapterId?: string;
  newChapterTitle?: string;
  newChapterOrder?: number;
  polishedText: string;
  placementExplanation: string;
  chronologicalContext: string;
}

export interface OrganizeResult {
  analysisSummary: string;
  suggestedTitle?: string;
  suggestedSynopsis?: string;
  placements: DictationPlacement[];
  newCharacters?: Array<{ name: string; role: string; description: string }>;
  newTimelineEvents?: Array<{ timeContext: string; event: string }>;
}
