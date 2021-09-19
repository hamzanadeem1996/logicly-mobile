import axios from 'axios'
import * as utility from '../shared/utility'
import { IPatientVisitHistory } from './models/IPatientVisitHistory'
import { ISchedule } from './models/ISchedule'
import { IVisitScheduleResponse } from './models/IVisitSchedule'
import { Settings } from './models/ISettings'
import { ICountries, IStates, ICities } from './models/ILocation'
import { IDocuments } from './models/IDocuments'
import { IForgotPassword } from './models/IForgotPassword'

// const baseURL = "https://apex-api.npit.info";
const baseURL = utility.GetApiRoot()
//AXIOS INTERCEPTOR

// Request
axios.interceptors.request.use(
  function (config) {
    const token = utility.getUserToken()
    config.headers['X-Referer'] = 'APP'

    if (token !== null && token !== '') {
      config.headers.Authorization = `bearer ${token}`
    }

    return config
  },
  function (err) {
    return Promise.reject(err)
  }
)

//Response
axios.interceptors.response.use(
  response => {
    return response
  },
  async function (error) {
    const originalRequest = error.config
    console.log(error, 'error')
    console.log(error.response, 'error')

    if (error.response != undefined) {
      if (error.response.status === 400) {
        console.log('error- 400')
        return Promise.reject(error)
      }

      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
        axios.defaults.headers.common[
          'Authorization'
        ] = `bearer ${utility.getUserToken()}`
        return axios(originalRequest)
      }
    }
    return Promise.reject(error)
  }
)

//LOGIN
export function Login (obj: Object) {
  return axios.post(baseURL + '/api/Auth/Login', obj)
}

//CRUD API's
export function Save (endpoint: any, obj: Object) {
  return axios.post(baseURL + '/api/' + endpoint + '/Save', obj)
}

export function GetAll (endpoint: any) {
  return axios.get(baseURL + '/api/' + endpoint + '/GetAll?pagesize=100')
}

export function GetByID (endpoint: any, id: any) {
  return axios.get(baseURL + '/api/' + endpoint + `/Get?id=${id}`)
}

export function DeleteById (endpoint: any, id: any) {
  return axios.delete(baseURL + '/api/' + endpoint + `/Delete?id=${id}`)
}

export function GetAllPatientsProfiles (
  pagenumber: any,
  query: any,
  status: any
) {
  return axios.get(
    baseURL +
      '/api/PatientProfile/GetAll?pagenumber=' +
      pagenumber +
      '&pagesize=20&query=' +
      query +
      '&Status=' +
      status
  )
}

//SETTINGS

export async function GetSettings () {
  let res = await axios.get(baseURL + '/api/Setting/Get')
  let settings: Settings = res.data
  const { data, message } = settings
  // set working hrs to local
  if (data) {
    utility.SetWorkingHoursToLocal(data)
  }
  return { data, message }
}

export function GetSchedulesByDay (
  patientIds: any,
  startDate: any,
  endDate: any
) {
  return axios.get(
    baseURL +
      '/api/PatientProfile/GetSchedule?' +
      patientIds +
      'startDate=' +
      startDate +
      '&endDate=' +
      endDate
  )
}

export const GetSchedule = async (startdate: any, query: string) => {
  let res = await axios.get<ISchedule>(
    baseURL +
      '/api/PatientProfile/GetSchedule?startdate=' +
      startdate +
      '&clinicianId=' +
      utility.ValueFromUserData('id') +
      '&query=' +
      query
  )
  return res.data
}

export const GetPatientVisitHistory = async (patientId: number) => {
  var res = await axios.get<IPatientVisitHistory>(
    baseURL +
      `/api/PatientVisitHistory/GetVisitHistory?pagenumber=1&pagesize=1000&patientid=${patientId}`
  )
  return res.data
}

//PATIENT VISIT HISTORY

export const addToVisitSchedule = (obj: Object) => {
  return axios.post(
    baseURL + '/api/PatientVisitSchedule/AddToVisitSchedule',
    obj
  )
}

export const getPatientVisitSchedule = async (
  startdate: any = undefined,
  mode: any
) => {
  console.log(mode, 'MODE', startdate, 'START')

  let url: any = `${baseURL}/api/PatientVisitSchedule/GetVisitSchedule?pagesize=1000&pagenumber=1&mode=${mode}`
  if (mode == 'semiautomatic') {
    url = `${baseURL}/api/PatientVisitSchedule/GetVisitSchedule?pagesize=1000&pagenumber=1&mode=${mode}&startdate=${startdate}`
  }

  //clinicianId append
  url += '&clinicianId=' + utility.ValueFromUserData('id')

  let res = await axios.get<IVisitScheduleResponse>(url)
  return res.data
}

export function SearchData (endpoint: any, val: string) {
  return axios.get(
    baseURL + '/api/' + endpoint + '/GetAll?pagesize=100&query=' + val
  )
}

