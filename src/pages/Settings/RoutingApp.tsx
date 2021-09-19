import { IonRadio, IonRadioGroup, IonButton } from '@ionic/react'
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
import * as Utility from '../../shared/utility'
import * as Api from '../../service/api'
import Loading from '../../controls/Loading'

const RoutingApp: React.FC = () => {
  const [data, setData] = useState<any>()
  const [showToast, setShowToast] = useState(false)
  const [loading, setLoading] = useState<any>(false)
  const [routing, setRouting] = useState<string>('Google Maps')
  const RoutingList = [
    'Waze',
    'Google Maps',
    'Find My Way',
    'I am Lost',
    'Just Get Me There'
  ]

  useIonViewDidEnter(async () => {
    if (Utility.isUserLoggedIn()) {
      Utility.menuEnable(true)
      getData()
    }
  })

  const handleChange = (e: any) => {
    console.log(e, 'MMM')
    if (e !== routing) {
      setRouting(e)
    }
  }

  const getData = async () => {
    try {
      setLoading(true)

      let res = await Api.GetSettings()
      setData(res.data)
      setRouting(res.data.routingApp)

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

      data.routingApp = routing
      let res = await Api.Save('Setting', data)
      console.log(res, 'RES')
      setShowToast(true)

      setLoading(false)
    } catch (err) {
      console.log(err, 'ERROR SETTINGS')
      setLoading(false)
    }
  }

  return (
    <IonPage>
      <Header Name={'Routing App'} CloseIcon={true} />
      <Loading ShowLoading={loading} />

      <IonContent>
        <IonGrid className='settings p0'>
          <IonRow>
            <IonCol>
              <IonList>
                <>
                  <IonRadioGroup
                    value={routing}
                    onIonChange={e => handleChange(e.detail.value)}
                  >
                    {RoutingList.map((item: any, key: any) => {
                      return (
                        <IonItem key={key}>
                          <IonLabel>{item}</IonLabel>
                          <IonRadio
                            mode={'ios'}
                            slot='end'
                            value={item}
                            className='radioCheck'
                          />
                        </IonItem>
                      )
                    })}
                  </IonRadioGroup>
                </>
              </IonList>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol className='text-center'>
              <IonButton onClick={Save}>Submit</IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
        {showToast
          ? Utility.toast(true, 'Routing App Updated Successfully.')
          : ''}
      </IonContent>
    </IonPage>
  )
}

export default RoutingApp
