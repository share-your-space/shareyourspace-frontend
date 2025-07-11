import { UserProfile } from "./userProfile";

export interface UserSimpleInfo {
    id: number;
    full_name: string | null;
    email: string;
    space_id: number | null;
    profile?: UserProfile | null;
}