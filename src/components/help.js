import React, { Component } from 'react'
import styled from 'styled-components'

const HelpDiv = styled.div`
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

class Help extends Component {
    render = () => {
        return (
            <HelpDiv show={this.props.show} env={this.props.env}>
                {this.props.show && this.props.getHelp()}
            </HelpDiv>
        )
    }
}

export default Help
