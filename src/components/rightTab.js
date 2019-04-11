import React, { Component } from 'react'
import styled from 'styled-components'

const Right = styled.div`
    position: absolute;
    right: ${props => (props.open ? '0' : '-7.5%')};
    display: flex;
    flex-direction: row;
    top: 0;
    bottom: 0;
    left: ${props => (props.open ? '90%' : '97.5%')};
    transition: right 1s, left 1s;
`

const RightOpener = styled.div`
    width: 25%;
    background-color: black;
    height: 100%;
`

const RightButton = styled.div`
    width: 75%;
    height: 100%;
    display: flex;
    justify-content: center;
    flex-direction: column;
    background-color: #404040;
`

const StyledInput = styled.input`
    width: 75%;
    padding: 10px;
`

class rightTab extends Component {
    constructor(props) {
        super(props)

        this.state = {
            open: false
        }

        this.open = this.open.bind(this)
    }

    open() {
        this.setState(state => ({
            open: !state.open
        }))
    }

    render() {
        return (
            <Right open={this.state.open}>
                <RightOpener onClick={this.open} />
                <RightButton />
            </Right>
        )
    }
}

export default rightTab
