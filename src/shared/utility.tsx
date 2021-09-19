import React from 'react'
import { Plugins } from '@capacitor/core'
import { IonAlert, IonToast } from '@ionic/react'
import { menuController } from '@ionic/core'
import { getPlatforms } from '@ionic/react'
import { LaunchNavigator } from '@ionic-native/launch-navigator'
export const packageFile = require('../../package.json')
export const moment = require('moment')

const { Geolocation } = Plugins
declare global {
  interface Window {
    runConfig: any
    [x: string]: any
  }
}

window.runConfig = window.runConfig || {}

var runConfig = window.runConfig

export function GetApiRoot () {
  console.log(window, 'window')
  if (window.location.href.includes('apexapp.netlify.app')) {
    return runConfig.stagingAPIRoot
  } else {
    return runConfig.apiRoot
  }
  // return "https://apex-api.npit.info";
}
function isJson (str: string) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

export function setToLocalStorage (key: string, val: any) {
  localStorage.setItem(key, val)
}

export const ValueFromUserData = (key: string) => {
  let UserData: any = getUserObj()

  if (UserData) {
    return UserData[key]
  } else {
    return ''
  }
}

export function readFromLocalStorage (key: any) {
  let data: any = localStorage.getItem(key)
  if (typeof data === 'undefined' || data == null) return null
  return isJson(data) ? JSON.parse(data) : data
}

export function getUserToken (): string {
  return getUserObj() == null ? '' : getUserObj().token
}

export function getUserObj () {
  return readFromLocalStorage('userObj')
}

export async function menuEnable (bool: boolean) {
  try {
    let menu = menuController
    menu.enable(bool)
  } catch (ex) {
    console.log(ex)
  }
}

export function isUserLoggedIn (): boolean {
  var val = getUserObj()
  if (val === null) return false
  console.log('User Object from LocalStorage: ' + val)
  var loggedIn: boolean = val !== null && val.token !== null && val.token !== ''
  console.log('User Logged In: ' + loggedIn)
  return loggedIn
}

var month = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

export function getMonth (index: any) {
  return month[index]
}

export function showAlert (
  show: boolean,
  setShowAlert: any,
  message: string,
  func: any
) {
  return (
    <IonAlert
      isOpen={show}
      onDidDismiss={() => setShowAlert(false)}
      cssClass='my-custom-class'
      message={message}
      buttons={[
        {
          text: 'Ok',
          handler: () => {
            console.log('Confirm Okay')
            func()
          }
        }
      ]}
    ></IonAlert>
  )
}

export function confirmationAlert (
  alert: any,
  setAlert: any,
  message: string,
  func: any,
  data: any = ''
) {
  return (
    <IonAlert
      isOpen={alert}
      onDidDismiss={() => setAlert(false)}
      cssClass='alertCustomCss'
      message={message}
      buttons={[
        {
          text: 'No',
          cssClass: 'noBtn alert-fix',
          handler: () => {
            console.log('Confirm NO')
            // goBack();
          }
        },
        {
          text: 'Yes',
          cssClass: 'yesBtn alert-fix',
          handler: () => {
            console.log('Confirm YES', alert)
            if (data) {
              func(data)
            } else {
              func()
            }
          }
        }
      ]}
    />
  )
}

export function viewDeletePatientPopup (
  alert: boolean,
  setAlert: any,
  message: string,
  func1: any,
  func2: any,
  func3: any,
  func4: any,
  func5: any,
  status: any
) {
  return (
    <IonAlert
      isOpen={alert}
      onDidDismiss={() => setAlert(false)}
      cssClass='alertCustomCss landscape-scaling'
      message={message}
      buttons={[
        {
          text: 'Navigate',
          cssClass: 'navBtn',
          handler: () => {
            console.log('Confirm VIEW')
            // goBack();
            func3()
          }
        },
        {
          text: 'View',
          cssClass: 'yesBtn',
          handler: () => {
            console.log('Confirm VIEW')
            // goBack();
            func1()
          }
        },
        {
          text: 'Delete',
          cssClass: 'noBtn',
          handler: () => {
            console.log('Confirm DELETE')
            func2()
          }
        },
        {
          text: status,
          cssClass: 'lockBtn',
          handler: () => {
            console.log('Confirm Lock')
            func4()
          }
        },
        {
          text: 'Mark as Complete',
          cssClass: 'yesBtn',
          handler: () => {
            console.log('Confirm Completed')
            // goBack();
            func5('Completed')
          }
        },
        {
          text: 'Mark as Missed',
          cssClass: 'missedBtn',
          handler: () => {
            console.log('Confirm Missed')
            func5('Missed')
          }
        }
      ]}
    />
  )
}

