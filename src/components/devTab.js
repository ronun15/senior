import React, { Component } from 'react'
import styled from 'styled-components'

const OuterDiv = styled.div`
    height: calc(100vh - 60px);
    width: 20%;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    padding-top: 30px;
    padding-bottom: 30px;
`
const Div = styled.div`
    visibility: ${props => (props.show ? 'visible' : 'hidden')};
    opacity: ${props => (props.show ? '1' : '0')};
    height: ${props => (props.show ? 'auto' : '0')};
    display: flex;
    flex-direction: column;
    overflow-y: hidden;
`
const ScrollDiv = styled.div`
    visibility: ${props => (props.show ? 'visible' : 'hidden')};
    opacity: ${props => (props.show ? '1' : '0')};
    height: ${props => (props.show ? 'auto' : '0')};
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
`

class DevTab extends Component {
    render() {
        const { addingBox, moving, boxFirstPoint } = this.props.controls
        const {
            addPoint,
            addSticker,
            deletePoint,
            createBox,
            addBox,
            moveBox,
            saveState,
            deleteSticker
        } = this.props
        return (
            <OuterDiv>
                <Div show={!addingBox && !moving}>
                    <h3>Add new 360 picture to box</h3>
                    <span>
                        <input id="path" type="file" />
                        <button onClick={addPoint}>add point</button>
                    </span>
                </Div>
                <Div show={!addingBox && !moving && !boxFirstPoint}>
                    <h3>Delete existing 360 picture from box</h3>
                    <button onClick={deletePoint}>delete point</button>
                    <h3>Add new sticker to sticker list</h3>
                    <span>
                        <input id="stickerPath" type="file" />
                        <button onClick={addSticker}>add sticker</button>
                    </span>
                    <h3>Delete current sticker from list</h3>
                    <button onClick={deleteSticker}>delete sticker</button>
                    <h3>Create a new box</h3>
                </Div>
                <Div show={!moving && !boxFirstPoint}>
                    <button onClick={addBox}>{`${
                        addingBox ? 'cancel' : 'add box'
                    }`}</button>
                </Div>
                <ScrollDiv show={addingBox}>
                    <h3>New box parameters</h3>
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
                    <div>
                        <h3>Create Box from existing directory</h3>
                        <span>
                            /asset/360/
                            <input id="boxFromDirectory" type="text" />
                            <button
                                onClick={() => {
                                    createBox('directory')
                                }}>
                                create
                            </button>
                        </span>
                    </div>
                    <h3>Modify each face</h3>
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
                </ScrollDiv>
                <Div show={addingBox || moving}>
                    <button onClick={moveBox}>finish</button>
                </Div>
                <Div show={moving}>
                    <p>rotate</p>
                    <span>
                        <input
                            id="rotate"
                            type="number"
                            onChange={() => {
                                createBox('rotate')
                            }}
                        />
                        angle
                    </span>
                </Div>
                <Div show={!addingBox && !moving && !boxFirstPoint}>
                    <h3>Save current state as json</h3>
                    <button onClick={saveState}>save state</button>
                </Div>
            </OuterDiv>
        )
    }
}

export default DevTab
