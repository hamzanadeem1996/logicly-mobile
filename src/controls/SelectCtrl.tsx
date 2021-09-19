import React, { Component } from "react";
import {
  IonItem,
  IonLabel,
  IonCol,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonList,
} from "@ionic/react";
import { Controller } from "react-hook-form";

interface InputProps {
  control: any;
  showError: any;
  label: string;
  placeholder: string;
  name: string;
  list: any;
  itemLabel?:string;
  itemVal?:string;
  required: boolean;
  IsMulti?:boolean;
}

export default class SelectCtrl extends Component<InputProps> {
  render() {
    // let label = this.props.label;
    let name = this.props.name;
    let Ival=this.props.itemVal;
    let iLabel=this.props.itemLabel;

    return (
      <>
        <IonRow>
          <IonCol size="12">
              <IonList>
            <IonItem className="fields" lines="none">
              {/* <IonLabel>{this.props.label}</IonLabel> */}
              <Controller
                render={({ onChange, onBlur, value }) => (
                  <IonSelect
                    name={this.props.name}
                    interface="popover"
                    placeholder={this.props.placeholder}
                    value={value}
                    onIonChange={onChange}
                    onBlur={onBlur}
                    multiple={this.props.IsMulti}
                  >
                    {this.props.list.map((item: any, key: any) => (
                      <IonSelectOption value={Ival==undefined?item:item[Ival]} key={key}>
                        {iLabel==undefined?item:item[iLabel]}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                )}
                name={this.props.name}
                control={this.props.control}
                rules={{
                  required: this.props.required,
                }}
              />
            </IonItem>
            </IonList>
            <IonLabel className="text-center">
              {this.props.showError(name)}
            </IonLabel>
          </IonCol>
        </IonRow>
      </>
    );
  }
}
