import React, { Component } from 'react'
import { IonInput, IonItem, IonLabel, IonCol, IonRow } from '@ionic/react'
import { Controller } from 'react-hook-form'

interface InputProps {
  control: any
  showError: any
  label: string
  type: any
  placeholder?: string
  name: string
  required: boolean
  min?: string
  max?: string
}

export default class InputCtrl extends Component<InputProps> {
  render () {
    let name = this.props.name
    let rules: any = {
      required: this.props.required,
      pattern: {
        value: /[A-Za-z0-9]{1,20}/,
        message: "Field can't be empty!"
      },
      maxLength: { value: 40, message: 'Can use max be 40 chars' },
      minLength: { value: 4, message: 'Must be 5 chars long' }
    }

    if (this.props.type == 'tel') {
      rules = {
        required: this.props.required,
        maxLength: {
          value: 14,
          message: 'Can use max 14 digits (Ex: +44 888888888888)!'
        },
        minLength: { value: 11, message: 'Must be 11 digits long!' },
        pattern: {
          value: /^(\+|\d)[0-9]{7,15}$/,
          message: 'Invalid mobile number'
        }
      }
    }

    if (
      name == 'preferredName' ||
      name == 'firstName' ||
      name == 'mdName' ||
      name == 'lastName'
    ) {
      rules.minLength.value = 1
      rules.minLength.message = 'Must be 1 char long'
    }

    if (this.props.type == 'number') {
      rules.minLength.value = 1
      rules.minLength.message = 'Must include 1 digit'
    }

    return (
      <>
        <IonRow>
          <IonCol>
            <IonItem className='fields' lines='none'>
              <IonLabel position='floating'>{this.props.label}</IonLabel>
              <Controller
                render={({ onChange, onBlur, value }) => (
                  <IonInput
                    onBlur={onBlur}
                    name={this.props.name}
                    onIonChange={onChange}
                    value={value}
                    type={this.props.type}
                    placeholder={this.props.placeholder}
                    min={this.props.min}
                    max={this.props.max}
                  />
                )}
                name={this.props.name}
                control={this.props.control}
                rules={rules}
              />
              {this.props.type == 'date' ? (
                <img
                  src='/assets/images/calIcon.svg'
                  alt=''
                  className='calIcon'
                />
              ) : (
                ''
              )}
            </IonItem>
            {this.props.showError(name)}
          </IonCol>
        </IonRow>
      </>
    )
  }
}
