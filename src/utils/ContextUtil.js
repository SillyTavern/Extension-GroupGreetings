/* global SillyTavern */
/* global $ */
import { ACTIVATION_MODE } from '../constants';
import _ from 'lodash';

/**
 * Clean up an array by filtering out non-string and empty values.
 * @param {string[]} arr
 * @returns {string[]}
 */
function cleanUpArray(arr) {
    return arr.filter(item => typeof item === 'string' && item.trim().length > 0);
}

/**
 * Get the character ID, handling group chat peeking.
 * @returns {number}
 */
export function getCharacterId() {
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

/**
 * Get the current character object.
 * @returns {object|undefined}
 */
export function getCharacter() {
    const context = SillyTavern.getContext();
    const characterId = getCharacterId();
    return context.characters[characterId];
}

/**
 * Get the current character's data object.
 * @returns {object|undefined}
 */
export function getCharacterData() {
    return getCharacter()?.data;
}

/**
 * Get the current character's name.
 * @returns {string}
 */
export function getName() {
    const context = SillyTavern.getContext();
    if (context.menuType === 'create') {
        return context.createCharacterData.name || 'Unknown';
    }
    return getCharacterData()?.name || 'Unknown';
}

/**
 * Get the list of group greetings from character data.
 * @param {object} characterData Character data object
 * @returns {string[]} List of greetings
 */
export function getListFromCharacterData(characterData) {
    const specV3Greetings = characterData?.group_only_greetings;
    const extensionGreetings = characterData?.extensions?.group_greetings;
    // Special legacy data handling: if both exist and extension is non-empty while specV3 is empty, use extension
    if (Array.isArray(specV3Greetings) && Array.isArray(extensionGreetings)) {
        if (extensionGreetings.length > 0 && specV3Greetings.length === 0) {
            return cleanUpArray(extensionGreetings);
        }
    }
    if (Array.isArray(specV3Greetings)) {
        return cleanUpArray(specV3Greetings);
    }
    if (Array.isArray(extensionGreetings)) {
        return cleanUpArray(extensionGreetings);
    }
    return [];
}

/**
 * Get the initial list of greetings for the current context.
 * @returns {string[]} List of greetings
 */
export function getInitialList() {
    const context = SillyTavern.getContext();
    if (context.menuType === 'create') {
        return _.get(context, 'createCharacterData.extensions.group_greetings', []);
    }
    return getListFromCharacterData(getCharacterData());
}

/**
 * Get the initial activation mode for the current context.
 * @returns {number} Activation mode
 */
export function getInitialMode() {
    const context = SillyTavern.getContext();
    if (context.menuType === 'create') {
        return _.get(context, 'createCharacterData.extensions.group_greetings_mode', ACTIVATION_MODE.RANDOM);
    }
    return getModeFromCharacterData(getCharacterData());
}

/**
 * Get the activation mode from character data.
 * @param {object} characterData Character data object
 * @returns {number} Activation mode
 */
export function getModeFromCharacterData(characterData) {
    return characterData?.extensions?.group_greetings_mode || ACTIVATION_MODE.RANDOM;
}

/**
 * Write data fields to the character via API.
 * @param {object} mergeRequest Merge request object
 * @returns {Promise<string>} Merge response
 */
export async function writeCharacterAsync(mergeRequest) {
    const context = SillyTavern.getContext();
    const mergeResponse = await fetch('/api/characters/merge-attributes', {
        method: 'POST',
        headers: context.getRequestHeaders(),
        body: JSON.stringify(mergeRequest),
    });
    return await mergeResponse.text();
}

/**
 * Save the greetings list to the character.
 * @param {string[]} list List of greetings
 */
export async function saveGreetingsList(list) {
    const context = SillyTavern.getContext();
    if (context.menuType === 'create') {
        _.set(context, 'createCharacterData.extensions.group_greetings', list);
    } else {
        const character = getCharacter();
        if (!character) {
            return;
        }
        await writeCharacterAsync({
            avatar: character.avatar,
            data: {
                extensions: {
                    group_greetings: list,
                },
                group_only_greetings: list,
            },
        });
        // Process JSON data
        if (character.json_data) {
            const jsonData = JSON.parse(character.json_data);
            _.set(jsonData, 'group_only_greetings', list);
            _.set(jsonData, 'extensions.group_greetings', list);
            character.json_data = JSON.stringify(jsonData);

            // Make sure the data doesn't get lost when saving the current character
            $('#character_json_data').val(character.json_data);
        }
        if (typeof context.getOneCharacter === 'function') {
            await context.getOneCharacter(character.avatar);
        } else if (typeof context.unshallowCharacter === 'function') {
            console.warn('[GroupGreetings] getOneCharacter function is not available in the current context, using a hacky reload method.');
            character.shallow = true;
            await context.unshallowCharacter(getCharacterId());
        } else {
            console.error('[GroupGreetings] Neither getOneCharacter nor unshallowCharacter functions are available in the current context. Character data may be stale.');
        }
    }
}

/**
 * Save the activation mode to the character.
 * @param {number} mode Activation mode
 */
export async function saveActivationMode(mode) {
    const context = SillyTavern.getContext();
    if (context.menuType === 'create') {
        _.set(context, 'createCharacterData.extensions.group_greetings_mode', mode);
    } else {
        const characterId = getCharacterId();
        await context.writeExtensionField(characterId, 'group_greetings_mode', mode);
    }
}
