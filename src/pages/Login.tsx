import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  IonInput,
  IonItem,
  IonLabel,
  IonHeader,
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
import * as Utility from '../shared/utility'
import { useHistory } from 'react-router'
import Loading from '../controls/Loading'

// set the default values for the controls
let initialValues = {
  Email: '',
  Password: ''
}

interface IFormInput {
  Email: string
  Password: string
}

const Login: React.FC = () => {
  const history = useHistory()
  const [loading, setLoading] = useState<any>(false)
  const [Alert, SetAlert] = useState({
    Show: false,
    Message: ''
  })
  const [message, showMessage] = useState<any>({ message: '' })
  const [showToast, setShowToast] = useState(false)

  const { control, handleSubmit, errors, reset } = useForm<IFormInput>({
    defaultValues: initialValues,
    mode: 'onBlur' // when the you blur... check for errors
  })

  useIonViewDidEnter(async () => {
    Utility.menuEnable(false)
    localStorage.removeItem('segment')
  })

  const showError = (_fieldName: string) => {
    let error = (errors as any)[_fieldName]
    return error ? (
      <div style={{ color: 'red', fontWeight: 'bold' }}>
        {error.message || 'Field Is Required'}
      </div>
    ) : null
  }

  const onSubmit = async (data: IFormInput) => {
    console.log(data, 'DATA')
    setLoading(true)

    try {
      let result = await Api.Login(data)

      console.log(result, 'RESULT')
      if (result.data.data != null && result.data.data != undefined) {
        // check payment method
        if (!result.data.data.hasPaymentMethod) {
          // raise alert
          SetAlert({
            Show: true,
            Message: result.data.data.paymentMessage
          })
          setLoading(false)
          return
        }

        Utility.setToLocalStorage('userObj', JSON.stringify(result.data.data))

        //
        Utility.SetCookie(
          'login-session',
          'allowed',
          (result.data.data.maxSessionHours
            ? parseInt(result.data.data.maxSessionHours)
            : 1) * 3600000
        )
        //
        showMessage({ message: 'Login Successful' })
        setShowToast(true)
        resetForm()
      } else {
        setLoading(false)
        showMessage({ message: result.data.message })
        setShowToast(true)
      }
    } catch (error) {
      console.log('Error Logging in', error)
    }
  }

  const resetForm = () => {
    reset(initialValues)
    Utility.setToLocalStorage('view', 'home')
    history.push('/home')
  }

  const goToForgotPass = () => {
    reset(initialValues)
    history.push('/forgotPassword')
  }

  return (
    <IonPage>
      <IonHeader />
      <Loading ShowLoading={loading} />

      <IonContent fullscreen className='signIn'>
        {Utility.showAlert(
          Alert.Show,
          (bool: any) => {
            SetAlert({
              ...Alert,
              Show: false
            })
          },
          Alert.Message,
          () => {}
        )}
        <div className='topBg'>
          <img src='/assets/images/topbg.png' alt='' />
        </div>

        <div className='logo ion-text-center'>
          <img className='logo-img' src='/assets/images/logo.png' alt='' />
        </div>
        <IonGrid className='login'>
          <IonRow>
            <IonCol>
              <div className='ion-text-center'>
                <h3> Sign In</h3>
                <span>Please Sign in to your account</span>
              </div>
            </IonCol>
          </IonRow>

          <form className='ion-text-center' onSubmit={handleSubmit(onSubmit)}>
            <IonRow>
              <IonCol>
                <IonItem className='fields' lines='none'>
                  <Controller
                    render={({ onChange, onBlur, value }) => (
                      <IonInput
                        onBlur={onBlur}
                        onIonChange={onChange}
                        value={value}
                        name='Email'
                        type='email'
                        placeholder='Email'
                      />
                    )}
                    name='Email'
                    control={control}
                    rules={{
                      required: true,
                      maxLength: {
                        value: 30,
                        message: 'Can use max be 30 chars'
                      },
                      minLength: { value: 4, message: 'Must be 5 chars long' },
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                        message: 'invalid email address'
                      }
                    }}
                  />
                </IonItem>
                {showError('Email')}
              </IonCol>
            </IonRow>

            <InputCtrl
              control={control}
              showError={showError}
              label=''
              type='password'
              placeholder='Password'
              name='Password'
              required={true}
            />

            <IonRow>
              <IonCol>
                <div className='ion-text-left'>
                  <input type='checkbox' name='' value='' />
                  <span> Remember Me</span>
                </div>
              </IonCol>
              <IonCol>
                <div className='ion-text-right' onClick={goToForgotPass}>
                  <span>
                    <a>Forgot Password?</a>
                  </span>
                </div>
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol>
                <div className='sign-in-button'>
                  <button>
                    <img src='../assets/images/sign-in.png' />
                    Sign in
                  </button>
                </div>
              </IonCol>
            </IonRow>
          </form>
        </IonGrid>

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
        <IonRow>
          <IonCol className='text-center'>
            <IonLabel className='version colorGrey'>
              Version: {Utility.packageFile.version}
            </IonLabel>
          </IonCol>
        </IonRow>
        <div className='bottomBg'>
          <img src='/assets/images/bottombg.png' alt='' />
        </div>
      </IonContent>
    </IonPage>
  )
}

export default Login
