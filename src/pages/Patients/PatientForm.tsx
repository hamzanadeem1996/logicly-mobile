import React, { useState } from 'react'
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonToast,
  IonIcon,
  IonItem,
  useIonViewDidEnter
} from '@ionic/react'
import Header from '../../components/Header'
import InputCtrl from '../../controls/InputCtrl'
import MobileCtrl from '../../controls/MobileCtrl'
import * as Api from '../../service/api'
import { useForm } from 'react-hook-form'
import { useHistory } from 'react-router'
import * as Utility from '../../shared/utility'
import { trash } from 'ionicons/icons'
import { IFormInput } from '../../service/models/IPatient'
import SearchSelect from '../../controls/SearchSelect'
import TextAreaCtrl from '../../controls/TextAreaCtrl'
import AddressAutoComplete from '../../components/AddressAutoComplete'
import Loading from '../../controls/Loading'

let initialValues = {
  firstName: '',
  lastName: '',
  preferredName: '',
  address: '',
  primaryNumber: '',
  secondaryNumber: '',
  evaluation: '',
  frequency: '',
  discharge: '',
  recert: '',
  thirtyDaysRelEval: '2020-02-13T20:23:21-00:00',
  notes: '',
  userId: 1,
  mdNumber: '',
  mdName: '',
  careTeamId: 1,
  teamLeader: 0,
  ot: 0,
  ota: 0,
  pt: 0,
  pta: 0,
  sn: 0,
  slp: 0,
  aid: 0,
  msw: 0,
  teamLeaderName: '',
  otname: '',
  otaName: '',
  ptName: '',
  ptaName: '',
  snName: '',
  slpName: '',
  mswName: '',
  aidName: '',
  noOfWeeks: 0,
  visitsPerWeek: 0,
  unavailableTimeSlot: [],
  slotDetail: '',
  countryId: 0,
  stateId: 0,
  cityId: 0,
  countryName: '',
  stateName: '',
  cityName: '',
  status: '',
  lat: '',
  long: '',
  zipCode: '',
  admission: '',
  eoc: ''
}

