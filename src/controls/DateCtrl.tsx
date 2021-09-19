import React from 'react'
import { IonRow, IonCol } from '@ionic/react'
import moment from 'moment'

interface IState {
  CustomDate: any
  [x: string]: any
}

class DateCtrl extends React.Component<any, IState> {
  InitDateLabel = () => {
    this.setState({
      CustomDate: this.props.SetDate()
    })
  }

  constructor (props: any) {
    super(props)
    this.state = {
      CustomDate: moment(new Date())
    }
  }

  componentDidMount () {
    console.log('mount...')
    this.InitDateLabel()
  }

  componentWillUnmount () {
    console.log('Leaving...')
  }

  RenderDateRange = (random: any) => {
    return `${moment(this.state.CustomDate).format('MM-DD-YYYY')}`
  }

  HandleDateChange = (action: any, count: any) => {
    let temp: any

    if (action == 'inc') {
      if (count == 'd') {
        temp = moment(this.state.CustomDate).add(1, 'day')
      } else {
        temp = moment(this.state.CustomDate).add(1, 'week')
      }
    } else {
      if (count == 'd') {
        temp = moment(this.state.CustomDate).subtract(1, 'day')
      } else {
        console.log('reduce 1 month')
        temp = moment(this.state.CustomDate).subtract(1, 'week')
      }
    }

    console.log('action', action, temp)
    this.setState(
      {
        CustomDate: temp
      },
      () => {
        // return data
        if (this.props.GetDateLabelVal)
          this.props.GetDateLabelVal(this.state.CustomDate)
      }
    )
  }

  render () {
    return (
      <>
        <IonRow className='slider-outer'>
          <IonCol className='outerarrow' size='3'>
            {/* Decrement Month */}
            <img
              src='/assets/images/doubleLeftArrow.png'
              onClick={() => {
                this.HandleDateChange('dec', 'm')
              }}
            />
          </IonCol>
          <IonCol className='date-section text-center bgSeaGreen' size='6'>
            {/* Decrement Day */}
            <img
              src='/assets/images/leftArrow.png'
              onClick={() => {
                this.HandleDateChange('dec', 'd')
              }}
            />
            <label id='inputDate'>{`${this.RenderDateRange(
              this.state.CustomDate
            )}`}</label>
            {/* Increment Day */}
            <img
              src='/assets/images/rightArrow.png'
              onClick={() => {
                this.HandleDateChange('inc', 'd')
              }}
            />
          </IonCol>
          <IonCol className='outerarrow ion-text-right' size='3'>
            {/* Increment Month */}
            <img
              src='/assets/images/doubleRightArrow.png'
              onClick={() => {
                this.HandleDateChange('inc', 'm')
              }}
            />
          </IonCol>
        </IonRow>
      </>
    )
  }
}

export default DateCtrl
