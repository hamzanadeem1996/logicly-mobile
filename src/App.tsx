import Menu from './components/Menu'
import React from 'react'
import { IonApp, IonRouterOutlet, IonSplitPane } from '@ionic/react'
import { IonReactHashRouter } from '@ionic/react-router'
import { Redirect, Route } from 'react-router-dom'

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css'
import '@ionic/react/css/float-elements.css'
import '@ionic/react/css/text-alignment.css'
import '@ionic/react/css/text-transformation.css'
import '@ionic/react/css/flex-utils.css'
import '@ionic/react/css/display.css'

/* Theme variables */
import './theme/variables.css'
import './theme/custom.scss'
import Login from './pages/Login'
import Signup from './pages/Signup'
import PatientForm from './pages/Patients/PatientForm'
import PatientList from './pages/Patients/PatientList'
import * as Utility from './shared/utility'
import PatientDetail from './pages/Patients/PatientDetail'
import Recertifications from './pages/Patients/Recertifications'
import AddRecertifications from './pages/Patients/AddRecertifications'
import Settings from './pages/Settings/Settings'
import Units from './pages/Settings/Units'
import RoutingApp from './pages/Settings/RoutingApp'
import DefaultSessionLength from './pages/Settings/DefaultSessionLength'
import DistanceCalculator from './pages/Settings/DistanceCalculator'
import IncludeWeekends from './pages/Settings/IncludeWeekends'
import WorkingHours from './pages/Settings/WorkingHours'
import Schedule from './pages/PatientSchedule/Schedule'
import DocumentsDue from './pages/DocumentsDue'
import ForgotPassword from './pages/ForgotPassword'
import AddSchedule from './pages/PatientSchedule/AddSchedule'
import PatientNonAvailability from './pages/Patients/PatientNonAvailability'
import NonAvailabilityList from './pages/Patients/PatientNonAvailabilityList'

const App: React.FC = () => {
  return (
    <IonApp>
      <IonReactHashRouter>
        <IonSplitPane contentId='main'>
          <Menu />
          <IonRouterOutlet id='main'>
            <Route path='/login' component={Login} exact />
            <Route path='/signup' component={Signup} exact />
            <Route path='/patient-form' component={PatientForm} exact />
            <Route path='/patient-detail/:id' component={PatientForm} exact />
            <Route path='/patient-list' component={PatientList} exact />
            <Route path='/details/:id' component={PatientDetail} exact />
            <Route
              path='/add-recertifications/:patient_id/:recert_id'
              component={AddRecertifications}
              exact
            />
            <Route
              path='/add-recertifications/:patient_id'
              component={AddRecertifications}
              exact
            />
            <Route
              path='/recertifications/:patient_id'
              component={Recertifications}
              exact
            />
            <Route path='/settings' component={Settings} exact />
            <Route path='/units' component={Units} exact />
            <Route path='/routing-app' component={RoutingApp} exact />
            <Route
              path='/default-session-length'
              component={DefaultSessionLength}
              exact
            />
            <Route
              path='/distance-calculator'
              component={DistanceCalculator}
              exact
            />
            <Route path='/include-weekends' component={IncludeWeekends} exact />
            <Route path='/working-hours' component={WorkingHours} exact />
            <Route path='/home' component={Schedule} exact />
            <Route path='/patient-schedule' component={Schedule} exact />
            <Route path='/documentsDue' component={DocumentsDue} exact />
            <Route path='/forgotPassword' component={ForgotPassword} exact />
            <Route
              path='/add-schedule/:patient_name/:patient_id/:recert_id'
              component={AddSchedule}
              exact
            />

            <Route
              path='/patient-non-availability/:name/:id'
              component={PatientNonAvailability}
              exact
            />
            <Route
              path='/non-availability-list/:name/:id'
              component={NonAvailabilityList}
              exact
            />
            <Route
              path='/non-availability-list/:name/:id/:unavail_id'
              component={PatientNonAvailability}
              exact
            />

            <Route
              path='/'
              render={() =>
                Utility.isUserLoggedIn() ? (
                  <Redirect to='/home' />
                ) : (
                  <Redirect to='/login' />
                )
              }
              exact
            />
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactHashRouter>
    </IonApp>
  )
}

export default App
