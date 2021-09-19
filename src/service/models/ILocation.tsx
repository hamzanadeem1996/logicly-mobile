//COUNTRIES
export interface ICountries {
  data: CountriesData;
  message: string;
}

export interface CountriesData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  items: CountryItem[];
}

export interface CountryItem {
  id: number;
  name: string;
}

//STATES
export interface IStates {
  data: StatesData;
  message: string;
}

export interface StatesData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  items: StateItem[];
}

export interface StateItem {
  id: number;
  name: string;
}

//CITIES
export interface ICities {
  data: CitiesData;
  message: string;
}

export interface CitiesData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  items: CityItem[];
}

export interface CityItem {
  id: number;
  name: string;
}
