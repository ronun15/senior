import React, { Component } from 'react'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'
import styled from 'styled-components'

const GoogleMapDiv = styled.div`
    width: 80%;
    height: 80%;
    z-index: 3;
    position: absolute;
    top: 10%;
    left: 10%;
    right: 10%;
    bottom: 10%;
    visibility: ${props => (props.show ? 'visible' : 'hidden')};
`

class Map extends Component {
    render = () => {
        return (
            <GoogleMapDiv show={this.props.show} env={this.props.env}>
                <LoadScript id="scriptLoader" googleMapsApiKey="insert key">
                    <GoogleMap
                        id="googleMap"
                        mapContainerStyle={{
                            height: '100%',
                            width: '100%'
                        }}
                        zoom={15}
                        center={{
                            lat: this.props.latitude,
                            lng: this.props.longtitude
                        }}>
                        <Marker
                            position={{
                                lat: this.props.latitude,
                                lng: this.props.longtitude
                            }}
                        />
                    </GoogleMap>
                </LoadScript>
            </GoogleMapDiv>
        )
    }
}

export default Map
