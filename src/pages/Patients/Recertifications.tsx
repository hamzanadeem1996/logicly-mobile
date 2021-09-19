import React, { useState } from 'react'
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  useIonViewDidEnter,
  IonFab,
  IonFabButton,
  IonIcon,
  IonList,
  IonLabel,
  useIonViewDidLeave
} from '@ionic/react'
import Header from '../../components/Header'
import { useHistory, useParams } from 'react-router'
import * as Utility from '../../shared/utility'
import * as Api from '../../service/api'
import { add } from 'ionicons/icons'
import Loading from '../../controls/Loading'

let init = {
  Name: '',
  Recertifications: []
}

const Recertifications: React.FC = () => {
  const params: any = useParams()

  const history = useHistory()
  const [loading, setLoading] = useState<any>(false)
  let [State, SetState] = useState({
    ...init
  })

  useIonViewDidEnter(async () => {
    if (Utility.isUserLoggedIn()) {
      Utility.menuEnable(true)
      FetchData()
    }
  })

  useIonViewDidLeave(() => {
    State = { ...init }
    SetState({
      ...State
    })
  })

  const FetchData = async () => {
    try {
      setLoading(true)
      let id = params.patient_id
      if (!id) {
        history.goBack()
        return
      }

      FetchRecertifications()

      let res: any = await Api.GetByID('PatientProfile', id)
      console.log(res, 'FETCHED')

      if (res.data.data !== null) {
        res = res.data.data
        State.Name = res.fullName
        SetState({
          ...State
        })
      }

      setLoading(false)
    } catch (err) {
      console.log(err, 'ERROR')
      setLoading(false)
    }
  }

  const FetchRecertifications = async () => {
    try {
      let result = await Api.GetData(
        '/api/PatientRecertification/GetRecertification?patientId=' +
          params.patient_id
      )
      console.log('result', result)
      if (result.data) {
        State.Recertifications = result.data
        SetState({
          ...State
        })
      } else {
        throw result
      }
    } catch (err) {
      console.log('err', err)
    }
  }

  return (
    <IonPage>
      <Header Name={'Certification Period'} CloseIcon={true} />

      <IonContent className='patient-schedule' fullscreen>
        <Loading ShowLoading={loading} />{' '}
        <IonGrid className='bgWhite'>
          <IonRow className='tabs-title custom-list'>
            <IonCol size='12'>
              <h4 className='headtitle'>{State.Name || 'Patient Name'}</h4>
            </IonCol>
            {State.Recertifications.length != 0 ? (
              <IonCol size='12'>
                <IonRow>
                  <IonCol className='head' size='7'>
                    Date
                  </IonCol>
                  <IonCol className='head' size='5'>
                    Created By
                  </IonCol>
                </IonRow>
                {State.Recertifications.map((recert: any) => {
                  let date = recert.recertificationDate.split('T')
                  date = date.length ? date[0].split('-') : ''
                  if (date) {
                    date = `${Utility.getMonth(parseInt(date[1]) - 1)} ${
                      date[2]
                    }, ${date[0]}`
                  }
                  date = ''
                  console.log('date', date)
                  return (
                    <IonRow
                      onClick={() => {
                        history.push(
                          `/add-recertifications/${params.patient_id}/${recert.id}`
                        )
                      }}
                    >
                      <IonCol className='item' size='7'>
                        {date || Utility.FormatMDY(recert.recertificationDate)}
                      </IonCol>
                      <IonCol className='item' size='5'>
                        {recert.nurseName}
                      </IonCol>
                    </IonRow>
                  )
                })}
              </IonCol>
            ) : null}
          </IonRow>
          {State.Recertifications.length == 0 ? (
            <IonRow>
              <IonCol>
                <IonList className='text-center search_list'>
                  <img src='/assets/images/frame.png' alt='' />
                  <br />
                  <span className='ion-text-center'>
                    <IonLabel className='noPatientText'>
                      No Certification Period Found
                    </IonLabel>
                    <br />
                  </span>
                </IonList>
              </IonCol>
            </IonRow>
          ) : null}
        </IonGrid>
        <IonFab vertical='bottom' horizontal='end' slot='fixed'>
          <IonFabButton
            className='bgGreen'
            onClick={() => {
              history.push('/add-recertifications/' + params.patient_id)
            }}
          >
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  )
}

export default Recertifications
