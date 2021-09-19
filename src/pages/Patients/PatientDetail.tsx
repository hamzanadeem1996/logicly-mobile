import React, { useState } from 'react'
import {
  IonButton,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonIcon,
  IonModal,
  IonPage,
  IonRow,
  IonTitle,
  useIonViewDidEnter,
  useIonViewDidLeave
} from '@ionic/react'
import Header from '../../components/Header'
import { useHistory, useParams } from 'react-router'
import * as Utility from '../../shared/utility'
import * as Api from '../../service/api'
import Calendar from '../../controls/Calendar'
import {
  eventDate,
  IPatientVisitHistory
} from '../../service/models/IPatientVisitHistory'
import InputCtrl from '../../controls/InputCtrl'
import { useForm } from 'react-hook-form'
import Loading from '../../controls/Loading'

let initialValues = {
  date: ''
}
const PatientDetails: React.FC = () => {
  const params: any = useParams()
  const [showModal, setShowModal] = useState(false)
  const { control, handleSubmit, errors, reset } = useForm<any>({
    defaultValues: initialValues,
    mode: 'onBlur' // when the you blur... check for errors
  })
  const history = useHistory()
  const [loading, setLoading] = useState<any>(false)
  const [data, setData] = useState<any>([])
  const [visitHistory, setVisitHistory] = useState<eventDate[]>([])
  const [legends, setLegends] = useState<any>([])
  // const [freq,setFreq]=useState<any>();

  const [message, showMessage] = useState<string>()
  const [showToast, setShowToast] = useState(false)

  useIonViewDidEnter(async () => {
    console.log(params, Utility.getQuery(), 'MMMMMM')
    if (Utility.isUserLoggedIn()) {
      Utility.menuEnable(true)
      getAllData()
    }
  })

  const getAllData = async () => {
    try {
      await getVisitTypes()
      setLoading(true)
      let id: number = 0
      if (Utility.getQuery() !== undefined) {
        // id = params.id;
        id = Utility.getQuery()
      } else {
        return
      }
      let res: any = await Api.GetByID('PatientProfile', id)
      console.log(res, 'FETCHED')

      if (res.data.data !== null) {
        res = res.data.data
        setData({ ...res })
        reset({
          ...initialValues,
          date: Utility.FormatYYYY_MM_DD(res.evaluation)
        })
      }

      let pvHistory: IPatientVisitHistory = await Api.GetPatientVisitHistory(id)

      console.log(pvHistory, 'HISTORY')
      let items = pvHistory.data

      let arr: eventDate[] = []
      items.forEach((v: any, i: any) => {
        let obj: eventDate = {
          date: Utility.getEventDate(v.start),
          class: v.colorType
        }

        arr.push(obj)
        if (i + 1 == items.length) {
          setVisitHistory(arr)
          console.log(arr, visitHistory, 'HISTORY')
        }
      })

      // let freq = await Api.GetFrequency(id);
      //   console.log(freq, "FREQ");
      //   if (freq.data !== null && freq.data.items !== undefined && freq.data.items.length !== 0) {
      //       let codes: any = [];
      //       freq.data.items.forEach((v: any) => {
      //           codes.push(v.generatedVisitCode);
      //       });
      //       freq = codes;
      //       setFreq(freq);
      //       console.log(Utility.parseStrArray(JSON.stringify(freq)),"FREQQQQQ")
      //   }
      setLoading(false)
    } catch (err) {
      console.log(err, 'ERROR')
      setLoading(false)
    }
  }

  const editDetails = (id: string) => {
    if (!Utility.ManagePatientAllowed()) return
    history.push('/patient-detail/' + id)
  }

  const getVisitTypes = async () => {
    let res = await Api.GetVisitTypes()
    console.log(res, 'RES')
    let _data = []
    if (res.data == null) return
    _data = res.data
    setLegends([..._data])
  }

  const showError = (_fieldName: string) => {
    let error = (errors as any)[_fieldName]
    return error ? (
      <div style={{ color: 'red', fontWeight: 'bold' }}>
        {error.message || 'Field Is Required'}
      </div>
    ) : null
  }

  useIonViewDidLeave(() => {
    // setFreq("");
    setData([])
  })

  const onSubmit = async (EvalData: any) => {
    setShowToast(false)
    setLoading(true)

    const dateUtc = `${EvalData.date}T00:00:00.000Z`

    let res = await Api.GetData(
      `/api/PatientProfile/SetEvaluationDate?patientId=${data.id}&Date=${dateUtc}`
    )

    if (res.status == 402) {
      showMessage(res.message)
    } else if (res.message.toLowerCase().includes('success')) {
      showMessage('Evaluation date updated Successfully.')
      setShowModal(false)
      await getAllData()
    } else {
      showMessage('Something went wrong.')
    }
    setShowToast(true)
    setLoading(false)
  }

  return (
    <IonPage>
      <Header Name={'Patient Details'} CloseIcon={true} />

      <IonContent className='patient-schedule' fullscreen>
        <Loading ShowLoading={loading} />
        <IonGrid className='bgWhite'>
          <IonRow className='tabs-title'>
            <div className='mainHeading'>
              <IonCol size='7' className=''>
                <h4 className='headtitle'>
                  {data.firstName == undefined ? 'Patient Name' : data.fullName}
                </h4>
              </IonCol>
              <IonCol size='5' className='editCalIcons'>
                <div className={'floatRight'}>
                  <span
                    onClick={() => {
                      history.push(
                        `/non-availability-list/${data.fullName}/${params.id}`
                      )
                    }}
                    className='clockIcon'
                  >
                    <i className='fa fa-clock-o' />
                  </span>
                  {/* <span onClick={() => { addSchedule(data.fullName) }}>
                    <i className="fas fa-calendar-alt"></i>
                  </span> */}
                  <span>
                    <i
                      className={`fas fa-edit hand ${
                        !Utility.ManagePatientAllowed() ? 'disabled-ico' : ''
                      }`}
                      onClick={e => editDetails(data.id)}
                    />
                  </span>
                </div>
              </IonCol>
            </div>

            <p>Intial Admission: {Utility.FormatDate(data.admission)}</p>
            <p>
              Initial Evaluation:{' '}
              <span className='evalDate'>
                {Utility.FormatDate(data.evaluation)}
              </span>
              <div
                className={'floatRight editEvalIcon'}
                onClick={() => {
                  setShowModal(true)
                }}
              >
                <i className='fas fa-edit hand'></i>
              </div>
            </p>
            <p>Frequency: {Utility.checkUnDef(data.frequency)}</p>
            {/* <p>Frequency: {Utility.parseStrArray(JSON.stringify(freq))}</p> */}

            {/* <p>
                            30 Day Re-Eval:{" "}
                            {Utility.checkUnDef(Utility.FormatMDY(data.thirtyDaysRelEval))}
                        </p> */}
            <p>
              Discharge Week:{' '}
              <span style={{ fontSize: '15px' }}>{data.dischargeWeek}</span>
            </p>
            <p>
              5 Day Window:{' '}
              <span style={{ fontSize: '15px' }}>{data.recert || 'N/A'}</span>
            </p>
            {/* <p>
                            Discharge: {data.dischargeValue == 'N/A' ? data.dischargeValue : Utility.checkUnDef(Utility.FormatMDY(data.discharge))}
                        </p> */}
            <p>End of Care: {Utility.FormatDate(data.eoc)}</p>
            <p>Most Recent 30DRE: {data.mostRecent30DRE || 'N/A'}</p>
            <p>Upcoming 30DRE: {data.upcoming30DRE || 'N/A'}</p>
            <p
              onClick={() => {
                history.push('/recertifications/' + data.id)
              }}
            >
              <strong>Certification Period:</strong> {'>>'}
            </p>
          </IonRow>
        </IonGrid>

        <IonGrid className='bgWhite'>
          <IonRow className='tabs-title'>
            <p>
              <strong>Address:</strong> {Utility.checkUnDef(data.address)}
            </p>
            <IonCol></IonCol>
          </IonRow>
        </IonGrid>

        <IonGrid className='bgWhite'>
          <IonRow className='tabs-title'>
            <p>
              <strong>Notes:</strong> {Utility.checkUnDef(data.notes)}
            </p>
            <IonCol></IonCol>
          </IonRow>
        </IonGrid>

        <div className='calendar m0'>
          <h4>Visit History</h4>
          <div className='form-group'>
            {/* <div className="col-md-12 "> */}
            {/* {visitHistory.length !== 0 ? ( */}
            <>
              <Calendar
                minDate={new Date()}
                maxDate={new Date()}
                eventDates={visitHistory}
                legends={legends}
                // eventDates={[
                //   {date: new Date('Sep 13 2020'), class: "missed"},
                //   {date: new Date('Sep 21 2020'), class: "complete"},
                // ]}
              />
            </>
            {/* ) : (
                  <div className="ion-text-center">
                  No Visit History
                  </div>
                )} */}
            {/* </div> */}
          </div>
        </div>

        <IonGrid>
          <IonRow className='tabs-title bgWhite careteam'>
            <h4>Care Team</h4>
            <p>Team Leader: {Utility.checkUnDef(data.teamLeaderName)}</p>
            <p>OT: {Utility.checkUnDef(data.otname)}</p>
            <p>OTA: {Utility.checkUnDef(data.otaName)}</p>
            <p>PT: {Utility.checkUnDef(data.ptName)}</p>
            <p>PTA: {Utility.checkUnDef(data.ptaName)}</p>
            <p>SLP: {Utility.checkUnDef(data.slpName)}</p>
            <p>SN: {Utility.checkUnDef(data.snName)}</p>
            <p>AID: {Utility.checkUnDef(data.aidName)}</p>
            <p>MSW: {Utility.checkUnDef(data.mswName)}</p>

            {/* <p>CNA: {Utility.checkUnDef(data.cna)}</p> */}
            <IonCol></IonCol>
          </IonRow>
        </IonGrid>
        <IonGrid className='p0'>
          <div className='icon-outer'>
            <IonRow className='footer-icon'>
              <IonCol>
                <p>
                  <a href={'tel:' + data.mdNumber}>
                    <img src='/assets/images/phone.svg' alt='' />
                    <span>MD</span>
                  </a>
                </p>
                <p>
                  <a href={'tel:' + data.primaryNumber}>
                    <img src='/assets/images/phone.svg' alt='' />
                    <span>Primary</span>
                  </a>
                </p>
                <p>
                  <a href={'tel:' + data.secondaryNumber}>
                    <img src='/assets/images/phone.svg' alt='' />
                    <span>Secondary</span>
                  </a>
                </p>
                {/* <p className="navigateIcon" onClick={(e: any) => { Utility.navigateToGoogleMaps(data.lat, data.long) }}>
                  <img src="/assets/images/nav.svg" alt="" />
                  <span>Navigate</span>
                </p> */}
              </IonCol>
            </IonRow>
          </div>
        </IonGrid>
        <IonModal
          isOpen={showModal}
          cssClass='modal-container'
          backdropDismiss={true}
        >
          <Loading ShowLoading={loading} />
          <div className='modalClass cust-eval-height'>
            <IonRow className='ion-text-right'>
              <IonCol size='3'></IonCol>

              <IonCol size='6'>
                <IonTitle className='editEvalTitle'>Edit Evaluation</IonTitle>
              </IonCol>
              <IonCol size='3'>
                <IonIcon
                  className='ion-text-right modalCloseIcon'
                  name='close'
                  onClick={() => {
                    setShowModal(false)
                  }}
                ></IonIcon>
              </IonCol>
            </IonRow>
            <form className='ion-text-center' onSubmit={handleSubmit(onSubmit)}>
              <InputCtrl
                control={control}
                showError={showError}
                label='Evaluation'
                type='date'
                placeholder=''
                name='date'
                required={true}
              />
              <IonRow className='ion-text-center'>
                <IonCol size='4'></IonCol>
                <IonCol size='4'>
                  <IonButton expand='block' type='submit' className='bgGreen'>
                    Save
                  </IonButton>
                </IonCol>
                <IonCol size='4'></IonCol>
              </IonRow>
            </form>
          </div>
        </IonModal>
        {Utility.toast(showToast, message)}
      </IonContent>
      <IonFab
        vertical='bottom'
        horizontal='end'
        slot='fixed'
        className='detailNavIcon'
        onClick={(e: any) => {
          Utility.navigateToGoogleMaps(data.lat, data.long, data.address)
        }}
      >
        <IonFabButton className='bgWhite'>
          <img src='/assets/images/nav1.svg' alt='' />
          {/* <IonIcon icon={menuOutline} /> */}
        </IonFabButton>
      </IonFab>
    </IonPage>
  )
}

export default PatientDetails
