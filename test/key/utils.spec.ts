import { expect } from 'chai';
import {
    binaryStringToArray,
    concatArrays,
    decodeBase64,
    encodeBase64,
    isExpiredKey,
    isRevokedKey,
    reformatKey,
    generateKey
} from '../../lib';
import {
    genPrivateEphemeralKey,
    genPublicEphemeralKey,
    stripArmor,
    keyCheck
} from '../../lib/pmcrypto';
import { openpgp } from '../../lib/openpgp';

describe('key utils', () => {
    it('it can correctly encode base 64', async () => {
        expect(encodeBase64('foo')).to.equal('Zm9v');
    });

    it('it can correctly decode base 64', async () => {
        expect(decodeBase64('Zm9v')).to.equal('foo');
    });

    it('it can correctly concat arrays', async () => {
        expect(concatArrays([new Uint8Array(1), new Uint8Array(1)])).to.deep.equal(new Uint8Array(2));
    });

    it('it can correctly dearmor a message', async () => {
        const x = await stripArmor(`
-----BEGIN PGP MESSAGE-----
Version: GnuPG v2.0.19 (GNU/Linux)

jA0ECQMCpo7I8WqsebTJ0koBmm6/oqdHXJU9aPe+Po+nk/k4/PZrLmlXwz2lhqBg
GAlY9rxVStLBrg0Hn+5gkhyHI9B85rM1BEYXQ8pP5CSFuTwbJ3O2s67dzQ==
=VZ0/
-----END PGP MESSAGE-----`);
        expect(x).to.deep.equal(
            new Uint8Array([
                140, 13, 4, 9, 3, 2, 166, 142, 200, 241, 106, 172, 121, 180, 201,
                210, 74, 1, 154, 110, 191, 162, 167, 71, 92, 149, 61, 104, 247,
                190, 62, 143, 167, 147, 249, 56, 252, 246, 107, 46, 105, 87, 195,
                61, 165, 134, 160, 96, 24, 9, 88, 246, 188, 85, 74, 210, 193, 174,
                13, 7, 159, 238, 96, 146, 28, 135, 35, 208, 124, 230, 179, 53, 4,
                70, 23, 67, 202, 79, 228, 36, 133, 185, 60, 27, 39, 115, 182, 179,
                174, 221, 205
            ])
        );
    });

    it('it can correctly perform an ECDHE roundtrip', async () => {
        const Q = binaryStringToArray(decodeBase64('QPOClKt3wRFh6I0D7ItvuRqQ9eIfJZfOcBK3qJ/J++oj'));
        const d = binaryStringToArray(decodeBase64('TG4WP1jLiWurBSTrpTCeYrdpJUqFTVFg1PzD2/m26Jg='));
        const Fingerprint = binaryStringToArray(decodeBase64('sbd0e0yF9dSX8+xH9VYDqGVK0Wk='));
        const Curve = 'curve25519';

        const { V, Z } = await genPublicEphemeralKey({ Curve, Q, Fingerprint });
        const Zver = await genPrivateEphemeralKey({ Curve, V, d, Fingerprint });

        expect(Zver).to.deep.equal(Z);
    });

    // Test issue https://github.com/ProtonMail/pmcrypto/issues/92
    it('it can check userId against a given email', () => {
        const info = {
            version: 4,
            userIds: ['jb'],
            algorithmName: 'ecdsa',
            encrypt: {},
            revocationSignatures: [],
            sign: {},
            user: {
                hash: [openpgp.enums.hash.sha256],
                symmetric: [openpgp.enums.symmetric.aes256],
                userId: 'Jacky Black <jackyblack@foo.com>'
            }
        };

        expect(info).to.deep.equal(keyCheck(info, 'jackyblack@foo.com'));

        expect(
            () => keyCheck(info, 'jack.black@foo.com')
        ).to.throw(/UserID does not contain correct email address/);
    });

    it('it reformats a key using the key creation time', async () => {
        const date = new Date(0);
        const { key } = await openpgp.generateKey({
            userIds: [{ name: 'name', email: 'email@it.com' }],
            date
        });

        const { key: reformattedKey } = await reformatKey({
            privateKey: key,
            passphrase: '123',
            userIds: [{ name: 'reformatted', email: 'reformatteed@it.com' }]
        });
        const primaryUser = await reformattedKey.getPrimaryUser();
        expect(primaryUser.user.userId.userid).to.equal('reformatted <reformatteed@it.com>');
        // @ts-ignore missing `created` field declaration in signature packet
        expect((await reformattedKey.getPrimaryUser()).selfCertification.created).to.deep.equal(date);
    });

    it('it can correctly detect an expired key', async () => {
        const now = new Date();
        // key expires in one second
        const { key: expiringKey } = await openpgp.generateKey({
            userIds: [{ name: 'name', email: 'email@it.com' }],
            date: now,
            keyExpirationTime: 1
        });
        expect(await isExpiredKey(expiringKey, now)).to.be.false;
        expect(await isExpiredKey(expiringKey, new Date(+now + 1000))).to.be.true;
        expect(await isExpiredKey(expiringKey, new Date(+now - 1000))).to.be.true;

        const { key } = await openpgp.generateKey({ userIds: [{ name: 'name', email: 'email@test.com' }], date: now });
        expect(await isExpiredKey(key)).to.be.false;
        expect(await isExpiredKey(key, new Date(+now - 1000))).to.be.true;
    });

    it('it can correctly detect a revoked key', async () => {
        const past = new Date(0);
        const now = new Date();

        const { key, revocationCertificate } = await openpgp.generateKey({
            userIds: [{ name: 'name', email: 'email@it.com' }],
            date: past
        });
        const { publicKey: revokedKey } = await openpgp.revokeKey({
            // @ts-ignore wrong revokeKey input declaration
            key,
            revocationCertificate
        });
        expect(await isRevokedKey(revokedKey, past)).to.be.true;
        expect(await isRevokedKey(revokedKey, now)).to.be.true;
        expect(await isRevokedKey(key, now)).to.be.false;
    });
});