export function usersForDropdown (
  endpoint: any,
  val: string,
  roleBased: any = ''
) {
  return axios.get(
    baseURL +
      '/api/' +
      endpoint +
      '/GetAll?pagesize=100&query=' +
      val +
      '&includeNone=true&includeAdmin=true' +
      roleBased
  )
}

//COUNTRY, STATE, CITY

export async function GetCountries () {
  let res = await axios.get<ICountries>(
    baseURL + '/api/Country/GetCountries?pagesize=250&pagenumber=1'
  )
  return res.data
}

export async function GetStates (countryId: any) {
  let res = await axios.get<IStates>(
    baseURL +
      '/api/Country/GetStates?pagesize=250&pagenumber=1&countryid=' +
      countryId
  )
  return res.data
}

export async function GetCities (stateId: any) {
  let res = await axios.get<ICities>(
    baseURL +
      '/api/Country/GetCities?pagesize=250&pagenumber=1&stateid=' +
      stateId
  )
  return res.data
}

//DOCUMENTS DUE

export const GetDocumentsDue = async (
  startDate: any
  // endDate: any,
) => {
  let res = await axios.get<IDocuments>(
    baseURL + '/api/MyDocuments/MyDocumentsDue?startdate=' + startDate
    //  +
    // "&endDate=" +
    // endDate
  )
  return res.data
}

//GET DOCUMENTS DUE BY PATIENT ID

export const GetDocDueBypID = async (startDate: any, patientid: any) => {
  let res = await axios.get<IDocuments>(
    baseURL +
      '/api/MyDocuments/MyDocumentsDue?startdate=' +
      startDate +
      '&patientid=' +
      patientid
  )
  return res.data
}

//UPDATE STATUS OF PATIENT

export function updatePatientStatus (patientId: any, status: any) {
  return axios.get(
    baseURL +
      `/api/PatientProfile/UpdatePatientStatus?patientId=${patientId}&status=${status}`
  )
}

// FORGOT PASSWORD
export const ForgotPassword = async (email: string) => {
  var response = await axios.get<IForgotPassword>(
    baseURL + '/api/Auth/ForgotPassword?email=' + email
  )
  return response.data
}

//UPDATE PATIENT VISIT SCHEDULE

export function updatePatientVisitSchedule (
  visitScheduleId: any,
  StartDate: any,
  EndDate: any,
  CombinationVisit: any = ''
) {
  return axios.get(
    `${baseURL}/api/PatientVisitSchedule/UpdatePatientVisitSchedule?visitScheduleId=${visitScheduleId}&StartDate=${StartDate}&EndDate=${EndDate}${
      CombinationVisit ? '&combinationVisit=' + CombinationVisit : ''
    }`
  )
}

export function GetSinglePatientVisitSchedule (Patientid: any) {
  return axios.get(
    baseURL +
      `/api/PatientVisitSchedule/GetSinglePatientVisitSchedule?patientId=${Patientid}`
  )
}

//GET VISIT TYPES FOR LEGENDS IN CALENDAR
export async function GetVisitTypes () {
  let response = await axios.get(
    `${baseURL}/api/PatientVisitHistory/GetVisitType`
  )
  return response.data
}

//remove patient from visit schedule

export function DelPatientFromCal (id: any) {
  return axios.delete(
    `${baseURL}/api/PatientVisitSchedule/RemoveFromVisitSchedule?id=${id}`
  )
}

//LOCK PATIENT
export async function lockPatient (id: any, status: boolean) {
  let response = await axios.get(
    `${baseURL}/api/PatientVisitSchedule/SetVisitLockStatus?visitScheduleId=${id}&isLocked=${status}`
  )
  return response.data
}

//SAVE AND GET FREQUENCY OF PATIENT
export async function GetFrequency (id: any) {
  let response = await axios.get(
    `${baseURL}/api/PatientSchedule/Get?patientId=${id}&pagenumber=1&pagesize=1000`
  )
  return response.data
}

export const SaveFrequency = (obj: Object) => {
  return axios.post(`${baseURL}/api/PatientSchedule/PatientScheduleSave`, obj)
}

export const AutoSchedule = (startDate: any, mode: any = '') => {
  return axios.post(
    `${baseURL}/api/PatientVisitSchedule/AutoScheduling?startdate=${startDate}${
      mode ? '&Mode=' + mode : ''
    }`
  )
}

// GET DATA
export const GetData = async (query: any) => {
  let response = await axios.get(`${baseURL}${query}`)
  return {
    data: response.data.data,
    message: response.data.message,
    status: response.data.status
  }
}

// POST DATA
export const PostData = async (endpoint: any, obj: any) => {
  let response = await axios.post(`${baseURL}${endpoint}`, obj)
  return { data: response.data.data, message: response.data.message }
}

// Delete DATA
export const DeleteData = async (query: any) => {
  let response = await axios.delete(baseURL + query)
  return { data: response.data.data, message: response.data.message }
}
