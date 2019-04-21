import React, { Component } from 'react'
import styled from 'styled-components'

const DropDownMenu = styled.div`
    position: absolute;
    top: 5%;
    left: 5%;
    width: 10%;
    height: auto;
    cursor: pointer;
    z-index: 1;
    cursor: pointer;
    background-color: white;
    display: flex;
    flex-direction: column;
`

const DropDownItem = styled.div`
    cursor: pointer;
    background-color: white;
    height: auto;
    position: relative;
`

const ItemFlexDiv = styled.div`
    display: flex;
    height: auto;
    width: 100%;
    flex-direction: column;
    position: absolute;
    left: 100%;
    min-width: 100px;
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
        console.log(floor)
        return Object.keys(floor).map(item => {
            console.log(item)
            return (
                <DropDownItem onClick={() => this.onClick(item)}>
                    {this.state.open === item && (
                        <ItemFlexDiv>
                            {floor[item].map(name => {
                                return (
                                    <DropDownItem
                                        onClick={() =>
                                            this.props.changeScene(name, item)
                                        }>
                                        <p>{name}</p>
                                    </DropDownItem>
                                )
                            })}
                        </ItemFlexDiv>
                    )}
                    <p>{`floor ${item}`}</p>
                </DropDownItem>
            )
        })
    }

    // hideDropDown = () => {
    //     this.setState({ open: -1 }, () => {
    //         document.removeEventListener('click', this.hideDropDown)
    //     })
    // }

    onClick = floor => {
        this.setState(
            state => ({
                open: state.open === floor ? -1 : floor
            })
            // () => {
            //     document.addEventListener('click', this.hideDropDown)
            // }
        )
    }

    render = () => {
        return (
            <DropDownMenu>
                <p>Navigate</p>
                {this.createDropDown()}
            </DropDownMenu>
        )
    }
}

export default DropDown
