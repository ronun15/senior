import React, { Component } from 'react'
import styled from 'styled-components'

const OuterDiv = styled.div`
    display: flex;
    flex-direction: column;
`
const AddDiv = styled.div`
    visibility: ${props => (props.show ? 'visible' : 'hidden')};
    opacity: ${props => (props.show ? '1' : '0')};
    height: ${props => (props.show ? '50%' : '0')};
    overflow-y: scroll;
`

const MoveDiv = styled.div`
    visibility: ${props => (props.show ? 'visible' : 'hidden')};
    opacity: ${props => (props.show ? '1' : '0')};
    height: ${props => (props.show ? 'auto' : '0')};
`

class DevTab extends Component {
    render() {
        const { addingBox, moving } = this.props.controls
        const {
            addPoint,
            deletePoint,
            createBox,
            addBox,
            moveBox,
            saveState
        } = this.props
        return (
            <OuterDiv>
                <p>Layers</p>
                <ul id="layers" />
                <input id="path" type="text" />{' '}
                <button onClick={null}>add Layers</button>
                <button onClick={addPoint}>add point</button>
                <button onClick={deletePoint}>delete point</button>
                <button onClick={addBox}>{`${
                    addingBox ? 'cancel' : 'add box'
                }`}</button>
                <AddDiv show={addingBox}>
                    <p>Width</p>
                    <input id="boxWidth" type="number" onChange={createBox} />
                    <p>Height</p>
                    <input id="boxHeight" type="number" onChange={createBox} />
                    <p>Depth</p>
                    <input id="boxDepth" type="number" onChange={createBox} />
                    <p>left</p>
                    <input id="left" type="text" onChange={createBox} />
                    <p>right</p>
                    <input id="right" type="text" onChange={createBox} />
                    <p>top</p>
                    <input id="top" type="text" onChange={createBox} />
                    <p>bottom</p>
                    <input id="bottom" type="text" onChange={createBox} />
                    <p>front</p>
                    <input id="front" type="text" onChange={createBox} />
                    <p>back</p>
                    <input id="back" type="text" onChange={createBox} />
                    <p>name</p>
                    <input id="boxName" type="text" onChange={createBox} />
                </AddDiv>
                <MoveDiv show={addingBox || moving}>
                    <button onClick={moveBox}>finish</button>
                </MoveDiv>
                <button onClick={saveState}>save state</button>
            </OuterDiv>
        )
    }
}

export default DevTab
