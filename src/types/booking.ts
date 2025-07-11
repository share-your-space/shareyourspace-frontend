import { UserSimpleInfo } from "./user";
import { Workstation } from "./workstation";

export interface Booking {
    id: number;
    start_date: string;
    end_date: string | null;
    user: UserSimpleInfo;
    workstation: Workstation;
    status: string; // "CONFIRMED", "PENDING", "CANCELLED", etc.
}
