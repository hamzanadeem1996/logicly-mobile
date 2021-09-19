export interface Settings {
  data: Data;
  message: string;
}
export interface Data {
  id: number;
  userId: number;
  units: string;
  routingApp: string;
  treatmentSessionLength: string;
  evaluationSessionLength: string;
  admissionSessionLength: string;
  distanceCalculator: string;
  includeWeekendsInWeekView: string;
  workingHours: string;
  patinetNameFormat: string;
  colorCoding: string;
  addedBy: number;
  lastModBy: number;
  addedOn: string;
  lastModOn: string;
}
