export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface Match {
  _id: string;
  creatorId: User;
  title: string;
  description: string;
  type: 'sport' | 'esport';
  category: string;
  location: string;
  startTime: string;
  maxParticipants: number;
  currentParticipants: number;
  participants: User[];
  status: 'open' | 'full' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

