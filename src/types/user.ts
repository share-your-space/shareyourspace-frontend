import { UserProfile } from "./userProfile";
import { Startup } from "./organization";

export interface UserSimpleInfo {
    id: string;
    full_name: string | null;
    email: string;
    space_id?: string | null;
    profile?: UserProfile | null;
}

export type Tenant = (UserSimpleInfo & { type: 'freelancer' }) | (Startup & { type: 'startup' });