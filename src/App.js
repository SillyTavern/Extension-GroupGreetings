/* global SillyTavern */
import ReactDOM from 'react-dom';
import { useState } from 'react';
import _ from 'lodash';

const {
    eventSource,
    eventTypes,
} = SillyTavern.getContext();

eventSource.on(eventTypes.CHARACTER_FIRST_MESSAGE_SELECTED, handleAppEvent);

function handleAppEvent(args) {
    const greetings = args.character?.data?.extensions?.group_greetings;
    if (Array.isArray(greetings)) {
        // Select one random greeting
        args.output = _.sample(greetings);
    }
}

function App() {
    function handleClick() {
        const element = document.createElement('div');
        const debouncedChangeHandler = _.debounce(handleListChange, 1000);
        ReactDOM.render(<Popup onListChange={debouncedChangeHandler} initialList={getInitialList()} name={getName()} />, element);
        SillyTavern.getContext().callPopup(element, 'text', '', { wide: true, large: true });
    }

    function handleListChange(list) {
        const context = SillyTavern.getContext();
        if (context.menuType === 'create') {
            _.set(context, 'createCharacterData.extensions.group_greetings', list);
        } else {
            context.writeExtensionField(context.characterId, 'group_greetings', list);
        }
    }

    function getName() {
        const context = SillyTavern.getContext();
        if (context.menuType === 'create') {
            return context.createCharacterData.name || 'Unknown';
        } else {
            return context.characters[context.characterId]?.data?.name || 'Unknown';
        }
    }

    function getInitialList() {
        const context = SillyTavern.getContext();
        if (context.menuType === 'create') {
            return _.get(context, 'createCharacterData.extensions.group_greetings', []);
        } else {
            return context.characters[context.characterId]?.data?.extensions?.group_greetings || [];
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

function Popup({ onListChange, initialList, name }) {
    const [list, setList] = useState(initialList || []);

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

    return (
        <div className="flex-container flexFlowColumn">
            <div className="flex-container justifySpaceBetween alignItemsCenter">
                <h3 className="margin0">Group greetings for <span>{name}</span></h3>
                <div className="menu_button menu_button_icon" onClick={handleAdd}>
                    <i className="fa-solid fa-plus"></i>
                    <span>Add</span>
                </div>
            </div>
            <div className="justifyLeft">
                <small>
                    When starting a group chat, one of these greetings will be chosen at random to be sent to the group.
                </small>
            </div>
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

export default App;
