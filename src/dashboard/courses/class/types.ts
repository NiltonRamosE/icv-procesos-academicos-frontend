// types.ts
export interface ClassData {
  id: number;
  group_id: number;
  class_name: string;
  description: string | null;
  class_date: string;
  start_time: string;
  end_time: string;
  meeting_url: string | null;
  class_status: string;
  created_at: string;
}

export interface Material {
  id: number;
  class_id: number;
  material_url: string;
  type: string;
  created_at: string;
}

export type MaterialType = 'PDF' | 'DOCX' | 'PPTX' | 'XLSX' | 'VIDEO' | 'IMAGEN' | 'ENLACE';