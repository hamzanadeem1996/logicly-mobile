export interface IPatientVisitHistory {
  data: Data[];
  message: string;
}

// export interface Data {
//   currentPage: number;
//   totalPages: number;
//   totalItems: number;
//   itemsPerPage: number;
//   items: Item[];
// }

export interface Data {
  id: number;
  patientId: number;
  visitDate: Date;
  status: string;
  notes: string;
  addedBy: number;
  lastModBy: number;
  addedOn: Date;
  lastModOn: Date;
}

export interface eventDate {
  class: string,
  date: Date
}