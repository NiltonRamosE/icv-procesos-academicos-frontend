// src/dashboard/groups/information/types.ts

export interface Participant {
  id: number;
  name: string;
  full_name?: string;
  role: string;
  expertise_area?: string;
}

export interface Class {
  id: number;
  class_name: string;
  class_date: string;
  start_time: string;
  end_time: string;
  description: string;
  class_status: string;
}

export interface PreviousCourse {
  previous_course_id: number;
  previous_course_title: string;
}

export interface Group {
  id: number;
  name: string;
  description: string | null;
  status: string;
  start_date: string;
  end_date: string;
  participants: Participant[];
  classes: Class[];
  previous_courses?: PreviousCourse[];
}