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
    const status = getKeyStatus(key);

    let keyInfo;

    switch (status) {
        case KeyStatus.NotProvided:
            keyInfo = authData.default;
            break;

        case KeyStatus.Invalid:
            return false;

        case KeyStatus.Valid:
            keyInfo = authData.keys[key];
            break;
    }

    const list = keyInfo['endpoints_list'];

    if (micromatch.isMatch(endpoint, list)) {
        // returns true if routes list is whitelist, otherwise returns false
        return keyInfo.whitelist;
    }

    // same as above, but opposite behaviour
    return !keyInfo.whitelist;
}

export function getKeyStatus(key) {
    if (!key) {
        return KeyStatus.NotProvided;
    }
    
    return key in authData.keys ? KeyStatus.Valid : KeyStatus.Invalid;
}