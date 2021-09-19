import { IonRadioGroup, IonRadio, IonButton } from '@ionic/react'
import React, { useState } from 'react'
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  useIonViewDidEnter,
  IonItem,
  IonLabel
} from '@ionic/react'
import Header from '../../components/Header'
import * as Utility from '../../shared/utility'
import * as Api from '../../service/api'
import Loading from '../../controls/Loading'

const IncludeWeekends: React.FC = () => {
  const [data, setData] = useState<any>()
  const [showToast, setShowToast] = useState(false)
  const [loading, setLoading] = useState<any>(false)
  const [includeWeekend, setIncludeWeekend] = useState<string>('Yes')
  const [message, showMessage] = useState<string>()
  useIonViewDidEnter(async () => {
    if (Utility.isUserLoggedIn()) {
      Utility.menuEnable(true)
      getData()
    }
  })

  const handleChange = (e: any) => {
    console.log(e, 'MMM')
    if (e == includeWeekend) {
      if (e == 'Yes') {
        setIncludeWeekend('No')
      } else {
        setIncludeWeekend('Yes')
      }
    } else {
      setIncludeWeekend(e)
    }
  }

  const getData = async () => {
    try {
      setLoading(true)

      let res = await Api.GetSettings()
      setData(res.data)
      setIncludeWeekend(res.data.includeWeekendsInWeekView)

      console.log(res, 'RES')
      setLoading(false)
    } catch (err) {
      console.log(err, 'ERROR')
      setLoading(false)
    }
  }

  const Save = async () => {
    try {
      setLoading(true)

      data.includeWeekendsInWeekView = includeWeekend
      let res = await Api.Save('Setting', data)
      console.log(res, 'RES')

      if (res.data.status == 402) {
        showMessage(res.data.message)
      } else {
        showMessage('Data Updated Successfully.')
      }

      setShowToast(true)
      setLoading(false)
    } catch (err) {
      console.log(err, 'ERROR SETTINGS')
      setLoading(false)
    }
  }

  return (
    <IonPage>
      <Header Name={'Include Weekends in Week View'} CloseIcon={true} />
      <Loading ShowLoading={loading} />
      <IonContent>
        <IonGrid className='settings p0'>
          <IonRow className='includeWeekends'>
            <IonCol>
              <IonLabel>Include Weekends</IonLabel>
            </IonCol>
          </IonRow>
          <IonRadioGroup
            value={includeWeekend}
            onIonChange={e => handleChange(e.detail.value)}
          >
            <IonRow>
              <IonCol size='4'>
                <IonItem lines='none'>
                  <IonLabel className='allow-weeks'>Yes</IonLabel>
                  <IonRadio
                    slot='start'
                    value='Yes'
                    className='radioCheck m10'
                  />
                </IonItem>
              </IonCol>
              <IonCol size='4'>
                <IonItem lines='none'>
                  <IonLabel className='allow-weeks'>No</IonLabel>
                  <IonRadio
                    slot='start'
                    value='No'
                    className='radioCheck m10'
                  />
                </IonItem>
              </IonCol>
              <IonCol size='6'></IonCol>
            </IonRow>
          </IonRadioGroup>
          <IonRow>
            <IonCol className='text-center'>
              <IonButton onClick={Save}>Submit</IonButton>
            </IonCol>
          </IonRow>
          {Utility.SettingsMessage()}
          {showToast ? Utility.toast(true, message, setShowToast) : ''}
        </IonGrid>
      </IonContent>
    </IonPage>
  )
}

export default IncludeWeekends