export function SearchItem (str: any, originalList: any, setStateArr: any) {
  let newList: any = []

  if (str.trim() !== '') {
    newList = originalList.filter((item: any) => {
      let lc: any = ''
      Object.values(item).forEach((val: any) => {
        let modVal = ''
        if (val != null) modVal = val.toString().toLowerCase()
        if (modVal.includes(str)) lc = str
      })

      return lc.includes(str)
    })
  } else {
    newList = originalList
  }
  setStateArr(newList)
}

export function checkUnDef (val: any) {
  if (val == undefined || val == null || val == '') return '--'
  return val

  // let str = "--";
  // if (replaceWith != undefined) str = replaceWith;

  // if (val != undefined && val != null && val.toString().trim() != "") {
  //   return val;
  // } else {
  //   return str;
  // }
}

export function reduceString (str: any) {
  if (str == null || str == undefined) {
    return ''
  } else {
    return str
      .toString()
      .trim()
      .replace(/ /g, '')
      .toLowerCase()
  }
}

// FORMAT-> MM/DD/YYYY
export function getDate (val: any) {
  let newVal = new moment(val).utc().format('MM/DD/YYYY')
  return newVal
}

//US FORMAT  March 8 2020
export function FormatMDY (val: any) {
  let newVal = new moment(val).utc().format('MMM DD, YYYY')
  return newVal
}

//FORMAT -> YYYY-MM-DD
export function getFormatedDate (val: any) {
  let newVal = new moment(val).utc().format('YYYY-MM-DD')
  return newVal
}

//FORMAT-> MMM DD YYYY
export function getEventDate (val: any) {
  let newVal = new moment(val).utc().format('MMM DD YYYY')
  return new Date(newVal)
}

export function utcFormatVisitDate (val: any) {
  let newVal = new moment(val).utc().format()
  // format("YYYY-MM-DDTHH:mm:ss ZZ");
  return newVal
}

export function FormatYYYY_MM_DD (val: any) {
  let newVal = new moment(val).utc().format('YYYY-MM-DD')
  // format("YYYY-MM-DDTHH:mm:ss ZZ");
  return newVal
}

export function readLocal (key: string) {
  let temp = localStorage.getItem(key)
  return temp == null ? '' : temp
}

export function getSettingFromLocal (param: string, setVal: any) {
  let data = readFromLocalStorage('settings')[param]
  setVal(data)
}

export function toast (showToast: boolean, message: any, fn: any = () => {}) {
  return (
    <IonToast
      isOpen={showToast}
      message={message}
      position='bottom'
      onDidDismiss={() => {
        fn()
      }}
      duration={3000}
    />
  )
}

// export function showLoading (loading: boolean) {
//   return (
//     <IonLoading isOpen={loading} message={'Please wait...'} duration={5000} />
//   )
// }

export async function navigateToGoogleMaps (
  lat: any,
  long: any,
  address: any = ''
) {
  // await Geolocation.requestPermissions
  // const coordinates: any = await Geolocation.getCurrentPosition()
  // let startLat = coordinates.coords.latitude
  // let startLong = coordinates.coords.longitude
  console.log(getPlatforms(), 'my platform', LaunchNavigator, address)
  // @ts-ignore
  LaunchNavigator.navigate(address).then(
    (success: any) => {
      console.log('success', success)
    },
    (err: any) => {
      console.log('err', err)
    }
  )

  // if (
  //   /* if we're on iOS, open in Apple Maps */
  //   navigator.platform.indexOf('iPhone') != -1 ||
  //   navigator.platform.indexOf('iPod') != -1 ||
  //   navigator.platform.indexOf('iPad') != -1
  // )
  //   window.open(
  //     'maps://maps.google.com/maps?saddr=' +
  //       startLat +
  //       ',' +
  //       startLong +
  //       '&daddr=' +
  //       lat +
  //       ',' +
  //       long +
  //       '&amp;ll='
  //   )
  // /* else use Google */ else
  //   window.open(
  //     'https://maps.google.com/maps?saddr=' +
  //       startLat +
  //       ',' +
  //       startLong +
  //       '&daddr=' +
  //       lat +
  //       ',' +
  //       long +
  //       '&amp;ll='
  //   )
}

