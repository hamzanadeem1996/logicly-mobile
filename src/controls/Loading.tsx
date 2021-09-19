import React, { Component } from 'react'
import { IonLoading } from '@ionic/react'
export default class Loading extends Component<any> {
  constructor (props: any) {
    super(props)
  }
  render () {
    return (
      <IonLoading
        isOpen={this.props.ShowLoading}
        message={'Please wait...'}
        duration={7000}
        onDidDismiss={() => {
          if (this.props.CB) this.props.CB()
        }}
      />
    )
  }
}
