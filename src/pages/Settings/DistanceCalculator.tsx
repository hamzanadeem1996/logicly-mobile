import {
  IonRadioGroup,
  IonRadio,
  IonButton,
} from "@ionic/react";
import React, { useState } from "react";
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  useIonViewDidEnter,
  IonItem,
  IonLabel,
  IonList,
} from "@ionic/react";
import Header from "../../components/Header";
import * as Utility from "../../shared/utility";
import * as Api from "../../service/api";
import Loading from "../../controls/Loading";

const DistanceCalculator: React.FC = () => {
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState<any>(false);
  const [showToast, setShowToast] = useState(false);
  const DistanceCalList = ["Home Address", "Agency Address"];
  const [distance, setDistance] = useState<string>("Google Maps");

  useIonViewDidEnter(async () => {
    if (Utility.isUserLoggedIn()) {
      Utility.menuEnable(true);
      getData();
    }
  });

  const handleChange = (e: any) => {
    console.log(e, "MMM");
    if (e !== distance) {
      setDistance(e);
    }
  };

  const getData = async () => {
    try {
      setLoading(true);

      let res = await Api.GetSettings();
      setData(res.data);
      setDistance(res.data.distanceCalculator);

      console.log(res, "RES");
      setLoading(false);
    } catch (err) {
      console.log(err, "ERROR");
      setLoading(false);
    }
  };

  const Save = async () => {
    try {
      setLoading(true);

      data.distanceCalculator = distance;
      let res = await Api.Save("Setting", data);
      console.log(res, "RES");
      setLoading(false);
      setShowToast(true);
    } catch (err) {
      console.log(err, "ERROR SETTINGS");
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <Header Name={"Distance Calculator"} CloseIcon={true} />
      <Loading ShowLoading={loading} />
      <IonContent>
        <IonGrid className="settings p0">
          <IonRow>
            <IonCol>
              <IonList>
                <>
                  <IonRadioGroup
                    value={distance}
                    onIonChange={(e) => handleChange(e.detail.value)}
                  >
                    {DistanceCalList.map((item: any, key: any) => {
                      return (
                        <IonItem key={key}>
                          <IonLabel>{item}</IonLabel>
                          <IonRadio
                            mode={"ios"}
                            slot="end"
                            value={item}
                            className="radioCheck"
                          />
                        </IonItem>
                      );
                    })}
                  </IonRadioGroup>
                </>
                <IonRow>
                  <IonCol className="text-center">
                    <IonButton onClick={Save}>Submit</IonButton>
                  </IonCol>
                </IonRow>
                {Utility.SettingsMessage()}
              </IonList>
            </IonCol>
          </IonRow>
        </IonGrid>
        {showToast?(Utility.toast(true,"Data Updated Successfully.")):""}
      </IonContent>
    </IonPage>
  );
};

export default DistanceCalculator;
