/* global SillyTavern */
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { ACTIVATION_MODE } from '../constants';
import { getListFromCharacterData, getModeFromCharacterData } from '../utils/ContextUtil';
import PickPopup from '../components/PickPopup';

/**
 * Handle the character first message selected event.
 * Replaces the greeting with a group-specific one if available.
 * @param {object} args - Event arguments containing character data and output
 */
export async function handleFirstMessageSelected(args) {
    const context = SillyTavern.getContext();
    const greetings = getListFromCharacterData(args.character?.data);
    const mode = getModeFromCharacterData(args.character?.data);

    if (!Array.isArray(greetings) || greetings.length === 0) {
        return;
    }

    if (mode === ACTIVATION_MODE.RANDOM) {
        args.output = _.sample(greetings);
        return;
    }

    if (mode === ACTIVATION_MODE.PICK) {
        const element = document.createElement('div');
        const setOutput = (output) => {
            args.output = output;
            const closeButton = document.getElementById('dialogue_popup_ok');
            if (closeButton instanceof HTMLElement) {
                closeButton.click();
            }
        };

        ReactDOM.render(
            <PickPopup
                onPick={setOutput}
                list={greetings}
                name={args.character.data.name}
            />,
            element
        );

        await context.callPopup(element, 'text', '', {
            wide: true,
            large: true,
            okButton: 'Random',
        });

        // If no greeting was picked, select a random one
        if (!args.output) {
            args.output = _.sample(greetings);
        }
    }
}
