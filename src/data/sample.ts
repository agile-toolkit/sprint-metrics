import type { SprintData, ProjectConfig } from '../types'

export const SAMPLE_SPRINTS: SprintData[] = [
  { id: '1', name: 'Sprint 1', planned: 40, completed: 32, carriedOver: 8 },
  { id: '2', name: 'Sprint 2', planned: 38, completed: 35, carriedOver: 3 },
  { id: '3', name: 'Sprint 3', planned: 42, completed: 38, carriedOver: 4 },
  { id: '4', name: 'Sprint 4', planned: 40, completed: 40, carriedOver: 0 },
  { id: '5', name: 'Sprint 5', planned: 45, completed: 36, carriedOver: 9 },
  { id: '6', name: 'Sprint 6', planned: 38, completed: 39, carriedOver: 0 },
]

export const SAMPLE_CONFIG: ProjectConfig = {
  name: 'Sample Project',
  targetScope: 300,
  sprintLengthWeeks: 2,
}
