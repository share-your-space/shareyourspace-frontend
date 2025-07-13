import { UserSimpleInfo } from "./user";

// Based on app.schemas.space.WorkstationStatus (Enum)
export enum WorkstationStatus {
  AVAILABLE = "AVAILABLE",
  OCCUPIED = "OCCUPIED",
  MAINTENANCE = "MAINTENANCE",
}

// Based on app.schemas.space.WorkstationType (Enum)
export enum WorkstationType {
  HOT_DESK = "HOT_DESK",
  PRIVATE_DESK = "PRIVATE_DESK",
  PRIVATE_OFFICE = "PRIVATE_OFFICE",
}

export interface Booking {
    id: string;
    user: UserSimpleInfo;
}

export interface Space {
    id: string;
    name: string;
}

// Based on app.schemas.workstation.Workstation
export interface Workstation {
  id: string;
  name: string;
  type: WorkstationType;
  status: WorkstationStatus;
  space_id?: string;
  space?: Space;
  current_booking?: Booking | null;
}
