import React, { Component } from 'react'
import styled from 'styled-components'

const MenuDiv = styled.div`
    position: absolute;
    left: ${props => (props.open ? '0' : '-18%')};
    display: flex;
    flex-direction: row-reverse;
    bottom: 0;
    top: 0;
    right: ${props => (props.open ? '80%' : '98%')};
    transition: left 1s, right 1s;
    transition-timing-function: ease-in-out;
    z-index: 4;
`

const MenuOpener = styled.div`
    width: 10%;
    background-color: #323335;
    height: 100%;
`

const MenuButton = styled.div`
    width: 90%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #404040;
`

const OuterDiv = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    height: 15%;
`

const StyledDiv = styled.div`
    width: 40%
    height: 0;
    overflow: hidden;
    padding-top: 100%;
    position: relative;
`

const StyledInput = styled.input`
    top: 0;
    left: 0;
    position: absolute;
    width: calc(100% - 10px);
    padding: 5px;
    cursor: pointer;
`

const Text = styled.p`
    width: calc(60% - 20px);
    padding: 10px;
`
class Menu extends Component {
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
            <MenuDiv open={this.state.open && this.props.canOpen}>
                <MenuOpener id="topOpener" onClick={this.open} />
                <MenuButton>
                    <OuterDiv>
                        <StyledDiv>
                            <StyledInput
                                type="image"
                                alt="info"
                                src="./information.png"
                                onClick={this.openlink}
                            />
                        </StyledDiv>
                        <Text>Info</Text>
                    </OuterDiv>
                    <OuterDiv>
                        <StyledDiv>
                            <StyledInput
                                type="image"
                                alt="Google maps"
                                src="./gmap.png"
                                onClick={this.props.showMap}
                            />
                        </StyledDiv>
                        <Text>Google Maps</Text>
                    </OuterDiv>
                    <OuterDiv>
                        <StyledDiv>
                            <StyledInput
                                type="image"
                                alt="Floor Plan"
                                src="./plan.png"
                                onClick={this.props.showPlan}
                            />
                        </StyledDiv>
                        <Text>Floor Plan</Text>
                    </OuterDiv>
                    <OuterDiv>
                        <StyledDiv>
                            <StyledInput
                                type="image"
                                alt="Change Sticker"
                                src="./help.png"
                                onClick={this.props.showSticker}
                            />
                        </StyledDiv>
                        <Text>Change Sticker</Text>
                    </OuterDiv>
                    <OuterDiv>
                        <StyledDiv>
                            <StyledInput
                                type="image"
                                alt="Help"
                                src="./help.png"
                                onClick={null}
                            />
                        </StyledDiv>
                        <Text>Help</Text>
                    </OuterDiv>
                </MenuButton>
            </MenuDiv>
        )
    }
}

export default Menu
