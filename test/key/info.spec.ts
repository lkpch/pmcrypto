import { expect } from 'chai';
import { generateKey, readPrivateKey, reformatKey } from '../../lib';
import keyInfo from '../../lib/key/info';
import { enums } from '../../lib/openpgp';

const publickey = `-----BEGIN PGP PUBLIC KEY BLOCK-----

mI0EW5kE2gEEAN3QcfWzMQCniICMlLJg3LgHtobUyQbv+PO1wPbBTdTo5XddwMVO
ef2QN+MNy4UXmRtjUoaWEvHzYQ1a8t10fUI0IyIjc2LhQDm2Wye6xXLrTxV0rWyp
HjC5027fQjaNiyuBUCU9cG78mwZVFTw0lboWryHjqZuBoF2mPHopTaaxABEBAAG0
JWV4cGlyYXRpb24gdGVzdCA8ZXhwaXJhdGlvbkB0ZXN0LmNvbT6IzgQTAQgAOBYh
BPjBOFw5rULVXFVgVMkCMBoLuY3LBQJbmQTaAhsDBQsJCAcCBhUKCQgLAgQWAgMB
Ah4BAheAAAoJEMkCMBoLuY3LwCQD/jCUZkJj8dTNmcn/3lGceL7IxGrh7oFEks9s
bwWsMhi5i6KUxCoYnmm9kp/E1mLDE9JufXzJB+bvaCyCRPjS1hksoCTdcIVOuggc
mtO5I+0ArW32mFHgLK1Dz6JrV8T4jiVkwpuD6YcTlL3O4ebGdCRyK4ICvHmSbRT5
DX9A4XbpuI0EW5kE2gEEAJmcO5EPemO/04X1XFwktOhSFUg7iwGHjNmqv15PhloP
NtjraL0K7rzYrC/cvaOBHQg8Va2MB11HkxUx50C1kBQf8K3BEhcFQwLpDjyocniu
gFqUigNlQLP+xFkaYZfhxajPGzhUe+ja6GjcthYYV0F1QtooaQEy0C0cs7e5Cfot
ABEBAAGIvAQYAQgAJgIbDBYhBPjBOFw5rULVXFVgVMkCMBoLuY3LBQJbmQhHBQkA
AVTtAAoJEMkCMBoLuY3LWr8EANCDuRF0i9SSEo+eDeqsMGPcy56J1rJz6YBrr+sE
hjz72pMy/LgTEucsc2Ag4SBO2ULxDj8A1o8M0wovqol57UgzkyzjqmsndyHgGP5+
Zbrv9MFSY3S4PFCdvQRF4svp/nZ7TFmeX2BLYZH2KIE7m4wKIWsDy30mm33A+VbI
EE1DuI0EW5kIbgEEAM38fxqrvdThdAwH9lSVR6Tb7JE4ASFY0j2EpDft1byBOiDm
sSkdZfaMal4ItHbbqsNeKxDW6DFda0VS5zeamPl2/GD8X/lzyBYrV6iqqRKu4zql
q3JSWRjkhcuJy48IwUQ0OR8cUrqK174cWylXY5mvjqJqxeI+dVxnvLC0lEdtABEB
AAGIvAQYAQgAJhYhBPjBOFw5rULVXFVgVMkCMBoLuY3LBQJbmQhuAhsMBQkJZgGA
AAoJEMkCMBoLuY3L6p8D/jwJkrNLrsBCDEv+7uIQWaXu9dn5sUY1hR2V8eIQo7yp
r7Wg1nvgd7aRzevVrtpn/fowNXaB6pfX1bUl4sRbGAKnF1avn4tPBAAZ5eh67bhO
JLdxTBJgqQoLePyHnb4LEPZItOUOMiHRBLUV8PSj/dxLEmYlmbPFOTnE62izRX4Q
=dM0r
-----END PGP PUBLIC KEY BLOCK-----`;

