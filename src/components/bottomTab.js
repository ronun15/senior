import React, { Component } from 'react'
import styled from 'styled-components'

const Bottom = styled.div`
    position: absolute;
    bottom: 5%;
    display: flex;
    flex-direction: row;
    right: 10%;
    left: 10%;
    top: 75%;
    transition: right 1s, left 1s;
    transition-timing-function: ease-in-out;
    z-index: 5;
    visibility: ${props => (props.show ? 'visible' : 'hidden')};
`

const OuterDiv = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    flex-direction: row;
    background-color: #404040;
    border-radius: 25px;
    border: 2px solid white;
    overflow-x: scroll;
    overflow-y: hidden;
`

class BottomTab extends Component {
    render = () => {
        return (
            <Bottom show={this.props.show}>
                <OuterDiv>{this.props.getSticker()}</OuterDiv>
            </Bottom>
        )
    }
}

export default BottomTab
