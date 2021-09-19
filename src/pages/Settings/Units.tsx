import { IonToggle, IonButton } from '@ionic/react'
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

const Units: React.FC = () => {
  const [showToast, setShowToast] = useState(false)
  const UnitList = ['Miles', 'Kilometers']
  const [loading, setLoading] = useState<any>(false)
  const [unit, setUnit] = useState<string>('Miles')
  const [data, setData] = useState<any>()

  useIonViewDidEnter(async () => {
    if (Utility.isUserLoggedIn()) {
      Utility.menuEnable(true)
      getData()
    }
  })

  const handleChange = (e: any) => {
    if (e == unit) {
      if (e == 'Miles') {
        setUnit('Kilometers')
      } else {
        setUnit('Miles')
      }
    } else {
      setUnit(e)
    }
  }

  const saveSettings = async () => {
    try {
      setLoading(true)

      data.units = unit

      let res = await Api.Save('Setting', data)
      console.log(res, 'RES')
      setLoading(false)
      setShowToast(true)
    } catch (err) {
      console.log(err, 'ERROR SETTINGS')
      setLoading(false)
    }
  }

  const getData = async () => {
    try {
      setLoading(true)

      let res = await Api.GetSettings()
      setData(res.data)
      setUnit(res.data.units)

      console.log(res, 'RES')
      setLoading(false)
    } catch (err) {
      console.log(err, 'ERROR')
      setLoading(false)
    }
  }

  return (
    <IonPage>
      <Header Name={'Units'} CloseIcon={true} />

      <IonContent>
        <Loading ShowLoading={loading} />
        <IonGrid className='settings p0'>
          <IonRow>
            <IonCol>
              <IonList>
                <>
                  {UnitList.map((item: any, key: any) => {
                    return (
                      <IonItem key={key}>
                        <IonLabel>
                          {item}{' '}
                          <IonToggle
                            mode={'ios'}
                            checked={unit == item}
                            value={item}
                            onClick={e => handleChange(item)}
                          />
                        </IonLabel>
                      </IonItem>
                    )
                  })}
                </>
                <IonRow>
                  <IonCol className='text-center'>
                    <IonButton onClick={saveSettings}>Submit</IonButton>
                  </IonCol>
                </IonRow>
              </IonList>
            </IonCol>
          </IonRow>
        </IonGrid>
        {showToast ? Utility.toast(true, 'Units Updated Successfully.') : ''}
      </IonContent>
    </IonPage>
  )
}

export default Units
