import { UserProfile } from './userProfile';

export interface MatchResult {
  profile: UserProfile;
  score: number;
  reasons: string[];
} 