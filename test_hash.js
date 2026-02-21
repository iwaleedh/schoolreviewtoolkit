// Simple script to test hash function
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    const mixed = hash.toString(16) + password.length.toString(16);
    return mixed;
}

console.log('password321:', hashPassword('password321'));
console.log('Admin@123:', hashPassword('Admin@123'));
