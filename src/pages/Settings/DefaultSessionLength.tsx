import { IonButton } from '@ionic/react'
import React, { useState, useEffect } from 'react'
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonList
} from '@ionic/react'
import Header from '../../components/Header'
import * as Utility from '../../shared/utility'
import * as Api from '../../service/api'
import InputCtrl from '../../controls/InputCtrl'
import { useForm } from 'react-hook-form'
import Loading from '../../controls/Loading'

let initialValues = {
  treatmentSessionLength: '',
  evaluationSessionLength: '',
  admissionSessionLength: '',
  dischargeSessionLength: '',
  recertSessionLength: '',
  thirtyDayReEvalSessionLength: ''
}

interface IFormInput {
  treatmentSessionLength: string
  evaluationSessionLength: string
  admissionSessionLength: string
  dischargeSessionLength: string
  recertSessionLength: string
  thirtyDayReEvalSessionLength: string
}
const DefaultSessionLength: React.FC = () => {
  const { control, handleSubmit, errors, reset } = useForm<IFormInput>({
    defaultValues: initialValues,
    mode: 'onBlur' // when the you blur... check for errors
  })

  const [showToast, setShowToast] = useState(false)

  const [loading, setLoading] = useState<any>(false)
  const [data, setData] = useState<any>()

  useEffect(() => {
    if (Utility.isUserLoggedIn()) {
      Utility.menuEnable(true)
      getData()
    }
  }, [reset])

  const showError = (_fieldName: string) => {
    let error = (errors as any)[_fieldName]
    return error ? (
      <div style={{ color: 'red', fontWeight: 'bold' }}>
        {error.message || 'Field Is Required'}
      </div>
    ) : null
  }

  const getData = async () => {
    try {
      setLoading(true)

      let res = await Api.GetSettings()
      setData(res.data)

      reset({
        ...res.data
      })

      console.log(res, 'RES')
      setLoading(false)
    } catch (err) {
      console.log(err, 'ERROR')
      setLoading(false)
    }
  }
  const onSubmit = async (formData: IFormInput) => {
    setLoading(true)

    data.treatmentSessionLength = formData.treatmentSessionLength
    data.evaluationSessionLength = formData.evaluationSessionLength
    data.admissionSessionLength = formData.admissionSessionLength
    data.dischargeSessionLength = formData.dischargeSessionLength
    data.recertSessionLength = formData.recertSessionLength
    data.thirtyDayReEvalSessionLength = formData.thirtyDayReEvalSessionLength

    let res = await Api.Save('Setting', data)
    console.log(res, 'res')
    setShowToast(true)
    setData(res.data.data)
    setLoading(false)
  }

  return (
    <IonPage>
      <Header Name={'Default Session Length'} CloseIcon={true} />
      <Loading ShowLoading={loading} />
      <IonContent>
        <IonGrid className='settings p0'>
          <IonRow>
            <IonCol>
              <IonList>
                <>
                  <form
                    className='ion-text-center'
                    onSubmit={handleSubmit(onSubmit)}
                  >
                    <InputCtrl
                      control={control}
                      showError={showError}
                      label='Treatment/Routine'
                      type='number'
                      placeholder='Treatment/Routine'
                      name='treatmentSessionLength'
                      min={'0'}
                      required={true}
                    />
                    <InputCtrl
                      control={control}
                      showError={showError}
                      label='Evaluation'
                      type='number'
                      placeholder='Evaluation'
                      name='evaluationSessionLength'
                      min={'0'}
                      required={true}
                    />
                    <InputCtrl
                      control={control}
                      showError={showError}
                      label='Admission'
                      type='number'
                      placeholder='Admission'
                      name='admissionSessionLength'
                      min={'0'}
                      required={true}
                    />

                    <InputCtrl
                      control={control}
                      showError={showError}
                      label='Discharge'
                      type='number'
                      placeholder='Discharge'
                      name='dischargeSessionLength'
                      min={'0'}
                      required={true}
                    />

                    <InputCtrl
                      control={control}
                      showError={showError}
                      label='Recertification'
                      type='number'
                      placeholder='Recertification'
                      name='recertSessionLength'
                      min={'0'}
                      required={true}
                    />

                    <InputCtrl
                      control={control}
                      showError={showError}
                      label='Thirty Day ReEvaluation'
                      type='number'
                      placeholder='Thirty Day ReEvaluation'
                      name='thirtyDayReEvalSessionLength'
                      min={'0'}
                      required={true}
                    />

                    <IonRow>
                      <IonCol>
                        <IonButton type='submit'>Submit</IonButton>
                      </IonCol>
                    </IonRow>
                  </form>
                </>
              </IonList>
            </IonCol>
          </IonRow>
          <IonRow className='sessionText'>
            <IonCol>
              <IonLabel>
                This is the default session length in minutes (how long you
                anticipate each session to be.)
              </IonLabel>
            </IonCol>
          </IonRow>
        </IonGrid>
        {showToast
          ? Utility.toast(true, 'Default Session Length Updated Successfully.')
          : ''}
      </IonContent>
    </IonPage>
  )
}

export default DefaultSessionLength