export function getUTCString (val: any) {
  let d = new Date(val).toUTCString()
  return d
}

export function getDateObj (val: any) {
  let d = new Date(val)
  return d
}

declare global {
  interface Window {
    google: any
  }
}

window.google = window.google || {}

export var GOOGLE = window.google
// export function GOOGLE(){
//   return window["google"]
// }
export function getSelectList (listArr: any, listName: string) {
  let arr: any = []
  if (listArr != undefined && listArr.length !== 0 && listArr !== '') {
    listArr.forEach((v: any) => {
      let obj: any = {}
      if (listName == 'users') {
        obj.value = v.id
        obj.label = v.fullName
      } else {
        obj.value = v.id
        obj.label = v.name
      }
      arr.push(obj)
    })
  }
  return arr
}
export function getSelectVal (data: any) {
  if (data != undefined) {
    return data.value
  }
}

export function getLabValObj (value: any, label: any) {
  let obj = {
    value: value,
    label: label
  }
  if (value == null && label == '') return value
  return obj
}

export function getVisitType (val: any) {
  if (val == 'RR') return 'Recertifications'
  if (val == 'Eval') return 'Evaluations'
  return val
}

export function nextWeekDate (val: any) {
  let newVal = new Date(val.setDate(val.getDate() + 6))
  return newVal
}

export function nextDate (val: any) {
  let newVal = new Date(val.setDate(val.getDate() + 1))
  return newVal
}

export function nextMonthDate (val: any) {
  console.log(val, 'util check')
  if (val.toString().trim() == '') {
    return
  }
  let d: any = new Date(val)

  let newVal = new Date(d.setDate(d.getDate() + 30)).toISOString()
  return newVal
}

export function next2MonthDate (val: any) {
  console.log(val, 'util check')
  if (val.toString().trim() == '') {
    return
  }
  let d: any = new Date(val)

  let newVal = new Date(d.setDate(d.getDate() + 59)).toISOString()
  return FormatMDY(newVal)
}

export function formatMMDD_DD_YYYY (start: any, end: any) {
  let s = start
  let e = end
  s = s.split(' ')
  e = e.split(' ')
  let finalDate = ''
  if (s[1] == e[1]) {
    finalDate = s[1] + ' ' + s[2] + ' - ' + e[2] + ', ' + e[3]
  } else {
    finalDate = s[1] + ' ' + s[2] + ' - ' + e[1] + ' ' + e[2] + ', ' + e[3]
  }
  return finalDate
}

export function checkColor (type: any) {
  if (type == undefined) return 'green'
  if (type == 'E') return 'EvalColor'
  if (type == 'RV') return 'RoutineColor'
  if (type == 'D') return 'DischargeColor'
  if (type == '30') return 'DREColor'
  if (type == 'R') return 'RecertColor'
}

export function parseStrArray (str: any) {
  try {
    if (str == '' || str == '[]') return '--'
    let temp = JSON.parse(str).join(',')
    return temp
  } catch {
    return '--'
  }
}

export function getQuery () {
  var page: any = window.location.href.substring(
    window.location.href.lastIndexOf('/') + 1
  )
  // console.log(page,"PAGE",typeof(page))
  if (isNaN(parseInt(page, 10))) {
    page = undefined
  }
  return page
}

export function getColor (type: any) {
  if (type == undefined) return 'green'
  if (type == 'Recert') return '#d40000'
  if (type == 'Discharge') return '#edd300'
  if (type == 'Evaluation') return '#ba96d7'
  if (type == '30DRE') return '#759ae0'
  if (type == 'RoutineVisit') return 'rgb(125, 184, 133)'
}

export async function currentLoc () {
  await Geolocation.requestPermissions
  const coordinates: any = await Geolocation.getCurrentPosition()
  let obj = {
    lat: coordinates.coords.latitude,
    long: coordinates.coords.longitude
  }
  console.log('Current', coordinates, obj)
  return obj
}

export function getTime (dat: any) {
  let newVal = new moment(dat).utc().format('HH:mm:ss')
  return newVal
}

export function FormatDate_Time (val: any) {
  let newVal = new moment(val).utc().format('YYYY-MM-DD HH:mm:ss')
  // format("YYYY-MM-DDTHH:mm:ss ZZ");
  return newVal
}

