import { getRateLimitTool } from './getRateLimit.js';
import { getViewerTool } from './getViewer.js';
import { validateAuthTool } from './validateAuth.js';

export const diagnosticTools = [getRateLimitTool, getViewerTool, validateAuthTool];
