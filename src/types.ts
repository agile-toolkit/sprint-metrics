export interface Sprint {
  id: string;
  name: string;
  planned: number;
  completed: number;
  carriedOver: number;
  startDate: string;
  endDate: string;
}

export interface Project {
  id: string;
  name: string;
  totalScope: number;
  sprints: Sprint[];
  createdAt: string;
  updatedAt: string;
}

export type View = 'data' | 'velocity' | 'burndown' | 'burnup' | 'forecast';
