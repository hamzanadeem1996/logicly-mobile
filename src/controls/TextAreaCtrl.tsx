import React, { Component } from 'react'
import { IonItem, IonCol, IonRow, IonLabel, IonTextarea } from '@ionic/react'
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

export default class TextAreaCtrl extends Component<InputProps> {
  render () {
    let name = this.props.name
    let rules: any = {
      required: this.props.required,
      pattern: {
        value: /[A-Za-z0-9]{1,20}/,
        message: "Field can't be empty!"
      }
    }

    return (
      <>
        <IonRow>
          <IonCol size='12'>
            <IonItem className='textArea' lines='none'>
              <IonLabel position='floating'>{this.props.label}</IonLabel>
              <Controller
                render={({ onChange, onBlur, value }) => (
                  <IonTextarea
                    inputmode={this.props.type}
                    onBlur={onBlur}
                    name={this.props.name}
                    onIonChange={onChange}
                    value={value}
                    placeholder={this.props.placeholder}
                    rows={2}
                    wrap={'hard'}
                    autoGrow={true}
                    cols={12}
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