const PatientForm: React.FC = () => {
  const history = useHistory()
  const [editMode, setMode] = useState<boolean>(false)
  const { control, handleSubmit, errors, reset } = useForm<IFormInput>({
    defaultValues: initialValues,
    mode: 'onBlur' // when the you blur... check for errors
  })

  const [patientData, setData] = useState<IFormInput>(initialValues)
  const [loading, setLoading] = useState<any>(false)
  const [message, showMessage] = useState<any>({ message: '' })
  const [showToast, setShowToast] = useState(false)
  const [alert, setAlert] = useState(false)
  let [confirmMode, setConfirmMode] = useState<any>('delete')
  let [paramID, setParamID] = useState<any>('')

  useIonViewDidEnter(() => {
    if (Utility.isUserLoggedIn()) {
      Utility.menuEnable(true)
      getData()
    }
  })

  const getData = async () => {
    console.log(window, Utility.getQuery(), 'WINDOW')
    paramID = Utility.getQuery()
    setParamID(paramID)
    if (paramID != undefined) {
      setLoading(true)
      setMode(true)
      let patientResponse: any = await Api.GetByID('PatientProfile', paramID)

      try {
        if (
          patientResponse != undefined &&
          patientResponse.data.data != undefined
        ) {
          patientResponse = patientResponse.data.data
          console.log(patientResponse, 'RESPONSE')
          patientResponse.countryId = Utility.getLabValObj(
            patientResponse.countryId,
            patientResponse.countryName
          )
          patientResponse.stateId = Utility.getLabValObj(
            patientResponse.stateId,
            patientResponse.stateName
          )
          patientResponse.cityId = Utility.getLabValObj(
            patientResponse.cityId,
            patientResponse.cityName
          )
          reset({
            ...patientResponse,
            admission: Utility.FormatYYYY_MM_DD(patientResponse.admission),
            userId: 1,
            careTeamId: 1
          })
          setData(patientResponse)

          setLoading(false)
        }
      } catch (err) {
        console.log(err, 'ERROR PATIENT FORM')
      }
    }
  }

  const showError = (_fieldName: string) => {
    let error = (errors as any)[_fieldName]
    return error ? (
      <div style={{ color: 'red', fontWeight: 'bold' }}>
        {error.message || 'Field Is Required'}
      </div>
    ) : null
  }

  const saveData = async (data: any) => {
    console.log(data, 'ddddddddd')
    try {
      setLoading(true)
      if (Utility.getQuery() != undefined) {
        data.id = Utility.getQuery()
        data.status = patientData.status
      }

      let res = await Api.Save('PatientProfile', data)
      console.log(res, 'SAVED DATA')

      if (res.data.data != null) {
        showMessage({ message: 'Data Saved Successfully!' })
        setTimeout(() => {
          history.goBack()
        }, 2000)
      } else {
        showMessage({ message: res.data.message })
      }

      setLoading(false)
      setShowToast(true)
      setData({ ...initialValues })
    } catch (err) {
      setLoading(false)
      setShowToast(true)
      showMessage({ message: err })
      console.log(err, 'ERROR ON SAVING/UPDATING DATA')
    }
  }

  const onSubmit = async (data: IFormInput) => {
    console.log(data, patientData, initialValues, 'DATA')
    let userID = Utility.readFromLocalStorage('userObj').id
    data.careTeamId = 1
    data.slotDetail = ''
    let arr = []
    let obj = {
      startdate: data.evaluation,
      enddate: data.evaluation
    }
    arr.push(obj)

    data.unavailableTimeSlot = arr
    data.userId = userID
    if (
      patientData.teamLeader == null ||
      patientData.ot == null ||
      patientData.ota == null ||
      patientData.pt == null ||
      patientData.pta == null ||
      patientData.sn == null ||
      patientData.slp == null ||
      patientData.aid == null ||
      patientData.msw == null
    ) {
      setLoading(false)
      showMessage({ message: 'Select value from the dropdown!' })
      setShowToast(true)
      return
    }

    if (patientData.address == '' || patientData.address == null) {
      setLoading(false)
      showMessage({ message: "Address field can't be empty!" })
      setShowToast(true)
      return
    }

    data.teamLeader =
      patientData.teamLeader.value !== undefined
        ? patientData.teamLeader.value
        : patientData.teamLeader
    data.ot =
      patientData.ot.value !== undefined ? patientData.ot.value : patientData.ot
    data.ota =
      patientData.ota.value !== undefined
        ? patientData.ota.value
        : patientData.ota
    data.pt =
      patientData.pt.value !== undefined ? patientData.pt.value : patientData.pt
    data.pta =
      patientData.pta.value !== undefined
        ? patientData.pta.value
        : patientData.pta
    data.sn =
      patientData.sn.value !== undefined ? patientData.sn.value : patientData.sn
    data.slp =
      patientData.slp.value !== undefined
        ? patientData.slp.value
        : patientData.slp
    data.aid =
      patientData.aid.value !== undefined
        ? patientData.aid.value
        : patientData.aid
    data.msw =
      patientData.msw.value !== undefined
        ? patientData.msw.value
        : patientData.msw
    data.cityId = 1
    data.address = patientData.address
    data.cityName = patientData.cityName
    data.admission += 'T00:00:00.000Z'
    data.lat = patientData.lat
    data.long = patientData.long
    setData(data)
    await saveData(data)
  }

  const ClearData = () => {
    reset({ ...initialValues })
    setData({ ...initialValues })
    history.goBack()
  }

  const deletePatient = () => {
    setConfirmMode('delete')
    showAlert('Are you sure?')
  }

  const showAlert = (_message: any) => {
    showMessage(_message)
    setAlert(true)
  }

  const deletion = async () => {
    console.log('GOT INO DELETION BLOCK')
    try {
      setLoading(true)
      let API_Response = await Api.DeleteById('PatientProfile', paramID)

      if (API_Response.data.message.toLowerCase().includes('success')) {
        showMessage({ message: 'Patient Deleted Successfully!' })
      } else {
        showMessage({ message: API_Response.data.message })
      }
      setShowToast(true)
      setLoading(false)

      history.push('/patient-list')
    } catch (err) {
      console.log(err, 'ERROR IN DELETION')
    }
  }

  const switchStatus = () => {
    setConfirmMode('status')
    showAlert('Are you sure?')
  }

  const updateStatus = async () => {
    let status = 'Discharged'
    if (patientData.status.toLowerCase() == 'discharged') status = 'Active'
    console.log('GOT INO UPDATE STATUS BLOCK', status)
    try {
      setLoading(true)
      let API_Response = await Api.updatePatientStatus(paramID, status)
      console.log(API_Response, 'STATUS')
      if (API_Response.data.data == null) {
        showMessage({ message: 'Something went wrong!' })
      } else {
        showMessage({ message: API_Response.data.message })
        setTimeout(() => {
          history.goBack()
        }, 2000)
      }
      setShowToast(true)
      setLoading(false)
    } catch (err) {
      console.log(err, 'ERROR IN UPDATION')
      setLoading(false)
    }
  }

  const renderAddress = (_patientData: any) => {
    if (paramID !== undefined && _patientData.address == '') return
    return (
      <AddressAutoComplete
        id={paramID == undefined ? 'addAddress' : 'editAddress'}
        Data={(data: any) => {
          console.log(data.address, 'popup')
          patientData.address = data.address
          patientData.lat = data.lat
          patientData.long = data.long
          patientData.cityName = data.cityName
          setData({ ...patientData })
        }}
        address={patientData.address}
        lat={patientData.lat}
        long={patientData.long}
      />
    )
  }

  return (
    <IonPage>
      <Header Name={'Patient Details'} CloseIcon={true} />

      <IonContent className='patientDetail' fullscreen>
        <Loading ShowLoading={loading} />

        <IonGrid no-padding>
          <form className='ion-text-center' onSubmit={handleSubmit(onSubmit)}>
            <IonRow>
              <IonCol size='6'>
                <InputCtrl
                  control={control}
                  showError={showError}
                  label='First Name'
                  type='text'
                  name='firstName'
                  required={true}
                />
              </IonCol>
              <IonCol size='6'>
                <InputCtrl
                  control={control}
                  showError={showError}
                  label='Last Name'
                  type='text'
                  name='lastName'
                  required={true}
                />
              </IonCol>
            </IonRow>

            <InputCtrl
              control={control}
              showError={showError}
              label='Preferred Nickname'
              type='text'
              name='preferredName'
              required={false}
            />

            {renderAddress(patientData)}

            <MobileCtrl
              control={control}
              showError={showError}
              label='Primary Number'
              type='tel'
              name='primaryNumber'
              required={true}
            />
            <MobileCtrl
              control={control}
              showError={showError}
              label='Secondary Number'
              type='tel'
              name='secondaryNumber'
              required={true}
            />
            <InputCtrl
              control={control}
              showError={showError}
              label='MD Name'
              type='text'
              name='mdName'
              required={true}
            />
            <MobileCtrl
              control={control}
              showError={showError}
              label='MD Number'
              type='tel'
              name='mdNumber'
              required={true}
            />

            <InputCtrl
              control={control}
              showError={showError}
              label='Admission'
              type='date'
              placeholder=''
              name='admission'
              required={true}
            />

            {editMode && patientData.teamLeaderName == '' ? null : (
              <SearchSelect
                CallBack={(selection: any) => {
                  console.log('yup value', selection)
                  patientData.teamLeader = selection
                }}
                InitVal={Utility.getLabValObj(
                  patientData.teamLeader,
                  patientData.teamLeaderName
                )}
                Placeholder={'Team Leader'}
                name={'teamLeader'}
                required={true}
              />
            )}
            {editMode && patientData.otname == '' ? null : (
              <SearchSelect
                CallBack={(selection: any) => {
                  console.log('yup value', selection)
                  patientData.ot = selection
                  setData({ ...patientData })
                }}
                InitVal={Utility.getLabValObj(
                  patientData.ot,
                  patientData.otname
                )}
                Placeholder={'OT'}
                name={'ot'}
                roleName={'ot'}
                required={true}
              />
            )}
            {editMode && patientData.otaName == '' ? null : (
              <SearchSelect
                CallBack={(selection: any) => {
                  console.log('yup value', selection)
                  patientData.ota = selection
                  setData({ ...patientData })
                }}
                InitVal={Utility.getLabValObj(
                  patientData.ota,
                  patientData.otaName
                )}
                Placeholder={'OTA'}
                name={'ota'}
                roleName={'ota'}
                required={true}
              />
            )}

            {editMode && patientData.ptName == '' ? null : (
              <SearchSelect
                CallBack={(selection: any) => {
                  console.log('yup value', selection)
                  patientData.pt = selection
                  setData({ ...patientData })
                }}
                InitVal={Utility.getLabValObj(
                  patientData.pt,
                  patientData.ptName
                )}
                Placeholder={'PT'}
                name={'pt'}
                roleName={'pt'}
                required={true}
              />
            )}
            {editMode && patientData.ptaName == '' ? null : (
              <SearchSelect
                CallBack={(selection: any) => {
                  console.log('yup value', selection)
                  patientData.pta = selection
                  setData({ ...patientData })
                }}
                InitVal={Utility.getLabValObj(
                  patientData.pta,
                  patientData.ptaName
                )}
                Placeholder={'PTA'}
                name={'pta'}
                roleName={'pta'}
                required={true}
              />
            )}
            {editMode && patientData.snName == '' ? null : (
              <SearchSelect
                CallBack={(selection: any) => {
                  console.log('yup value', selection)
                  patientData.sn = selection
                  setData({ ...patientData })
                }}
                InitVal={Utility.getLabValObj(
                  patientData.sn,
                  patientData.snName
                )}
                Placeholder={'SN'}
                name={'sn'}
                roleName={'sn'}
                required={true}
              />
            )}

            {editMode && patientData.aidName == '' ? null : (
              <SearchSelect
                CallBack={(selection: any) => {
                  console.log('yup value', selection)
                  patientData.aid = selection
                  setData({ ...patientData })
                }}
                InitVal={Utility.getLabValObj(
                  patientData.aid,
                  patientData.aidName
                )}
                Placeholder={'AID'}
                name={'aid'}
                required={true}
              />
            )}

            {editMode && patientData.slpName == '' ? null : (
              <SearchSelect
                CallBack={(selection: any) => {
                  console.log('yup value', selection)
                  patientData.slp = selection
                  setData({ ...patientData })
                }}
                InitVal={Utility.getLabValObj(
                  patientData.slp,
                  patientData.slpName
                )}
                Placeholder={'SLP'}
                name={'slp'}
                roleName={'slp'}
                required={true}
              />
            )}

            {editMode && patientData.mswName == '' ? null : (
              <SearchSelect
                CallBack={(selection: any) => {
                  console.log('yup value', selection)
                  patientData.msw = selection
                  setData({ ...patientData })
                }}
                InitVal={Utility.getLabValObj(
                  patientData.msw,
                  patientData.mswName
                )}
                Placeholder={'MSW'}
                name={'msw'}
                roleName={'msw'}
                required={true}
              />
            )}

            <TextAreaCtrl
              control={control}
              showError={showError}
              label='Notes'
              type='text'
              name='notes'
              required={false}
            />
            <IonRow>
              <IonCol size={paramID == undefined ? '6' : '3'}>
                <IonButton expand='block' type='reset' onClick={ClearData}>
                  Cancel
                </IonButton>
              </IonCol>
              <IonCol size={paramID == undefined ? '6' : '3'}>
                <IonButton expand='block' type='submit'>
                  Save
                </IonButton>
              </IonCol>
              {paramID == undefined ? null : (
                <IonCol size='3'>
                  <IonButton
                    expand='block'
                    type='button'
                    onClick={switchStatus}
                    className={
                      patientData.status == null ||
                      patientData.status.toLowerCase() == 'active'
                        ? 'bgYellow'
                        : 'bgGreen'
                    }
                  >
                    {patientData.status == null ||
                    patientData.status.toLowerCase() == 'active'
                      ? 'Discharge'
                      : 'Activate'}
                  </IonButton>
                </IonCol>
              )}
              {paramID == undefined ? null : (
                <IonCol size='3'>
                  <IonItem lines='none'>
                    <IonIcon slot='end' icon={trash} onClick={deletePatient} />
                  </IonItem>
                </IonCol>
              )}
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
        {alert
          ? Utility.confirmationAlert(
              alert,
              setAlert,
              message,
              confirmMode == 'delete' ? deletion : updateStatus
            )
          : null}
      </IonContent>
    </IonPage>
  )
}

export default PatientForm
