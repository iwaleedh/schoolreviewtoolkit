import { query } from "./_generated/server";

export default query(async () => {
    const encoder = new TextEncoder();
    const password = "testpassword";
    const salt = crypto.getRandomValues(new Uint8Array(16));

    try {
        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            encoder.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveBits", "deriveKey"]
        );

        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                salt: salt as any,
                iterations: 100000, // production value
                hash: "SHA-256"
            },
            keyMaterial,
            256
        );

        return { success: true, derivedHex: Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('') };
    } catch (err: any) {
        return { success: false, error: err.message, stack: err.stack };
    }
});
