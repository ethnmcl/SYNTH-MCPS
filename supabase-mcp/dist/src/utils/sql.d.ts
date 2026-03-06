export declare function quoteIdent(identifier: string): string;
export declare function qualifyTable(schema: string, table: string): string;
export declare function escapeLiteral(value: string): string;
export declare function vectorToSql(values: number[]): string;
export declare function isReadOnlySql(sql: string): boolean;
