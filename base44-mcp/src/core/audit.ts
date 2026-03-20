export interface AuditEntry {
  id: string;
  timestamp: string;
  toolName: string;
  action: string;
  payload: Record<string, unknown>;
}

const entries: AuditEntry[] = [];

export const addAuditEntry = (entry: Omit<AuditEntry, 'id' | 'timestamp'>): AuditEntry => {
  const full: AuditEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString()
  };
  entries.push(full);
  return full;
};

export const listAuditEntries = (): AuditEntry[] => [...entries];
export const clearAuditEntries = (): number => {
  const count = entries.length;
  entries.length = 0;
  return count;
};
