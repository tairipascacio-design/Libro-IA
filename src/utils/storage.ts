import { Book } from "../types";

const STORAGE_KEY_BOOKS = "voz_a_libro_books_v1";
const STORAGE_KEY_CURRENT_ID = "voz_a_libro_active_id_v1";

export const DEFAULT_SAMPLE_BOOK: Book = {
  id: "sample-book-1",
  title: "El Secreto del Viejo Relojero",
  subtitle: "Crónicas de un tiempo suspendido",
  author: "Tairí Pascacio",
  genre: "Misterio y Suspenso",
  tone: "Literario y Evocador",
  synopsis:
    "En una pequeña villa enclavada en las montañas, un relojero guarda en sus máquinas mecanismos que no solo miden las horas, sino los recuerdos olvidados de quienes las habitan. A través de memorias desordenadas y confesiones a contratiempo, la verdad de su pasado comienza a salir a la luz.",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  chapters: [
    {
      id: "ch-1",
      order: 1,
      title: "Capítulo I: El Taller de las Horas Muertas",
      summary: "Introducción al taller y la atmósfera entre péndulos y engranajes de bronce.",
      content: `El polvo danzaba en los haces de luz dorada que atravesaban los ventanales del viejo taller. En aquel rincón olvidado del mundo, el tiempo no transcurría como en el resto de la villa; allí, cada segundo quedaba atrapado en el tintineo metálico de trescientos relojes que latían al unísono, como corazones mecánicos en un pecho de madera y latón.

Don Valerio jamás miraba las agujas de las paredes para saber la hora. Le bastaba escuchar el rumor sordo del péndulo de pie que custodiaba la entrada. Sin embargo, aquella tarde de noviembre, una anomalía quebró la cadencia: el gran reloj astronómico de la chimenea se detuvo exactamente a las cinco y diecisiete minutos.

—No puede ser —susurró el anciano, ajustándose las lupas de relojero sobre los ojos cansados—. Ese engranaje fue forjado para no detenerse jamás, a menos que alguien haya tocado la cuerda equivocada.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "ch-2",
      order: 2,
      title: "Capítulo II: La Llave de Madera de Olivo",
      summary: "Aparición de la carta escondida y el misterio de la llave sin cerradura.",
      content: `Bajo el suelo entarimado, en un compartimento que solo cedía tras presionar tres clavos alineados, reposaba una caja de olivo pulido. Durante más de cuarenta años, Valerio se había negado a rozar su cerradura. Creía, con la superstición propia de los hombres que viven entre autómatas, que abrirla desencadenaría una marea de memorias imposibles de contener.

La carta que acompañaba a la llave estaba escrita con una caligrafía temblorosa, casi infantil. «Si has llegado a leer esto», decía la primera línea, «es porque las campanas de San Jerónimo han dejado de sonar y el río ha vuelto a cambiar su cauce».

Afuera, la bruma comenzaba a devorar las colinas, y los pasos apresurados de un forastero resonaron sobre el empedrado húmedo de la calle Mayor.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  characters: [
    {
      id: "char-1",
      name: "Don Valerio",
      role: "Protagonista / Maestro Relojero",
      description: "Anciano sabio, meticuloso, guardián del tiempo y de secretos antiguos de la villa.",
    },
    {
      id: "char-2",
      name: "El Forastero del Río",
      role: "Antagonista o mensajero misterioso",
      description: "Hombre cubierto con un abrigo oscuro que llega a la villa tras detenerse el reloj astronómico.",
    },
  ],
  timeline: [
    {
      id: "tl-1",
      timeContext: "Cuarenta años antes",
      event: "Se forja el gran reloj astronómico y se oculta la caja de olivo.",
      chapterId: "ch-2",
    },
    {
      id: "tl-2",
      timeContext: "Noviembre, 5:17 PM",
      event: "El reloj astronómico se detiene misteriosamente en el taller.",
      chapterId: "ch-1",
    },
  ],
  dictationHistory: [
    {
      id: "log-sample-1",
      timestamp: new Date().toISOString(),
      rawText: "Fíjate que al final descubrieron la carta secreta en el desván, pero espera, antes de eso, cuando era niño a los diez años su abuelo siempre le advertía que nunca abriera el cajón de roble...",
      mode: "Acomodo Cronológico",
      explanation: "Se mantuvieron tus palabras exactas: la advertencia de la infancia se acomodó primero cronológicamente en el Capítulo I, y el descubrimiento final se ubicó en el Capítulo II.",
      placementsCount: 2,
    },
  ],
};

export function loadBooksFromStorage(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKS);
    if (!raw) {
      saveBooksToStorage([DEFAULT_SAMPLE_BOOK]);
      return [DEFAULT_SAMPLE_BOOK];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [DEFAULT_SAMPLE_BOOK];
  } catch (e) {
    console.error("Error reading books from localStorage:", e);
    return [DEFAULT_SAMPLE_BOOK];
  }
}

export function saveBooksToStorage(books: Book[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
  } catch (e) {
    console.error("Error saving books to localStorage:", e);
  }
}

export function loadActiveBookId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_CURRENT_ID) || DEFAULT_SAMPLE_BOOK.id;
  } catch {
    return DEFAULT_SAMPLE_BOOK.id;
  }
}

export function saveActiveBookId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_CURRENT_ID, id);
  } catch (e) {
    console.error("Error saving active book ID:", e);
  }
}
