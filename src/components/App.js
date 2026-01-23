/* global SillyTavern */
import ReactDOM from 'react-dom';
import _ from 'lodash';
import EditPopup from './EditPopup';
import {
    getInitialList,
    getInitialMode,
    getName,
    saveGreetingsList,
    saveActivationMode,
} from '../utils/ContextUtil';

function App() {
    function handleClick() {
        const context = SillyTavern.getContext();
        const element = document.createElement('div');

        const debouncedListChangeHandler = _.debounce(saveGreetingsList, 500);
        const debouncedModeChangeHandler = _.debounce(saveActivationMode, 500);

        ReactDOM.render(
            <EditPopup
                onListChange={debouncedListChangeHandler}
                onModeChange={debouncedModeChangeHandler}
                initialList={getInitialList()}
                initialMode={getInitialMode()}
                name={getName()}
            />,
            element
        );

        context.callPopup(element, 'text', '', { wide: true, large: true });
    }

    return (
        <div onClick={handleClick} className="menu_button flexGap5" title="Open group greetings menu">
            <i className="fa-solid fa-user-group"></i>
            <i className="fa-solid fa-plus"></i>
            <i className="fa-solid fa-comments"></i>
        </div>
    );
}

export default App;
