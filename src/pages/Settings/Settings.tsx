import React, { useState } from 'react'
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  useIonViewDidEnter,
  IonItem,
  IonLabel,
  IonList
} from '@ionic/react'
import Header from '../../components/Header'
import { useHistory } from 'react-router'
import * as Utility from '../../shared/utility'
import * as Api from '../../service/api'
import Loading from '../../controls/Loading'

let initialValues = {
  userId: 0,
  units: 'Miles',
  routingApp: 'Google Maps',
  treatmentSessionLength: '60',
  evaluationSessionLength: '60',
  admissionSessionLength: '60',
  distanceCalculator: 'Starting/Home Address',
  includeWeekendsInWeekView: 'Yes',
  workingHours: '9:00-15:00',
  patinetNameFormat: 'UpperCase',
  colorCoding: 'Black',
  start: '8:00:00',
  end: '17:00:00'
}

const Settings: React.FC = () => {
  const history = useHistory()
  const [loading, setLoading] = useState<any>(false)
  const [userID, setUserID] = useState<any>()

  const SettingList = [
    'Units',
    'Routing App',
    'Default Session Length',
    'Distance Calculator',
    'Include Weekends in Week view',
    'Working Hours'
  ]

  useIonViewDidEnter(async () => {
    if (Utility.isUserLoggedIn()) {
      Utility.menuEnable(true)
      getData()
    } else {
      history.push('/login')
    }
  })

  const getData = async () => {
    try {
      setLoading(true)

      let _userID = Utility.readFromLocalStorage('userObj').id
      setUserID(_userID)
      let res = await Api.GetSettings()
      console.log(res, 'RES')
      if (res.data == null) {
        saveSettings()
      }
      setLoading(false)
    } catch (err) {
      console.log(err, 'ERROR')
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      initialValues.userId = userID

      let res = await Api.Save('Setting', initialValues)
      console.log(res, 'SAVED')
    } catch (err) {
      console.log(err, 'ERROR SETTINGS')
    }
  }

  const open = (item: any) => {
    var navigateTo = '/'
    if (item == 'Units') navigateTo = 'units'
    if (item == 'Routing App') navigateTo = 'routing-app'
    if (item == 'Default Session Length') navigateTo = 'default-session-length'
    if (item == 'Distance Calculator') navigateTo = 'distance-calculator'
    if (item == 'Include Weekends in Week view') navigateTo = 'include-weekends'
    if (item == 'Working Hours') navigateTo = 'working-hours'
    history.push(navigateTo)
  }

  return (
    <IonPage>
      <Header Name={'Settings'} />

      <IonContent>
        <Loading ShowLoading={loading} />
        <IonGrid className='settings p0'>
          <IonRow>
            <IonCol>
              <IonList>
                <>
                  {SettingList.map((item: any, key: any) => {
                    return (
                      <IonItem key={key} onClick={e => open(item)}>
                        <IonLabel>{item}</IonLabel>
                      </IonItem>
                    )
                  })}
                </>
              </IonList>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  )
}

export default Settings
