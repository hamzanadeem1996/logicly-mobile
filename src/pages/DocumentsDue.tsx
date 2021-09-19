import {
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  useIonViewDidEnter
} from '@ionic/react'
import React, { useState } from 'react'
import { IonContent, IonPage } from '@ionic/react'
import Header from '../components/Header'
import { useHistory } from 'react-router'
import * as Utility from '../shared/utility'
import * as Api from '../service/api'
import { IDocuments } from '../service/models/IDocuments'
import WeekCtrl from '../controls/WeekCtrl'
import Loading from '../controls/Loading'

let initialState = {
  data: [],
  currentDate: '',
  endDate: ''
}

const DocumentsDue: React.FC = () => {
  const history = useHistory()
  const [loading, setLoading] = useState<any>(false)
  const [state, setState] = useState<any>({ initialState })

  useIonViewDidEnter(async () => {
    if (Utility.isUserLoggedIn()) {
      Utility.menuEnable(true)
      state.currentDate = Utility.getFormatedDate(new Date())
      state.endDate = Utility.getFormatedDate(Utility.nextWeekDate(new Date()))
      setState({ ...state })
      getDocumentsData()
    } else {
      history.push('/login')
    }
  })

  const getDocumentsData = async () => {
    setLoading(true)
    let res: IDocuments = await Api.GetDocumentsDue(state.currentDate)
    if (res.data != null) {
      state.data = res.data
      setState({ ...state })
      console.log(state.data, 'DOC DATA')
    }
    setLoading(false)
  }

  const setCurrentDate = (e: any) => {
    let dat = e.split(',') //START AND END DATE
    state.currentDate = dat[0]
    state.endDate = dat[1]
    setState({ ...state })
    getDocumentsData()
  }

  return (
    <IonPage>
      <Header Name={'Documents Due'} />
      <Loading ShowLoading={loading} />
      <IonContent fullscreen className=' documents'>
        <>
          <WeekCtrl currentDate={setCurrentDate} />

          {state.data == undefined ? (
            <p className='ion-text-center pt10'>No Data Found!</p>
          ) : (
            state.data.map((visit: any, i: any) => {
              return (
                <>
                  <IonCard className='cardHead'>
                    <IonRow key={i}>
                      <IonCol
                        style={{
                          color: Utility.getColor(visit.visitType),
                          fontWeight: 600
                        }}
                      >
                        {Utility.getVisitType(visit.visitType)}
                      </IonCol>
                    </IonRow>
                    <IonCardContent>
                      {visit.events == undefined || visit.events.length == 0
                        ? 'No Data Found!'
                        : visit.events.map((e: any, k: any) => {
                            return (
                              <IonRow key={k} className='dataRow'>
                                <IonCol className='name' size='5'>
                                  {e.patientName}
                                </IonCol>
                                <IonCol className='date' size='7'>
                                  {Utility.FormatMDY(e.patientDates)}
                                </IonCol>
                              </IonRow>
                            )
                          })}
                    </IonCardContent>
                  </IonCard>
                </>
              )
            })
          )}
        </>
      </IonContent>
    </IonPage>
  )
}

export default DocumentsDue
