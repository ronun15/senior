import React, { Component } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faChevronLeft,
    faChevronRight
} from '@fortawesome/free-solid-svg-icons'

import { mobile } from '../mediaStyle'

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
    margin: 1rem auto;
    font-size: 2rem;
    color: white;

    @media ${mobile} {
        font-size: 1rem;
    }
`

class Help extends Component {
    constructor(props) {
        super(props)

        this.state = {
            index: 0,
            img: [
                'https://previews.123rf.com/images/mdorottya/mdorottya1410/mdorottya141000012/32805665-happy-little-orange-havanese-puppy-dog-is-sitting-in-the-grass.jpg',
                'https://www.opencollege.info/wp-content/uploads/2016/06/buying-a-new-puppy-dog.jpg'
            ],
            text: [
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi nec lacus suscipit, congue neque sed, efficitur nulla. Curabitur vel dapibus libero. Nullam vestibulum justo mi, vel aliquam ipsum lacinia et. Nullam tincidunt mauris id justo aliquet maximus. Curabitur ut dolor non augue dignissim imperdiet eget at enim. Nulla placerat arcu vitae neque hendrerit, in tempor neque accumsan. Donec ullamcorper sed enim vitae fringilla. Vivamus sed ex quis enim vehicula auctor in et nunc. Sed vel convallis ante. Quisque id tempor ipsum, quis iaculis nulla. Sed gravida id dolor eu laoreet. Donec maximus tempor eros a vestibulum. Duis ut aliquam nibh.',
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi nec lacus suscipit, congue neque sed, efficitur nulla. Curabitur vel dapibus libero. Nullam vestibulum justo mi, vel aliquam ipsum lacinia et. Nullam tincidunt mauris id justo aliquet maximus. Curabitur ut dolor non augue dignissim imperdiet eget at enim. Nulla placerat arcu vitae neque hendrerit, in tempor neque accumsan. Donec ullamcorper sed enim vitae fringilla. Vivamus sed ex quis enim vehicula auctor in et nunc. Sed vel convallis ante. Quisque id tempor ipsum, quis iaculis nulla. Sed gravida id dolor eu laoreet. Donec maximus tempor eros a vestibulum. Duis ut aliquam nibh.'
            ]
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
                    <Img
                        src={this.state.img[this.state.index]}
                        alt={this.state.text[this.state.index]}
                    />

                    <P>{this.state.text[this.state.index]}</P>
                </ContentDiv>
                <ArrowDiv
                    show={
                        this.state.index !== this.state.img.length - 1 &&
                        this.props.show
                    }>
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
