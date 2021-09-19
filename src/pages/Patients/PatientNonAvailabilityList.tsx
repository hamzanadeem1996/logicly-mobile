import React, { useState } from 'react'
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  useIonViewDidEnter,
  IonLabel,
  IonItem
} from '@ionic/react'
import Header from '../../components/Header'
import { useHistory, useParams } from 'react-router'
import * as Utility from '../../shared/utility'
import * as Api from '../../service/api'
import Loading from '../../controls/Loading'

let delid: any = null

const PatientNonAvailabilityList: React.FC = () => {
  const params: any = useParams()
  const history = useHistory()
  const [loading, setLoading] = useState<any>(false)
  const [message, setMessage] = useState<any>('')
  const [showToast, setShowToast] = useState(false)
  const [alert, setAlert] = useState(false)
  const [data, setData] = useState<any>([])

  useIonViewDidEnter(async () => {
    if (Utility.isUserLoggedIn()) {
      Utility.menuEnable(true)
      fetchData()
    }
    delid = null
  })

  const fetchData = async () => {
    setLoading(true)
    let res = await Api.GetData(
      `/api/PatientAvailability/GetPatientAvailability?patientId=${params.id}`
    )
    console.log(res, 'RESPONSE')
    if (res.data !== null) {
      setData([...res.data.items])
    }
    setLoading(false)
  }

  const DeleteUnavailability = async () => {
    console.log('del req', delid)
    try {
      setLoading(true)
      let res = await Api.DeleteData(
        '/api/PatientAvailability/Delete?id=' + delid
      )
      setMessage(res.message)
      if (res) {
        fetchData()
      }
      setShowToast(true)
      delid = null
    } catch (err) {
      console.log('err', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <IonPage>
      <Header Name={'Patient Non Availability'} CloseIcon={true} />

      <IonContent
        className='patient-schedule frequency nonAvailability'
        fullscreen
      >
        {alert
          ? Utility.confirmationAlert(
              alert,
              setAlert,
              message,
              DeleteUnavailability
            )
          : null}
        <Loading ShowLoading={loading} />
        <IonRow>
          <IonCol className='ion-text-left'>
            <IonLabel className='headtitle'>{params.name}</IonLabel>
          </IonCol>
        </IonRow>
        <IonGrid>
          {data == undefined || data.length == 0 ? (
            <IonRow>
              <IonCol>
                Click on plus icon to add a weekday on which the patient is
                unavailable.
              </IonCol>
            </IonRow>
          ) : (
            <IonRow>
              <IonCol>
                {data.map((v: any, i: any) => {
                  return (
                    <IonItem key={i}>
                      <IonLabel
                        onClick={() => {
                          history.push(
                            `/non-availability-list/${params.name}/${params.id}/${v.id}`
                          )
                        }}
                      >
                        {v.weekDayName}
                        <span className='timing'>{`${v.time}`}</span>
                      </IonLabel>
                    </IonItem>
                  )
                })}
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
        <IonRow className='bottomBtns'>
          <IonCol></IonCol>
          <IonCol className='ion-text-right plusTickBtn'>
            <button
              onClick={() => {
                history.push(
                  `/patient-non-availability/${params.name}/${params.id}`
                )
              }}
              className='plus'
            >
              <span className='plus-bottom'>
                <i className='fas fa-plus'></i>
              </span>
            </button>
          </IonCol>
        </IonRow>

        {Utility.toast(showToast, message)}
      </IonContent>
    </IonPage>
  )
}

export default PatientNonAvailabilityList
