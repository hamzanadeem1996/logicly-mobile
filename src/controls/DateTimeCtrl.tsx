import React, { Component } from "react";
import { IonItem, IonLabel, IonCol, IonRow, IonDatetime } from "@ionic/react";
import { Controller } from "react-hook-form";
import { nextMonthDate } from "../shared/utility";

interface InputProps {
  control: any;
  showError: any;
  label: string;
  placeholder?: string;
  name: string;
  min: any;
  max: any;
  required?: boolean;
  readonly?: boolean;
  setValue?: any;
  displayFormat?:any;
}

export default class DateTimeCtrl extends Component<InputProps> {
  render() {
    // let label = this.props.label;
    let name = this.props.name;

    const handleChange = (e: any) => {
      if (this.props.setValue != undefined && name == "evaluation") {
        let val = e.target.value;
        if (val == undefined || val == null) {
          return;
        }
        let upVal = nextMonthDate(val);
        this.props.setValue("thirtyDaysRelEval", upVal);
      }
    };

    return (
      <>
        <IonRow className="dateTimeCss">
          <IonCol>
            <IonItem className="fields" lines="none">
              <IonLabel position="floating">{this.props.label}</IonLabel>
              <Controller
                render={({ onChange, onBlur, value }) => (
                  <IonDatetime
                    onBlur={onBlur}
                    onIonChange={(e: any) => {
                      onChange(e.target.value);
                      handleChange(e);
                    }}
                    value={value}
                    name={this.props.name}
                    display-timezone="utc"
                    displayFormat={this.props.displayFormat}
                    pickerFormat={this.props.displayFormat}
                    placeholder={this.props.placeholder}
                    readonly={this.props.readonly}
                    min="2018" max="2099-10-31"
                  ></IonDatetime>
                  )}
                name={this.props.name}
                control={this.props.control}
                rules={{
                  required: this.props.required,
                  min: {
                    value: this.props.min,
                    message: "Date can't be less than " + this.props.min,
                  },
                  max: {
                    value: this.props.max,
                    message: "Date can't be less than " + this.props.max,
                  },
                }}
              />
                <img src="/assets/images/calIcon.svg" alt="" className="calIcon"/>
            </IonItem>
            <IonLabel className="text-center">
              {this.props.showError(name)}
            </IonLabel>
          </IonCol>
        </IonRow>
      </>
    );
  }
}
