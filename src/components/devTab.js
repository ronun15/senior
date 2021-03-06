import React, { Component } from 'react'
import styled from 'styled-components'

const OuterDiv = styled.div`
    height: calc(100vh - 4em);
    width: 20%;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    padding: 2em 0.5em;
    color: white;
    background-color: #212121;
`
const Div = styled.div`
    visibility: ${props => (props.show ? 'visible' : 'hidden')};
    opacity: ${props => (props.show ? '1' : '0')};
    height: ${props => (props.show ? 'auto' : '0')};
    display: flex;
    flex-direction: column;
    overflow-y: ${props => (props.show ? '' : 'hidden')};
`

const Button = styled.button`
    margin: 0 1rem;
`
const ScrollDiv = styled.div`
    visibility: ${props => (props.show ? 'visible' : 'hidden')};
    opacity: ${props => (props.show ? '1' : '0')};
    height: ${props => (props.show ? 'auto' : '0')};
    display: flex;
    flex-direction: column;
    overflow-y: ${props => (props.show ? '' : 'hidden')};
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
            deleteSticker,
            addLayer,
            deleteLayer,
            changeState
        } = this.props
        return (
            <OuterDiv>
                <Div show={!addingBox && !moving && !boxFirstPoint}>
                    <h3>Link to website</h3>
                    <span>
                        <input id="url" type="type" />
                        <Button
                            onClick={() => {
                                changeState('url')
                            }}>
                            change URL
                        </Button>
                    </span>
                    <h3>Latitude</h3>
                    <span>
                        <input id="latitude" type="number" />
                        <Button
                            onClick={() => {
                                changeState('lat')
                            }}>
                            change
                        </Button>
                    </span>
                    <h3>Longtitude</h3>
                    <span>
                        <input id="longtitude" type="number" />
                        <Button
                            onClick={() => {
                                changeState('long')
                            }}>
                            change
                        </Button>
                    </span>
                </Div>
                <Div show={!addingBox && !moving}>
                    <h3>Add new 360 picture to box</h3>
                    <span>
                        <input id="path" type="file" />
                        <Button onClick={addPoint}>add point</Button>
                    </span>
                </Div>
                <Div show={!addingBox && !moving && !boxFirstPoint}>
                    <h3>Delete existing 360 picture from box</h3>
                    <Button onClick={deletePoint}>delete point</Button>
                    <h3>Add new sticker to sticker list</h3>
                    <span>
                        <input id="stickerPath" type="file" />
                        <Button onClick={addSticker}>add sticker</Button>
                    </span>
                    <h3>Delete current sticker from list</h3>
                    <Button onClick={deleteSticker}>delete sticker</Button>
                    <h3>Add new layer to this scene</h3>
                    <input id="layerPath" type="file" />
                    <p> chromakey color</p>
                    <Div show={!addingBox && !moving && !boxFirstPoint}>
                        r
                        <input id="red" type="number" max="255" min="0" />
                    </Div>
                    <Div show={!addingBox && !moving && !boxFirstPoint}>
                        g
                        <input id="green" type="number" max="255" min="0" />
                    </Div>
                    <Div show={!addingBox && !moving && !boxFirstPoint}>
                        b
                        <input id="blue" type="number" max="255" min="0" />
                    </Div>
                    <Div show={!addingBox && !moving && !boxFirstPoint}>
                        alpha
                        <input id="alpha" type="number" max="1" min="0" step='0.1' />
                    </Div>

                    <span>
                        <Button
                            onClick={() => {
                                addLayer('front')
                            }}>
                            add layer front
                        </Button>
                        <Button
                            onClick={() => {
                                addLayer('back')
                            }}>
                            add layer back
                        </Button>
                    </span>
                    <h3>Delete current layer from scene</h3>
                    <Button onClick={deleteLayer}>delete layer</Button>
                    <h3>Create a new box</h3>
                </Div>
                <Div show={!moving && !boxFirstPoint}>
                    <Button onClick={addBox}>{`${
                        addingBox ? 'cancel' : 'add box'
                    }`}</Button>
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
                            <Button
                                onClick={() => {
                                    createBox('directory')
                                }}>
                                create
                            </Button>
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
                    <h3>finish</h3>
                    <Button onClick={moveBox}>finish</Button>
                </Div>
                <Div show={moving}>
                    <h3>rotate</h3>
                    <span>
                        rotate
                        <input
                            id="rotate"
                            type="number"
                            onChange={() => {
                                createBox('rotate')
                            }}
                        />
                        degrees
                    </span>
                </Div>
                <Div show={!addingBox && !moving && !boxFirstPoint}>
                    <h3>Save current state as json</h3>
                    <Button onClick={saveState}>save state</Button>
                </Div>
            </OuterDiv>
        )
    }
}

export default DevTab