export function replaceParanthesis (input: any) {
  return input
    .replace(/ /g, '')
    .replace(/-/g, '')
    .replace(/\(|\)/g, '')
}

export const getCoords = async () => {
  try {
    await Geolocation.requestPermissions
    let coordinates: any = await Geolocation.getCurrentPosition({
      timeout: 10000,
      enableHighAccuracy: true
    })
    console.log('_workinghours', coordinates)
    let obj: any = {
      lat: coordinates.coords.latitude,
      long: coordinates.coords.longitude
    }
    return obj
  } catch (err) {
    console.log('_workinghrs', err)
    return { lat: 0, long: 0 }
  }
}

export function get24hrTime (utcString: any) {
  console.log(utcString, 'UTC STRING')
  let newVal = utcString.split('T')[1]
  newVal = newVal.split(':')

  return newVal[0] + ':' + newVal[1]
}

export function UpgradePlanAlert (
  show: boolean,
  DissMiss: any,
  message: string,
  func: any = () => {}
) {
  return (
    <IonAlert
      isOpen={show}
      onDidDismiss={() => DissMiss()}
      cssClass='my-custom-class'
      header={'Upgrade Plan'}
      message={message}
      buttons={[
        {
          text: 'Ok',
          handler: () => {
            console.log('Confirm Okay')
            DissMiss()
          }
        }
      ]}
    ></IonAlert>
  )
}

export function AutoScheduleAlert (
  ShowAlert: boolean,
  SetShowAlert: any = () => {},
  Message: string = '',
  SchedulingMethod: any = () => {}
) {
  return (
    <IonAlert
      isOpen={ShowAlert}
      onDidDismiss={() => SetShowAlert(false)}
      cssClass='alertCustomCss'
      header='Auto Scheduling'
      message={Message}
      buttons={[
        {
          text: 'Today',
          cssClass: 'navBtn',
          handler: () => {
            console.log('Today Method')
            SchedulingMethod('Today')
          }
        },
        {
          text: 'Week',
          cssClass: 'yesBtn',
          handler: () => {
            console.log('Week Method')
            SchedulingMethod('Week')
          }
        },
        {
          text: 'Month',
          cssClass: 'noBtn',
          handler: () => {
            console.log('Month Method')
            SchedulingMethod('Month')
          }
        }
      ]}
    />
  )
}

export async function SetCookie (
  cookie_key: string,
  data: string,
  expiresIn: number // in ms
) {
  console.log('cookie', cookie_key, data, expiresIn)
  // SET COOKIE //
  document.cookie =
    `${cookie_key} = ` +
    data +
    '; expires=' +
    new Date(new Date().getTime() + expiresIn).toUTCString() +
    ';'
}

export const GetCookieValue = (Key: string) => {
  var val = document.cookie.match('(^|[^;]+)\\s*' + Key + '\\s*=\\s*([^;]+)')
  return val ? val.pop() : ''
}

export const SettingsMessage = () => {
  return (
    <div className='settings-info'>
      <small>These settings will take effect for future actions.</small>
    </div>
  )
}

export const formatAMPM = (date: any) => {
  if (!date) return 'N/A'
  var hours = date.getHours()
  var minutes = date.getMinutes()
  var ampm = hours >= 12 ? 'pm' : 'am'
  hours = hours % 12
  hours = hours ? hours : 12 // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes
  var strTime = hours + ':' + minutes + ' ' + ampm
  return strTime
}

export const SetWorkingHoursToLocal = (result: any) => {
  if (result.start && result.end) {
    localStorage.setItem(
      'working-hrs',
      JSON.stringify({ start: result.start, end: result.end })
    )
  }
}

export const MomentInstance = (date: any, mode: any = null) => {
  let temp: any = moment(date)
  if (mode === 'us') {
    return temp.format('MM-DD-YYYY')
  }
  return temp
}

export const ManagePatientAllowed = () => {
  let role: any = ValueFromUserData('roleName')

  if (role) {
    role = role.toUpperCase()
    return (
      role == 'ADMIN' ||
      role == 'PT' ||
      role == 'OT' ||
      role == 'SN' ||
      role == 'SLP' ||
      role == 'USER'
    )
  }
  return false
}

export function FormatDate (
  val: any,
  _format: string = 'll',
  ReturnNull: boolean = false
) {
  if (val && new Date(val).getTime() > 0) {
    return new moment(val).utc().format(_format)
  }
  if (ReturnNull) return null
  return 'N/A'
}