const creationkey = `-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: OpenPGP.js v3.0.5
Comment: https://openpgpjs.org

xsBNBFgsrPkBCAC4NTH8ew1ASUtqVRA3j+aolI5lMAmAER18fBIfwjd/IbtC
XzYbi/+arYyIMzUXU3OZUTwifxV3PBu1FCq1ZxVvZyH2ZoliP5fwx39bv3sI
Oo1ijtxUKgVXmu+o4N5y3dhAjO9UYFza5Wq8TjmNdPhHp/PEd1+qMK8W3cxm
8Ly7du9zv3nQ1B5M5/uGoo4FyQxKdh4wX6lJnAjYI0g/kfj/zfzaPyjiRurB
wuXrRYVcliUQy3OP/fera5VJOhGzb6/Kycth0dgBsMPsn8gx8VOHPiHDcXlv
vwp6drbCXujReU+hZgPda/eqhafjQDbCAfs5ZJD/B4/6SF8IMQ+Z9gjVABEB
AAHNNSJzaGFudGFyYW1AcHJvdG9ubWFpbC5jb20iIDxzaGFudGFyYW1AcHJv
dG9ubWFpbC5jb20+wsB1BBABCAApBQJcaFwkBgsJBwgDAgkQbolVqMpNxdsE
FQgKAgMWAgECGQECGwMCHgEAACzfB/9t+McxCVvVqUQblF1phnV8mKC9uPcU
5yPEu07lRoJw3D3qusK25iDVwLGNS3Mx2G2ugHx6I/ik60LPDrOXgH44k90b
LnyUIUGUFX61Rzn/Un637dw1o2+kOfQzN4SYce/rwPvF1efAnZiwSoVhy+Ks
oV0MHA8QeP4woMhL6y014tJDrqHGXIk6KTMLp+CR/5gBlHaVihVIZsTgLj01
y2J6NykjPVPy5CGFju457jaWcsxpaO308fQGUB5hhelJvKzUt9zpDL0Dyr2O
sFVnKhDts5EoVE13Yp4BrZslvXR7PZqoaMNOXr8uSIWt6khe06aPH8cSBtCu
MtsgAlmN08vxzsBNBFgsrPkBCADxmOuZvx1fMLxYr/08a/b3dZfncP1fA1PH
66mkUo9kE5Zr5UOqqbbFaCQbuc54nE4pvAJgR6EaynrnzjfbX75/v0ElEhZq
cAWEXgM+A+WwPD3KTpAcMDXd42lPkq1lHH7ExN4UsYfrqSF7T7GVMZpo30wC
IOYBBbYAZUCiDmSjeLTE1iLx14G6GMxniL+3TvUWUSF5waabouzV6vYlBlok
lby0vw7gyvexkPOQgG/u4lmsvNYRGl3UcVbecu2yS94RhBm/TG5kA+eaa8mc
jBZsMZ2GcfDfMZZLrP/5KwjLJ9OTrV9yDM0D6F6sAVlBF4l0MyOXl8ov/Qc/
bsdDA+J9ABEBAAHCwF8EGAEIABMFAlxoXCoJEG6JVajKTcXbAhsMAADltAf/
TbsN49vres/68RKkg3C4wihCTzSujrFYOxeKJOZALynTvMTwpjKmYik7zaJT
+25WxK0P3IknYKpsUFlDtIBluvdz4McZLEH0ymNwsi3hsnEG3l2W18JdKdzl
RLfkk/sT5Ay2LtjvPUmynkGvI3LFRkkqiA4buDiFOV/pqdV6RGIXEOcyMyPJ
hufD30wViByeDdxpJsFOlVnw7D02WDNUHomhN2m8ogLJyFbfrG8/c54VmX6O
J5Tj5Die5J5mSWCHbi9O0TBBgCysDxAr7blqK2xBO85q+Kp0809lPiS97iDq
uokpJQHZjIvfQ5/9tx1946Tvo0RX0A26JfOO+J68XA==
=MPBF
-----END PGP PUBLIC KEY BLOCK-----`;

interface KeyInfoFingerprints {
    fingerprints: string[],
    sha256Fingerprints: string[]
}

