import React, { useState, useEffect } from "react";
import { IonRow, IonCol, IonItem } from "@ionic/react";
import * as Api from "../service/api";

const AutoComplete: React.FC<any> = (props: any) => {
  const [State, SetState] = useState({
    searchValue: "",
    searchId: "",
  });

  const [APIStatus, SetAPIStatus] = useState({
    AlreadyFetchingSkipRequest: false,
  });

  const [SuggestionData, SetSuggestionData] = useState<any>({
    suggest: [],
    showSuggestionsBox: false,
    showSuggestions: false,
  });

  useEffect(() => {
    SetState({
      ...State,
      searchValue: props.InitVal,
    });
  }, []);

  const SearchSuggestions = (e: any) => {
    let value = e.target.value;
    SetState({ ...State, searchValue: value });
    if (value.length >= 3) {
      SetSuggestionData({ ...SuggestionData, showSuggestionsBox: true });
      if (!APIStatus.AlreadyFetchingSkipRequest) {
        SetAPIStatus({
          ...APIStatus,
          AlreadyFetchingSkipRequest: true,
        });
        SetSuggestionData({
          ...SuggestionData,
          showSuggestions: false,
        });
        FetchData();
      }
    } else {
      SetSuggestionData({
        ...SuggestionData,
        showSuggestionsBox: false,
      });
    }
  };

  const FetchData = async () => {
    let res: any = await Api.SearchData("User", State.searchValue);
    if (res.data.data != null) {
      res = res.data.data.items;
      setTimeout(() => {
        SetSuggestionData({
          ...SuggestionData,
          suggest: res,
          showSuggestions: true,
          showSuggestionsBox: true,
        });

        SetAPIStatus({
          ...APIStatus,
          AlreadyFetchingSkipRequest: false,
        });
      }, 2000);
    }
  };

  const Reset = () => {
    if (props.CallBack != undefined) {
      props.CallBack(State.searchId);
    }
    console.log(State.searchValue, State, "call back");

    SetSuggestionData({
      ...SuggestionData,
      showSuggestionsBox: false,
    });
  };

  return (
    <div
      onBlur={() => {
        setTimeout(() => {
          Reset();
        }, 400);
      }}
    >
      <IonRow>
        <IonCol>
          <IonItem className="fields autoComplete" lines="none">
            <input
              type="text"
              placeholder={props.Placeholder}
              name={props.name}
              onChange={SearchSuggestions}
              autoComplete="off"
              value={State.searchValue}
              required={props.required}
            />
            <i className="fas fa-angle-down downArrow"></i>
          </IonItem>
          {SuggestionData.showSuggestionsBox && (
            <ul className="auto-complete-list">
              {!SuggestionData.showSuggestions ? (
                <li>loading...</li>
              ) : SuggestionData.suggest.length != 0 ? (
                SuggestionData.suggest.map((ele: any) => {
                  return (
                    <li key={ele.id}
                      onClick={() => {
                        console.log("select", ele.id);
                        State.searchId = ele.id;
                        State.searchValue = ele.fullName;
                        SetState({
                          ...State,
                        });
                      }}
                    >
                      {`${ele.fullName}`}
                    </li>
                  );
                })
              ) : (
                <li>No Suggestions</li>
              )}
            </ul>
          )}
        </IonCol>
      </IonRow>
    </div>
  );
};

export default AutoComplete;
