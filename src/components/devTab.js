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
                <span>
                    <input id="path" type="file" />
                    <button onClick={addPoint}>add point</button>
                </span>
                <button onClick={deletePoint}>delete point</button>
                <button onClick={addBox}>{`${
                    addingBox ? 'cancel' : 'add box'
                }`}</button>
                <AddDiv show={addingBox}>
                    <p>Width</p>
                    <input
                        id="boxWidth"
                        type="number"
                        onChange={() => {
                            createBox('x')
                        }}
                    />
                    <p>Height</p>
                    <input
                        id="boxHeight"
                        type="number"
                        onChange={() => {
                            createBox('y')
                        }}
                    />
                    <p>Depth</p>
                    <input
                        id="boxDepth"
                        type="number"
                        onChange={() => {
                            createBox('z')
                        }}
                    />
                    <p>left</p>
                    <input
                        id="left"
                        type="file"
                        onChange={() => {
                            createBox('left')
                        }}
                    />
                    <p>right</p>
                    <input
                        id="right"
                        type="file"
                        onChange={() => {
                            createBox('right')
                        }}
                    />
                    <p>top</p>
                    <input
                        id="top"
                        type="file"
                        onChange={() => {
                            createBox('top')
                        }}
                    />
                    <p>bottom</p>
                    <input
                        id="bottom"
                        type="file"
                        onChange={() => {
                            createBox('bottom')
                        }}
                    />
                    <p>front</p>
                    <input
                        id="front"
                        type="file"
                        onChange={() => {
                            createBox('front')
                        }}
                    />
                    <p>back</p>
                    <input
                        id="back"
                        type="file"
                        onChange={() => {
                            createBox('back')
                        }}
                    />
                    <p>name</p>
                    <input
                        id="boxName"
                        type="text"
                        autoComplete="off"
                        onChange={() => {
                            createBox('name')
                        }}
                    />
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
