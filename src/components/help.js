import React, { Component } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'

import { mobile } from '../mediaStyle'

const text1 = `Controls

    - Left Click and Drag - rotate the camera
    - Mousewhell - zoom in/out
    - Double Click - add/remove a sticker
`

const text2 = `Menu

    - About -
The project website.

    - Google Maps -
The project location.

    - Floor Plan -
View the project room in 3D. Looking above will results in a floor plan.

    - Change Sticker -
Change the currently active sticker. You can place it on the scene by double clicking.

    - Change Layers -
Change the layers that are showing on top of the room.

    - Change BG -
Change the background that are showing outside of the room.

    - Help -
Show Help.
`

const text3 = `Floor Plan

    You can view the layout of the house in 3D with the yellow dot showing the current location.

Controls

    - Left Click and Drag - rotate the camera
    - Right Click and Drag - translate the camera
    - Mousewhell - zoom in/out
    - Double Click - move to the closest location to the click
`

const HelpDiv = styled.div`
    background-color: #212121;
    border-radius: 25px;
    border: 2px solid white;
    width: 80%;
    height: 80%;
    z-index: ${props => (props.show ? '3' : '-1')};
    position: absolute;
    top: 10%;
    left: 10%;
    right: 10%;
    bottom: 10%;
    display: flex;
    visibility: ${props => (props.show ? 'visible' : 'hidden')};
`

const ArrowDiv = styled.div`
    width: 5%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    visibility: ${props => (props.show ? 'visible' : 'hidden')};
    font-size: 1rem;

    @media ${mobile} {
        font-size: 0.5rem;
    }
`

const ContentDiv = styled.div`
    width: 90%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: auto;
`

const Img = styled.img`
    width: 100%;
    margin: auto;
    margin: 2rem auto;
`

const P = styled.p`
    margin: 1rem;
    font-size: 2rem;
    color: white;
    white-space: pre-wrap;

    @media ${mobile} {
        font-size: 1rem;
    }
`

class Help extends Component {
    constructor(props) {
        super(props)

        this.state = {
            index: 0,
            img: ['./img/img1.JPG', './img/img2.JPG', './img/img3.JPG'],
            text: [text1, text2, text3]
        }
    }

    addIndex = () => {
        this.setState(state => ({
            index: state.index + 1
        }))
    }

    reduceIndex = () => {
        this.setState(state => ({
            index: state.index - 1
        }))
    }

    render = () => {
        return (
            <HelpDiv show={this.props.show}>
                <ArrowDiv show={this.state.index !== 0 && this.props.show}>
                    <FontAwesomeIcon
                        icon={faChevronLeft}
                        size="3x"
                        color="white"
                        style={{
                            cursor: 'pointer'
                        }}
                        onClick={this.reduceIndex}
                    />
                </ArrowDiv>
                <ContentDiv>
                    <Img src={this.state.img[this.state.index]} alt={this.state.text[this.state.index]} />

                    <P>{this.state.text[this.state.index]}</P>
                </ContentDiv>
                <ArrowDiv show={this.state.index !== this.state.img.length - 1 && this.props.show}>
                    <FontAwesomeIcon
                        icon={faChevronRight}
                        size="3x"
                        color="white"
                        style={{
                            cursor: 'pointer'
                        }}
                        onClick={this.addIndex}
                    />
                </ArrowDiv>
            </HelpDiv>
        )
    }
}

export default Help
