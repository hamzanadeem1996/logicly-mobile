import { IonContent, IonPage } from '@ionic/react'
import React from 'react'
import { useParams } from 'react-router'
import ExploreContainer from '../components/ExploreContainer'
import Header from '../components/Header'

const Page: React.FC = () => {
  const { title } = useParams<{ title: string }>()
  const { info } = useParams<{ info: string }>()

  return (
    <IonPage>
      <Header Name={title} />
      {/* <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{title}</IonTitle>
        </IonToolbar>
      </IonHeader> */}

      <IonContent fullscreen>
        {/* <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{info}</IonTitle>
          </IonToolbar>
        </IonHeader> */}
        <ExploreContainer name={info} />
      </IonContent>
    </IonPage>
  )
}

export default Page
