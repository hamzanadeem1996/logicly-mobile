import {
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonRow,
  IonCol
} from '@ionic/react'

import React from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import './Menu.scss'
import * as Util from '../shared/utility'

interface AppPage {
  url: string
  title: string
}

const appPages: AppPage[] = [
  {
    title: 'Caseload Scheduling',
    url: '/home'
  },
  {
    title: 'Patient Schedules',
    url: '/patient-schedule'
  },
  {
    title: 'Documents Due',
    url: '/documentsDue'
  },
  {
    title: 'Patients',
    url: '/patient-list'
  },
  {
    title: 'Settings',
    url: '/settings'
  },
  {
    title: 'Logout',
    url: '/login'
  }
]

const Menu: React.FC = () => {
  const location = useLocation()
  const history = useHistory()

  const navigateToPage = async (page: any) => {
    let pageTitle = page.title
    if (pageTitle.toLowerCase().includes('logout')) {
      localStorage.clear()
    }
    history.push(page.url)
    if (pageTitle.toLowerCase().includes('caseload')) {
      pageTitle = 'home'
    }
    Util.setToLocalStorage('view', pageTitle)
    localStorage.removeItem('segment')
  }

  return (
    <>
      <IonMenu contentId='main' type='overlay'>
        <IonContent className='sidemenu'>
          <IonList id='inbox-list'>
            <IonListHeader>
              <IonMenuToggle autoHide={false}>
                <IonRow>
                  <IonCol className='ion-align-self-center' size='3'>
                    <i className='far fa-user'></i>
                  </IonCol>
                  <IonCol size='6'></IonCol>
                </IonRow>
              </IonMenuToggle>
            </IonListHeader>
            {appPages.map((appPage, index) => {
              let _role = Util.ValueFromUserData('roleName')
              let _global: any = false
              if (
                appPage.url === '/home' ||
                appPage.url === '/settings' ||
                appPage.url === '/login'
              ) {
                _global = true
              }
              return _global ||
                (_role !== 'OTA' &&
                  _role !== 'PTA' &&
                  _role !== 'AID' &&
                  _role !== 'MSW') ? (
                <IonMenuToggle key={index} autoHide={false}>
                  <IonItem
                    className={
                      location.pathname === appPage.url ? 'selected' : ''
                    }
                    onClick={() => navigateToPage(appPage)}
                    routerDirection='none'
                    lines='none'
                    detail={false}
                  >
                    <IonLabel>{appPage.title}</IonLabel>
                  </IonItem>
                </IonMenuToggle>
              ) : null
            })}
          </IonList>
        </IonContent>
        <IonRow className='text-center'>
          <IonLabel className='version'>
            Version: {Util.packageFile.version}
          </IonLabel>
        </IonRow>
      </IonMenu>
    </>
  )
}

export default Menu
