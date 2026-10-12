export type RealmType = 'uni' | 'work' | 'personal';

export type NoteType =
  | 'lecture'
  | 'assignment'
  | 'paper'
  | 'sprint'
  | 'meeting'
  | 'client'
  | 'journal'
  | 'concept'
  | 'note';

export interface NoteMetadata {
  title: string;
  realm: RealmType;
  type: NoteType;
  created: string;
  tags: string[];
  xp_value: number;
  status: 'active' | 'completed' | 'archived';
}

export interface NoteCreateDTO {
  title: string;
  realm: RealmType;
  type: NoteType;
  tags?: string[];
  body?: string;
  customBody?: string;
  targetFolder?: string;
}

export interface FileInfo {
  absolutePath: string;
  relativePath: string;
  fileName: string;
  title: string;
  realm: RealmType;
  type: NoteType;
  createdAt: string;
  modifiedAt: string;
  sizeBytes: number;
  tags: string[];
}

export interface WorkspacePathsConfig {
  academicPath: string; // e.g. "Academic"
  commercialPath: string; // e.g. "Commercial"
  sanctumPath: string; // e.g. "Sanctum"
}
