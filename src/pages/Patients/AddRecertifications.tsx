import React, { useState, useEffect } from 'react'
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  useIonViewDidEnter,
  IonIcon,
  IonList,
  IonLabel,
  IonButton,
  IonToast
} from '@ionic/react'
import Header from '../../components/Header'
import { useHistory, useParams } from 'react-router'
import * as Utility from '../../shared/utility'
import * as Api from '../../service/api'
import { trash } from 'ionicons/icons'

import InputCtrl from '../../controls/InputCtrl'
import { useForm } from 'react-hook-form'
import moment from 'moment'
import Loading from '../../controls/Loading'
let init = {
  Frequencies: [],
  recert: Utility.FormatMDY(new Date())
}

const AddRecertifications: React.FC = () => {
  let params: any = useParams()

  const history = useHistory()
  const [loading, setLoading] = useState<any>(false)
  let [NewRecert, SetNewRecert] = useState<any>(true)
  const [alert, setAlert] = useState(false)
  let [State, SetState] = useState({
    ...init
  })
  const { control, handleSubmit, errors, reset, watch } = useForm<any>({
    defaultValues: {
      RecertificationDate: ''
    },
    mode: 'onBlur' // when the you blur... check for errors
  })

  const watchDate = watch('RecertificationDate')
  const [showToast, setShowToast] = useState(false)
  const [message, setMessage] = useState('')

  const [data, setData] = useState<any>([])

  useEffect(() => {
    SetState({
      ...State,
      recert: watchDate
    })
  }, [watchDate])

  useIonViewDidEnter(async () => {
    State = { ...init }
    SetState({
      ...State
    })
    if (Utility.isUserLoggedIn()) {
      Utility.menuEnable(true)
      getAllData()
    }
    console.log('test', params)
  })

  const showError = (_fieldName: string) => {
    // State.recert=Utility.FormatMDY(getValues("RecertificationDate"));
    // SetState({...State});

    let error = (errors as any)[_fieldName]
    return error ? (
      <div style={{ color: 'red', fontWeight: 'bold' }}>
        {error.message || 'Field Is Required'}
      </div>
    ) : null
  }

  const getAllData = async () => {
    try {
      setLoading(true)
      let id = params.patient_id
      if (!id) {
        history.goBack()
        return
      }

      // Fetch Frequencies

      // Fetch Recert Date if is edit
      if (params.recert_id) {
        SetNewRecert(false)
        FetchFrequencies()
        FetchRecertDate()
      } else {
        AutoPopulateDateField()
      }

      let res = await Api.GetByID('PatientProfile', id)
      console.log(res, 'FETCHED')

      if (res.data.data !== null) {
        res = res.data.data
        setData(res)
      }

      setLoading(false)
    } catch (err) {
      console.log(err, 'ERROR')
      setLoading(false)
    }
  }

  const AutoPopulateDateField = async () => {
    try {
      let result: any = await Api.GetData(
        `/api/PatientRecertification/GetNextRecert?patientId=${params.patient_id}`
      )
      console.log('okay', result)
      if (result.data) {
        reset({
          RecertificationDate: moment(result.data.recertificationDate)
            .utc()
            .format('YYYY-MM-DD')
        })
      } else {
        throw result
      }
    } catch (err) {
      console.log('err', err)
    }
  }

  const FetchRecertDate = async () => {
    try {
      let result = await Api.GetData(
        '/api/PatientRecertification/GetRecertificationById?id=' +
          params.recert_id
      )
      console.log(result, 'result')
      if (result.data && result.data.length != 0) {
        // Deleted/ Invalid entry fetch req
        if (result.data.id == 0) {
          GoBack()
          return
        }

        reset({
          RecertificationDate: moment(result.data.recertificationDate)
            .utc()
            .format('YYYY-MM-DD')
        })
      } else {
        throw result
      }
    } catch (err) {
      console.log('err', err)
    }
  }

  const FetchFrequencies = async () => {
    try {
      let res: any = await Api.GetData(
        `/api/PatientSchedule/Get?patientId=${params.patient_id}&recertId=${params.recert_id}`
      )

      if (res.data.items) {
        res = res.data.items
        console.log(res, 'freq')
        State.Frequencies = res
        SetState({
          ...State
        })
      }

      // setLoading(false)
    } catch (err) {
      console.log(err, 'ERROR')
      // setLoading(false)
    }
  }

  const GoBack = () => {
    history.goBack()
    // history.push("/recertifications/"+params.patient_id)
  }

  const onSubmit = async (_data: any) => {
    console.log(_data, 'data')
    try {
      setLoading(true)

      if (params.recert_id) {
        _data.Id = params.recert_id
        _data.addedBy = Utility.readFromLocalStorage('userObj').id || 0
      }

      let result = await Api.PostData(
        '/api/PatientRecertification/AddRecertification',
        {
          ..._data,
          PatientId: params.patient_id
          // RecertificationDate: new Date(data.RecertificationDate).toUTCString()
        }
      )
      console.log('result', result)
      if (result.data) {
        if (NewRecert) {
          setTimeout(() => {
            history.push(
              `/add-recertifications/${params.patient_id}/${result.data.id}`
            )
          }, 600)
          // SetNewRecert(false)
          // State = {
          //   ...init
          // }
          // getAllData()
        }
        GoBack()
      } else {
        throw result
      }
    } catch (err) {
      console.log('err')
      setMessage(err.message)
      setShowToast(true)
    } finally {
      setLoading(false)
    }
  }

  const DeleteRecert = async () => {
    console.log('del req')
    try {
      setLoading(true)
      let res = await Api.DeleteData(
        '/api/PatientRecertification/DeleteRecertification?id=' +
          params.recert_id
      )
      if (res) {
        GoBack()
      } else {
        throw res
      }
    } catch (err) {
      console.log('err', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <IonPage>
      <Header Name={'Certification Period'} CloseIcon={true} />

      <IonContent className='patient-schedule patientDetail recerts' fullscreen>
        <Loading ShowLoading={loading} />
        <IonGrid className='bgWhite'>
          <IonRow className='tabs-title custom-list'>
            <IonCol size='12'>
              <h4 className='headtitle'>
                {data.firstName == undefined ? 'Patient Name' : data.fullName}
              </h4>
            </IonCol>
          </IonRow>

          <form className='ion-text-center' onSubmit={handleSubmit(onSubmit)}>
            <InputCtrl
              control={control}
              showError={showError}
              label='Start of Care'
              type='date'
              placeholder=''
              name='RecertificationDate'
              required={true}
            />
            <div className='ion-text-center'>
              <span className='careText'>
                The care period will be from {Utility.FormatMDY(State.recert)}{' '}
                to {Utility.next2MonthDate(State.recert)}
              </span>
            </div>

            <IonRow className='tabs-title'>
              <IonCol size='12'>
                Frequencies
                {!NewRecert ? (
                  <span
                    onClick={() => {
                      history.push(
                        `/add-schedule/${data.fullName}/${params.patient_id}/${params.recert_id}`
                      )
                    }}
                  >
                    Manage
                  </span>
                ) : null}
              </IonCol>
            </IonRow>

            {State.Frequencies.length == 0 ? (
              <IonRow className='freq-display'>
                <IonCol>
                  <IonList className='text-center search_list'>
                    <img src='/assets/images/frame.png' alt='' />
                    <br />
                    <span className='ion-text-center'>
                      <IonLabel className='noPatientText'>
                        No Frequencies Found
                      </IonLabel>
                      <br />
                      <div className='message-tips'>
                        {NewRecert ? (
                          <span>
                            <strong>Save </strong> a recertification to add{' '}
                            <strong>frequencies</strong>
                          </span>
                        ) : (
                          <>
                            <span>
                              Use <strong>Manage</strong> to add
                            </span>
                            <span>or</span>
                            <span>
                              <strong>Import From Primary Schedule</strong> for
                              this Patient
                            </span>
                          </>
                        )}
                      </div>
                    </span>
                  </IonList>
                </IonCol>
              </IonRow>
            ) : (
              <IonRow className='frequency freq-display'>
                <IonCol size='12'>
                  {State.Frequencies.map((v: any, i: any) => {
                    return (
                      <>
                        <IonButton className='buttons' disabled>
                          {v.generatedVisitCode}
                        </IonButton>
                        <br />
                      </>
                    )
                  })}
                </IonCol>
              </IonRow>
            )}
            <IonRow className='btn-grp'>
              <IonCol size={params.recert_id ? '5' : '6'}>
                <IonButton expand='block' type='reset' onClick={GoBack}>
                  Cancel
                </IonButton>
              </IonCol>
              <IonCol size={params.recert_id ? '5' : '6'}>
                <IonButton expand='block' type='submit'>
                  Save
                </IonButton>
              </IonCol>
              {params.recert_id ? (
                <IonCol size='2'>
                  <IonIcon
                    icon={trash}
                    onClick={() => {
                      setAlert(true)
                    }}
                  />
                </IonCol>
              ) : null}
            </IonRow>
          </form>
        </IonGrid>
        {alert
          ? Utility.confirmationAlert(
              alert,
              setAlert,
              'Are you sure?',
              DeleteRecert
            )
          : null}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => {
            setShowToast(false)
          }}
          message={message}
          position='bottom'
          duration={3000}
        />
      </IonContent>
    </IonPage>
  )
}

export default AddRecertifications
