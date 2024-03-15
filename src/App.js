/* global SillyTavern */
import ReactDOM from 'react-dom';
import { useState } from 'react';
import _ from 'lodash';

const {
    eventSource,
    eventTypes,
} = SillyTavern.getContext();

const ACTIVATION_MODE = {
    RANDOM: 0,
    PICK: 1,
};

class ContextUtil {
    static getCharacterId() {
        const context = SillyTavern.getContext();
        let characterId = context.characterId;
        // When peeking a group chat member, find a proper characterId
        if (context.groupId) {
            const avatarUrlInput = document.getElementById('avatar_url_pole');
            if (avatarUrlInput instanceof HTMLInputElement) {
                const avatarUrl = avatarUrlInput.value;
                characterId = context.characters.findIndex(c => c.avatar === avatarUrl);
            }
        }
        return characterId;
    }

    static getName() {
        const context = SillyTavern.getContext();
        if (context.menuType === 'create') {
            return context.createCharacterData.name || 'Unknown';
        } else {
            const characterId = ContextUtil.getCharacterId();
            return context.characters[characterId]?.data?.name || 'Unknown';
        }
    }

    static getInitialList() {
        const context = SillyTavern.getContext();
        if (context.menuType === 'create') {
            return _.get(context, 'createCharacterData.extensions.group_greetings', []);
        } else {
            const characterId = ContextUtil.getCharacterId();
            return context.characters[characterId]?.data?.extensions?.group_greetings || [];
        }
    }

    static getInitialMode() {
        const context = SillyTavern.getContext();
        if (context.menuType === 'create') {
            return _.get(context, 'createCharacterData.extensions.group_greetings_mode', ACTIVATION_MODE.RANDOM);
        } else {
            const characterId = ContextUtil.getCharacterId();
            return context.characters[characterId]?.data?.extensions?.group_greetings_mode || ACTIVATION_MODE.RANDOM;
        }
    }
}

eventSource.on(eventTypes.CHARACTER_FIRST_MESSAGE_SELECTED, handleAppEvent);

async function handleAppEvent(args) {
    const context = SillyTavern.getContext();
    const greetings = args.character?.data?.extensions?.group_greetings;
    const mode = args.character?.data?.extensions?.group_greetings_mode || ACTIVATION_MODE.RANDOM;
    if (Array.isArray(greetings) && greetings.length > 0) {
        // Select one random greeting
        if (mode === ACTIVATION_MODE.RANDOM) {
            args.output = _.sample(greetings);
        }
        // Prompt to pick a greeting
        if (mode === ACTIVATION_MODE.PICK) {
            const element = document.createElement('div');
            const setOutput = (output) => {
                args.output = output;
                const closeButton = document.getElementById('dialogue_popup_ok');
                if (closeButton instanceof HTMLElement) {
                    closeButton.click();
                }
            };
            ReactDOM.render(<PickPopup onPick={setOutput} list={greetings} name={args.character.data.name} />, element);
            await context.callPopup(element, 'text', '', { wide: true, large: true, okButton: 'Random' });
            // If no greeting was picked, select a random one
            if (!args.output) {
                args.output = _.sample(greetings);
            }
        }
    }
}

function App() {
    function handleClick() {
        const context = SillyTavern.getContext();
        const element = document.createElement('div');
        const debouncedListChangeHandler = _.debounce(handleListChange, 500);
        const debouncedModeChangeHandler = _.debounce(handleModeChange, 500);
        ReactDOM.render(<EditPopup onListChange={debouncedListChangeHandler} onModeChange={debouncedModeChangeHandler} initialList={ContextUtil.getInitialList()} initialMode={ContextUtil.getInitialMode()} name={ContextUtil.getName()} />, element);
        context.callPopup(element, 'text', '', { wide: true, large: true });
    }

    function handleListChange(list) {
        const context = SillyTavern.getContext();
        if (context.menuType === 'create') {
            _.set(context, 'createCharacterData.extensions.group_greetings', list);
        } else {
            const characterId = ContextUtil.getCharacterId();
            context.writeExtensionField(characterId, 'group_greetings', list);
        }
    }

    function handleModeChange(mode) {
        const context = SillyTavern.getContext();
        if (context.menuType === 'create') {
            _.set(context, 'createCharacterData.extensions.group_greetings_mode', mode);
        } else {
            const characterId = ContextUtil.getCharacterId();
            context.writeExtensionField(characterId, 'group_greetings_mode', mode);
        }
    }

    return (
        <div onClick={handleClick} className="menu_button flexGap5" title="Open group greetings menu">
            <i class="fa-solid fa-user-group"></i>
            <i class="fa-solid fa-plus"></i>
            <i class="fa-solid fa-comments"></i>
        </div>
    );
}

