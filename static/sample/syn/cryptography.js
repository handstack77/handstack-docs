'use strict';
let $cryptography = {
    extends: [
        'parsehtml'
    ],

    hook: {
        pageLoad() {
            syn.$l.get('txt_version').value = syn.$d.version;
        }
    },

    event: {
        btn_base64Encode_click() {
            syn.$l.get('txt_base64EncodeResult').value = syn.$c.base64Encode(syn.$l.get('txt_base64Encode').value);
        },

        btn_base64Decode_click() {
            syn.$l.get('txt_base64DecodeResult').value = syn.$c.base64Decode(syn.$l.get('txt_base64Decode').value);
        },

        btn_utf8Encode_click() {
            syn.$l.get('txt_utf8EncodeResult').value = syn.$c.utf8Encode(syn.$l.get('txt_utf8Encode').value);
        },

        btn_utf8Decode_click() {
            syn.$l.get('txt_utf8DecodeResult').value = syn.$c.utf8Decode(syn.$l.get('txt_utf8Decode').value);
        },

        btn_isWebCryptoSupported_click() {
            syn.$l.get('txt_isWebCryptoSupportedResult').value = syn.$c.isWebCryptoSupported();
        },

        btn_padKey_click() {
            syn.$l.get('txt_padKeyResult').value = syn.$c.padKey(syn.$l.get('txt_padKey').value, syn.$l.get('txt_padLength').value);
        },

        async btn_generateHMAC_click() {
            syn.$l.get('txt_generateHMACResult').value = await syn.$c.generateHMAC(syn.$l.get('txt_generateHMACKey').value, syn.$l.get('txt_generateHMACMessage').value);
        },

        async btn_verifyHMAC_click() {
            syn.$l.get('txt_verifyHMACResult').value = await syn.$c.verifyHMAC(syn.$l.get('txt_verifyHMACKey').value, syn.$l.get('txt_verifyHMACMessage').value, syn.$l.get('txt_verifyHMACSignature').value);
        },

        async btn_generateRSAKey_click() {
            var cryptoKey = await syn.$c.generateRSAKey();
            syn.$l.get('txt_generateRSAKeyResult').value = JSON.stringify(cryptoKey);
        },

        async btn_exportCryptoKey_click() {
            var cryptoKey = await syn.$c.generateRSAKey();
            syn.$l.get('txt_exportCryptoKeyPublicResult').value = await syn.$c.exportCryptoKey(cryptoKey.publicKey, true);
            syn.$l.get('txt_exportCryptoKeyPrivateResult').value = await syn.$c.exportCryptoKey(cryptoKey.privateKey, false);
        },

        async btn_importCryptoKey_click() {
            syn.$l.get('txt_importCryptoKeyResult').value = '';
            var isPublic = $string.toBoolean(syn.$l.get('txt_importCryptoKey').value);
            var cryptoKey = await syn.$c.generateRSAKey();
            var pem = await syn.$c.exportCryptoKey((isPublic == true ? cryptoKey.publicKey : cryptoKey.privateKey), isPublic);

            syn.$l.get('txt_importCryptoKeyResult').value = await syn.$c.importCryptoKey(syn.$l.get('txt_importCryptoKeyPEM').value, isPublic);
        },

        async btn_rsaEncode_click() {
            var cryptoKey = await syn.$c.importCryptoKey(syn.$l.get('txt_rsaEncodePEM').value, true);
            syn.$l.get('txt_rsaEncodeResult').value = await syn.$c.rsaEncode(syn.$l.get('txt_rsaEncode').value, cryptoKey);
        },

        async btn_rsaDecode_click() {
            var cryptoKey = await syn.$c.importCryptoKey(syn.$l.get('txt_rsaDecodePEM').value, false);
            syn.$l.get('txt_rsaDecodeResult').value = await syn.$c.rsaDecode(syn.$l.get('txt_rsaDecode').value, cryptoKey);
        },

        btn_generateIV_click() {
            syn.$l.get('txt_generateIVResult').value = syn.$c.generateIV(syn.$l.get('txt_generateIV').value, syn.$l.get('txt_generateIVLength').value);
        },

        async btn_aesEncode_click() {
            var encodeKey = syn.$l.get('txt_aesEncodeKey').value;
            var encodeAlgorithm = syn.$l.get('txt_aesEncodeAlgorithm').value;
            var encodeAESLength = syn.$l.get('txt_aesEncodeAESLength').value;

            var encodeResult = await syn.$c.aesEncode(syn.$l.get('txt_aesEncode').value, encodeKey, encodeAlgorithm, encodeAESLength);
            syn.$l.get('txt_aesEncodeResult').value = JSON.stringify(encodeResult);
            syn.$l.get('txt_aesDecode').value = encodeResult.encrypted;
        },

        async btn_aesDecode_click() {
            var decodeKey = syn.$l.get('txt_aesDecodeKey').value;
            var decodeAlgorithm = syn.$l.get('txt_aesDecodeAlgorithm').value;
            var decodeAESLength = syn.$l.get('txt_aesDecodeAESLength').value;

            var ivLength = decodeAlgorithm === 'AES-GCM' ? 12 : 16;

            var encodeResult = {
                iv: syn.$c.base64Encode(syn.$c.generateIV(decodeKey, ivLength)),
                encrypted: syn.$l.get('txt_aesDecode').value
            };

            syn.$l.get('txt_aesDecodeResult').value = await syn.$c.aesDecode(encodeResult, decodeKey, decodeAlgorithm, decodeAESLength);
        },

        async btn_sha_click() {
            syn.$l.get('txt_shaResult').value = await syn.$c.sha(syn.$l.get('txt_sha').value, syn.$l.get('txt_shaAlgorithm').value);
        },

        btn_sha256_click() {
            syn.$l.get('txt_sha256Result').value = syn.$c.sha256(syn.$l.get('txt_sha256').value);
        },

        btn_encrypt_click() {
            syn.$l.get('txt_encryptResult').value = syn.$c.encrypt(syn.$l.get('txt_encrypt').value);
        },

        btn_decrypt_click() {
            syn.$l.get('txt_decryptResult').value = syn.$c.decrypt(syn.$l.get('txt_decrypt').value);
        },

        btn_LZStringEncode_click() {
            syn.$l.get('txt_LZStringResult').value = syn.$c.LZString.compressToBase64(syn.$l.get('txt_LZString').value);
        },

        btn_LZStringDecode_click() {
            syn.$l.get('txt_LZStringResult').value = syn.$c.LZString.decompressFromBase64(syn.$l.get('txt_LZString').value);
        }
    }
};
