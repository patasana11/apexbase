export interface Activity {
  id: string;
  type: string;
  name: string;
  description?: string;
  position: {
    x: number;
    y: number;
  };
  functions?: {
    id: string;
    name: string;
    code: string;
  }[];
  properties?: Record<string, any>;
}

export interface Transition {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'default' | 'conditional';
  name?: string;
  description?: string;
  condition?: string;
  properties?: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  activities: Activity[];
  transitions: Transition[];
  properties?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
} 