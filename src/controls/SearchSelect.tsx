import React, { useState, useEffect } from 'react'
import {
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  useIonViewDidEnter
} from '@ionic/react'
import * as Api from '../service/api'
import * as Utility from '../shared/utility'
import Select from 'react-select'

let initialValues = {
  list: [],
  value: {},
  query: '',
  skipReq: false,
  InitVal: '',
  CallBack: '',
  Placeholder: '',
  name: '',
  required: true
}

interface IProps {
  [x: string]: any
}
let IsLatest: any = undefined
const SearchSelect: React.FC<IProps> = (props: IProps) => {
  let [state, setState] = useState<any>(initialValues)

  useEffect(() => {
    FetchData('')
    state.value = props.InitVal == undefined ? null : props.InitVal

    //
    if (state.value && state.value.value == 0) {
      state.value = {
        value: 0,
        label: 'None'
      }
    }
    //

    state.Placeholder = props.Placeholder
    setState({ ...state })
  }, [])

  useIonViewDidEnter(() => {
    state.value = props.InitVal == undefined ? null : props.InitVal
    if (state.value && state.value.value == 0) {
      state.value = {
        value: 0,
        label: 'None'
      }
    }
    setState({ ...state })
  })

  const FetchData = async (query: any) => {
    let temp = Math.random()
    IsLatest = temp
    let res: any = await Api.usersForDropdown(
      'User',
      query,
      props.roleName ? '&roleName=' + props.roleName : ''
    )
    console.log(res, 'RES')
    if (temp != IsLatest) {
      return
    }
    if (res.data.data != null) {
      res = res.data.data.items
      console.log(res, 'mmmm')
      state.list = Utility.getSelectList(res, 'users')
      state.skipReq = false
      setState({ ...state })
      console.log(res, 'ok options')
    }
  }

  const Reset = () => {
    if (props.CallBack != undefined) {
      props.CallBack(state.value)
    }
    console.log(state, 'call back')
  }

  const searchOnInput = (e: any) => {
    console.log('text enter fetch', e)
    if (e == null) {
      e = ''
    }
    if (e) {
      FetchData(e)
    }
  }

  const handleChange = (e: any) => {
    state.value = e
    setState({ ...state })
    console.log(e, 'VAL')
    //
    Reset()
  }

  return (
    <div
      onBlur={() => {
        setTimeout(() => {
          Reset()
        }, 400)
      }}
    >
      <IonRow>
        <IonCol className='searchSelectItem'>
          <IonItem lines='none'>
            {state.value !== null && state.value.label !== '' ? (
              <IonLabel position='floating'>{props.Placeholder}</IonLabel>
            ) : null}
            <div
              className={`searchSelectDrop ${
                state.value !== null && state.value.label !== '' ? '' : 'pb22'
              }`}
            >
              <Select
                placeholder={
                  state.value !== null && state.value.value == null
                    ? ''
                    : props.Placeholder
                }
                name={props.name}
                onChange={handleChange}
                onInputChange={searchOnInput}
                onFocus={() => FetchData('')}
                autoComplete='off'
                value={state.value}
                required={props.required}
                className='searchSelect'
                options={state.list}
                isSearchable
                isClearable
              />
            </div>
          </IonItem>
        </IonCol>
      </IonRow>
    </div>
  )
}

export default SearchSelect
