export type EntryType =
  | 'trait' | 'form' | 'session' | 'narration' | 'devotion'
  | 'dialogue' | 'wonderland' | 'signal' | 'imposition' | 'switch'
  | 'design' | 'dialogue_session' | 'practice'
  | 'autonomy' | 'resonance';

export type Speaker = 'self' | 'tulpa';
export type SenseType = 'visual' | 'audio' | 'smell' | 'touch' | 'taste';

export interface Stage {
  id: string;
  name: string;
  order: number;
  description: string;
  unlocked_at: string | null;
}

export interface Entry {
  id: number;
  stage_id: string;
  type: EntryType;
  title: string;
  content: string;
  tags: string;
  created_at: string;
  duration_seconds: number;
  mood: number | null;
}

export interface DialogueMessage {
  id: number;
  entry_id: number;
  speaker: Speaker;
  content: string;
  seq: number;
}

export interface Trait {
  id: number;
  name: string;
  description: string;
  weight: number;
  category: string;
}

export interface FormDetail {
  id: number;
  sense_type: SenseType;
  description: string;
}

export type DeviationTargetType = 'trait' | 'form';

export interface Deviation {
  id: number;
  target_type: DeviationTargetType;
  target_id: number;
  note: string;
  created_at: string;
}

export interface Milestone {
  id: number;
  stage_id: string;
  title: string;
  achieved_at: string | null;
  notes: string;
}

export interface ImpositionLevel {
  sense_type: SenseType;
  level: number;
}
