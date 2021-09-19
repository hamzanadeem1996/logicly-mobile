import React, { useState, useEffect } from 'react'
import TimeKeeper from 'react-timekeeper'
import { formatAMPM } from '../shared/utility'
import moment from 'moment'
const ClockTimePicker: React.FC<any> = (props: any) => {
  const [time, setTime] = useState({
    fr12: '12:30 pm',
    fr24: ''
  })
  useEffect(() => {
    console.log('time', props.Value)

    if (!props.Value) {
      setTime({
        fr12: formatAMPM(new Date()),
        fr24: moment(formatAMPM(new Date()), ['h:mm A']).format('HH:mm')
      })
    } else {
      setTime({
        fr12: props.Value,
        fr24: moment(props.Value, ['h:mm A']).format('HH:mm')
      })
    }
  }, [])
  return (
    <div className='clock-picker'>
      <TimeKeeper
        time={time.fr12}
        onChange={newTime =>
          setTime({ fr12: newTime.formatted12, fr24: newTime.formatted24 })
        }
        onDoneClick={() => {
          props.DataCB(time)
          props.SetShow(false)
        }}
        switchToMinuteOnHourSelect
      />
    </div>
  )
}

export default ClockTimePicker
