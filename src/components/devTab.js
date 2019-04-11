import React, { Component } from 'react'
import styled from 'styled-components'

const OuterDiv = styled.div`
    display: flex;
    flex-direction: column;
`
const AddDiv = styled.div`
    visibility: ${props => (props.addingBox ? 'visible' : 'hidden')};
    opacity: ${props => (props.addingBox ? '1' : '0')};
    height: ${props => (props.addingBox ? '50%' : '0')};
    overflow-y: scroll;
`

const MoveDiv = styled.div`
    visibility: ${props => (props.addingBox ? 'visible' : 'hidden')};
    opacity: ${props => (props.addingBox ? '1' : '0')};
    height: ${props => (props.addingBox ? 'auto' : '0')};
`

class DevTab extends Component {
    render() {
        const { addingBox } = this.props.controls
        const addBox = this.props.addBox
        return (
            <OuterDiv>
                <p>Layers</p>
                <ul id="layers" />
                <input id="path" type="text" />{' '}
                <button onClick="">add Layers</button>
                <button onClick="">add point</button>
                <button onClick="">delete point</button>
                <button onClick={addBox}>{`${
                    addingBox ? 'cancel' : 'add box'
                }`}</button>
                <AddDiv addingBox={addingBox}>
                    <p>Width</p>
                    <input id="boxWidth" type="number" />
                    <p>Height</p>
                    <input id="boxHeight" type="number" />
                    <p>Depth</p>
                    <input id="boxDepth" type="number" />
                    <p>left</p>
                    <input id="left" type="text" />
                    <p>right</p>
                    <input id="right" type="text" />
                    <p>top</p>
                    <input id="top" type="text" />
                    <p>bottom</p>
                    <input id="bottom" type="text" />
                    <p>front</p>
                    <input id="front" type="text" />
                    <p>back</p>
                    <input id="back" type="text" />
                    <p>name</p>
                    <input id="boxName" type="text" />
                </AddDiv>
                <MoveDiv addingBox={addingBox}>
                    <button onClick="">finish</button>
                </MoveDiv>
            </OuterDiv>
        )
    }
}

export default DevTab
