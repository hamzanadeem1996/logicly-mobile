import {
  IonLabel,
  IonRow,
  IonCol,
  IonButton,
  useIonViewDidLeave
} from '@ionic/react'
import React, { useState, useEffect } from 'react'
import { IonContent, IonPage, useIonViewDidEnter } from '@ionic/react'
import Header from '../../components/Header'
import { useHistory, useLocation, useParams } from 'react-router'
import * as Utility from '../../shared/utility'
import * as Api from '../../service/api'
import RadioCtrl from '../../controls/RadioCtrl'
import { useForm } from 'react-hook-form'
import Loading from '../../controls/Loading'
let initialValues = {
  PatientId: 0,
  NumberOfUnits: 1,
  VisitsPerUnit: 1,
  GeneratedVisitCode: [],
  Unit: 'Week',
  SortIndx: 0
}

interface IFormInput {
  PatientId: any
  NumberOfUnits: any
  VisitsPerUnit: any
  GeneratedVisitCode: any
  Unit: string
  SortIndx: any
}
let TrackPrev: any = []
let latestCodes: any[] = []
const AddSchedule: React.FC = () => {
  const history = useHistory()
  const params: any = useParams()
  const location = useLocation()
  const [message, showMessage] = useState<string>()
  const [showToast, setShowToast] = useState(false)
  const [loading, setLoading] = useState<any>(false)
  const [Label, SetLabel] = useState<any>('week')
  let [data, setData] = useState<any>({
    ...initialValues,
    code: '',
    codeArr: []
  })
  const radioList = ['Week', 'Month']

  const { control, handleSubmit, errors, reset, getValues } = useForm<
    IFormInput
  >({
    defaultValues: initialValues,
    mode: 'onBlur' // when the you blur... check for errors
  })

  useIonViewDidLeave(() => {
    data = {
      ...initialValues,
      code: '',
      codeArr: []
    }
  })

  useIonViewDidEnter(async () => {
    console.log(location, 'LOCATION', initialValues)
    if (Utility.isUserLoggedIn()) {
      data.GeneratedVisitCode = []
      Utility.menuEnable(true)
      fetchData()
    } else {
      history.push('/login')
    }
  })

  useEffect(() => {}, [reset])

  const fetchData = async () => {
    setLoading(true)
    data.PatientId = params.patient_id
    setData({ ...data })

    let freq = await Api.GetData(
      `/api/PatientSchedule/Get?patientId=${params.patient_id}&recertId=${params.recert_id}`
    )
    console.log(freq, 'FREQ')
    if (freq.data && freq.data.items.length !== 0) {
      let codes: any = []
      freq.data.items.forEach((v: any) => {
        codes.push(v.generatedVisitCode)
      })
      // track prev frequency
      TrackPrev = JSON.parse(JSON.stringify(codes))
      data.GeneratedVisitCode = codes
      setData({ ...data })
    }
    setLoading(false)
  }

  const showError = (_fieldName: string) => {
    let error = (errors as any)[_fieldName]
    return error ? (
      <div style={{ color: 'red', fontWeight: 'bold' }}>
        {error.message || 'Field Is Required'}
      </div>
    ) : null
  }

  const IncDecVisits = (action: string) => {
    // decrease
    if (data.VisitsPerUnit == 0 && action == 'dec') {
      return
    }

    // increase
    if (Label == 'month') {
      if (data.VisitsPerUnit == 31 && action == 'inc') {
        return
      }
    } else {
      if (data.VisitsPerUnit == 7 && action == 'inc') {
        return
      }
    }

    if (action == 'inc') {
      data.VisitsPerUnit += 1
    } else {
      data.VisitsPerUnit -= 1
    }
    setData({ ...data })
  }

  const IncDecWeeks = (action: string) => {
    let isMonth: boolean = Label == 'month'

    if (action === 'dec') {
      if (data.NumberOfUnits == 1) return
      data.NumberOfUnits -= 1
    }
    if (action === 'inc') {
      if (isMonth) {
        if (data.NumberOfUnits == 2) return
      } else {
        if (data.NumberOfUnits == 10) return
      }

      data.NumberOfUnits += 1
    }
    setData({ ...data })
  }

  const saveData = async () => {
    console.log(data, latestCodes, 'saving')

    // if (data.GeneratedVisitCode && data.GeneratedVisitCode.length == 0) {
    //   showMessage('Visit Codes Empty')
    //   setShowToast(true)
    //   return
    // }

    setLoading(true)

    let arr: any = []
    let temp: any = data.GeneratedVisitCode.join()
    arr.push(temp)

    data.RecertId = params.recert_id

    let obj = {
      ...data,
      GeneratedVisitCode: [...arr],
      IsFrequencyNew: true
    }

    // comparison logic TrackPrev and VisitCodes(from local state)
    // if TrackPrev length is less than equal to VisitCodes, means that we remove some frequency from previous(if less) or changed the frequency in last position(if equal)
    if (data.GeneratedVisitCode.length <= TrackPrev.length) {
      obj.IsFrequencyNew = true
    } else {
      let flag: number = 0
      // If previously frequency saved is empty, then the IsNewFrequency is supposed to be true
      if (!TrackPrev.length) flag = 1
      TrackPrev.forEach((code: any, idx: any) => {
        if (code != data.GeneratedVisitCode[idx]) {
          flag = 1
        }
      })
      if (!flag) {
        let temp: any[] = []
        temp.push(data.GeneratedVisitCode[data.GeneratedVisitCode.length - 1])
        obj.IsFrequencyNew = false
        obj.GeneratedVisitCode = temp
      }
    }
    //
    let res = await Api.SaveFrequency(obj)
    console.log(res, 'RES FREQUENCY')

    if (res.data.status == 402) {
      showMessage(res.data.message)
      setShowToast(true)
      setLoading(false)
      fetchData()
      return
    }
    if (res.data.data !== null) {
      showMessage('Saved Succesfully!')
      setShowToast(true)
      TrackPrev = JSON.parse(JSON.stringify(data.GeneratedVisitCode))
      // setTimeout(() => {
      //   history.goBack()
      // }, 1500)
    }
    setLoading(false)
  }

  const onSubmit = async (form: IFormInput) => {
    console.log(form)
    let unit = 'w'
    if (form.Unit.includes('Month')) unit = 'm'

    data.code = `${data.VisitsPerUnit}${unit}${data.NumberOfUnits}`
    data.GeneratedVisitCode.push(data.code)
    form.PatientId = params.patient_id

    setData({ ...data, ...form })
    latestCodes.push(data.code)

    console.log(data.code, latestCodes, 'result')
    // dynamic
    saveData()
  }

  const handleDelete = (v: any, id: any) => {
    let index = data.GeneratedVisitCode.findIndex((element: any, idx: any) => {
      console.log(element, idx, 'NEHA')
      return idx == id
    })
    console.log(index, 'in')
    if (index != -1) {
      data.GeneratedVisitCode.splice(index, 1)
    }
    setData({ ...data })
    console.log(data, 'data')
    // dynamic
    saveData()
  }

  return (
    <IonPage>
      <Header Name={'Schedule'} Tabs={false} CloseIcon={true} />
      <Loading ShowLoading={loading} />
      <IonContent className={'patient-schedule frequency'} fullscreen>
        <form className='ion-text-center' onSubmit={handleSubmit(onSubmit)}>
          <IonLabel className='heading'>Patients Visits Frequency</IonLabel>
          <br />
          <IonLabel className='sub-heading'>{params.patient_name}</IonLabel>
          <RadioCtrl
            name={'Unit'}
            list={radioList}
            control={control}
            showError={showError}
            required={true}
            CB={(val: any) => {
              setData({
                ...data,
                NumberOfUnits: 1,
                VisitsPerUnit: 1
              })
              SetLabel(val)
            }}
          />
          <IonRow className='weeks'>
            <IonCol>
              <IonLabel># of visits/{Label}</IonLabel>
            </IonCol>
            <IonCol className='weeks_icons'>
              <span className='red' onClick={() => IncDecVisits('dec')}>
                <i className='fas fa-minus'></i>
              </span>
              <IonLabel className='ion-text-center'>
                {data.VisitsPerUnit}
              </IonLabel>
              <span className='borderGreen' onClick={() => IncDecVisits('inc')}>
                <i className='fas fa-plus'></i>
              </span>
            </IonCol>
          </IonRow>

          <IonRow className='weeks'>
            <IonCol>
              <IonLabel># of {Label}s</IonLabel>
            </IonCol>
            <IonCol className='weeks_icons'>
              <span className='red' onClick={() => IncDecWeeks('dec')}>
                <i className='fas fa-minus'></i>
              </span>
              <IonLabel className='ion-text-center'>
                {data.NumberOfUnits}
              </IonLabel>
              <span className='borderGreen' onClick={() => IncDecWeeks('inc')}>
                <i className='fas fa-plus'></i>
              </span>
            </IonCol>
          </IonRow>
          {data.GeneratedVisitCode.length == 0 ? (
            <IonLabel>Add a visit frequency!</IonLabel>
          ) : (
            <IonRow>
              <IonCol size='12'>
                <h2>You have selected a visit frequency of :</h2>
              </IonCol>

              <IonCol>
                {data.GeneratedVisitCode.map((v: any, i: any) => {
                  return (
                    <>
                      <IonButton className='buttons'>{v}</IonButton>
                      <span
                        className='red delFreq'
                        onClick={() => handleDelete(v, i)}
                      >
                        <i className='fas fa-minus'></i>
                      </span>
                      <br />
                    </>
                  )
                })}
              </IonCol>
            </IonRow>
          )}

          <IonRow className='bottomBtns'>
            <IonCol></IonCol>
            <IonCol className='ion-text-right plusTickBtn'>
              <button type='submit' className='plus'>
                <span className='plus-bottom'>
                  <i className='fas fa-plus'></i>
                </span>
              </button>
              {/* <span className='tick-bottom' onClick={saveData}>
                <i className='fas fa-check'></i>
              </span> */}
            </IonCol>
          </IonRow>
          {Utility.toast(showToast, message, () => {
            setShowToast(false)
          })}
        </form>
      </IonContent>
    </IonPage>
  )
}

export default AddSchedule
