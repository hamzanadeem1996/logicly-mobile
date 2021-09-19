import React, { useState } from 'react'
import { IonFab, IonFabButton } from '@ionic/react'
import * as Utility from '../../shared/utility'

interface IProps {
  segment?: any
  callBack?: any
  modeChanged?: any
}

const ScheduleFooter: React.FC<IProps> = ({ callBack, segment }) => {
  const [showToast, setShowToast] = useState(false)
  const [message, showMessage] = useState<string>()

  const GetStyles = () => {
    if (segment != 'today') {
      return {
        left: '0'
      }
    }

    return {}
  }

  return (
    <>
      <IonFab
        vertical='bottom'
        horizontal='center'
        slot='fixed'
        className='navIcon'
      >
        <IonFabButton
          onClick={e => {
            let data = callBack.find((v: any) => {
              return Utility.getTime(v.start) > Utility.getTime(new Date())
            })
            if (data == undefined) {
              setShowToast(true)
              showMessage('You have visited all your patients!')
              setTimeout(() => {
                setShowToast(false)
              }, 2000)
            } else {
              Utility.navigateToGoogleMaps(
                data.patientLat,
                data.patientLong,
                data.patientAddress
              )
            }
          }}
          style={GetStyles()}
        >
          <img src='/assets/images/nav1.svg' alt='' />
        </IonFabButton>
      </IonFab>
      {Utility.toast(showToast, message)}
    </>
  )
}

export default ScheduleFooter
