import React, { useEffect, useState } from 'react'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridDayPlugin from '@fullcalendar/timegrid'
import { useHistory } from 'react-router'
import $ from 'jquery'
import interactionPlugin from '@fullcalendar/interaction'
import * as Utility from '../shared/utility'
import * as Api from '../service/api'
import moment from 'moment'
import Loading from './Loading'
interface CalendarProps {
  events: any
  view: string
  calendarID: string
  callBack?: any
  cDate?: any
  startTime?: any
  IncludeWeekends?: boolean
  _Refetch?: any
  PatientSchedules?: boolean
  SetupLoading?: any
}
let MarkMissed: any = undefined
let remove: any = undefined
let lock: any = undefined
let CurrentDate: any =
  moment(new Date()).format('YYYY-MM-DD') + 'T00:00:00.000Z'
let flag: number = 0
const FullCalendarCtrl: React.FC<CalendarProps> = ({
  view,
  events,
  calendarID,
  callBack,
  cDate,
  startTime,
  IncludeWeekends = true,
  _Refetch,
  PatientSchedules = false,
  SetupLoading = () => {}
}) => {
  let history = useHistory()
  const [alert, setAlert] = useState(false)
  const [message, showMessage] = useState<any>({ message: '' })
  const [patientData, setPatientData] = useState<any>()
  const [loading, setLoading] = useState<any>(false)
  const [showToast, setShowToast] = useState(false)
  let [state, setState] = useState<any>({
    success: false,
    currentDate: '',
    dragStop: false,
    status: false
  })
  useEffect(() => {
    //
    if (flag) {
      flag = 0
      if (window._x) {
        CurrentDate =
          moment(window._x.view.getCurrentData().currentDate)
            .utc()
            .format('YYYY-MM-DD') + 'T00:00:00.000Z'
      } else {
        CurrentDate = cDate()
      }
    } else {
      CurrentDate = cDate()
    }
    //

    LoadCalendar(view, events)
  }, [view, events, startTime])

  useEffect(() => {
    window._x = undefined
    flag = 0
    if (SetupLoading) SetupLoading(setLoading)
  }, [])

  const deletion = async (_patientData: any) => {
    //
    // let temp: any = events.find((evt: any) => {
    //   return evt.id == _patientData.event._def.publicId
    // })

    // let check: any
    // if (temp) {
    //   check = events.find((evt: any) => {
    //     return (
    //       evt.id != _patientData.event._def.publicId &&
    //       evt.isCombined &&
    //       temp.recertId == evt.recertId &&
    //       temp.patientId == evt.patientId &&
    //       temp.start.split('T')[0] == evt.start.split('T')[0]
    //     )
    //   })

    //   //
    //   if (check) {
    //     Api.DelPatientFromCal(check.id)
    //   }
    // }

    // console.log('dta', _patientData, check, temp)
    //

    let ID = _patientData.event._def.publicId
    console.log('GOT INO DELETION BLOCK', ID)
    try {
      setLoading(true)
      let API_Response = await Api.DelPatientFromCal(ID)
      if (API_Response.data.data == null) {
        showMessage('Deleted Successfully')
      } else {
        showMessage('Something went wrong!')
      }
      // check
      // callBack(data)
      flag = 1
      if (_Refetch) _Refetch()

      setShowToast(true)
      setLoading(false)
    } catch (err) {
      console.log(err, 'ERROR IN DELETION')
    }
  }

  const LockEvent = async (_patientData: any) => {
    console.log(_patientData, 'PATIENT')
    let ID = _patientData.event.extendedProps.patientId
    console.log('GOT INO LOCK BLOCK', ID)
    try {
      setLoading(true)
      let API_Response = await Api.lockPatient(
        _patientData.event._def.publicId,
        state.status ? false : true
      )
      let status = false
      if (API_Response.message.toLowerCase().includes('success')) {
        status = true
        showMessage(`${state.status ? 'Unlocked' : 'Locked'} Successfully`)
      } else {
        status = false
        showMessage('Something went wrong!')
      }
      let data = {
        status: status,
        currentDate: state.currentDate
      }
      // callBack(data)
      flag = 1
      if (_Refetch) _Refetch()

      setShowToast(true)
      // setLoading(false)
    } catch (err) {
      console.log(err, 'ERROR IN LOCKING')
    }
  }

  const ViewDeletePatient = (name: any) => {
    showAlert('Options for ' + name.replace(/,/, ''))
  }

  const showAlert = (_message: any) => {
    showMessage(_message)
    setAlert(true)
  }

  const viewDetails = () => {
    let pID = patientData.event._def.extendedProps.patientId
    history.push('details/' + pID)
  }

  const navigateTo = () => {
    let data = patientData.event._def.extendedProps
    let lat = data.patientLat
    let long = data.patientLong

    Utility.navigateToGoogleMaps(lat, long, data.patientAddress)
  }

  const MarkAsMissed = async (data: any, status: any = 'Missed') => {
    console.log('marking as missed...')

    //
    // let temp: any = events.find((evt: any) => {
    //   return evt.id == data.event._def.publicId
    // })

    // let check: any
    // if (temp) {
    //   check = events.find((evt: any) => {
    //     return (
    //       evt.id != data.event._def.publicId &&
    //       evt.isCombined &&
    //       temp.recertId == evt.recertId &&
    //       temp.patientId == evt.patientId &&
    //       temp.start.split('T')[0] == evt.start.split('T')[0]
    //     )
    //   })

    //   //
    //   if (check) {
    //     Api.PostData(
    //       `/api/PatientVisitSchedule/UpdateVisitStatus?id=${
    //         check.id
    //       }&status=${status}&patientDateId=${0}`,
    //       {}
    //     )
    //   }
    // }

    // console.log('dta', patientData, check, temp)
    //

    try {
      setLoading(true)
      const result: any = await Api.PostData(
        `/api/PatientVisitSchedule/UpdateVisitStatus?id=${
          data.event._def.publicId
        }&status=${status}&patientDateId=${0}`,
        {}
      )
      console.log(result, 'result of marking missed')
      // GoBack()
      if (result.status == 402) {
        throw result
      }
      flag = 1
      if (_Refetch) _Refetch()

      setLoading(false)
      showMessage(result.message)
      setShowToast(true)
    } catch (err) {
      console.log(err.message, 'error')
      setLoading(false)
      showMessage(err.message)
      setShowToast(true)
    }
  }

  const IsCalendarEditable = (_view: any) => {
    if (PatientSchedules) return false
    return _view == 'dayGridMonth' ? false : true
  }

  const LoadCalendar = (_view: any, _events: any) => {
    console.log(startTime, 'START')
    // if (_view == 'timeGridDay' && calendarID == 'home') {
    _events.forEach((v: any) => {
      if (v.isLocked) {
        v.editable = false
      }
      if (v.distance == undefined) return
      v.title = `${v.title}, Drive: ${v.distance} ${
        v.units == 'Kilometers' ? 'Km' : 'mi'
      }\n`
    })
    // }

    var calendarEl: any = document.getElementById(calendarID)
    var calendar = new Calendar(calendarEl, {
      initialView: _view,
      titleFormat: { month: 'long', day: 'numeric', year: 'numeric' },
      now: moment().format('YYYY-MM-DD') + 'T00:00:00',
      height: 650,
      timeZone: 'UTC',
      scrollTime: startTime,
      contentHeight: 700,
      editable: IsCalendarEditable(_view),
      eventDurationEditable: false,
      droppable: true,
      allDaySlot: false,
      longPressDelay: 100,
      eventLongPressDelay: 100,
      selectLongPressDelay: 100,
      slotDuration: '00:15:00',
      slotLabelInterval: '01:00',
      eventOverlap: false,
      weekends: IncludeWeekends,
      headerToolbar: {
        left: 'prev',
        center: 'title',
        right: 'next'
      },
      datesSet: function (info) {
        console.log('INFO', info, calendar.getDate())
        calendar.gotoDate(calendar.getDate())
      },
      eventClick: function (data) {
        state.currentDate = Utility.FormatYYYY_MM_DD(calendar.getDate())
        state.status = data.event._def.extendedProps.isLocked
        setState({ ...state })
        if (calendarID == 'home') {
          let name = data.event._def.title.split('Drive')[0]
          setPatientData({ ...data })
          remove = () => {
            remove = undefined
            deletion(data)
          }
          MarkMissed = (status: any) => {
            MarkMissed = undefined
            MarkAsMissed(data, status)
          }
          lock = () => {
            lock = undefined
            LockEvent(data)
          }
          ViewDeletePatient(name)
        }
        console.log(
          Utility.FormatYYYY_MM_DD(calendar.getDate()),
          'CURRENT DATE'
        )
      },
      eventDrop: async function (info: any) {
        // console.log(info, 'DRAG DROP INFO')
        // if (_view == 'dayGridMonth') return
        // let id = info.event._def.publicId
        // let start = Utility.utcFormatVisitDate(
        //   info.event._instance?.range.start
        // )
        // let end = Utility.utcFormatVisitDate(info.event._instance?.range.end)

        // let res = await Api.updatePatientVisitSchedule(id, start, end)
        // console.log(res, 'UPDATED SCHEDULE')
        // showMessage(res.data.message)
        // setShowToast(true)
        // if (res.data.status == 401) {
        //   info.revert()
        // }

        // if (_this.state.APIStatus.InProgress) {
        //   info.revert()
        //   return
        // }

        // _this.setState({
        //   APIStatus: {
        //     ..._this.state.APIStatus,
        //     InProgress: true
        //   }
        // })

        try {
          setLoading(true)
          // reverse update combined visit
          let reverseUpdateFlag: number = 0
          if (info.event._def.extendedProps.isCombined) {
            let data: any = info.event._def.extendedProps
            if (data.colorChar == 'D') {
              reverseUpdateFlag = 1
              // info.revert()
              // return
            }
          }

          let id = info.event._def.publicId

          // first block start/end //
          let start = moment(info.event._instance.range.start)
            .utc()
            .format()
          let end = moment(info.event._instance.range.end)
            .utc()
            .format()

          console.log('info', info, info.event._def.extendedProps)
          // - //

          // second block star/end //
          // iscombined
          let temp: any = events.find((evt: any) => {
            return evt.id == info.event._def.publicId
          })

          let check: any = null,
            start2: any = null,
            end2: any = null

          if (temp) {
            check = events.find((evt: any) => {
              return (
                evt.id != info.event._def.publicId &&
                evt.isCombined &&
                temp.recertId == evt.recertId &&
                temp.patientId == evt.patientId &&
                temp.start.split('T')[0] == evt.start.split('T')[0]
              )
            })
            if (check) {
              let startEvt2 = new Date(check.start).getTime()
              let endEvt2 = new Date(check.end).getTime()
              let endEvt1 = new Date(end).getTime()

              start2 = end
              end2 = moment(endEvt1 + (endEvt2 - startEvt2))
                .utc()
                .format()
            }
          }
          // - //

          // if (reverseUpdateFlag) {
          //   // case when bottom block of a combined visit is dragged/dropped
          //   let swap
          //   // start time
          //   swap = start
          //   start = start2
          //   start2 = swap

          //   // end time
          //   swap = end
          //   end = end2
          //   end2 = swap
          // }
          let result = await Api.updatePatientVisitSchedule(
            id,
            start,
            end,
            info.event._def.extendedProps.combinationVisit
          )

          // API.GetData(
          //   `/PatientVisitSchedule/UpdatePatientVisitSchedule?visitScheduleId=${id}&StartDate=${start}&EndDate=${end}&isCombined=${!!check}`
          // )

          console.log(info, start, id, end, result.data, 'DRAG DROP INFO')

          if (result.data.status == 402) {
            // utility.ShowAlert(result.message, 'error')
            info.revert()
          } else {
            // if (temp) {
            //   // got valid data(temp) to compare with
            //   if (check && start2 && end2) {
            //     // means the just updated schedule was a in combination with other(check)
            //     // api
            //     let r = await Api.updatePatientVisitSchedule(
            //       check.id,
            //       start2,
            //       end2,
            //       check.isCombined
            //     )
            if (info.event._def.extendedProps.combinationVisit) {
              flag = 1
              if (_Refetch) _Refetch()
            }
            // API.GetData(
            //   `/PatientVisitSchedule/UpdatePatientVisitSchedule?visitScheduleId=${check.id}&StartDate=${start2}&EndDate=${end2}&isCombined=${check.isCombined}`
            // )

            // _this.ReFetchMethod(_this.props.FetchStartdate())
            // }
            // }
            //
          }
        } catch (err) {
          console.log('err', err)
        } finally {
          setLoading(false)
          // console.log('i am reverting...')
          // _this.setState({
          //   APIStatus: {
          //     ..._this.state.APIStatus,
          //     InProgress: false
          //   }
          // })
        }
      },
      eventDragStop: function (data) {
        $('.fc-event').removeClass('fc-event-draggable fc-event-selected')
        setTimeout(() => {
          $('.fc-event').addClass('fc-event-draggable')
        }, 1000)
      },
      events: _events,
      plugins: [timeGridDayPlugin, dayGridPlugin, interactionPlugin]
    })

    //
    window._x = calendar
    if (loading) setLoading(false)
    //

    calendar.render()
    console.log('date!!', cDate())
    calendar.gotoDate(CurrentDate)
  }

  return (
    <>
      <Loading
        ShowLoading={loading}
        CB={() => {
          setLoading(false)
        }}
      />
      <div
        id={calendarID}
        className={`${view == 'timeGridDay' ? 'timeGrid' : ''}`}
      ></div>
      {Utility.viewDeletePatientPopup(
        alert,
        setAlert,
        message,
        viewDetails,
        remove,
        navigateTo,
        lock,
        (status: any = 'Missed') => {
          MarkMissed(status)
        },
        state.status ? 'Unlock' : 'Lock'
      )}
      {Utility.toast(showToast, message)}
    </>
  )
}

export default FullCalendarCtrl
