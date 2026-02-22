import { query } from "./_generated/server";

export default query(async () => {
    return {
        hasCrypto: typeof crypto !== 'undefined',
        hasSubtle: typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined',
        subtleKeys: typeof crypto !== 'undefined' && crypto.subtle ? Object.keys(crypto.subtle) : [],
        testImport: typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.importKey === 'function'
    };
});