describe('key info', () => {
    it('sha256 fingerprints - v4 key', async () => {
        const { publicKey } = await generateKey({ userIDs: [{}], passphrase: 'test', config: { v5Keys: false } });
        const { fingerprints, sha256Fingerprints } : KeyInfoFingerprints = await keyInfo(publicKey);
        expect(sha256Fingerprints.length).to.equal(fingerprints.length);
        sha256Fingerprints.forEach((sha256Fingerprint, i) => {
            expect(sha256Fingerprint).to.not.equal(fingerprints[i]);
        });
    });

    it('sha256 fingerprints - v5 key', async () => {
        const { publicKey } = await generateKey({ userIDs: [{}], passphrase: 'test', config: { v5Keys: true } });
        const { fingerprints, sha256Fingerprints } : KeyInfoFingerprints = await keyInfo(publicKey);
        expect(sha256Fingerprints.length).to.equal(fingerprints.length);
        sha256Fingerprints.forEach((sha256Fingerprint, i) => {
            expect(sha256Fingerprint).to.equal(fingerprints[i]);
        });
    });

    it('key expiration', async () => {
        // primary key does not expire
        const { expires, dateError } = await keyInfo(publickey);
        expect(expires).to.equal(Infinity);
        expect(dateError).to.be.null;

        const now = new Date(0);
        // primary key expires after one second
        const { publicKey: expiringKey } = await generateKey({
            userIDs: [{}],
            passphrase: 'test',
            date: now,
            keyExpirationTime: 1
        });
        const expiringKeyInfo = await keyInfo(expiringKey);
        expect((expiringKeyInfo.expires as Date).getTime()).to.equal(new Date(+now + 1000).getTime());
        expect(expiringKeyInfo.dateError).to.be.null;
    });

    it('illegal key creation date', async () => {
        const { dateError } = await keyInfo(
            creationkey,
            undefined,
            undefined,
            new Date('2019-01-01T00:00:00.000Z')
        );
        expect(dateError).to.equal('The self certifications are created with illegal times');
    });

    it('key validation - invalid key', async () => {
        const { validationError } = await keyInfo(publickey);
        expect(validationError).to.equal('Key is less than 2048 bits');
    });

    it('key validation - valid key', async () => {
        const { validationError } = await keyInfo(creationkey);
        expect(validationError).to.be.null;
    });

    it('key validation - newly generated RSA key should be valid', async () => {
        const { publicKey } = await generateKey({ userIDs: [{}], passphrase: 'test' });
        const { validationError } = await keyInfo(publicKey);
        expect(validationError).to.be.null;
    });

    it('key validation - newly generated ECC 25519 key should be valid', async () => {
        const { publicKey } = await generateKey({ userIDs: [{}], passphrase: 'test', curve: 'curve25519' });
        const { validationError } = await keyInfo(publicKey);
        expect(validationError).to.be.null;
    });

    it('key validation - newly generated ECC key with invalid curve should fail validation', async () => {
        const config = { rejectCurves: new Set<enums.curve>() };
        const { publicKey: publicKeyArmored } = await generateKey({ userIDs: [{}], passphrase: 'test', curve: 'secp256k1', config });
        const { validationError } = await keyInfo(publicKeyArmored);
        expect(validationError).to.equal('Key must use Curve25519, P-256, P-384 or P-521');
    });

    it('key validation - reformatted key should be valid', async () => {
        const keyWithUncompressedPrefs = `-----BEGIN PGP PRIVATE KEY BLOCK-----

xVgEYY59gxYJKwYBBAHaRw8BAQdA3DNzk7qxgFfjGv2857uqzBUMZo+hg+4I
vGrmYl8nNgQAAP97yy0+vpHCz6QagYd2rfWXuVJ5CoDKGrTEP4ZRiJIbtxFx
zRB0ZXN0IDx0ZXN0QGEuaXQ+wooEEBYKABsFAmGOfYMECwkHCAMVCAoCFgAC
GQECGwMCHgEAIQkQI+qK7FSXbHYWIQSjeLP72yV1s/rmKeoj6orsVJdsdiaM
AP9oO7ev/fBQBj62VD0deZ5qBn4FfEr83fpBirGO2llBcgD+IcBT+M3hH4iU
I7QkN2sbwEXjcmgVEMstxjznHYx1iw3HXQRhjn2DEgorBgEEAZdVAQUBAQdA
V4Vjk7Ja6eCWT2wdmrvNCotMBLcaJii64Js0VpdOhHsDAQgHAAD/SX7fPa10
GRIRUT3Y4qgsChAGRVLjMMR3HA2fonCyQbAN3cJ4BBgWCAAJBQJhjn2DAhsM
ACEJECPqiuxUl2x2FiEEo3iz+9sldbP65inqI+qK7FSXbHaYBAEA+dOkYlvI
oRqcHrieqMQU7fmKAskJGb+0E0wG15dek28A/2TI9YMe6rbH4yvHWw+MLvYJ
0Z/fFLxYWQxNdcIETekM
=aRnh
-----END PGP PRIVATE KEY BLOCK-----`;
        const privateKey = await readPrivateKey({ armoredKey: keyWithUncompressedPrefs });

        const { validationError: compressionPrefsError } = await keyInfo(privateKey.toPublic().armor());
        expect(compressionPrefsError).to.match(/Preferred compression algorithms must include zlib/);

        const { privateKey: reformattedKey } = await reformatKey({ privateKey, userIDs: [{}], passphrase: 'test' });
        const { validationError } = await keyInfo(reformattedKey);
        expect(validationError).to.be.null;
    });
});
