import { UserProfile } from "./userProfile";
import { Startup } from "./organization";

export interface UserSimpleInfo {
    id: number;
    full_name: string | null;
    email: string;
    space_id: number | null;
    profile?: UserProfile | null;
}

export type Tenant = (UserSimpleInfo & { type: 'freelancer' }) | (Startup & { type: 'startup' });