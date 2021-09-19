export interface IVisitScheduleResponse {
    data: Data;
    events:Events;
    message: string;
}

export interface Data {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    items: IVisitList[]
}

export interface IVisitList {
    id: number;
    patientId: number;
    patientName: string;
    nurseId: number;
    visitDate: string;
}

export interface Events{
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    items: EventsList[]
}

export interface EventsList{
    id: number;
    nurseId: number;
    patientId: number;
    title: string;
    allDay: boolean;
    start: string;
    end: string;
    colorType: string;
    color: string;
}
