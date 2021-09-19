import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  useIonViewDidEnter,
  IonButton
} from '@ionic/react'
import InputCtrl from '../controls/InputCtrl'
import * as Api from '../service/api'
import * as Utility from '../shared/utility'
import { useHistory } from 'react-router'
import { IForgotForm } from '../service/models/IForgotPassword'
import Header from '../components/Header'
import Loading from '../controls/Loading'

let initialValues = {
  Email: ''
}

const ForgotPassword: React.FC = () => {
  const history = useHistory()
  const [showToast, setShowToast] = useState(false)
  const [loading, setLoading] = useState<any>(false)
  const [message, showMessage] = useState<string>()

  const { control, handleSubmit, errors, reset } = useForm<IForgotForm>({
    defaultValues: initialValues,
    mode: 'onBlur' // check errors on blur
  })

  useIonViewDidEnter(async () => {
    Utility.menuEnable(false)
  })

  useEffect(() => {}, [reset])

  const showError = (_fieldName: string) => {
    let error = (errors as any)[_fieldName]
    return error ? (
      <div style={{ color: 'red', fontWeight: 'normal' }}>
        {error.message || 'Field Is Required'}
      </div>
    ) : null
  }

  const onSubmit = async (data: IForgotForm) => {
    console.log(data, 'DATA')

    setLoading(true)

    try {
      let result: any = await Api.ForgotPassword(data.Email)
      console.log(result, 'RESULT')
      setLoading(false)
      showMessage(result.message)
      setShowToast(true)
      if (result.status !== 402) {
        history.push('/login')
      }
    } catch (error) {
      console.log('Error Logging in', error)
    }
  }

  return (
    <IonPage>
      <Header Name='Forgot Password' CloseIcon={true} />
      <Loading ShowLoading={loading} />
      <IonContent fullscreen>
        <IonRow className='logo forgotpw'>
          <IonCol className='ion-text-center'>
            <div className='logo ion-text-center'>
              <div className='logo ion-text-center'>
                <img
                  className='logo-img'
                  src='/assets/images/logo.png'
                  alt=''
                />
              </div>
            </div>
          </IonCol>
        </IonRow>
        <IonGrid className='login forgot-pw'>
          <p>
            Please enter your registered email to get a link to reset your
            password
          </p>

          <form
            className='ion-text-center fields'
            onSubmit={handleSubmit(onSubmit)}
          >
            <InputCtrl
              control={control}
              showError={showError}
              label=''
              type='Email'
              placeholder='Email'
              name='Email'
              required={true}
            />

            <IonRow className='loginBtn'>
              <IonCol className='ion-text-center forgot'>
                <IonButton type='submit' className='bgGreen' expand='block'>
                  Submit
                </IonButton>
              </IonCol>
            </IonRow>
          </form>
        </IonGrid>

        {Utility.toast(showToast, message, () => {
          setShowToast(false)
        })}
      </IonContent>
    </IonPage>
  )
}

export default ForgotPassword
