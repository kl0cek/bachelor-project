export type Astronaut = {
  id: string;
  name: string;
  role?: string;
  color?: string;
};

export type Task = {
  id: string;
  title: string;
  start: string; // ISO
  end: string; // ISO
  astronautId?: string | null;
  details?: string;
};
