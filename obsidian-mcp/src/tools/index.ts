import type { ToolDefinition } from "../types.js";
import { appendToNoteTool } from "./appendToNote.js";
import { autoLinkSuggestionsTool } from "./autoLinkSuggestions.js";
import { bulkDeleteNotesTool } from "./bulkDeleteNotes.js";
import { completeTaskTool } from "./completeTask.js";
import { createNoteTool } from "./createNote.js";
import { createNoteFromTemplateTool } from "./createNoteFromTemplate.js";
import { createTaskTool } from "./createTask.js";
import { createTodayNoteTool } from "./createTodayNote.js";
import { deleteNoteTool } from "./deleteNote.js";
import { extractTasksTool } from "./extractTasks.js";
import { generateOutlineTool } from "./generateOutline.js";
import { getBacklinksTool } from "./getBacklinks.js";
import { getGraphNeighborhoodTool } from "./getGraphNeighborhood.js";
import { getHeadingsTool } from "./getHeadings.js";
import { getNoteTool } from "./getNote.js";
import { getNoteFrontmatterTool } from "./getNoteFrontmatter.js";
import { getNoteMetadataTool } from "./getNoteMetadata.js";
import { getOutgoingLinksTool } from "./getOutgoingLinks.js";
import { getRecentNotesTool } from "./getRecentNotes.js";
import { getRelatedNotesTool } from "./getRelatedNotes.js";
import { getTagsTool } from "./getTags.js";
import { getTodayNoteTool } from "./getTodayNote.js";
import { indexNoteTool } from "./indexNote.js";
import { indexVaultTool } from "./indexVault.js";
import { listDailyNotesTool } from "./listDailyNotes.js";
import { listNotesTool } from "./listNotes.js";
import { listTemplatesTool } from "./listTemplates.js";
import { listVaultInfoTool } from "./listVaultInfo.js";
import { moveNoteTool } from "./moveNote.js";
import { prependToNoteTool } from "./prependToNote.js";
import { renameNoteTool } from "./renameNote.js";
import { reopenTaskTool } from "./reopenTask.js";
import { replaceInNoteTool } from "./replaceInNote.js";
import { searchByFrontmatterTool } from "./searchByFrontmatter.js";
import { searchByTagTool } from "./searchByTag.js";
import { searchNotesTool } from "./searchNotes.js";
import { semanticSearchNotesTool } from "./semanticSearchNotes.js";
import { summarizeNoteTool } from "./summarizeNote.js";
import { summarizeNotesBatchTool } from "./summarizeNotesBatch.js";
import { updateNoteTool } from "./updateNote.js";
import { validateVaultTool } from "./validateVault.js";

export const TOOLS: ToolDefinition[] = [
  listVaultInfoTool,
  listNotesTool,
  getNoteTool,
  getNoteMetadataTool,
  getNoteFrontmatterTool,
  createNoteTool,
  createNoteFromTemplateTool,
  updateNoteTool,
  appendToNoteTool,
  prependToNoteTool,
  replaceInNoteTool,
  renameNoteTool,
  moveNoteTool,
  deleteNoteTool,
  bulkDeleteNotesTool,
  searchNotesTool,
  searchByTagTool,
  searchByFrontmatterTool,
  semanticSearchNotesTool,
  getRecentNotesTool,
  getBacklinksTool,
  getOutgoingLinksTool,
  getRelatedNotesTool,
  getGraphNeighborhoodTool,
  autoLinkSuggestionsTool,
  getTagsTool,
  getHeadingsTool,
  extractTasksTool,
  createTaskTool,
  completeTaskTool,
  reopenTaskTool,
  listDailyNotesTool,
  getTodayNoteTool,
  createTodayNoteTool,
  listTemplatesTool,
  summarizeNoteTool,
  summarizeNotesBatchTool,
  generateOutlineTool,
  indexVaultTool,
  indexNoteTool,
  validateVaultTool,
];
