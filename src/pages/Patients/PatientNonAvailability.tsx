import React, { useState } from 'react'
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  useIonViewDidEnter,
  useIonViewDidLeave,
  IonModal,
  IonIcon,
  IonLabel,
  IonItem,
  IonInput
} from '@ionic/react'
import Header from '../../components/Header'
import { useHistory, useParams } from 'react-router'
import * as Utility from '../../shared/utility'
import * as Api from '../../service/api'
import { useForm } from 'react-hook-form'
import SelectCtrl from '../../controls/SelectCtrl'
import Loading from '../../controls/Loading'
import ClockTimePicker from '../../controls/ClockTimePicker'
import moment from 'moment'
import { trash } from 'ionicons/icons'
let initialValues = {
  date: ''
}
let weekDays: any = [
  { id: 0, title: 'Sunday' },
  { id: 1, title: 'Monday' },
  { id: 2, title: 'Tuesday' },
  { id: 3, title: 'Wednesday' },
  { id: 4, title: 'Thursday' },
  { id: 5, title: 'Friday' },
  { id: 6, title: 'Saturday' }
]
let Time: string = 'start'
let TimeValue: any = ''
const PatientNonAvailability: React.FC = () => {
  const params: any = useParams()
  const history = useHistory()
  const [loading, setLoading] = useState<any>(false)
  const [message, showMessage] = useState<string>()
  const [showToast, setShowToast] = useState(false)
  const [alert, setAlert] = useState(false)
  const [ShowModal, SetShowModal] = useState<boolean>(false)
  const [startTime, setStartTime] = useState<string>('')

  const [endTime, setEndTime] = useState<string>('')
  let [Format24, SetFormat24] = useState<any>({
    start: '',
    end: ''
  })
  const { control, handleSubmit, errors, reset } = useForm<any>({
    defaultValues: initialValues,
    mode: 'onBlur' // when the you blur... check for errors
  })

  useIonViewDidEnter(async () => {
    if (Utility.isUserLoggedIn()) {
      Utility.menuEnable(true)
    }

    if (params.unavail_id) {
      fetchData()
    }
  })

  const fetchData = async () => {
    setLoading(true)
    let result: any = await Api.GetData(
      `/api/PatientAvailability/Get?id=${params.unavail_id}`
    )
    console.log('result', result)
    if (result.data) {
      result = result.data
      reset({
        StartHour: result.startHour,
        EndHour: result.endHour,
        WeekDayNo: result.weekDayNo
      })
      setStartTime(moment(result.startHour, ['HH:mm']).format('h:mm A'))
      setEndTime(moment(result.endHour, ['HH:mm']).format('h:mm A'))
      SetFormat24({ start: result.startHour, end: result.endHour })
    }
    setLoading(false)
  }

  useIonViewDidLeave(() => {
    reset({})
  })

  const showError = (_fieldName: string) => {
    let error = (errors as any)[_fieldName]
    return error ? (
      <div style={{ color: 'red', fontWeight: 'bold' }}>
        {error.message || 'Field Is Required'}
      </div>
    ) : null
  }

  useIonViewDidLeave(async () => {})

  const checkValidity = (start: any, end: any) => {
    let err = false

    console.log('start -', start, 'end -', end)

    console.log(
      Format24,
      startTime,
      endTime,
      startTime.includes(Format24.start),
      endTime.includes(Format24.end),
      'time'
    )
    if (Format24.start.length == 4) {
      Format24.start = '0' + Format24.start
    }
    if (Format24.end.length == 4) {
      Format24.end = '0' + Format24.end
    }

    console.log(Format24, startTime, endTime, 'time')
    if (Format24.start >= Format24.end) {
      console.log('Error. Start Time is more than End Time')
      err = true
    }

    return err
  }

  const onSubmit = async (data: any) => {
    let err = checkValidity(startTime, endTime)

    if (err) {
      showMessage('Invalid start date and end date')
      setShowToast(true)
      return
    }
    console.log('proceed', startTime, endTime, Format24)
    // return
    console.log('data', data)
    data.PatientId = params.id
    data.IsAvailable = false
    data.StartHour = Format24.start
    data.EndHour = Format24.end

    if (params.unavail_id) {
      let temp: any = data.WeekDayNo
      data.WeekDayNo = []
      data.WeekDayNo.push(temp)
      data.Id = params.unavail_id
    } else if (
      !data.WeekDayNo ||
      data.WeekDayNo.length == 0 ||
      data.WeekDayNo.length > 3
    ) {
      showMessage('Please select atmost 3 days')
      setShowToast(true)
      return
    }

    console.log(data, 'DATA')

    setLoading(true)
    let res = await Api.PostData('/api/PatientAvailability/Save', data)
    console.log(res, 'AVAILABILITY')
    if (res.data !== null && res.message.toLowerCase().includes('success')) {
      showMessage('Saved Successfully')
      history.goBack()
    } else {
      showMessage(res.message)
    }

    setShowToast(true)
    setLoading(false)
  }

  const DeleteUnavailability = async () => {
    console.log('del req')
    try {
      setLoading(true)
      let res = await Api.DeleteData(
        '/api/PatientAvailability/Delete?id=' + params.unavail_id
      )
      showMessage(res.message)
      if (res) {
        history.goBack()
      }
      setShowToast(true)
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
              'Are you sure?',
              DeleteUnavailability
            )
          : null}
        <IonModal
          isOpen={ShowModal}
          cssClass='clock-picker-modal'
          showBackdrop={true}
          backdropDismiss={true}
          onDidDismiss={() => {
            SetShowModal(false)
          }}
        >
          <ClockTimePicker
            SetShow={SetShowModal}
            DataCB={(time: any) => {
              console.log('time', time)
              if (Time == 'start') {
                SetFormat24({ ...Format24, start: time.fr24 })
                setStartTime(time.fr12)
              } else {
                SetFormat24({ ...Format24, end: time.fr24 })
                setEndTime(time.fr12)
              }
            }}
            Value={TimeValue}
          />
        </IonModal>
        <Loading ShowLoading={loading} />
        <IonRow>
          <IonCol className='ion-text-left'>
            <IonLabel className='headtitle'>{params.name}</IonLabel>
          </IonCol>
        </IonRow>
        <IonGrid>
          <IonRow></IonRow>
        </IonGrid>
        <form action='' onSubmit={handleSubmit(onSubmit)}>
          <SelectCtrl
            control={control}
            showError={showError}
            list={weekDays}
            itemLabel={'title'}
            itemVal={'id'}
            label=''
            placeholder='Week Day'
            name='WeekDayNo'
            required={true}
            IsMulti={!params.unavail_id}
          />
          <IonRow>
            <IonCol>
              <IonItem className='fields' lines='none'>
                <IonLabel position='floating'>{'Start Hour'}</IonLabel>
                <IonInput
                  onFocus={() => {
                    Time = 'start'
                    TimeValue = startTime
                    SetShowModal(true)
                  }}
                  value={startTime}
                />
                <img
                  src='/assets/images/calIcon.svg'
                  alt=''
                  className='calIcon'
                />
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <IonItem className='fields' lines='none'>
                <IonLabel position='floating'>{'End Hour'}</IonLabel>
                <IonInput
                  onFocus={() => {
                    Time = 'end'
                    TimeValue = endTime
                    SetShowModal(true)
                  }}
                  value={endTime}
                />
                <img
                  src='/assets/images/calIcon.svg'
                  alt=''
                  className='calIcon'
                />
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow className='bottomBtns'>
            <IonCol size='6' className='ion-text-left delete-btn'>
              {params.unavail_id ? (
                <button type='button' className='plus'>
                  <span className='tick-bottom'>
                    <IonIcon
                      icon={trash}
                      onClick={() => {
                        setAlert(true)
                      }}
                    />
                  </span>
                </button>
              ) : null}
            </IonCol>
            <IonCol size='6' className='ion-text-right plusTickBtn'>
              <button type='submit' className='plus'>
                <span className='tick-bottom'>
                  <i className='fas fa-check'></i>
                </span>
              </button>
            </IonCol>
          </IonRow>
        </form>

        {Utility.toast(showToast, message, () => {
          setShowToast(false)
        })}
      </IonContent>
    </IonPage>
  )
}

export default PatientNonAvailability
