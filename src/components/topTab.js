import React, { Component } from 'react'
import styled from 'styled-components'

const Top = styled.div`
    position: absolute;
    top: ${props => (props.open ? '0' : '-7.5%')};
    display: flex;
    flex-direction: column-reverse;
    left: 0;
    right: 0;
    bottom: ${props => (props.open ? '90%' : '97.5%')};
    transition: top 1s, bottom 1s;
`

const TopOpener = styled.div`
    height: 25%;
    background-color: black;
    width: 100%;
`

const TopButton = styled.div`
    height: 75%;
    width: 100%;
    display: flex;
    flex-direction: row;
    background-color: #404040;
`

const StyledInput = styled.input`
    height: 75%;
    padding: 10px;
`

class topTab extends Component {
    constructor(props) {
        super(props)

        this.state = {
            open: false
        }
    }

    open = () => {
        if (this.props.canOpen) {
            this.setState(state => ({
                open: !state.open
            }))
        } else {
            this.setState({
                open: false
            })
        }
    }

    openlink = () => {
        window.open(this.props.websiteLink)
    }

    render = () => {
        return (
            <Top open={this.state.open && this.props.canOpen}>
                <TopOpener id="topOpener" onClick={this.open} />
                <TopButton>
                    <StyledInput
                        type="image"
                        alt="info"
                        src="./information.png"
                        onClick={this.openlink}
                    />
                    <div>
                        <StyledInput
                            type="image"
                            alt="Google maps"
                            src="./gmap.png"
                            onClick={null}
                        />
                    </div>
                    <div id="map" />
                    <StyledInput
                        type="image"
                        alt="Floor Plan"
                        src="./plan.png"
                        onClick={this.props.showPlan}
                    />
                </TopButton>
            </Top>
        )
    }
}

export default topTab
