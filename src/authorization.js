import { readFileSync } from 'fs';
import { parse } from 'toml';
import micromatch from 'micromatch';

const fileContents = readFileSync('./access.toml', 'utf8');
const authData = parse(fileContents);

export const KeyStatus = {
    NotProvided: 'NotProvided',
    Invalid: 'Invalid',
    Valid: 'Valid'
}

export function hasAccess(key, endpoint) {
    const type = getKeyStatus(key);

    let keyData;

    if (type === KeyStatus.NotProvided) {
        keyData = authData.default;
    } else if (type === KeyStatus.Valid) {
        keyData = authData.keys[key];
    } else {
        return false;
    }

    const list = keyData['endpoints_list'];

    if (micromatch.isMatch(endpoint, list)) {
        // returns true if routes list is whitelist, otherwise returns false
        return keyData.whitelist;
    }

    // same as above, but opposite behaviour
    return !keyData.whitelist;
}

export function getKeyStatus(key) {
    if (!key) {
        return KeyStatus.NotProvided;
    }
    
    return key in authData.keys ? KeyStatus.Valid : KeyStatus.Invalid;
}