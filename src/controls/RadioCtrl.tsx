import React, { Component } from 'react'
import { IonItem, IonLabel, IonRadio, IonRadioGroup } from '@ionic/react'
import { Controller } from 'react-hook-form'

interface IRadioProps {
  control: any
  list: any
  itemLabel?: string
  itemValue?: string
  showError: any
  name: string
  required: boolean
  CB?: any
}

export default class RadioCtrl extends Component<IRadioProps> {
  render () {
    let name = this.props.name
    let iVal = this.props.itemValue
    let iLabel = this.props.itemLabel

    return (
      <>
        <IonItem className='radioCtrl' lines='none'>
          <Controller
            render={({ onChange, onBlur, value }) => (
              <IonRadioGroup
                value={value}
                onIonChange={e => {
                  if(this.props.CB){this.props.CB(e.detail.value.toLowerCase())}
                  onChange(e.detail.value)}}
              >
                {this.props.list.map((item: any, key: any) => (
                  <IonItem lines='none'>
                    <IonLabel>
                      {iLabel == undefined ? item : item[iLabel]}
                    </IonLabel>
                    <IonRadio
                      mode='md'
                      slot='start'
                      value={iVal == undefined ? item : item[iVal]}
                    />
                  </IonItem>
                ))}
              </IonRadioGroup>
            )}
            name={name}
            control={this.props.control}
            rules={{
              required: this.props.required
            }}
          />
        </IonItem>

        <IonLabel className='text-center'>
          {this.props.showError(name)}
        </IonLabel>
      </>
    )
  }
}
