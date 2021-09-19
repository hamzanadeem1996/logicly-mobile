import React, { Component } from "react";
import {
  IonLabel,
  IonRow,
  IonCol,
} from "@ionic/react";
import { Link } from "react-router-dom";

interface SegmentsProps {
  pageView?: string;
  active?:boolean;
}
class Segments extends Component<SegmentsProps> {
  render() {

    let active=this.props.active;
    let page=this.props.pageView;
    
    return (
      <>
        <IonRow className={"scheduleBtn"}>
          <IonCol>
            <Link className={active&&page=="patients"?"active":""} to="/patient-schedule">
              <IonLabel >Patients</IonLabel>
            </Link>
            <Link className={active&&page=="today"?"active":""} to="/today-view">
              <IonLabel>Today</IonLabel>
            </Link>
            <Link className={active&&page=="week"?"active":""} to="/week-view">
              <IonLabel>Week</IonLabel>
            </Link>
            <Link className={active&&page=="month"?"active":""} to="/month-view">
              <IonLabel>Month</IonLabel>
            </Link>
          </IonCol>
        </IonRow>
      </>
    );
  }
}

export default Segments;
