export interface IDocuments {
  data: Data;
  message: string;
}
export interface Data {
  visitType: string;
  events: EventsArr[];
}
export interface EventsArr {
  allDay: boolean;
  patientId: string;
  title: string;
  start: string;
  end: string;
  color: string;
  colorType: string;
  distance: string;
}
