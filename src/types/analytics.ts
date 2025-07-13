export interface TimeSeriesData {
    date: string;
    count: number;
}

export interface AnalyticsSummary {
    total_tenants: number;
    total_startups: number;
    total_freelancers: number;
    active_connections: number;
    occupancy_rate: number;
}

export interface IndustryData {
    industry: string;
    count: number;
}

export interface AnalyticsData {
    summary: AnalyticsSummary;
    tenant_growth: TimeSeriesData[];
    tenant_composition: {
        startups: number;
        freelancers: number;
    };
    top_industries: IndustryData[];
}
