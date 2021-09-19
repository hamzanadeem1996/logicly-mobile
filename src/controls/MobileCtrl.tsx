import React, { Component } from 'react'
import { IonItem, IonLabel, IonCol, IonRow } from '@ionic/react'
import { Controller } from 'react-hook-form'
import InputMask from 'react-input-mask'

interface InputProps {
  control: any
  showError: any
  label?: string
  type: any
  placeholder?: string
  name: string
  required: boolean
  min?: string
  max?: string
}

export default class MobileCtrl extends Component<InputProps> {
  render () {
    let name = this.props.name
    let rules: any = {}

    if (this.props.type == 'tel') {
      rules = {
        required: this.props.required
      }
    }

    return (
      <>
        <IonRow>
          <IonCol>
            <IonItem className='fields mobileCtrl' lines='none'>
              <IonLabel position='floating'>{this.props.label}</IonLabel>
              <Controller
                render={({ onChange, onBlur, value }) => (
                  <InputMask
                    className='maskField'
                    name={this.props.name}
                    mask='(999)999-9999'
                    type={this.props.type}
                    alwaysShowMask={true}
                    value={value}
                    onChange={onChange}
                  />
                )}
                name={this.props.name}
                control={this.props.control}
                rules={rules}
              />
            </IonItem>
            {this.props.showError(name)}
          </IonCol>
        </IonRow>
      </>
    )
  }
}
