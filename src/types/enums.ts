export enum ContactVisibility {
  PRIVATE = "private",
  CONNECTIONS = "connections",
  PUBLIC = "public",
}

export enum UserRole {
    SYS_ADMIN = "SYS_ADMIN",
    CORP_ADMIN = "CORP_ADMIN",
    CORP_EMPLOYEE = "CORP_EMPLOYEE",
    STARTUP_ADMIN = "STARTUP_ADMIN",
    STARTUP_MEMBER = "STARTUP_MEMBER",
    FREELANCER = "FREELANCER",
}

export enum UserStatus {
    PENDING_VERIFICATION = "PENDING_VERIFICATION",
    WAITLISTED = "WAITLISTED",
    PENDING_ONBOARDING = "PENDING_ONBOARDING",
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
    BANNED = "BANNED",
}

export enum TeamSize {
    EXTRA_SMALL = "1-10",
    SMALL = "11-50",
    MEDIUM = "51-200",
    LARGE = "201-1000",
    EXTRA_LARGE = "1001+",
}

export enum StartupStage {
    IDEA = "Idea",
    PRE_SEED = "Pre-Seed",
    SEED = "Seed",
    SERIES_A = "Series A",
    SERIES_B = "Series B",
    SERIES_C = "Series C",
    GROWTH = "Growth",
}

export enum WorkstationStatus {
    AVAILABLE = "AVAILABLE",
    OCCUPIED = "OCCUPIED",
    MAINTENANCE = "MAINTENANCE",
}

// Add other shared enums here 