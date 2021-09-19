import { IonToast, IonButton, IonModal } from '@ionic/react'
import React, { useState } from 'react'
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  useIonViewDidEnter,
  IonLabel,
  IonList
} from '@ionic/react'
import Header from '../../components/Header'
import * as Utility from '../../shared/utility'
import * as Api from '../../service/api'
import ClockTimePicker from '../../controls/ClockTimePicker'
import Loading from '../../controls/Loading'
let Time: string = 'start'
let TimeValue: any = ''
const WorkingHours: React.FC = () => {
  const [loading, setLoading] = useState<any>(false)
  const [message, showMessage] = useState<any>({ message: '' })
  const [showToast, setShowToast] = useState(false)
  const [data, setData] = useState<any>()
  const [ShowModal, SetShowModal] = useState<boolean>(false)

  const [startTime, setStartTime] = useState<string>('')

  const [endTime, setEndTime] = useState<string>('')
  let [Format24, SetFormat24] = useState<any>({
    start: '',
    end: ''
  })
  useIonViewDidEnter(async () => {
    if (Utility.isUserLoggedIn()) {
      Utility.menuEnable(true)

      getData()
    }
  })

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

  const getData = async () => {
    try {
      setLoading(true)

      //
      const cb = (hour: any) => {
        if (hour < 12) {
          return 'am'
        } else {
          return 'pm'
        }
      }
      //

      let res: any = await Api.GetSettings()
      setData(res.data)
      let start = res.data.start
      let end = res.data.end
      SetFormat24({
        start: res.data.start,
        end: res.data.end
      })
      start = start.split(':')
      start = start.length
        ? `${parseInt(start[0]) % 12}:${start[1]} ${cb(parseInt(start[0]))}`
        : res.data.start

      end = end.split(':')
      end = end.length
        ? `${parseInt(end[0]) % 12}:${end[1]} ${cb(parseInt(end[0]))}`
        : res.data.end

      setStartTime(start)
      setEndTime(end)

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

      let start: string = Utility.getUTCString(startTime)
      let end: string = Utility.getUTCString(endTime)

      let err = checkValidity(startTime, endTime)
      if (err) {
        showMessage({ message: 'Start Time is more than End Time' })
      } else {
        start = Format24.start
        end = Format24.end

        data.start = start
        data.end = end

        let res = await Api.Save('Setting', data)
        console.log(res, 'RES')
        // set working hrs to local
        if (res.data && res.data.data) {
          Utility.SetWorkingHoursToLocal(res.data.data)
        }
        showMessage({ message: 'Working Hrs updated Successfully' })
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
      <Header Name={'Working Hours'} CloseIcon={true} />
      <Loading ShowLoading={loading} />
      <IonContent>
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
        <IonGrid className='settings p0'>
          <IonRow>
            <IonCol>
              <IonList className='workingHrs'>
                <IonRow>
                  <IonCol size='5'>
                    <IonLabel>Start</IonLabel>
                  </IonCol>
                  <IonCol size='7'>
                    <span
                      className='timeSel'
                      onClick={() => {
                        Time = 'start'
                        TimeValue = startTime
                        SetShowModal(true)
                      }}
                    >
                      {startTime || '--'}
                    </span>
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol size='5'>
                    <IonLabel>End</IonLabel>
                  </IonCol>
                  <IonCol size='7'>
                    <span
                      className='timeSel'
                      onClick={() => {
                        Time = 'end'
                        TimeValue = endTime
                        SetShowModal(true)
                      }}
                    >
                      {endTime || '--'}
                    </span>
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol className='text-center'>
                    <IonButton onClick={Save}>Submit</IonButton>
                  </IonCol>
                </IonRow>
                {Utility.SettingsMessage()}
              </IonList>
            </IonCol>
          </IonRow>
          <IonToast
            isOpen={showToast}
            onDidDismiss={() => {
              setLoading(false)
              setShowToast(false)
            }}
            message={message.message}
            position='bottom'
            duration={2000}
          />
        </IonGrid>
        {showToast ? Utility.toast(true, message.message) : ''}
      </IonContent>
    </IonPage>
  )
}

export default WorkingHours
