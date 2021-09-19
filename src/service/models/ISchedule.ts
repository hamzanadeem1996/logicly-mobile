export interface ISchedule {
    data: Data[];
    events: EventsData[];
    message: string;
  }
  
  export interface Data {
    startDate: string;
    endDate: string;
    dateStamp: string;
    patientName: string;
    patientId: string;
    eventType: string;
    eventTypeColor: string;
  }

  export interface EventsData{
    allDay: boolean;
    title: string;
    start: string;
    end: string;
    color: string;
    colorType: string;
  }
  