import { UserRole } from "./enums";

export interface Invitation {
    id: number;
    email: string;
    role: UserRole;
    status: string;
    created_at: string;
    company_id: number;
}
