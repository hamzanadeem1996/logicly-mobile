import React, { useState } from 'react'
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  IonSearchbar,
  useIonViewDidEnter,
  IonItem,
  IonLabel,
  IonList,
  IonFab,
  IonFabButton,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent
} from '@ionic/react'
import Header from '../../components/Header'
import { useHistory } from 'react-router'
import * as Utility from '../../shared/utility'
import * as Api from '../../service/api'
import { add, trash, menuOutline } from 'ionicons/icons'
import Loading from '../../controls/Loading'

let distinctUntilChangeTimeout: any = null

const PatientList: React.FC = () => {
  const history = useHistory()
  const [loading, setLoading] = useState<any>(false)
  let [data, setData] = useState<any>([])
  const [activePage, setActivePage] = useState(1)
  let selectedPatient: any = []
  const [totalPages, setTotalPages] = useState(1)
  const [listEnded, setListEnded] = useState(false)
  const [toggleStatus, setToggleStatus] = useState<any>('active')

  useIonViewDidEnter(async () => {
    if (Utility.isUserLoggedIn()) {
      Utility.menuEnable(true)
      getAllPatients(activePage, '', toggleStatus)
    } else {
      history.push('/login')
    }
  })

  const getAllPatients = async (
    pageNum: any,
    query: any,
    status: any,
    infiniteLoad = false,
    queryLoad = false
  ) => {
    try {
      if (query.trim() == '' && !infiniteLoad) {
        setLoading(true)
      }
      let patientsData = await Api.GetAllPatientsProfiles(
        pageNum,
        query,
        status
      )
      patientsData = patientsData.data.data.items
      console.log(patientsData, 'PATIENT')
      if (patientsData != undefined && Array.isArray(patientsData)) {
        console.log('new patient data', patientsData)
        let combinedData = [...patientsData]
        if (!queryLoad) {
          combinedData = [...data].concat(patientsData)
        }
        setData(combinedData)

        setLoading(false)
        if (patientsData.length === 0) {
          console.log('length is 0 can stop')
          setListEnded(true)
        }
      }
    } catch (err) {
      console.log(err, 'ERROR')
      setLoading(false)
    }
  }

  const viewDetails = (id: string) => {
    history.push('/details/' + id)
  }

  const addPatient = () => {
    let navigateTo = 'patient-form'
    let view = Utility.readFromLocalStorage('view')
    if (view != null && view.toLowerCase().includes('patient schedule')) {
      Utility.setToLocalStorage('patientIDs', JSON.stringify(selectedPatient))
      navigateTo = 'patient-schedule'
    }
    history.push(navigateTo)
  }
  const handleSearch = async (e: any) => {
    const searchStr = e.target.value.toLowerCase()
    // debounce time
    if (distinctUntilChangeTimeout) {
      console.log('api hit cancelled')
      clearTimeout(distinctUntilChangeTimeout)
    }
    distinctUntilChangeTimeout = null
    const debounceTime = 800
    distinctUntilChangeTimeout = setTimeout(() => {
      getAllPatients(activePage, searchStr.trim(), toggleStatus, false, true)
    }, debounceTime)
  }

  const clearSearch = (e: any) => {
    e.target.value = ''
  }

  const fetchMore = async (e: CustomEvent<void>) => {
    console.log(totalPages)

    if (!listEnded) {
      console.log('total pages', totalPages)

      await getAllPatients(totalPages + 1, '', true)
      setTotalPages(totalPages + 1)
    }
    ;(e.target as HTMLIonInfiniteScrollElement).complete()
  }

  const toggleList = (status: any) => {
    console.log(status, 'STATUS')
    setToggleStatus(status)
    data = []
    setData(data)
    getAllPatients(activePage, '', status)
  }

  return (
    <IonPage>
      <Header Name={'Patients'} />

      <IonContent fullscreen>
        <Loading ShowLoading={loading} />

        <IonGrid className='patient-list'>
          <IonRow>
            <IonCol>
              <IonSearchbar
                onIonChange={handleSearch}
                onIonBlur={clearSearch}
              />
              <img
                src='/assets/images/search1.svg'
                alt=''
                className='searchIcon'
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonList
                className={
                  data.length == 0 ? 'text-center search_list' : 'search_list'
                }
              >
                {data.length == 0 ? (
                  <>
                    <img src='/assets/images/frame.png' alt='' />
                    <br />
                    <span className='ion-text-center'>
                      <IonLabel className='noPatientText'>No Patients</IonLabel>
                      <br />
                      <span className='subText'>Sync or add patients</span>
                    </span>
                  </>
                ) : (
                  data.map((patient: any, key: any) => (
                    <IonItem
                      key={key}
                      onClick={() => {
                        viewDetails(patient.id)
                      }}
                    >
                      <IonLabel>
                        {patient.firstName + ' ' + patient.lastName}
                      </IonLabel>
                    </IonItem>
                  ))
                )}
              </IonList>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonInfiniteScroll
          style={{ display: listEnded ? 'none' : 'block' }}
          threshold='20px'
          disabled={false}
          onIonInfinite={e => {
            fetchMore(e)
          }}
        >
          <IonInfiniteScrollContent
            loadingText='Loading more patients'
            loadingSpinner='bubbles'
          ></IonInfiniteScrollContent>
        </IonInfiniteScroll>
      </IonContent>

      {/* <IonFooter>

        <IonRow>
          <IonCol>
            <Pagination
              activePage={activePage}
              itemsCountPerPage={5}
              totalItemsCount={450}
              pageRangeDisplayed={2}
              onChange={handlePageChange}
              activeLinkClass={"activePage"}
            />
          </IonCol>
        </IonRow>
      </IonFooter> */}
      <IonFab vertical='bottom' horizontal='start' slot='fixed'>
        <IonFabButton
          className='bgGreen'
          onClick={() =>
            toggleList(toggleStatus == 'active' ? 'discharged' : 'active')
          }
        >
          <IonIcon icon={toggleStatus == 'active' ? trash : menuOutline} />
        </IonFabButton>
      </IonFab>
      <IonFab vertical='bottom' horizontal='end' slot='fixed'>
        <IonFabButton
          className='bgGreen'
          onClick={addPatient}
          disabled={!Utility.ManagePatientAllowed()}
        >
          <IonIcon icon={add} />
        </IonFabButton>
      </IonFab>
    </IonPage>
  )
}

export default PatientList
