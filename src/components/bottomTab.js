import React, { Component } from 'react'
import styled from 'styled-components'

const OuterDiv = styled.div`
    position: absolute;
    right: 10%;
    left: 10%;
    top: 75%;
    bottom: 5%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    background-color: #212121;
    border-radius: 25px;
    border: 2px solid white;
    z-index: ${props => (props.show ? 5 : -1)};
    overflow-x: auto;
    visibility: ${props => (props.show ? 'visible' : 'hidden')};
`

class BottomTab extends Component {
    render = () => {
        return (
            <OuterDiv
                show={
                    this.props.showSticker ||
                    this.props.showFront ||
                    this.props.showBack
                }>
                {this.props.showSticker && this.props.getSticker()}
                {(this.props.showFront || this.props.showBack) &&
                    this.props.getLayer()}
            </OuterDiv>
        )
    }
}

export default BottomTab
