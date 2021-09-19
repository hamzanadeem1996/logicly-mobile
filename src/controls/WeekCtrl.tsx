import React, { useState, useEffect } from 'react'
import { IonRow, IonCol, useIonViewDidEnter } from '@ionic/react'
import * as Utility from '../shared/utility'

interface IWeekVal {
  currentDate?: any
  endDate?: any
}

let initialState = {
  currentDate: '',
  endDate: ''
}

const WeekCtrl: React.FC<IWeekVal> = (props: IWeekVal) => {
  const [state, setState] = useState<IWeekVal>(initialState)

  useEffect(() => {
    fetchData(new Date())
  }, [])

  useIonViewDidEnter(() => {
    setState({ ...initialState })
    SendResult(state)
  })

  const fetchData = (dat: any) => {
    let d = dat
    state.currentDate = d.toDateString()
    state.endDate = new Date(d.setDate(d.getDate() + 7)).toDateString()
  }

  const nextWeek = () => {
    let d = new Date(state.currentDate)
    let start = new Date(d.setDate(d.getDate() + 7))
    state.currentDate = start.toDateString()
    state.endDate = new Date(start.setDate(start.getDate() + 6)).toDateString()
    setState({ ...state })
    SendResult(state)
  }
  const prevWeek = () => {
    let d = new Date(state.currentDate)
    let start = new Date(d.setDate(d.getDate() - 7))
    state.currentDate = start.toDateString()
    state.endDate = new Date(start.setDate(start.getDate() + 7)).toDateString()
    setState({ ...state })
    SendResult(state)
  }

  const SendResult = (custDate: IWeekVal) => {
    if (props.currentDate != undefined) {
      let startDate = Utility.getFormatedDate(custDate.currentDate)
      let endDate = Utility.getFormatedDate(custDate.endDate)
      props.currentDate(`${startDate + ',' + endDate}`)
    }
  }

  return (
    <>
      <IonRow className='ion-text-center weekCtrl'>
        <IonCol size='12'>
          <img src='/assets/images/leftArrow.png' onClick={prevWeek} />
          <label>
            {Utility.formatMMDD_DD_YYYY(state.currentDate, state.endDate)}
          </label>
          <img
            src='/assets/images/rightArrow.png'
            className='ion-text-right'
            onClick={nextWeek}
          />
        </IonCol>
      </IonRow>
    </>
  )
}

export default WeekCtrl
