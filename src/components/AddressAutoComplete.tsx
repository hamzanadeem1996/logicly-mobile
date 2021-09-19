import React, { useEffect } from 'react'
import { GOOGLE } from './../shared/utility'
import { useIonViewDidLeave, useIonViewWillEnter } from '@ionic/react'

let autocomplete: any

interface IProps {
  address: string
  Data: any
  id: string
  lat: any
  long: any
}
const AddressAutoComplete: React.FC<IProps> = (props: any) => {
  useEffect(() => {
    initAutocomplete()
  }, [])

  useIonViewWillEnter(() => {
    initAutocomplete()
  })
  useIonViewDidLeave(() => {
    let inputField: any = document.getElementById(props.id)
    if (inputField == null) return
    console.log('enter leavveee')
    inputField.value = ''
  })

  const initAutocomplete = () => {
    let inputField: any = document.getElementById(props.id)
    if (inputField == null) return
    inputField.value = props.address
    console.log(props, inputField.value, 'ADDRESS 1234')
    // Create the autocomplete object, restricting the search predictions to
    // geographical location types.
    autocomplete = new GOOGLE.maps.places.Autocomplete(inputField, {})
    // Avoid paying for data that you don't need by restricting the set of
    // place fields that are returned to just the address components.
    autocomplete.setFields([
      'geometry',
      'place_id',
      'formatted_address',
      'vicinity'
    ])
    // When the user selects an address from the drop-down, populate the
    // address fields in the form.
    autocomplete.addListener('place_changed', fillInAddress)
  }

  const fillInAddress = () => {
    // Get the place details from the autocomplete object.
    const place = autocomplete.getPlace()
    console.log(place, 'PLACES')
    console.log(place, 'PLACE', place.geometry.location.lat())
    if (props.Data != undefined && place !== undefined) {
      props.Data({
        address: place.formatted_address,
        cityName: place.vicinity,
        lat: place.geometry.location.lat(),
        long: place.geometry.location.lng()
      })
    }
  }

  const geolocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const geolocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        const circle = new GOOGLE.maps.Circle({
          center: geolocation,
          radius: position.coords.accuracy
        })
        if (autocomplete != undefined)
          autocomplete.setBounds(circle.getBounds())
      })
    }
  }

  return (
    <div id='locationField'>
      <input
        id={props.id}
        placeholder='Enter Patient Address'
        onFocus={geolocate}
        type='text'
        className='form-control'
        required
      />
    </div>
  )
}
export default AddressAutoComplete
