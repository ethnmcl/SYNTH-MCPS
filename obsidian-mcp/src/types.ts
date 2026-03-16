export type JsonSchema = {
  $schema?: string;
  type?: string;
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: string[];
  additionalProperties?: boolean | JsonSchema;
  enum?: Array<string | number | boolean | null>;
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  allOf?: JsonSchema[];
  description?: string;
  title?: string;
  default?: unknown;
  format?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  [key: string]: unknown;
};

export interface NoteRef {
  note: string;
}

export interface NoteLink {
  raw: string;
  target: string;
  alias?: string;
  isWiki: boolean;
  line: number;
}

export interface Heading {
  level: number;
  text: string;
  line: number;
}

export interface MarkdownTask {
  line: number;
  text: string;
  completed: boolean;
  raw: string;
}

export interface NoteMetadata {
  path: string;
  title: string;
  basename: string;
  sizeBytes: number;
  createdAt: string;
  modifiedAt: string;
  tags: string[];
}

export interface ParsedNote extends NoteMetadata {
  content: string;
  frontmatter: Record<string, unknown>;
  headings: Heading[];
  links: NoteLink[];
  tasks: MarkdownTask[];
}

export interface SearchResult {
  note: NoteMetadata;
  score: number;
  snippet?: string;
  matchedFields?: string[];
}

export interface GraphEdge {
  source: string;
  target: string;
  type: "wiki" | "markdown" | "tag" | "semantic";
  weight?: number;
}

export interface GraphNode {
  id: string;
  title: string;
  path: string;
}

export interface EmbeddingChunk {
  id: string;
  notePath: string;
  text: string;
  vector: number[];
  updatedAt: string;
}

export interface EmbeddingSearchResult {
  notePath: string;
  score: number;
  chunkId: string;
  excerpt: string;
}

export interface ObsidianMcpConfig {
  vaultPath: string;
  trashDir: string;
  dailyNotesDir: string;
  templatesDir: string;
  defaultNoteExtension: string;
  enableSemanticSearch: boolean;
  embeddingProvider: "local-stub";
  maxFileSizeBytes: number;
  allowedWrite: boolean;
  allowedDelete: boolean;
  indexCacheFile: string;
  timezone: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  execute: (context: ToolContext, input: Record<string, unknown>) => Promise<unknown>;
}

export interface ToolContext {
  config: ObsidianMcpConfig;
  services: ServiceContainer;
}

export interface ServiceContainer {
  vaultService: import("./services/vaultService.js").VaultService;
  noteService: import("./services/noteService.js").NoteService;
  searchService: import("./services/searchService.js").SearchService;
  graphService: import("./services/graphService.js").GraphService;
  taskService: import("./services/taskService.js").TaskService;
  dailyNoteService: import("./services/dailyNoteService.js").DailyNoteService;
  templateService: import("./services/templateService.js").TemplateService;
  embeddingService: import("./services/embeddingService.js").EmbeddingService;
  indexerService: import("./services/indexerService.js").IndexerService;
}
