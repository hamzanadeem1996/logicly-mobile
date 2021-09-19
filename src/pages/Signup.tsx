import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonToast,
  useIonViewDidEnter
} from '@ionic/react'
import InputCtrl from '../controls/InputCtrl'
import * as Api from '../service/api'
import { menuController } from '@ionic/core'
import { useHistory } from 'react-router'
import Loading from '../controls/Loading'

let initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  roleId: 0
}

interface IFormInput {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  roleId: number
}

const Signup: React.FC = () => {
  const { control, handleSubmit, errors, reset } = useForm<IFormInput>({
    defaultValues: initialValues,
    mode: 'onBlur' // when the you blur... check for errors
  })

  const history = useHistory()

  const [loading, setLoading] = useState<any>(false)
  const [message, showMessage] = useState<any>({ message: '' })
  const [showToast, setShowToast] = useState(false)

  useIonViewDidEnter(() => {
    let menu = menuController

    menu.enable(false)
  })

  useEffect(() => {}, [reset])

  const showError = (_fieldName: string) => {
    let error = (errors as any)[_fieldName]
    return error ? (
      <div style={{ color: 'red', fontWeight: 'bold' }}>
        {error.message || 'Field Is Required'}
      </div>
    ) : null
  }

  const onSubmit = async (data: IFormInput) => {
    console.log(data, initialValues, 'DATA')
    data.roleId = 2

    if (data.password.trim() !== data.confirmPassword.trim()) {
      showMessage({ message: "Password and confirm password doesn't match" })
      setShowToast(true)
      return
    }

    setLoading(true)

    try {
      let result = await Api.Save('User', data)

      if (result.data.data != null && result.data.data != undefined) {
        showMessage({ message: 'Signup Successful' })
        setShowToast(true)

        resetForm()
      } else {
        setLoading(false)
        showMessage({ message: result.data.data.message })
        setShowToast(true)
      }
    } catch (error) {
      console.log('Error Logging in', error.message)
    }
  }

  const resetForm = () => {
    reset({ ...initialValues })
    history.push('/login')
  }

  return (
    <IonPage>
      <Loading ShowLoading={loading} />
      <IonContent fullscreen>
        <div className='logo ion-text-center'>
          <img className='logo-img' src='/assets/images/logo.png' alt='' />
        </div>
        <IonGrid className='login' no-padding>
          <IonRow>
            <IonCol>
              <div className='ion-text-center'>
                <h3> Sign Up</h3>
                <span>Please Sign in to your account</span>
              </div>
            </IonCol>
          </IonRow>

          <form className='ion-text-center' onSubmit={handleSubmit(onSubmit)}>
            <IonRow>
              <IonCol>
                <InputCtrl
                  control={control}
                  showError={showError}
                  label=''
                  type='text'
                  placeholder='First Name'
                  name='firstName'
                  required={true}
                />
              </IonCol>
              <IonCol>
                <InputCtrl
                  control={control}
                  showError={showError}
                  label=''
                  type='text'
                  placeholder='Last Name'
                  name='lastName'
                  required={true}
                />
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <InputCtrl
                  control={control}
                  showError={showError}
                  label=''
                  type='email'
                  placeholder='Email'
                  name='email'
                  required={true}
                />
                <InputCtrl
                  control={control}
                  showError={showError}
                  label=''
                  type='password'
                  placeholder='Password'
                  name='password'
                  required={true}
                />
                <InputCtrl
                  control={control}
                  showError={showError}
                  label=''
                  type='password'
                  placeholder='Confirm Password'
                  name='confirmPassword'
                  required={true}
                />
                {/* <div className="fields">
                  <label className="name-field">
                    <input type="text" placeholder="First Name"></input>
                    <input type="text" placeholder="Last Name"></input>
                  </label>
                  <input type="text" placeholder="Email"></input>
                  <input type="text" placeholder="Password"></input>
                  <input type="text" placeholder="Confirm Password"></input>
                </div> */}
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol>
                <div className='ion-text-left'>
                  <input type='checkbox' name='' value='' />
                  <span> Remember Me</span>
                </div>
              </IonCol>
              <IonCol>
                <div className='ion-text-right'>
                  <span>
                    <a href='#'>Forgot Password?</a>
                  </span>
                </div>
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol>
                <div className='sign-in-button'>
                  <button>
                    <img src='../assets/images/sign-in.png' />
                    Sign Up
                  </button>
                </div>
                <label className='sign-up'>
                  Don't have an account? <a href='/login'>Sign In</a>
                </label>
              </IonCol>
            </IonRow>
          </form>

          <IonToast
            isOpen={showToast}
            onDidDismiss={() => {
              setLoading(false)
              setShowToast(false)
            }}
            message={message.message}
            position='bottom'
            duration={2000}
          />
        </IonGrid>
      </IonContent>
    </IonPage>
  )
}

export default Signup
