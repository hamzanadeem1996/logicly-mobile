import {
  useIonViewWillEnter,
  IonSegmentButton,
  IonLabel,
  IonSegment,
  IonRow,
  IonCol,
  IonList,
  IonItem,
  IonCheckbox,
  IonModal,
  IonSearchbar,
  useIonViewDidLeave
} from '@ionic/react'
import React, { useState, useEffect } from 'react'
import {
  IonContent,
  IonPage,
  IonGrid,
  useIonViewDidEnter,
  IonFab,
  IonFabButton,
  IonIcon
} from '@ionic/react'
import Header from '../../components/Header'
import { useHistory, useLocation } from 'react-router'
import * as Utility from '../../shared/utility'
import * as Api from '../../service/api'
import { add } from 'ionicons/icons'
import Footer from './ScheduleFooter'

import FullCalendarCtrl from '../../controls/FullCalendarCtrl'
import DateCtrl from '../../controls/DateCtrl'
import { ISchedule } from '../../service/models/ISchedule'
import { ScreenOrientation } from '@ionic-native/screen-orientation'
import { IVisitScheduleResponse } from '../../service/models/IVisitSchedule'
import Loading from '../../controls/Loading'
let selectedPatient: any = []

let _load: any = undefined
const Schedule: React.FC = () => {
  const segmentList = ['patients', 'today', 'week', 'month']
  const history = useHistory()
  const location = useLocation()
  const [message, showMessage] = useState<string>()
  const [Banner, SetBanner] = useState<any>({
    Message: '',
    Show: false
  })
  const [ShowAutoAlert, SetShowAutoAlert] = useState<boolean>(false)

  const [ShowAlert, SetShowAlert] = useState<any>('')

  const [showToast, setShowToast] = useState(false)
  const [loading, setLoading] = useState<any>(false)
  const [data, setData] = useState<any>([])
  const [calendarData, setCalendarData] = useState<any>([])
  let [segment, setSegment] = useState<any>('patients')
  const [calendarType, setCalendarType] = useState('timeGridDay')
  let [startEndDate, setStartEndDate] = useState<any>(
    Utility.MomentInstance(new Date())
  )
  let [startTime, setStartTime] = useState<string>('06:00:00')
  let [IncludeWeekends, SetIncludeWeekends] = useState<boolean>(true)
  const [singlePatientID, setSinglePatientID] = useState<any>('0')
  const [page, setPage] = useState<any>('home')
  const [showModal, setShowModal] = useState(false)
  let [docData, setDocData] = useState<any>({ doc: [], name: '' })
  let [mode, setMode] = useState<any>('manual')

  let [PatientSchedules, SetPatientSchedules] = useState<boolean>(false)
  useIonViewWillEnter(async () => {
    if (Utility.isUserLoggedIn()) {
      Utility.menuEnable(true)
      //setting segment by default
      let seg = 'patients'
      let view = Utility.readFromLocalStorage('view')
      if (view !== null && view == 'home') {
        seg = Utility.readFromLocalStorage('segment')
        if (seg == null) seg = 'patients'
      }
      setSegment(seg)
      Utility.setToLocalStorage('segment', seg)
    } else {
      history.push('/login')
    }
  })

  useIonViewDidLeave(() => {
    console.log('LEAVING...')
    // startEndDate = Utility.MomentInstance(new Date())
    setStartEndDate(Utility.MomentInstance(new Date()))
  })

  useIonViewDidEnter(() => {
    console.log('hey')
    setData([])
    getAllData(startEndDate, '')
  })

  useEffect(() => {
    console.log(location, window.location, 'LOCATION')
    let loc = window.location.hash
    if (loc.includes('home') || loc.includes('login')) {
      setPage('home')
      Utility.setToLocalStorage('view', 'home')
    } else {
      setPage('Patient Schedule')
      Utility.setToLocalStorage('view', 'Patient Schedules')
      SetPatientSchedules(true)
    }
    getAllData(startEndDate, '')
    const setScreenOrientation = async () => {
      console.log(ScreenOrientation.type, 'SCREEN TYPE')

      if (segment == 'week' || segment == 'month') {
        ScreenOrientation.lock(ScreenOrientation.ORIENTATIONS.LANDSCAPE)
      } else {
        console.log('NOT SET')
        ScreenOrientation.unlock()
      }
    }
    setScreenOrientation()
  }, [segment])

  const fetchWorkingHrs = async () => {
    let res: any = await Api.GetSettings()
    if (res.data !== null) {
      startTime = res.data.start
      setStartTime(startTime)
      SetIncludeWeekends(res.data.includeWeekendsInWeekView == 'Yes')
    }
  }

  const getAllData = async (dateVal: any, query: any, load = true) => {
    console.log('date!', dateVal)
    try {
      fetchWorkingHrs()

      // if(segment!=="patients")dateVal=Utility.MomentInstance(new Date());
      // setStartEndDate(dateVal)
      if (query.trim() == '') {
        setLoading(load)
      }
      if (segment == 'patients') {
        let res: ISchedule = await Api.GetSchedule(
          dateVal.format('YYYY-MM-DD'),
          query
        )
        console.log(res, 'FACULTY SCHEDULE', data)

        //
        let arr: any = JSON.stringify(res.events)
        arr = JSON.parse(arr)

        res.events.forEach((_data: any, index: any) => {
          let temp: any = {
            splitVisit: true
          }
          _data.vsttype.forEach((value: any, idx: any) => {
            if (value.isCombined) {
              if (value.isPrimary) {
                temp.isPrimary = value
              } else {
                temp.isSecondary = value
              }
            }

            if (idx + 1 == _data.vsttype.length) {
              if (temp.isPrimary && temp.isSecondary) {
                arr[index].vsttype.push(temp)
              }
            }
          })
        })
        //

        res.events == null ? setData([]) : setData(arr)
      } else {
        console.log(singlePatientID, 'ID OF SINGLE PATIENT')
        if (Utility.readFromLocalStorage('view') == 'home') {
          fetchVisitSchedule()
        } else {
          let res1: any = await Api.GetSinglePatientVisitSchedule(
            singlePatientID
          )
          console.log(res1.data.events.items, 'SINGLE PATIENT DATA')
          res1.data.events == null
            ? setCalendarData([])
            : setCalendarData(res1.data.events.items)
        }
      }
      setLoading(false)
    } catch (err) {
      console.log(err, 'ERROR')
      setLoading(false)
    } finally {
      setTimeout(() => {
        setLoading(false)
      }, 200)
    }
  }

  const handleSegment = (e: any) => {
    let val = e.detail.value
    setMode('manual')
    console.log(val, 'THREE', data)
    if (val == 'patients') {
      // let data:any=[];
      // setData(data);

      // setStartEndDate(Utility.MomentInstance(new Date()))
      // setStartEndDate(startEndDate)
      console.log('date!!', startEndDate)
      // getAllData(startEndDate, '')
      //   getAllPatients(startEndDate);
    }
    if (val == 'today') {
      setCalendarType('timeGridDay')
    }
    if (val == 'week') {
      setCalendarType('timeGridWeek')
    }
    if (val == 'month') {
      setCalendarType('dayGridMonth')
    }
    setSegment(val)
    selectedPatient = []
    setData([])
    Utility.setToLocalStorage('segment', val)
    setLoading(false)
  }

  const addPatient = async () => {
    setShowToast(false)
    try {
      setLoading(true)
      if (selectedPatient.length == 0) {
        showMessage('Please select patients to add!')
        setShowToast(true)
      } else if (selectedPatient.length > 10) {
        showMessage('Can select max 10 patients only!')
        setShowToast(true)
      } else {
        selectedPatient.forEach((v: any, idx: any) => {
          v.sortIndex = idx
        })
        let obj = {
          Patients: selectedPatient,
          VisitDate: startEndDate.format('YYYY-MM-DD')
        }

        console.log(obj, 'OBJECT')

        let res = await Api.addToVisitSchedule(obj)
        console.log(res.data.data, 'res')
        if (res.data !== null) {
          if (res.data.status == 200) {
            setSegment('today')
            selectedPatient = []
          } else {
            showMessage(res.data.message)
            setShowToast(true)
          }
        }

        // history.push("today-view");
        // setSegment("today");
        // selectedPatient = [];
        getAllData(startEndDate, '')
        selectedPatient = []
      }
      setLoading(false)
    } catch (err) {
      console.log(err, 'ERROR SCHEDULE')
      setLoading(false)
    }
  }

  const selectDate = (dateVal: string) => {
    console.log('SELECTED DATE', dateVal, selectedPatient)
    // getAllPatients(dateVal);
    setData([])
    setStartEndDate(dateVal)
    getAllData(dateVal, '', false)
  }

  const viewSchedule = async (id: any) => {
    setSinglePatientID(id)
    setSegment('today')
  }

  const openModal = async (patientId: any, name: any) => {
    setShowModal(true)
    let res: any = await Api.GetDocDueBypID(
      startEndDate.format('YYYY-MM-DD'),
      patientId
    )
    console.log(res, 'RES')
    docData.doc = res.data
    docData.name = name
    setDocData({ ...docData })
  }

  const closeModal = () => {
    docData.doc = []
    docData.name = ''
    setDocData({ ...docData })
    setShowModal(false)
  }

  const handleSearch = async (e: any) => {
    const searchStr = e.target.value.toLowerCase()
    getAllData(startEndDate, searchStr)
  }

  const clearSearch = (e: any) => {
    e.target.value = ''
  }

  const fetchVisitSchedule = async () => {
    setLoading(true)
    setShowToast(false)
    let res: any = await Api.getPatientVisitSchedule(
      startEndDate.format('YYYY-MM-DD'),
      mode
    )
    console.log(res, 'VISITING SCHEDULE')
    setLoading(false)
    if (res.status === 400) {
      showMessage(res.message)
      setShowToast(true)
      return
    }
    res.data == null ? setCalendarData([]) : setCalendarData(res.data)
  }

  const handleMode = async () => {
    setLoading(true)
    setShowToast(false)
    let res: any = await Api.getPatientVisitSchedule(
      startEndDate.format('YYYY-MM-DD'),
      'semiautomatic'
    )
    console.log(res, 'VISITING SCHEDULE')
    setLoading(false)
    if (res.status === 400) {
      showMessage(res.message)
      setShowToast(true)
      return
    }
    getAllData(startEndDate, '')
    // res.data == null ? setCalendarData([]) : setCalendarData(res.data)
  }

  const autoSchedule = async () => {
    SetShowAutoAlert(true)
  }

  const StartAutoScheduling = async (_mode: string) => {
    console.log('mode', _mode, startEndDate)
    try {
      setLoading(true)
      setShowToast(false)
      let res: any = await Api.AutoSchedule(
        startEndDate.format('YYYY-MM-DD'),
        _mode
      )
      if (res.data !== null) {
        console.log(res, 'check')
        if (res.data.status == 401) {
          SetBanner({
            Show: true,
            Message: res.data.message
          })
          setLoading(false)
          return
        } else if (res.data.status == 402) {
          showMessage(res.data.message)
          setShowToast(true)
          return
        }
        res = res.data.data.data
        if (res == undefined || res.length == 0) {
          showMessage('All Patients are already Scheduled!')
        } else {
          showMessage('Patients Scheduled Successfully!')
          // getAllData(startEndDate, '')
        }
        setShowToast(true)
      }
      setLoading(false)
    } catch (err) {
      console.log('err', err)
    } finally {
      getAllData(startEndDate, '')
    }
  }

  const UnMarkFromMissed = async (visit: any) => {
    console.log('missed to active', visit)
    try {
      console.log('toggle from marked missed', visit)
      setLoading(true)

      if (visit.s) {
        Api.PostData(
          `/api/PatientVisitSchedule/UpdateVisitStatus?id=${0}&status=unmissed&patientDateId=${
            visit.s.id
          }`,
          {}
        )
      }

      const result = await Api.PostData(
        `/api/PatientVisitSchedule/UpdateVisitStatus?id=${0}&status=unmissed&patientDateId=${
          visit.p.id
        }`,
        {}
      )
      console.log(result, 'result of marking missed')

      //
      if (result.data) {
        showMessage(result.message)
        setShowToast(true)
        setLoading(false)
        setData([])
        getAllData(startEndDate, '')
      } else {
        throw result
      }
    } catch (err) {
      console.log('err', err)
      showMessage(err.message)
      setShowToast(true)
    }
  }

  const IsDisabled = (item: any) => {
    let _disabled: boolean = true
    if (item.vsttype.length == 1) {
      return false
    }
    item.vsttype.forEach((val: any) => {
      _disabled = _disabled && val.isDisabled
    })

    return _disabled
  }

  return (
    <IonPage>
      {segment == 'week' || segment == 'month' ? null : (
        <Header Name={''} Tabs={true} />
      )}
      {Utility.UpgradePlanAlert(
        Banner.Show,
        () => {
          SetBanner({
            ...Banner,
            Show: false
          })
        },
        Banner.Message
      )}
      <Loading
        ShowLoading={loading}
        CB={() => {
          setLoading(false)
        }}
      />
      <IonContent className={'patient-schedule'} fullscreen>
        {Utility.AutoScheduleAlert(
          ShowAutoAlert,
          SetShowAutoAlert,
          '',
          StartAutoScheduling
        )}
        {Utility.confirmationAlert(
          typeof ShowAlert === 'object',
          SetShowAlert,
          'Change the status back to active?',
          UnMarkFromMissed,
          ShowAlert
        )}
        <IonSegment
          className='tabs'
          onIonChange={handleSegment}
          value={segment}
        >
          {segmentList.map((item: any, key: any) => {
            return (
              <IonSegmentButton key={key} value={item}>
                <IonLabel>{item}</IonLabel>
              </IonSegmentButton>
            )
          })}
        </IonSegment>

        <>
          {segment == 'patients' ? (
            <>
              <IonGrid className='patient-list'>
                {/* DATE CONTROL */}
                {Utility.readFromLocalStorage('view') == 'home' ? (
                  <DateCtrl
                    GetDateLabelVal={selectDate}
                    SetDate={() => {
                      return startEndDate
                    }}
                  />
                ) : (
                  <IonRow>
                    <IonCol>
                      <IonSearchbar
                        onIonChange={handleSearch}
                        onIonBlur={clearSearch}
                      />
                      <img
                        src='/assets/images/search1.svg'
                        alt=''
                        className='searchIcon'
                      />
                    </IonCol>
                  </IonRow>
                )}

                <IonRow>
                  <IonCol>
                    <IonList
                      className={
                        data == undefined || data.length <= 0
                          ? 'text-center search_list'
                          : 'search_list'
                      }
                    >
                      {data == null || data == undefined || data.length <= 0 ? (
                        <>
                          <img src='/assets/images/frame.png' alt='' />
                          <br />
                          <span className='ion-text-center'>
                            <IonLabel className='noPatientText'>
                              No Patients
                            </IonLabel>
                          </span>
                          <br />
                          <span className='subText'>Sync or add patients</span>
                        </>
                      ) : (
                        data.map((item: any, key: any) => {
                          let _cb = (value: any) => {
                            let temp: any = document.getElementById(`_${key}`)
                            if (temp) {
                              if (value) {
                                temp.classList.add('green-check-mark')
                              } else {
                                temp.classList.remove('green-check-mark')
                              }
                            }
                          }
                          return (
                            <>
                              {Utility.readFromLocalStorage('view').includes(
                                'home'
                              ) || page.includes('home') ? (
                                <IonItem mode='md' key={key}>
                                  <IonLabel className='cust-flex cust-width-1 patientTitle'>
                                    {item.title}
                                    <br />
                                    <span className='city'>
                                      {item.cityName}
                                    </span>
                                  </IonLabel>
                                  <IonLabel
                                    className={`cust-flex cust-width-2 visit-types-label ${
                                      item.isDisabled ? 'bubbles ' : ''
                                    }ion-text-left`}
                                  >
                                    <div className='visit-types-wrapper'>
                                      {!item.vsttype || item.vsttype.length == 0
                                        ? ''
                                        : item.vsttype.map((v: any) => {
                                            return !v.splitVisit ? (
                                              !v.isCombined ? (
                                                <span
                                                  onClick={() =>
                                                    //
                                                    {
                                                      if (
                                                        v.visitcolor ==
                                                          '#FF69B4' ||
                                                        v.isCompleted
                                                      ) {
                                                        // alert confirmation
                                                        SetShowAlert({ p: v })
                                                      } else {
                                                        openModal(
                                                          item.patientId,
                                                          item.title
                                                        )
                                                      }
                                                    }
                                                  }
                                                  className={'num'}
                                                  style={{
                                                    backgroundColor:
                                                      v.visitcolor
                                                  }}
                                                >
                                                  {v.visitTypeCode}
                                                </span>
                                              ) : null
                                            ) : (
                                              <div
                                                className='split-outer num'
                                                style={{
                                                  backgroundImage: `linear-gradient(-236deg, ${v.isPrimary.visitcolor} 50%, ${v.isSecondary.visitcolor} 50%)`
                                                }}
                                                onClick={() => {
                                                  if (
                                                    v.isPrimary.visitcolor ==
                                                      '#FF69B4' ||
                                                    v.isSecondary.visitcolor ==
                                                      '#FF69B4' ||
                                                    v.isPrimary.isCompleted ||
                                                    v.isSecondary.isCompleted
                                                  ) {
                                                    SetShowAlert({
                                                      p: v.isPrimary,
                                                      s: v.isSecondary
                                                    })
                                                  }
                                                }}
                                              >
                                                <span>
                                                  {v.isPrimary.visitTypeCode}
                                                </span>
                                              </div>
                                            )
                                          })}
                                    </div>
                                  </IonLabel>
                                  {IsDisabled(item) ||
                                  (item.vsttype.length == 1 &&
                                    item.vsttype[0].visitcolor ===
                                      '#FF69B4') ? (
                                    <>
                                      <IonCheckbox
                                        checked={false}
                                        mode={'ios'}
                                      />
                                      <i
                                        className='fas fa-check green-text transparent'
                                        id={`_${key}`}
                                      ></i>
                                    </>
                                  ) : (
                                    <>
                                      <IonCheckbox
                                        mode={'ios'}
                                        // disabled={item.isDisabled}
                                        // style={{display:item.isDisabled?'none':'block'}}
                                        onIonChange={e => {
                                          _cb(e.detail.checked)
                                          if (e.detail.checked) {
                                            let obj: any = {
                                              patientId: item.patientId,
                                              colorType: item.colorType,
                                              routineVisitDate: ''
                                            }
                                            if (
                                              item.vsttype !== undefined &&
                                              item.vsttype.length !== 0
                                            ) {
                                              //  console.log(item.vsttype[0].visitTypeCode,"VISIT")
                                              let flag: any = {}
                                              let dat2 = item.vsttype.find(
                                                (a: any) => {
                                                  if (a.isCombined) {
                                                    if (
                                                      Object.keys(flag)
                                                        .length != 0
                                                    ) {
                                                      selectedPatient.push({
                                                        patientId:
                                                          item.patientId,
                                                        colorType:
                                                          item.colorType,
                                                        routineVisitDate:
                                                          flag.routineVisitDate,
                                                        clinicianId:
                                                          flag.clinicianId,
                                                        isCombined:
                                                          flag.isCombined,
                                                        certEndDate:
                                                          flag.certEndDate,
                                                        recertId: flag.recertId
                                                      })
                                                      return true
                                                    }
                                                    flag = a
                                                    return false
                                                  }
                                                  return (
                                                    a.visitcolor !==
                                                      '#808080' &&
                                                    a.visitcolor !==
                                                      '#FF69B4' &&
                                                    !a.isCompleted
                                                  )
                                                }
                                              )

                                              if (dat2 == undefined) {
                                                showMessage(
                                                  'Patient already added in Visiting Schedule!'
                                                )
                                                setShowToast(true)
                                                // e.detail.checked=false
                                                e.stopPropagation()
                                                return false
                                              }

                                              // check fix
                                              obj.routineVisitDate =
                                                dat2.routineVisitDate
                                              obj.clinicianId = dat2.clinicianId
                                              obj.isCombined = dat2.isCombined
                                              obj.certEndDate = dat2.certEndDate
                                              obj.recertId = dat2.recertId
                                              // if (
                                              //   dat2 !== undefined &&
                                              //   dat2.visitTypeCode == 'RV'
                                              // ) {
                                              // } else {
                                              //   delete obj.routineVisitDate
                                              // }
                                              setShowToast(false)

                                              obj.colorType =
                                                dat2 == undefined
                                                  ? item.colorType
                                                  : dat2.visitTypeCode
                                            } else {
                                              delete obj.routineVisitDate
                                            }

                                            selectedPatient.push(obj)
                                          } else {
                                            let index = selectedPatient.findIndex(
                                              (element: any) => {
                                                return (
                                                  element.patientId ==
                                                  item.patientId
                                                )
                                              }
                                            )
                                            console.log(index, 'in')

                                            if (index != -1) {
                                              if (
                                                selectedPatient[index]
                                                  .isCombined
                                              ) {
                                                selectedPatient.splice(index, 1)

                                                let index2 = selectedPatient.findIndex(
                                                  (ele: any) => {
                                                    return (
                                                      ele.patientId ==
                                                        item.patientId &&
                                                      ele.isCombined
                                                    )
                                                  }
                                                )

                                                if (index2 !== -1) {
                                                  selectedPatient.splice(
                                                    index2,
                                                    1
                                                  )
                                                }
                                              } else {
                                                selectedPatient.splice(index, 1)
                                              }
                                            }
                                          }

                                          console.log(
                                            selectedPatient,
                                            'Selected patients !!!!'
                                          )
                                        }}
                                      />
                                      <i
                                        className='fas fa-check green-text'
                                        id={`_${key}`}
                                      ></i>
                                    </>
                                  )}
                                </IonItem>
                              ) : (
                                <IonItem
                                  key={key}
                                  onClick={() => viewSchedule(item.patientId)}
                                >
                                  <IonLabel>{item.title}</IonLabel>
                                </IonItem>
                              )}
                            </>
                          )
                        })
                      )}
                    </IonList>
                  </IonCol>
                </IonRow>
              </IonGrid>
              {page == 'home' ||
              Utility.readFromLocalStorage('view') == 'home' ? (
                <>
                  <IonFab
                    vertical='bottom'
                    horizontal='start'
                    slot='fixed'
                    className='boxesIcon l0'
                  >
                    <IonFabButton onClick={autoSchedule}>
                      {/* <img src="/assets/images/boxes.png" alt="" /> */}
                      <i className='fas fa-bolt'></i>
                    </IonFabButton>
                  </IonFab>
                  <IonFab vertical='bottom' horizontal='end' slot='fixed'>
                    <IonFabButton
                      className='bgGreen'
                      onClick={addPatient}
                      disabled={
                        data == undefined || data.length == 0 ? true : false
                      }
                    >
                      <IonIcon icon={add} />
                    </IonFabButton>
                  </IonFab>
                </>
              ) : (
                ''
              )}
            </>
          ) : (
            <>
              <IonGrid>
                <FullCalendarCtrl
                  view={calendarType}
                  cDate={() => {
                    return startEndDate.format('YYYY-MM-DD') + 'T00:00:00.000Z'
                  }}
                  events={calendarData}
                  _Refetch={() => {
                    getAllData(startEndDate, '')
                  }}
                  calendarID={page}
                  startTime={startTime}
                  IncludeWeekends={IncludeWeekends}
                  callBack={(_data: any) => {}}
                  SetupLoading={(fn: any) => {
                    _load = fn
                  }}
                  PatientSchedules={PatientSchedules}
                />
              </IonGrid>
              {/* <Footer segment={segment} callBack={calendarData} /> */}
              <div className='fab-btn-wrapper'>
                {!PatientSchedules && segment == 'today' ? (
                  <IonFab
                    vertical='bottom'
                    horizontal='center'
                    slot='fixed'
                    className='boxesIcon'
                  >
                    <IonFabButton onClick={handleMode}>
                      <img src='/assets/images/boxes.png' alt='' />
                    </IonFabButton>
                  </IonFab>
                ) : null}
                <IonFab
                  vertical='bottom'
                  horizontal='end'
                  slot='fixed'
                  className='boxesIcon refresh-cal-wrapper'
                >
                  <IonFabButton>
                    <i
                      className='fas fa-redo-alt'
                      onClick={() => {
                        if (_load) {
                          _load(true)
                        }
                        getAllData(startEndDate, '')
                      }}
                    ></i>
                  </IonFabButton>
                </IonFab>
              </div>
            </>
          )}

          {Utility.toast(showToast, message, () => {
            setShowToast(false)
          })}
        </>
        <IonModal
          isOpen={showModal}
          cssClass='modal-container'
          backdropDismiss={false}
        >
          <Loading ShowLoading={loading} />
          <div className='modalClass'>
            <IonRow className='modalHead'>
              <IonCol size='2'></IonCol>
              <IonCol className='ion-text-center' size='8'>
                <IonLabel className='modalHeadTitle'>
                  {docData.name == '' ? '--' : docData.name}
                </IonLabel>
              </IonCol>
              <IonCol size='2'>
                <IonIcon
                  className='ion-text-right modalCloseIcon'
                  name='close'
                  onClick={closeModal}
                ></IonIcon>
              </IonCol>
            </IonRow>
            <div className='modalInner'>
              {docData.doc == null ||
              docData.doc == undefined ||
              docData.doc.length == 0 ? (
                <IonRow>
                  <IonCol>
                    <IonLabel>No Data Found.</IonLabel>
                  </IonCol>
                </IonRow>
              ) : (
                docData.doc.map((v: any) => {
                  return (
                    <IonRow>
                      <IonCol>
                        <IonLabel className='modalSubHead'>
                          {v.visitType}
                        </IonLabel>
                        <br />
                        {v.events == undefined || v.events.length == 0 ? (
                          <IonLabel>--</IonLabel>
                        ) : (
                          v.events.map((item: any) => {
                            return (
                              <IonLabel>
                                {Utility.FormatMDY(item.patientDates)}
                              </IonLabel>
                            )
                          })
                        )}
                      </IonCol>
                    </IonRow>
                  )
                })
              )}
            </div>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  )
}

export default Schedule
