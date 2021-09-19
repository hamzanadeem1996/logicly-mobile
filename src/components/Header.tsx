import {
  IonHeader,
  IonTitle,
  IonToolbar,
  IonRow,
  IonCol,
  IonMenuToggle,
  useIonViewDidEnter
} from '@ionic/react'
import React from 'react'
import { useHistory } from 'react-router'
import * as Utility from '../shared/utility'
import * as Api from '../service/api'
import moment from 'moment'

interface IHeaderProps {
  Name?: string
  Tabs?: boolean
  CloseIcon?: boolean
}

let PingIntervalActive: boolean = false
let PingInterval: any = undefined

const Header: React.FC<IHeaderProps> = ({ Name, Tabs, CloseIcon }) => {
  const history = useHistory()

  const Close = () => {
    history.goBack()
  }

  useIonViewDidEnter(async () => {
    console.log('ping check ?...?', Utility.readFromLocalStorage('working-hrs'))
    const TogglePing = () => {
      if (ContinuePing()) {
        // need to keep pinging
        if (!PingIntervalActive) {
          // need to start pinging
          PingIntervalActive = true
          console.log('ping interval')
          AutoLogout()
          pingLocation()
          PingInterval = setInterval(async () => {
            pingLocation()
          }, 30000)
        }
      } else {
        // need to stop pinging
        ClearPing()
      }
    }
    if (!Utility.readFromLocalStorage('working-hrs')) {
      // set working-hrs
      let result: any = await Api.GetSettings()
      console.log('result !!! ping ?...?', result)
      // logic to check start/stop ping
      TogglePing()
    } else {
      // logic to check start/stop ping
      TogglePing()
    }
  })

  const ClearPing = () => {
    console.log('?...? ping clearing interval...')
    PingIntervalActive = false
    if (PingInterval) clearInterval(PingInterval)
  }

  const ContinuePing = () => {
    let currentTime: any = moment().format('HH:mm:ss')
    let workingHrs = Utility.readFromLocalStorage('working-hrs')
    let start, end
    start = workingHrs.start || ''
    end = workingHrs.end || ''

    console.log('stop/start ping ?...?', workingHrs, currentTime, start, end)
    return start && end && start <= currentTime && currentTime <= end
  }

  const pingLocation = async () => {
    console.log("keep pingin' ?", ContinuePing())
    if (Utility.GetCookieValue('login-session') == '') {
      console.log('login session expired')
      if (PingInterval) {
        PingIntervalActive = false
        clearInterval(PingInterval)
      }
      history.push('/login')
      return
    }
    //
    if (!ContinuePing()) {
      ClearPing()
      return
    }
    //
    if (Utility.isUserLoggedIn()) {
      localStorage.setItem('LastLoginAt', new Date().toISOString())
      let coords = await Utility.getCoords()
      let obj = {
        ClinicianId: Utility.getUserObj().id,
        Latitude: coords.lat,
        Longitude: coords.long
      }
      let res = await Api.PostData('/api/ClinicianAvailability/Ping', obj)
      console.log(res, 'pinging')
    }
  }

  const AutoLogout = () => {
    // to remove previously logged in ADMIN's from APP
    let temp: any = Utility.getUserObj()
    temp = temp ? temp.roleName : ''

    console.log('role', temp)
    //
    if (!Utility.isUserLoggedIn()) return
    let lastLog: any = localStorage.getItem('LastLoginAt')
    var lastLoginAt: any = Date.parse(lastLog)
    var currentDateTime: any = Date.now()
    var diff = (currentDateTime - lastLoginAt) / 60000
    if (diff >= 10080) {
      //7 days
      console.log('Auto Logging User Out....')
      history.push('/login')
    }
  }
  return (
    <IonHeader>
      <IonToolbar className={'bgWhite'}>
        <IonRow>
          <IonCol size='2'>
            <IonMenuToggle className='menuIcon'>
              <img src={'/assets/images/menuIcon.png'} />
            </IonMenuToggle>
          </IonCol>
          <IonCol size='8'>
            <IonTitle
              className={Name == 'Forgot Password' ? 'ion-text-center' : ''}
            >
              {Name}
            </IonTitle>
          </IonCol>
          {CloseIcon ? (
            <IonCol size='2' onClick={Close}>
              <span className={'header_ic'}>
                <img src='/assets/images/cancel.svg' alt='' />
              </span>
            </IonCol>
          ) : (
            ''
          )}
        </IonRow>
      </IonToolbar>
    </IonHeader>
  )
}

export default Header
