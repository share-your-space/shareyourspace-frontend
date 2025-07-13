import { TeamSize, StartupStage } from './enums';

export interface Startup {
  id: number;
  name: string;
  description: string;
  website: string;
  industry_focus: string;
  team_size: TeamSize;
  mission: string;
  stage: StartupStage;
  pitch_deck_url: string;
  created_at: string;
  updated_at: string;
  owner_id: number;
}
