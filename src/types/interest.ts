import { User } from './auth';
import { Startup } from './organization';

export interface Interest {
  id: string;
  user: User;
  space_id: string;
  created_at: string;
  startup?: Startup | null;
}
