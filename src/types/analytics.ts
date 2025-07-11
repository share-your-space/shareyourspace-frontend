export interface TimeSeriesData {
    date: string;
    count: number;
}

export interface AnalyticsData {
    bookings_over_time: TimeSeriesData[];
    tenant_growth: TimeSeriesData[];
    workstation_utilization: number;
    tenant_distribution: {
        [key: string]: number;
    };
}
