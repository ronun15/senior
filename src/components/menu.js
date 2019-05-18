import React, { Component } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faBars,
    faInfoCircle,
    faQuestionCircle,
    faSmile,
    faMapMarkerAlt,
    faHome,
    faLayerGroup,
    faCloudSun
} from '@fortawesome/free-solid-svg-icons'

import { mobile } from '../mediaStyle'

const MenuDiv = styled.div`
    position: absolute;
    display: flex;
    flex-direction: row-reverse;
    bottom: 0;
    top: 0;
    right: ${props =>
        props.open ? 'calc(100% - 25rem)' : 'calc(100% - 5rem)'};
    transition: left 0.5s, right 0.5s;
    transition-timing-function: ease-in-out;
    z-index: 4;

    @media ${mobile} {
        right: 0;
        left: 0;
        bottom: ${props => (props.open ? '0' : 'calc(100% - 3rem)')};
        transition: top 0.5s, bottom 0.5s;
        flex-direction: column-reverse;
    }
`

const MenuOpener = styled.div`
    width: 5rem;
    height: 100%;
    font-size: 3rem;
    background-color: #000000;
    padding: 1rem 0;
    display: flex;

    @media ${mobile} {
        width: 100%;
        height: 2rem;
        justify-content: center;
        padding: 0.5rem 0;
        font-size: 1.5rem;
    }
`

const MenuButton = styled.div`
    width: 20rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #212121;
    color: white;
    text-align: center;

    @media ${mobile} {
        width: 100%;
        height: calc(100% - 3rem);
    }
`

const OuterDiv = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    flex: 1;
    overflow-y: hidden;
    font-size: 2rem;
    border-bottom: 0.2em solid black;
    cursor: pointer;

    @media ${mobile} {
        border-bottom: ${props =>
            props.open ? '0.2em solid black' : '0px solid black'};
        transition: border-bottom-width 0.5s;
        font-size: 1.5rem;
    }
`

const StyledDiv = styled.div`
    width: 40%
    position: relative;
    display : flex;
    flex-direction: column;
    justify-content: center;
`

const Text = styled.p`
    margin: 0
    width: calc(60% - 2em);
    margin: auto 1rem;
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
            const open = this.state.open
            if (!open) {
                document
                    .getElementById('canvas')
                    .addEventListener('mousedown', this.open)
                document
                    .getElementById('plan')
                    .addEventListener('mousedown', this.open)
            } else {
                document
                    .getElementById('canvas')
                    .removeEventListener('mousedown', this.open)
                document
                    .getElementById('plan')
                    .removeEventListener('mousedown', this.open)
            }
            this.setState({
                open: !open
            })
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
            <MenuDiv id="menu" open={this.state.open && this.props.canOpen}>
                <MenuOpener id="opener">
                    <FontAwesomeIcon
                        icon={faBars}
                        size="lg"
                        color="white"
                        style={{ margin: '0 auto', cursor: 'pointer' }}
                        onClick={this.open}
                    />
                </MenuOpener>
                <MenuButton>
                    <OuterDiv
                        open={this.state.open && this.props.canOpen}
                        onClick={() => {
                            this.openlink()
                            this.open()
                        }}>
                        <StyledDiv>
                            <FontAwesomeIcon
                                icon={faInfoCircle}
                                size="3x"
                                color="white"
                                style={{
                                    margin: '0 auto'
                                }}
                            />
                        </StyledDiv>
                        <Text>ABOUT</Text>
                    </OuterDiv>
                    <OuterDiv
                        open={this.state.open && this.props.canOpen}
                        onClick={() => {
                            this.props.showMap()
                            this.open()
                        }}>
                        <StyledDiv>
                            <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                size="3x"
                                color="white"
                                style={{
                                    margin: '0 auto'
                                }}
                            />
                        </StyledDiv>
                        <Text>GOOGLE MAPS</Text>
                    </OuterDiv>
                    <OuterDiv
                        open={this.state.open && this.props.canOpen}
                        onClick={() => {
                            this.props.showPlan()
                            this.open()
                        }}>
                        <StyledDiv>
                            <FontAwesomeIcon
                                icon={faHome}
                                size="3x"
                                color="white"
                                style={{
                                    margin: '0 auto'
                                }}
                            />
                        </StyledDiv>
                        <Text>FLOOR PLAN</Text>
                    </OuterDiv>
                    <OuterDiv
                        open={this.state.open && this.props.canOpen}
                        onClick={() => {
                            this.props.showSticker()
                            this.open()
                        }}>
                        <StyledDiv>
                            <FontAwesomeIcon
                                icon={faSmile}
                                size="3x"
                                color="white"
                                style={{
                                    margin: '0 auto'
                                }}
                            />
                        </StyledDiv>
                        <Text>CHANGE STICKERS</Text>
                    </OuterDiv>
                    <OuterDiv
                        open={this.state.open && this.props.canOpen}
                        onClick={() => {
                            this.props.showFront()
                            this.open()
                        }}>
                        <StyledDiv>
                            <FontAwesomeIcon
                                icon={faLayerGroup}
                                size="3x"
                                color="white"
                                style={{
                                    margin: '0 auto'
                                }}
                            />
                        </StyledDiv>
                        <Text>CHANGE LAYERS</Text>
                    </OuterDiv>
                    <OuterDiv
                        open={this.state.open && this.props.canOpen}
                        onClick={() => {
                            this.props.showBack()
                            this.open()
                        }}>
                        <StyledDiv>
                            <FontAwesomeIcon
                                icon={faCloudSun}
                                size="3x"
                                color="white"
                                style={{
                                    margin: '0 auto'
                                }}
                            />
                        </StyledDiv>
                        <Text>CHANGE BG</Text>
                    </OuterDiv>
                    <OuterDiv
                        open={this.state.open && this.props.canOpen}
                        onClick={() => {
                            this.props.showHelp()
                            this.open()
                        }}>
                        <StyledDiv>
                            <FontAwesomeIcon
                                icon={faQuestionCircle}
                                size="3x"
                                color="white"
                                style={{
                                    margin: '0 auto'
                                }}
                            />
                        </StyledDiv>
                        <Text>HELP</Text>
                    </OuterDiv>
                </MenuButton>
            </MenuDiv>
        )
    }
}

export default Menu
