import React, { Component } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronCircleRight } from '@fortawesome/free-solid-svg-icons'

const DropDownMenu = styled.div`
    position: absolute;
    top: 0;
    left: 5rem;
    width: 15rem;
    height: auto;
    z-index: 1;
    background-color: black;
    display: flex;
    flex-direction: column;
    color: white;
    font-size: 1.2rem;
    border-left: 0.5rem solid white;
`

const DropDownItem = styled.div`
    cursor: pointer;
    background-color: black;
    height: auto;
    position: relative;
    color: white;

    &:hover {
        background-color: white;
        color: black;
    }
`

const ItemFlexDiv = styled.div`
    display: flex;
    height: auto;
    width: 100%;
    flex-direction: column;
    position: absolute;
    left: 100%;
`

const NavigateP = styled.p`
    font-size: 2rem;
    margin: 1rem;
`

const TextP = styled.p`
    margin: 1rem;
`

class DropDown extends Component {
    constructor(props) {
        super(props)

        this.state = {
            open: -1
        }
    }

    createDropDown = () => {
        const graph = this.props.graph
        const floor = {}

        for (const name in graph) {
            const i = graph[name].floor
            if (!floor[i]) {
                floor[i] = [name]
            } else {
                floor[i].push(name)
            }
        }
        return Object.keys(floor).map((item, index) => {
            return (
                <DropDownItem key={index} onClick={() => this.onClick(item)}>
                    {this.state.open === item && (
                        <ItemFlexDiv>
                            {floor[item].map((name, index2) => {
                                return (
                                    <DropDownItem
                                        key={index2}
                                        onClick={() =>
                                            this.props.changeScene(name, item)
                                        }>
                                        <TextP>{name}</TextP>
                                    </DropDownItem>
                                )
                            })}
                        </ItemFlexDiv>
                    )}
                    <TextP>
                        {`FLOOR ${item}`}
                        <FontAwesomeIcon
                            icon={faChevronCircleRight}
                            size="lg"
                            pull="right"
                            style={{
                                margin: 'auto 0'
                            }}
                        />
                    </TextP>
                </DropDownItem>
            )
        })
    }

    hideDropDown = () => {
        this.setState({ open: -1 }, () => {
            document
                .getElementById('canvas')
                .removeEventListener('click', this.hideDropDown)
        })
    }

    onClick = floor => {
        this.setState(
            state => ({
                open: state.open === floor ? -1 : floor
            }),
            () => {
                document
                    .getElementById('canvas')
                    .addEventListener('click', this.hideDropDown)
            }
        )
    }

    render = () => {
        return (
            <DropDownMenu>
                <NavigateP>NAVIGATE</NavigateP>
                {this.createDropDown()}
            </DropDownMenu>
        )
    }
}

export default DropDown
