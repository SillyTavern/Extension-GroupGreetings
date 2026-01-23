import { useState } from 'react';
import { ACTIVATION_MODE } from '../constants';

function EditPopup({ onListChange, initialList, name, onModeChange, initialMode }) {
    const [list, setList] = useState(initialList || []);
    const [mode, setMode] = useState(initialMode || ACTIVATION_MODE.RANDOM);

    const updateList = (newList) => {
        setList(newList);
        onListChange(newList);
    };

    const handleAdd = () => {
        updateList([...list, '']);
    };

    const handleDelete = (index) => {
        updateList(list.filter((_, i) => i !== index));
    };

    const handleTextChange = (event, index) => {
        const newList = [...list];
        newList[index] = event.target.value;
        updateList(newList);
    };

    const handleMoveUp = (index) => {
        if (index <= 0) return;
        const newList = [...list];
        [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
        updateList(newList);
    };

    const handleMoveDown = (index) => {
        if (index >= list.length - 1) return;
        const newList = [...list];
        [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
        updateList(newList);
    };

    const handleModeChange = (newMode) => {
        setMode(newMode);
        onModeChange(newMode);
    };

    return (
        <div className="flex-container flexFlowColumn">
            <Header name={name} onAdd={handleAdd} />
            <hr />
            <ModeSelector mode={mode} onModeChange={handleModeChange} />
            <hr />
            <GreetingsList
                list={list}
                onDelete={handleDelete}
                onTextChange={handleTextChange}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
            />
        </div>
    );
}

function Header({ name, onAdd }) {
    return (
        <div className="flex-container justifySpaceBetween alignItemsCenter">
            <h3 className="margin0">Group greetings for <span>{name}</span></h3>
            <div className="menu_button menu_button_icon" onClick={onAdd}>
                <i className="fa-solid fa-plus"></i>
                <span>Add</span>
            </div>
        </div>
    );
}

function ModeSelector({ mode, onModeChange }) {
    return (
        <>
            <label className="checkbox_label">
                <input
                    type="radio"
                    name="mode"
                    value={ACTIVATION_MODE.RANDOM}
                    checked={mode === ACTIVATION_MODE.RANDOM}
                    onChange={() => onModeChange(ACTIVATION_MODE.RANDOM)}
                />
                <span>Random</span>
            </label>
            <label className="checkbox_label">
                <input
                    type="radio"
                    name="mode"
                    value={ACTIVATION_MODE.PICK}
                    checked={mode === ACTIVATION_MODE.PICK}
                    onChange={() => onModeChange(ACTIVATION_MODE.PICK)}
                />
                <span>Pick</span>
            </label>
            <div className="justifyLeft">
                <small>
                    {mode === ACTIVATION_MODE.RANDOM
                        ? 'When starting a group chat, one of these greetings will be chosen at random to be sent to the group.'
                        : 'When starting a group chat, you will be prompted to pick one of these greetings to be sent to the group.'}
                </small>
            </div>
        </>
    );
}

function GreetingsList({ list, onDelete, onTextChange, onMoveUp, onMoveDown }) {
    if (list.length === 0) {
        return <strong>Click <i className="fa-solid fa-plus"></i> to get started</strong>;
    }

    return list.map((text, index) => (
        <GreetingItem
            key={index}
            index={index}
            text={text}
            onDelete={onDelete}
            onTextChange={onTextChange}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            isFirst={index === 0}
            isLast={index === list.length - 1}
        />
    ));
}

function GreetingItem({ index, text, onDelete, onTextChange, onMoveUp, onMoveDown, isFirst, isLast }) {
    const textareaId = `group_greeting_${index}`;

    return (
        <div>
            <div className="flex-container justifySpaceBetween">
                <div className="flex-container alignItemsCenter">
                    <h4>Greeting #{index + 1}</h4>
                    <i
                        className="editor_maximize fa-solid fa-maximize right_menu_button"
                        title="Expand the editor"
                        data-i18n="[title]Expand the editor"
                        data-for={textareaId}
                    ></i>
                </div>
                <div className="flex-container">
                    <div className="menu_button menu_button_icon" onClick={() => onMoveUp(index)} disabled={isFirst}>
                        <i className="fa-solid fa-chevron-up"></i>
                    </div>
                    <div className="menu_button menu_button_icon" onClick={() => onMoveDown(index)} disabled={isLast}>
                        <i className="fa-solid fa-chevron-down"></i>
                    </div>
                    <div className="menu_button menu_button_icon" onClick={() => onDelete(index)}>
                        <i className="fa-solid fa-trash-alt"></i>
                        <span>Delete</span>
                    </div>
                </div>
            </div>
            <textarea
                id={textareaId}
                value={text}
                onChange={(event) => onTextChange(event, index)}
                className="text_pole textarea_compact autoSetHeight"
                rows="14"
            />
        </div>
    );
}

export default EditPopup;