function EditPopup({ onListChange, initialList, name, onModeChange, initialMode }) {
    const [list, setList] = useState(initialList || []);
    const [mode, setMode] = useState(initialMode || ACTIVATION_MODE.RANDOM);

    const handleAdd = () => {
        const newList = [...list, ''];
        setList(newList);
        onListChange(newList);
    };

    const handleDelete = (index) => {
        const newList = list.filter((_, i) => i !== index);
        setList(newList);
        onListChange(newList);
    };

    const handleTextChange = (event, index) => {
        const newList = [...list];
        newList[index] = event.target.value;
        setList(newList);
        onListChange(newList);
    };

    const handleModeChange = (mode) => {
        const newMode = mode;
        setMode(newMode);
        onModeChange(newMode);
    };

    return (
        <div className="flex-container flexFlowColumn">
            <div className="flex-container justifySpaceBetween alignItemsCenter">
                <h3 className="margin0">Group greetings for <span>{name}</span></h3>
                <div className="menu_button menu_button_icon" onClick={handleAdd}>
                    <i className="fa-solid fa-plus"></i>
                    <span>Add</span>
                </div>
            </div>
            <hr />
            <label className="checkbox_label">
                <input type="radio" name="mode" value={ACTIVATION_MODE.RANDOM} checked={mode === ACTIVATION_MODE.RANDOM} onChange={() => handleModeChange(ACTIVATION_MODE.RANDOM)} />
                <span>Random</span>
            </label>
            <label className="checkbox_label">
                <input type="radio" name="mode" value={ACTIVATION_MODE.PICK} checked={mode === ACTIVATION_MODE.PICK} onChange={() => handleModeChange(ACTIVATION_MODE.PICK)} />
                <span>Pick</span>
            </label>
            {
                mode === ACTIVATION_MODE.RANDOM &&
                <div className="justifyLeft">
                    <small>
                        When starting a group chat, one of these greetings will be chosen at random to be sent to the group.
                    </small>
                </div>
            }
            {
                mode === ACTIVATION_MODE.PICK &&
                <div className="justifyLeft">
                    <small>
                        When starting a group chat, you will be prompted to pick one of these greetings to be sent to the group.
                    </small>
                </div>
            }
            <hr />
            {list.length === 0 && <strong>Click <i className="fa-solid fa-plus"></i> to get started</strong>}
            {list.map((text, index) => (
                <div key={index}>
                    <div className="flex-container justifySpaceBetween">
                        <h4>Greeting #{index + 1}</h4>
                        <div className="menu_button menu_button_icon" onClick={() => handleDelete(index)}>
                            <i className="fa-solid fa-trash"></i>
                            <span>Delete</span>
                        </div>
                    </div>
                    <textarea value={text} onChange={(event) => handleTextChange(event, index)} className="text_pole textarea_compact" rows="14" />
                </div>
            ))}
        </div>
    );
}

function PickPopup({ onPick, list, name }) {
    const handlePick = (text) => {
        onPick(text);
    };

    return (
        <div className="flex-container flexFlowColumn">
            <h3>Pick a greeting for <span>{name}</span></h3>
            <hr />
            {list.map((text, index) => (
                <div key={index} className="flex-container alignItemsCenter">
                    <textarea rows="6" onClick={() => handlePick(text)} readOnly className="right_menu_button justifyLeft textarea_compact">
                        {text}
                    </textarea>
                </div>
            ))}
        </div>
    );
}

export default App;
