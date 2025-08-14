---
sidebar_position: 80
---

# HandStack 화면 JavaScript 작성 지침

이 문서는 HandStack 화면 개발 시 준수해야 할 한국어 응답 규칙 및 syn.js, syn.uicontrols.js 기반의 JavaScript 작성 지침을 명시합니다.

## 한국어 응답 규칙

모든 응답은 한국어로 작성하며, 다음 원칙을 따릅니다.

- 언어 통일: 모든 응답 콘텐츠는 한국어로 작성합니다.
- 코드 주석: 주석을 만들지 않아야 합니다. No Comment.
- 기술 용어: 필요시 영어 원문과 한국어를 병행 표기합니다 (예: "컨테이너(container)").
- 원문 유지: 에러 메시지나 로그는 원본 언어를 유지하되, 이에 대한 설명은 한국어로 제공합니다.
- 예외 상황:
    - 코드 자체(변수명, 함수명 등)는 영어로 작성합니다.
    - 공식 문서나 명령어는 원본 언어를 유지합니다.
    - 사용자가 명시적으로 다른 언어를 요청하는 경우에만 해당 언어를 사용합니다.

## syn.js 라이브러리의 주요 기능

syn.js 라이브러리는 HandStack 화면의 동작과 업무 구현을 위해 반복적인 코드를 좀 더 쉽고 일관성 있도록 하는 공통 기능 모음입니다. 최소한의 학습으로 실무에 적용 가능하도록 설계 되었으며 다음과 같은 특징이 있습니다.

- ECMAScript 2017 스펙 이상을 사용하는 표준 Javascript입니다. (Internet Explorer 미지원)
- 단독 사용 가능한 종속성이 없는 독립적인 라이브러리 입니다.
- 화면과 기능에 대한 업무 로직을 Javascript 객체 기반으로 만듭니다.
- 어떠한 외부 프레임워크와 라이브러리(jQuery, prototype, Vue, React 등등)의 통합이 가능합니다.
- 화면 개발 이후 유지보수 및 운영에 필요한 일관적인 소스 코드 품질을 만듭니다.

|약어|파일명|설명|
|---|---|---|
|[syn.$b](browser)|syn.browser.js|브라우저 정보 확인 기능 제공|
|[syn.$m](manipulation)|syn.manipulation.js|DOM (Document Object Model) 조작 기능 제공|
|[syn.$d](dimension)|syn.dimension.js|HTML Element 크기, 위치 제어 기능 제공|
|[syn.$c](cryptography)|syn.cryptography.js|base64, sha256 및 암호화 기능 제공|
|[syn.$k](keyboard)|syn.keyboard.js|키보드 단축키 기능 제공|
|[syn.$v](validation)|syn.validation.js|유효성 검사 기능 제공|
|[syn.$l](library)|syn.library.js|공통 라이브러리 기능 제공|
|[syn.$w](webform)|syn.webform.js|화면 개발 및 거래 업무 기능 제공|
|[syn.$r](request)|syn.request.js|http 요청 및 URL, Cookie 조작 기능 제공|
|[syn.$n](network)|syn.network.js|iframe 화면 간에 양방향 통신 기능을 제공|
|[syn.$p](print)|syn.print.js|PDF 문서를 이용한 인쇄 기능을 제공|
|[$date](date), [$array](array), [$string](string), [$number](number), [$object](object)|syn.extension.js|기본 데이터 타입 확장 기능 제공|

### [syn.$b](browser)|syn.browser.js 예제 코드

```js
'use strict';
let $browser = {
    extends: [
        'parsehtml'
    ],

    hook: {
        pageLoad() {
            syn.$l.get('txt_appName').value = syn.$b.appName;
            syn.$l.get('txt_appCodeName').value = syn.$b.appCodeName;
            syn.$l.get('txt_appVersion').value = syn.$b.appVersion;
            syn.$l.get('txt_cookieEnabled').value = syn.$b.cookieEnabled;
            syn.$l.get('txt_pdfViewerEnabled').value = syn.$b.pdfViewerEnabled;
            syn.$l.get('txt_platform').value = syn.$b.platform;
            syn.$l.get('txt_devicePlatform').value = syn.$b.devicePlatform;
            syn.$l.get('txt_userAgent').value = syn.$b.userAgent;
            syn.$l.get('txt_devicePixelRatio').value = syn.$b.devicePixelRatio;
            syn.$l.get('txt_isExtended').value = syn.$b.isExtended;
            syn.$l.get('txt_screenWidth').value = syn.$b.screenWidth;
            syn.$l.get('txt_screenHeight').value = syn.$b.screenHeight;
            syn.$l.get('txt_language').value = syn.$b.language;
            syn.$l.get('txt_isWebkit').value = syn.$b.isWebkit;
            syn.$l.get('txt_isMac').value = syn.$b.isMac;
            syn.$l.get('txt_isLinux').value = syn.$b.isLinux;
            syn.$l.get('txt_isWindow').value = syn.$b.isWindow;
            syn.$l.get('txt_isOpera').value = syn.$b.isOpera;
            syn.$l.get('txt_isIE').value = syn.$b.isIE;
            syn.$l.get('txt_isChrome').value = syn.$b.isChrome;
            syn.$l.get('txt_isEdge').value = syn.$b.isEdge;
            syn.$l.get('txt_isFF').value = syn.$b.isFF;
            syn.$l.get('txt_isSafari').value = syn.$b.isSafari;
            syn.$l.get('txt_isMobile').value = syn.$b.isMobile;
        }
    },

    event: {
        btn_getSystemFonts_click() {
            syn.$l.get('txt_getSystemFonts').value = syn.$b.getSystemFonts().map((item) => {
                return item.trim();
            }).join('\n');
        },

        btn_getPlugins_click() {
            syn.$l.get('txt_getPlugins').value = syn.$b.getPlugins().map((item) => {
                return item.trim();
            }).join('\n');
        },

        async btn_fingerPrint_click() {
            syn.$l.get('txt_fingerPrint').value = await syn.$b.fingerPrint();
        },

        btn_windowWidth_click() {
            syn.$l.get('txt_windowWidth').value = syn.$b.windowWidth();
        },

        btn_windowHeight_click() {
            syn.$l.get('txt_windowHeight').value = syn.$b.windowHeight();
        },

        async btn_getIpAddress_click() {
            syn.$l.get('txt_getIpAddress').value = await syn.$b.getIpAddress();
        }
    },
};

```

### [syn.$m](manipulation)|syn.manipulation.js 예제 코드
```js
'use strict';
let $manipulation = {
    extends: [
        'parsehtml'
    ],

    event: {
        btn_childNodes_click() {
            var childNodes = syn.$m.childNodes(document.body);
            var nodes = [];
            for (var i = 0, length = childNodes.length; i < length; i++) {
                nodes.push(childNodes[i].nodeName + '\n');
            }

            syn.$l.get('txt_childNodes').value = nodes.join('');
        },

        btn_children_click() {
            var children = syn.$m.children(document.body);
            var nodes = [];
            for (var i = 0, length = children.length; i < length; i++) {
                nodes.push(children[i].nodeName + '\n');
            }

            syn.$l.get('txt_children').value = nodes.join('');
        },

        btn_firstChild_click() {
            syn.$l.get('txt_firstChild').value = syn.$m.firstChild(document.body);
        },

        btn_firstElementChild_click() {
            syn.$l.get('txt_firstElementChild').value = syn.$m.firstElementChild(document.body);
        },

        btn_lastChild_click() {
            syn.$l.get('txt_lastChild').value = syn.$m.lastChild(document.body);
        },

        btn_lastElementChild_click() {
            syn.$l.get('txt_lastElementChild').value = syn.$m.lastElementChild(document.body);
        },

        btn_nextSibling1_click() {
            syn.$l.get('txt_nextSibling').value = '';
            syn.$l.get('txt_nextSibling').value = syn.$m.nextSibling('nextSibling_item1')?.nodeName;
        },

        btn_nextSibling2_click() {
            syn.$l.get('txt_nextSibling').value = '';
            syn.$l.get('txt_nextSibling').value = syn.$m.nextSibling('nextSibling_item2')?.nodeName;
        },

        btn_nextElementSibling1_click() {
            syn.$l.get('txt_nextElementSibling').value = '';
            syn.$l.get('txt_nextElementSibling').value = syn.$m.nextElementSibling('nextElementSibling_item1')?.nodeName;
        },

        btn_nextElementSibling2_click() {
            syn.$l.get('txt_nextElementSibling').value = '';
            syn.$l.get('txt_nextElementSibling').value = syn.$m.nextElementSibling('nextElementSibling_item2')?.nodeName;
        },

        btn_previousSibling1_click() {
            syn.$l.get('txt_previousSibling').value = '';
            syn.$l.get('txt_previousSibling').value = syn.$m.previousSibling('previousSibling_item1')?.nodeName;
        },

        btn_previousSibling2_click() {
            syn.$l.get('txt_previousSibling').value = '';
            syn.$l.get('txt_previousSibling').value = syn.$m.previousSibling('previousSibling_item2')?.nodeName;
        },

        btn_previousElementSibling1_click() {
            syn.$l.get('txt_previousElementSibling').value = '';
            syn.$l.get('txt_previousElementSibling').value = syn.$m.previousElementSibling('previousElementSibling_item1')?.nodeName;
        },

        btn_previousElementSibling2_click() {
            syn.$l.get('txt_previousElementSibling').value = '';
            syn.$l.get('txt_previousElementSibling').value = syn.$m.previousElementSibling('previousElementSibling_item2')?.nodeName;
        },

        btn_siblings_click() {
            var siblingELs = syn.$m.siblings('btn_parentNode');
            var nodes = [];
            for (var i = 0, length = siblingELs.length; i < length; i++) {
                nodes.push(siblingELs[i].nodeName + '\n');
            }

            syn.$l.get('txt_siblings').value = nodes.join('');
        },

        btn_parentNode_click() {
            syn.$l.get('txt_parentNode').value = syn.$m.parentNode(document.body)?.nodeName;
        },

        btn_parentElement_click() {
            syn.$l.get('txt_parentElement').value = syn.$m.parentElement(document.body)?.nodeName;
        },

        btn_value_click() {
            syn.$m.value('txt_value', 'hello world');
        },

        btn_textContent_click() {
            syn.$m.textContent('div_textContent', 'hello world');
        },

        btn_innerText_click() {
            syn.$m.innerText('div_innerText', 'hello world');
        },

        btn_innerHTML_click() {
            syn.$m.innerHTML('div_innerHTML', '<b style="color: red;">hello world</b>');
        },

        btn_outerHTML_click() {
            syn.$l.get('txt_outerHTML').value =syn.$m.outerHTML('div_outerHTML');
        },

        btn_className_click() {
            syn.$l.get('txt_className').value = syn.$m.className('btn_className');
        },

        btn_removeAttribute_click() {
            syn.$l.get('txt_attribute').value = '';
            syn.$m.removeAttribute('txt_attribute', 'custom1');
        },

        btn_getAttribute_click() {
            syn.$l.get('txt_attribute').value = syn.$m.getAttribute('txt_attribute', 'custom1');
        },

        btn_setAttribute_click() {
            syn.$m.setAttribute('txt_attribute', 'custom1', 'hello world');
        },

        btn_appendChild_click() {
            var el = document.createElement('LI');
            el.textContent = 'Grape';
            syn.$m.appendChild('myList', el);
        },

        btn_setStyle_click() {
            syn.$m.setStyle('div_setStyle', 'color', 'red');
        },

        btn_addStyle_click() {
            syn.$m.addStyle('div_addStyle', { backgroundColor: 'blue', color: 'white', border: '2px solid red' });
        },

        btn_addCssText_click() {
            syn.$m.addCssText('div_addCssText', 'background-color: lightblue;');
        },

        btn_getStyle_click() {
            syn.$l.get('txt_getStyle').value = syn.$m.getStyle('div_getStyle', 'border');
        },

        btn_getComputedStyle_click() {
            syn.$l.get('txt_getComputedStyle').value = syn.$m.getComputedStyle('txt_getComputedStyle', 'border');
        },

        btn_hasHidden_click() {
            syn.$l.get('txt_hasHidden').value = syn.$m.hasHidden('txt_hasHidden');
        },

        btn_addClass_click() {
            syn.$m.addClass('div_className', syn.$l.get('txt_className1').value);
        },

        btn_hasClass_click() {
            syn.$l.get('txt_className1').value = syn.$m.hasClass('div_className', syn.$l.get('txt_className1').value);
        },

        btn_toggleClass_click() {
            syn.$m.toggleClass('div_className', syn.$l.get('txt_className1').value);
        },

        btn_removeClass_click() {
            syn.$m.removeClass('div_className', syn.$l.get('txt_className1').value);
        },

        btn_append_click() {
            syn.$m.append('div_append', 'input', 'txt' + syn.$l.random(), {
                styles: {
                    display: 'block',
                    color: 'red'
                },
                classNames: 'f:32 mb-2',
                value: 'hello world',
                text: 'hello world',
                content: 'hello world',
                html: 'hello world'
            });
        },

        btn_prepend_click() {
            var value = $date.toString(new Date(), 'a');
            var divEL = syn.$m.create({
                tag: 'div',
                styles: {
                    display: 'block',
                    color: 'red'
                },
                attributes: {
                    custom1: 'custom1',
                    readonly: 'readonly'
                },
                data: {
                    data1: 'data1',
                    data2: 'data2',
                    data3: 'data3'
                },
                className: 'form-control',
                classNames: 'f:32 mb-2',
                value: value,
                text: value,
                content: value,
                html: value
            });
            syn.$m.prepend(divEL, 'div_prepend');
        },

        btn_copy_click() {
            var copyEL = syn.$m.copy('div_copy');
            syn.$l.get('txt_copy').value = copyEL.outerHTML;
            copyEL.innerHTML = '';
        },

        btn_remove_click() {
            syn.$m.remove('div_remove');
        },

        btn_hasChild_click() {
            syn.$l.get('txt_hasChild').value = syn.$m.hasChild('txt_hasChild');
        },

        btn_insertAfter_click() {
            var divEL = syn.$m.create({
                text: $date.toString(new Date(), 'a'),
            });
            syn.$m.insertAfter(divEL, 'div_insertAfter');
        },

        btn_display_click() {
            syn.$m.display('div_display', syn.$l.get('chk_display').checked);
        },

        btn_toggleDisplay_click() {
            syn.$m.toggleDisplay('div_display');
        },

        btn_parent_click() {
            syn.$l.get('txt_parent').value = syn.$m.parent('btn_parent').outerHTML;
        },

        btn_parentID_click() {
            syn.$l.get('txt_parent').value = syn.$m.parent('btn_parent', 'div_parent').outerHTML;
        },

        btn_create_click() {
            var el = syn.$m.create(JSON.parse(syn.$l.get('txt_createJson').value));
            syn.$l.get('txt_create').value = el.outerHTML;
        },

        btn_each_click() {
            var nodes = [];
            var siblingELs = syn.$m.siblings('btn_parentNode');
            syn.$m.each(siblingELs, (item, index) => {
                nodes.push(`name: ${item.nodeName}, index: ${index}` + '\n');
            });
            syn.$l.get('txt_each').value = nodes.join('');
        },

        btn_setActive_click() {
            syn.$m.setActive('div_setActive', syn.$l.get('chk_setActive').checked);
        },

        btn_setSelected_click(evt) {
            syn.$m.setSelected('opt_setSelected_Item1', true, true);
            syn.$m.setSelected('opt_setSelected_Item2', true, true);
            syn.$m.setSelected('opt_setSelected_Item3', true, true);
        },

        btn_setChecked_click(evt) {
            syn.$m.setChecked('opt_setChecked_Item1', true);
            syn.$m.setChecked('opt_setChecked_Item2', true);
            syn.$m.setChecked('opt_setChecked_Item3', true);
        }
    }
};

```

### [syn.$d](dimension)|syn.dimension.js 예제 코드
```js
'use strict';
let $dimension = {
    extends: [
        'parsehtml'
    ],

    event: {
        btn_getDocumentSize_click() {
            syn.$l.get('txt_getDocumentSize').value = JSON.stringify(syn.$d.getDocumentSize());
        },

        btn_getWindowSize_click() {
            syn.$l.get('txt_getWindowSize').value = JSON.stringify(syn.$d.getWindowSize());
        },

        btn_getScrollPosition_click() {
            syn.$l.get('txt_getScrollPosition').value = JSON.stringify(syn.$d.getScrollPosition('btn_getScrollPosition'));
        },

        btn_getMousePosition_click(evt) {
            syn.$l.get('txt_getMousePosition').value = JSON.stringify(syn.$d.getMousePosition(evt));
        },

        btn_offset_click(evt) {
            syn.$l.get('txt_offset').value = JSON.stringify(syn.$d.offset('btn_offset'));
        },

        btn_offsetLeft_click(evt) {
            syn.$l.get('txt_offsetLeft').value = JSON.stringify(syn.$d.offsetLeft('btn_offsetLeft'));
        },

        btn_parentOffsetLeft_click(evt) {
            syn.$l.get('txt_parentOffsetLeft').value = JSON.stringify(syn.$d.parentOffsetLeft('btn_parentOffsetLeft'));
        },

        btn_offsetTop_click(evt) {
            syn.$l.get('txt_offsetTop').value = JSON.stringify(syn.$d.offsetTop('btn_offsetTop'));
        },

        btn_parentOffsetTop_click(evt) {
            syn.$l.get('txt_parentOffsetTop').value = JSON.stringify(syn.$d.parentOffsetTop('btn_parentOffsetTop'));
        },

        btn_getSize_click(evt) {
            syn.$l.get('txt_getSize').value = JSON.stringify(syn.$d.getSize('btn_getSize'));
        },

        btn_measureWidth_click(evt) {
            syn.$l.get('txt_measureWidth').value = JSON.stringify(syn.$d.measureWidth('hello world', '14px'));
        },

        btn_measureHeight_click(evt) {
            syn.$l.get('txt_measureHeight').value = JSON.stringify(syn.$d.measureHeight('hello world', '14px'));
        },

        btn_measureSize_click(evt) {
            syn.$l.get('txt_measureSize').value = JSON.stringify(syn.$d.measureSize('hello world', '14px'));
        }
    }
};

```

### [syn.$c](cryptography)|syn.cryptography.js 예제 코드
```js
'use strict';
let $cryptography = {
    extends: [
        'parsehtml'
    ],

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

```

### [syn.$k](keyboard)|syn.keyboard.js 예제 코드
```js
'use strict';
let $keyboard = {
    extends: [
        'parsehtml'
    ],

    event: {
        btn_setElement_click() {
            syn.$k.setElement('txt_setElement');
            syn.$l.get('txt_setElement').value = '설정 되었습니다';
        },

        btn_addKeyCode_click() {
            syn.$k.setElement('txt_setElement');
            syn.$k.addKeyCode('keydown', syn.$k.keyCodes.a, function (evt) {
                alert(`${evt.target.id}: ${evt.key}, ${evt.code}, ${evt.keyCode}`);
            });

            syn.$k.addKeyCode('keyup', syn.$k.keyCodes.c, function (evt) {
                alert(`${evt.target.id}: ${evt.key}, ${evt.code}, ${evt.keyCode}`);
            });
        },

        btn_removeKeyCode_click() {
            syn.$k.setElement('txt_setElement');
            syn.$k.removeKeyCode('keydown', syn.$k.keyCodes.a);
        }
    }
};

```

### [syn.$v](validation)|syn.validation.js 예제 코드
```js
'use strict';
let $validate = {
    extends: [
        'parsehtml'
    ],

    method: {
        customValidation(options) {
            console.log(options);
            return syn.$l.get('txt_custom').value.trim() != '';
        }
    },

    event: {
        btn_setElement_click() {
            syn.$v.setElement('txt_setElement');
            syn.$l.get('txt_setElement').value = '설정되었습니다';
        },

        btn_required_click() {
            syn.$v.required('txt_required', true, 'Required 검사가 실패했습니다.');
        },

        btn_required_validateControl_click() {
            var isValid = syn.$v.validateControl('txt_required');
            if (isValid == false) {
                var messages = syn.$v.toMessages();
                if ($string.isNullOrEmpty(messages) == false) {
                    alert(messages);
                }
            }
        },

        btn_pattern_numeric_click() {
            syn.$v.pattern('txt_pattern', 'numeric', { 'expr': syn.$v.regexs.numeric, 'message': '숫자를 입력 해야합니다.' });
        },

        btn_pattern_email_click() {
            syn.$v.pattern('txt_pattern', 'email', { 'expr': syn.$v.regexs.email, 'message': '이메일을 입력 해야합니다.' });
        },

        btn_pattern_juminNo_click() {
            syn.$v.pattern('txt_pattern', 'juminNo', { 'expr': syn.$v.regexs.juminNo, 'message': '주민등록번호를 입력 해야합니다.' });
        },

        btn_pattern_validateControl_click() {
            var isValid = syn.$v.validateControl('txt_pattern');
            if (isValid == false) {
                var messages = syn.$v.toMessages();
                if ($string.isNullOrEmpty(messages) == false) {
                    alert(messages);
                }
            }
        },

        btn_range_click() {
            syn.$v.pattern('txt_range', 'numeric', { 'expr': syn.$v.regexs.numeric, 'message': '숫자를 입력 해야합니다.' });
            syn.$v.range('txt_range', 'overflow', { 'min': 0, 'max': 100, 'minOperator': '<', 'maxOperator': '>', 'message': '1 ~ 100 이내 값을 입력 해야합니다.' });
        },

        btn_range_validateControl_click() {
            debugger;
            var isValid = syn.$v.validateControl('txt_range');
            if (isValid == false) {
                var messages = syn.$v.toMessages();
                if ($string.isNullOrEmpty(messages) == false) {
                    alert(messages);
                }
            }
        },

        btn_custom_click() {
            syn.$v.custom('txt_custom', 'customVaild', { 'functionName': 'customValidation', 'functionParam1': 'ok', 'message': '사용자 지정 검사가 실패했습니다.' });
        },

        btn_custom_validateControl_click() {
            var isValid = syn.$v.validateControl('txt_custom');
            if (isValid == false) {
                var messages = syn.$v.toMessages();
                if ($string.isNullOrEmpty(messages) == false) {
                    alert(messages);
                }
            }
        },

        btn_validateControls_click() {
            var isValid = syn.$v.validateControls(syn.$l.get('txt_required', 'txt_pattern', 'txt_range', 'txt_custom'));
            if (isValid == false) {
                var messages = syn.$v.toMessages();
                if ($string.isNullOrEmpty(messages) == false) {
                    alert(messages);
                }
            }
        },

        btn_validateForm_click() {
            var isValid = syn.$v.validateForm();
            if (isValid == false) {
                var messages = syn.$v.toMessages();
                if ($string.isNullOrEmpty(messages) == false) {
                    alert(messages);
                }
            }
        }
    }
};

```

### [syn.$l](library)|syn.library.js 예제 코드
```js
'use strict';
let $library = {
    extends: [
        'parsehtml'
    ],

    method: {
        updateText(evt) {
            var el = null;
            if ($object.isNullOrUndefined(evt) == true) {
                el = syn.$w.activeControl(this);
            }
            else {
                el = syn.$w.activeControl(evt);
            }

            el.value = el.value + ' changed !';
        }
    },

    event: {
        btn_guid_click() {
            syn.$l.get('txt_guid').value = syn.$l.guid();
        },

        btn_stringToArrayBuffer_click() {
            syn.$l.get('txt_stringToArrayBuffer').value = syn.$l.stringToArrayBuffer('hello world');
        },

        btn_arrayBufferToString_click() {
            syn.$l.get('txt_arrayBufferToString').value = syn.$l.arrayBufferToString(syn.$l.stringToArrayBuffer('hello world'));
        },

        btn_random_click() {
            syn.$l.get('txt_random').value = syn.$l.random();
        },

        btn_random1_click() {
            syn.$l.get('txt_random').value = syn.$l.random(32);
        },

        btn_random2_click() {
            syn.$l.get('txt_random').value = syn.$l.random(32, true);
        },

        btn_dispatchClick_click() {
            syn.$l.dispatchClick('btn_random2');
        },

        btn_addEvent_click() {
            syn.$l.addEvent('txt_addEvent', 'click', (evt) => {
                var el = syn.$w.activeControl(evt);
                el.value = el.value + ' click !';
            })
                .addEvent('txt_addEvent', 'change', $this.method.updateText)
                .addEvent('txt_addEvent', 'blur', (evt) => {
                    var el = syn.$w.activeControl(evt);
                    el.value = el.value + ' blur !';
                });
        },

        btn_addEvents_click() {
            syn.$l.addEvents('input[type="text"]', 'click', (evt) => {
                var el = syn.$l.get('txt_addEvents');
                el.value = el.value + ' input[type="text"] click !';
            });

            syn.$l.addEvents(['div.form-text', 'button#btn_triggerEvent'], 'click', (evt) => {
                var el = syn.$l.get('txt_addEvents');
                el.value = el.value + ' div.form-text, button#btn_triggerEvent click !';
            });
        },

        btn_addLive_click() {
            syn.$l.addLive('txt_addLive', 'click', (evt) => {
                var el = syn.$w.activeControl(evt);
                el.value = el.value + ' click !';
            });
        },

        btn_addLiveElement_click() {
            syn.$m.append('div_addLive', 'input', 'txt_addLive', {
                classNames: 'form-control',
                value: 'hello world'
            });
        },

        btn_removeEvent_click() {
            syn.$l.removeEvent('txt_addEvent', 'change', $this.method.updateText);
        },

        btn_hasEvent_click() {
            syn.$l.get('txt_hasEvent').value = syn.$l.hasEvent('txt_addEvent', 'change');
        },

        btn_trigger_click() {
            syn.$l.get('txt_trigger').value = syn.$l.trigger('txt_addEvent', 'change');
        },

        btn_triggerEvent_click() {
            syn.$l.get('txt_triggerEvent').value = syn.$l.triggerEvent('txt_addEvent', 'change');
        },

        btn_get_click() {
            var els = syn.$l.get('btn_trigger', 'btn_triggerEvent', 'btn_get');
            syn.$l.get('txt_get').value = `${syn.$l.get('btn_get').textContent}, ${els.length}`;
        },

        btn_querySelector_click() {
            var els = syn.$l.querySelector('#btn_trigger', '#btn_triggerEvent', '#btn_get');
            syn.$l.get('txt_querySelector').value = `${syn.$l.querySelector('#btn_get').textContent}, ${els.length}`;
        },

        btn_getTagName_click() {
            var els = syn.$l.getTagName('button', 'input');
            syn.$l.get('txt_getTagName').value = els.length;
        },

        btn_toEnumValue_click() {
            syn.$l.get('txt_toEnumValue').value = syn.$l.toEnumValue(syn.$v.valueType, 'valueMissing');
        },

        btn_toEnumText_click() {
            syn.$l.get('txt_toEnumText').value = syn.$l.toEnumText(syn.$v.valueType, 0);
        },

        btn_text2Json_click() {
            var json = syn.$l.text2Json(syn.$l.get('txt_text2Json').value);
            syn.$l.get('txt_text2Json').value = JSON.stringify(json, null, 4);
        },

        btn_json2Text_click() {
            var json = JSON.parse(syn.$l.get('txt_json2Text').value);
            var text = syn.$l.json2Text(json, ['AAA', 'BBB', 'CCC']);
            syn.$l.get('txt_json2Text').value = text;
        },

        btn_nested2Flat_click() {
            var dataSource = JSON.parse(syn.$l.get('txt_jsontext').value);
            var jsonRoot = syn.$l.flat2Nested(dataSource, 'id', 'parentId');
            var flatItems = syn.$l.nested2Flat(jsonRoot, 'id', 'parentId', 'items');
            syn.$l.get('txt_nestedresult').value = JSON.stringify(flatItems, null, 4);
        },

        btn_flat2Nested_click() {
            var dataSource = JSON.parse(syn.$l.get('txt_jsontext').value);
            var jsonRoot = syn.$l.flat2Nested(dataSource, 'id', 'parentId');
            syn.$l.get('txt_nestedresult').value = JSON.stringify(jsonRoot, null, 4);
        },

        btn_findNestedByID_click() {
            var dataSource = JSON.parse(syn.$l.get('txt_jsontext').value);
            var jsonRoot = syn.$l.flat2Nested(dataSource, 'id', 'parentId');
            var findItem = syn.$l.findNestedByID(jsonRoot, 10, 'id', 'items');
            syn.$l.get('txt_nestedresult').value = JSON.stringify(findItem, null, 4);
        },

        btn_deepFreeze_click() {
            var json = {
                value: ''
            };
            json.value = 'hello world';

            var freezeJson = syn.$l.deepFreeze(json);

            try {
                freezeJson.value = 'change !';
            } catch {

            }

            syn.$l.get('txt_deepFreeze').value = `json: ${JSON.stringify(json)}, freezeJson: ${JSON.stringify(freezeJson)}`;
        },

        btn_createBlob_click() {
            var blob = syn.$l.createBlob('hello world', 'text/plain');
            syn.$l.get('txt_createBlob').value = blob;
        },

        btn_dataUriToBlob_click() {
            var dataUri = 'data:text/plain;base64,aGVsbG93b3JsZA==';
            var blob = syn.$l.dataUriToBlob(dataUri);
            syn.$l.get('txt_dataUriToBlob').value = blob;
        },

        btn_dataUriToText_click() {
            var dataUri = 'data:text/plain;base64,aGVsbG93b3JsZA==';
            var json = syn.$l.dataUriToText(dataUri);
            syn.$l.get('txt_dataUriToText').value = `value: ${json.value}, mime: ${json.mime}`;
        },

        btn_blobToDataUri_click() {
            var blob = syn.$l.createBlob('hello world', 'text/plain');
            syn.$l.blobToDataUri(blob, (dataUri) => {
                syn.$l.get('txt_blobToDataUri').value = dataUri;
            });
        },

        btn_blobToDownload_click() {
            var blob = syn.$l.createBlob('hello world', 'text/plain');
            syn.$l.blobToDownload(blob, 'helloworld.txt');
        },

        btn_blobUrlToBlob_click() {
            var createBlob = syn.$l.createBlob('helloworld', 'text/plain');
            var blobUrl = syn.$r.createBlobUrl(createBlob);
            syn.$l.blobUrlToBlob(blobUrl, (blob) => {
                syn.$l.get('txt_blobUrlToBlob').value = blob;
            });
        },

        btn_blobUrlToDataUri_click() {
            var blob = syn.$l.createBlob('helloworld', 'text/plain');
            var blobUrl = syn.$r.createBlobUrl(blob);
            syn.$l.blobUrlToDataUri(blobUrl, (dataUri) => {
                syn.$l.get('txt_blobUrlToDataUri').value = dataUri;
            });
        },

        async btn_blobToBase64_click() {
            var blob = syn.$l.createBlob('hello world', 'text/plain');
            syn.$l.get('txt_blobToBase64').value = await syn.$l.blobToBase64(blob);
        },

        async btn_base64ToBlob_click() {
            var blob = syn.$l.createBlob('hello world', 'text/plain');
            var base64 = await syn.$l.blobToBase64(blob);

            var mimeType = base64?.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];
            var realData = base64.split(',')[1];

            syn.$l.get('txt_base64ToBlob').value = syn.$l.base64ToBlob(realData, mimeType).size;
        },

        async btn_blobToFile_click() {
            var blob = syn.$l.createBlob('hello world', 'text/plain');
            var file = await syn.$l.blobToFile(blob);
            syn.$l.get('txt_blobToFile').value = file.size;
        },

        async btn_fileToBase64_click() {
            var blob = syn.$l.createBlob('hello world', 'text/plain');
            var file = await syn.$l.blobToFile(blob);
            syn.$l.get('txt_fileToBase64').value = await syn.$l.fileToBase64(file);
        },

        async btn_fileToBlob_click() {
            var blob = syn.$l.createBlob('hello world', 'text/plain');
            var file = await syn.$l.blobToFile(blob);
            syn.$l.get('txt_fileToBlob').value = await syn.$l.fileToBlob(file);
        }
    }
};

```

### [syn.$w](webform)|syn.webform.js 예제 코드
```js
'use strict';
let $webforms = {
    extends: [
        'parsehtml'
    ],

    transaction: {
        GD01: {
            inputs: [{ type: 'Row', dataFieldID: 'MainForm' }],
            outputs: [{ type: 'Form', dataFieldID: 'MainForm' }]
        },
    },

    event: {
        btn_setStorage_sessionStorage_click() {
            syn.$w.setStorage('storageKey1', 'hello world');
            syn.$w.setStorage('storageKey2', 12345);
            syn.$w.setStorage('storageKey3', new Date());
            syn.$w.setStorage('storageKey4', true);
            syn.$w.setStorage('storageKey5', { key: 'hello world' });

            syn.$l.get('txt_setStorage').value = 'sessionStorage 저장';
        },

        btn_setStorage_localStorage_click() {
            syn.$w.setStorage('storageKey1', 'hello world', true);
            syn.$w.setStorage('storageKey2', 12345, true);
            syn.$w.setStorage('storageKey3', new Date(), true);
            syn.$w.setStorage('storageKey4', true, true);
            syn.$w.setStorage('storageKey5', { key: 'hello world' }, true);

            syn.$l.get('txt_setStorage').value = 'localStorage 저장';
        },

        btn_getStorage_sessionStorage_click() {
            var storageKey1 = syn.$w.getStorage('storageKey1');
            var storageKey2 = syn.$w.getStorage('storageKey2');
            var storageKey3 = syn.$w.getStorage('storageKey3');
            var storageKey4 = syn.$w.getStorage('storageKey4');
            var storageKey5 = syn.$w.getStorage('storageKey5');

            syn.$l.get('txt_getStorage').value = `sessionStorage storageKey1: ${storageKey1}, storageKey2: ${storageKey2}, storageKey3: ${storageKey3}, storageKey4: ${storageKey4}, storageKey5: ${storageKey5}`;
        },

        btn_getStorage_localStorage_click() {
            var storageKey1 = syn.$w.getStorage('storageKey1', true);
            var storageKey2 = syn.$w.getStorage('storageKey2', true);
            var storageKey3 = syn.$w.getStorage('storageKey3', true);
            var storageKey4 = syn.$w.getStorage('storageKey4', true);
            var storageKey5 = syn.$w.getStorage('storageKey5', true);

            syn.$l.get('txt_getStorage').value = `localStorage storageKey1: ${storageKey1}, storageKey2: ${storageKey2}, storageKey3: ${storageKey3}, storageKey4: ${storageKey4}, storageKey5: ${storageKey5}`;
        },

        btn_removeStorage_sessionStorage_click() {
            syn.$w.removeStorage('storageKey1');
            syn.$w.removeStorage('storageKey2');
            syn.$w.removeStorage('storageKey3');
            syn.$w.removeStorage('storageKey4');
            syn.$w.removeStorage('storageKey5');

            syn.$l.get('txt_removeStorage').value = `sessionStorage 삭제`;
        },

        btn_removeStorage_localStorage_click() {
            syn.$w.removeStorage('storageKey1', true);
            syn.$w.removeStorage('storageKey2', true);
            syn.$w.removeStorage('storageKey3', true);
            syn.$w.removeStorage('storageKey4', true);
            syn.$w.removeStorage('storageKey5', true);

            syn.$l.get('txt_removeStorage').value = `localStorage 삭제`;
        },

        btn_activeControl_click() {
            var el = syn.$w.activeControl();
            syn.$l.get('txt_activeControl').value = el.outerHTML;
        },

        btn_argumentsExtend_click() {
            var parameter = {
                aaaa: 1234,
                bbbb: '2222'
            };

            var extend = syn.$w.argumentsExtend({
                aaaa: 0,
                bbbb: '',
                cccc: false
            }, parameter);

            extend.bbbb = 'hello world';

            syn.$l.get('txt_argumentsExtend').value = JSON.stringify(extend);
        },

        btn_getterValue_click() {
            var result = syn.$w.getterValue('GD01');
            syn.$l.get('txt_getterValue').value = JSON.stringify(result);
        },

        btn_setterValue_click() {
            var dataSet = [{
                setStorage: 'setStorage',
                getStorage: 'getStorage',
                removeStorage: 'removeStorage',
                activeControl: 'activeControl',
                argumentsExtend: 'argumentsExtend',
                getterValue: 'getterValue'
            }];

            var result = syn.$w.setterValue('GD01', dataSet);
            syn.$l.get('txt_setterValue').value = JSON.stringify(result);
        },

        btn_scrollToTop_click() {
            syn.$w.scrollToTop();
        },

        btn_setFavicon_click() {
            syn.$w.setFavicon('/img/logo.ico');
        },

        btn_fileDownload_click() {
            var url = syn.$l.get('txt_fileDownload').value;
            syn.$w.fileDownload(url, 'download.txt');
        },

        async btn_apiHttp_get_click() {
            var result = await syn.$w.apiHttp('sample.json').send();
            syn.$l.get('txt_apiHttp').value = JSON.stringify(result);
        },

        async btn_apiHttp_post_click() {
            var result = await syn.$w.apiHttp('sample.json').send({
                applicationID: 'programID',
                projectID: 'businessID',
                transactionID: 'transactionID',
                serviceID: 'functionID'
            });
            syn.$l.get('txt_apiHttp').value = JSON.stringify(result);
        },

        async btn_apiHttp_form_click() {
            var formData = new FormData();
            formData.append('field', 'data');

            var result = await syn.$w.apiHttp('sample.json').send(formData);
            syn.$l.get('txt_apiHttp').value = JSON.stringify(result);
        },

        btn_loadScript_click() {
            var url = syn.$l.get('txt_loadScript').value;
            syn.$w.loadScript(url);
            alert(`url: ${url} 요청 완료`);
        },

        btn_loadStyle_click() {
            var url = syn.$l.get('txt_loadStyle').value;
            syn.$w.loadStyle(url);
            alert(`url: ${url} 요청 완료`);
        },

        async btn_fetchText_click() {
            var url = syn.$l.get('txt_loadStyle').value;
            syn.$l.get('txt_fetchText').value = await syn.$w.fetchText(url);
        },

        async btn_fetchJson_click() {
            var result = await syn.$w.fetchJson('sample.json');
            syn.$l.get('txt_fetchJson').value = JSON.stringify(result);
        },

        btn_pseudoStyle_click() {
            var pseudoID = syn.$l.get('txt_pseudoID').value;
            var selector = syn.$l.get('txt_selector').value;
            var pseudoStyle = syn.$l.get('txt_pseudoStyle').value;

            syn.$w.pseudoStyle(pseudoID, selector, pseudoStyle);
        },

        btn_pseudoStyles_click() {
            var pseudoID = syn.$l.get('txt_pseudoIDs').value;
            var pseudoStyle = syn.$l.get('txt_pseudoStyles').value;

            syn.$w.pseudoStyles(pseudoID, eval(pseudoStyle));
        }
    }
};

```

### [syn.$r](request)|syn.request.js 예제 코드
```js
'use strict';
let $requests = {
    extends: [
        'parsehtml'
    ],

    method: {
    },

    event: {
        btn_query_click() {
            syn.$r.params['p1'] = 'aaa';
            syn.$r.params['p2'] = 'bbb';
            syn.$r.params['p3'] = 'ccc';
            syn.$l.get('txt_query').value = syn.$r.query('p2');
        },

        btn_url_click() {
            syn.$r.params['p1'] = 'aaa';
            syn.$r.params['p2'] = 'bbb';
            syn.$r.params['p3'] = 'ccc';
            syn.$l.get('txt_url').value = syn.$r.url();
        },

        btn_setCookie_click() {
            syn.$r.setCookie('txtSetCookie', 'hello');
            syn.$l.get('txt_setCookie').value = '설정 완료';
        },

        btn_getCookie_click() {
            syn.$l.get('txt_getCookie').value = syn.$r.getCookie('txtSetCookie');
        },

        btn_deleteCookie_click() {
            syn.$r.deleteCookie('txtSetCookie');
            syn.$l.get('txt_deleteCookie').value = '삭제 완료';
        }
    }
};

```

### [syn.$n](network)|syn.network.js 예제 코드
```js
'use strict';
let $iframe_main = {
    event: {
        btnChildrenConnect_click() {
            var channelID = 'channelID';
            var iframeChannel = syn.$w.channels.find(function (item) { return item.id == channelID });
            if (iframeChannel == undefined) {
                var iframe = syn.$l.get('ifmChildren');
                var contentWindow = iframe.contentWindow;
                var frameMessage = {
                    id: channelID,
                    channel: syn.$n.rooms.connect({
                        debugOutput: true,
                        window: contentWindow,
                        origin: '*',
                        scope: channelID
                    })
                };

                frameMessage.channel.bind('response', function (evt, val) {
                    alert('iframe_main ' + val);
                });

                syn.$w.channels.push(frameMessage);
            }
        },

        btnChildrenLoad_click() {
            var iframe = syn.$l.get('ifmChildren');
            iframe.src = 'iframe_child.html';
        },

        btnParent2Children_click() {
            var channelID = 'channelID';
            var length = syn.$w.channels.length;
            for (var i = 0; i < length; i++) {
                var frameMessage = syn.$w.channels[i];

                if (channelID == frameMessage.id) {
                    frameMessage.channel.call({
                        method: 'request',
                        params: ['request data'],
                        error(error, message) {
                            alert('iframe_main request ERROR: ' + error + ' (' + message + ')');
                        },
                        success(val) {
                            alert('iframe_main request function returns: ' + val);
                        }
                    });
                }
            }
        }
    }
}

let $iframe_child = {
    prop: {
        childrenChannel: null
    },

    hook: {
        pageLoad() {
            var channelID = 'channelID';
            if (window != window.parent && channelID) {
                $this.prop.childrenChannel = syn.$n.rooms.connect({ window: window.parent, origin: '*', scope: channelID });
                $this.prop.childrenChannel.bind('request', function (evt, params) {
                    alert('iframe_child ' + params);
                });
            }
        }
    },

    event: {
        btnChildren2Parent_click() {
            if ($this.prop.childrenChannel != null) {
                $this.prop.childrenChannel.emit({
                    method: 'response',
                    params: ['response data'],
                    error(error, message) {
                        alert('iframe_child response ERROR: ' + error + ' (' + message + ')');
                    },
                    success(val) {
                        alert('iframe_child response function returns: ' + val);
                    }
                });
            }
        }
    }
}

```

### [$date](date), [$array](array), [$string](string), [$number](number), [$object](object)|syn.extension.js 예제 코드
```js
'use strict';
let $extension_array = {
    extends: [
        'parsehtml'
    ],

    event: {
        btn_distinct_click() {
            var arr = ['Apple', 'Banana', 'Banana', 'Mango', 'Cherry'];
            syn.$l.get('txt_distinct').value = JSON.stringify($array.distinct(arr));
        },

        btn_sort_click() {
            var arr = ['Apple', 'Banana', 'Banana', 'Mango', 'Cherry'];
            syn.$l.get('txt_sort').value = JSON.stringify($array.sort(arr, true));
        },

        btn_objectSort_click() {
            var arr = [{ name: 'Apple', price: 10 }, { name: 'Banana', price: 5 }, , { name: 'Cherry', price: 5 }];
            syn.$l.get('txt_objectSort').value = JSON.stringify($array.objectSort(arr, 'price', true));
        },

        btn_groupBy_click() {
            var arr = [{ name: 'Apple', price: 10 }, { name: 'Banana', price: 5 }, , { name: 'Cherry', price: 5 }];
            syn.$l.get('txt_groupBy').value = JSON.stringify($array.groupBy(arr, 'price'));
        },

        btn_groupBy_click() {
            var arr = [{ name: 'Apple', price: 10 }, { name: 'Banana', price: 5 }, , { name: 'Cherry', price: 5 }];
            syn.$l.get('txt_groupBy').value = JSON.stringify($array.groupBy(arr, 'price'));
        },

        btn_groupBy_length_click() {
            syn.$l.get('txt_groupBy').value = JSON.stringify($array.groupBy(["하나", "둘", "셋"], "length"));
        },

        btn_groupBy_floor_click() {
            syn.$l.get('txt_groupBy').value = JSON.stringify($array.groupBy([9.8, 7.1, 9.2], Math.floor));
        },

        btn_groupBy_predicate_click() {
            var arr = [{ name: 'Apple', price: 10 }, { name: 'Banana', price: 5 }, , { name: 'Cherry', price: 5 }];
            syn.$l.get('txt_groupBy').value = JSON.stringify($array.groupBy(arr, ({ price }) => {
                return price <= 5 ? 'buy' : 'not buy'
            }));
        },

        btn_shuffle_click() {
            syn.$l.get('txt_shuffle').value = JSON.stringify($array.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
        },

        btn_addAt_click() {
            var arr = ['Apple', 'Banana', 'Mango', 'Cherry'];
            syn.$l.get('txt_addAt').value = JSON.stringify($array.addAt(arr, 2, 'hello world'));
        },

        btn_removeAt_click() {
            var arr = ['Apple', 'Banana', 'Mango', 'Cherry'];
            syn.$l.get('txt_removeAt').value = JSON.stringify($array.removeAt(arr, 3));
        },

        btn_contains_click() {
            var arr = ['Apple', 'Banana', 'Mango', 'Cherry'];
            syn.$l.get('txt_contains').value = $array.contains(arr, 'Banana');
        },

        btn_merge_click() {
            var arr = ['Apple', 'Banana', 'Mango', 'Cherry'];
            syn.$l.get('txt_merge').value = $array.merge(arr, ['Grape', 'Banana', 'BlueBarry']);
        },

        btn_union_click() {
            var arr = ['Apple', 'Banana', 'Mango', 'Cherry'];
            syn.$l.get('txt_union').value = $array.union(arr, ['Grape', 'Banana', 'BlueBarry']);
        },

        btn_difference_click() {
            var arr = ['Apple', 'Banana', 'Mango', 'Cherry'];
            syn.$l.get('txt_difference').value = $array.difference(arr, ['Grape', 'Banana', 'BlueBarry']);
        },

        btn_intersect_click() {
            var arr = ['Apple', 'Banana', 'Mango', 'Cherry'];
            syn.$l.get('txt_intersect').value = $array.intersect(arr, ['Grape', 'Banana', 'BlueBarry']);
        },

        btn_symmetryDifference_click() {
            var arr = ['Apple', 'Banana', 'Mango', 'Cherry'];
            syn.$l.get('txt_symmetryDifference').value = $array.symmetryDifference(arr, ['Grape', 'Banana', 'BlueBarry']);
        },

        btn_ranks_click() {
            var arr = [79, 5, 18, 5, 32, 1, 16, 1, 82, 13];
            syn.$l.get('txt_ranks').value = $array.ranks(arr);
        },
    },
};

'use strict';
let $extension_date = {
    extends: [
        'parsehtml'
    ],

    event: {
        btn_now_click() {
            syn.$l.get('txt_now').value = $date.now().toString();
        },

        btn_clone_click() {
            var date = $date.now();
            var cloneDate = $date.clone(date);
            syn.$l.get('txt_clone').value = cloneDate.toString();
        },

        btn_isBetween_click() {
            var date = $date.now();
            syn.$l.get('txt_isBetween').value = $date.isBetween(date, new Date('2023-10-22T03:24:00'), new Date('2023-12-31T03:24:00'))
        },

        btn_equals_click() {
            var date = $date.now();
            var cloneDate = $date.clone(date);
            syn.$l.get('txt_equals').value = $date.equals(date, cloneDate);
        },

        btn_equalDay_click() {
            var date = $date.now();
            var cloneDate = $date.clone(date);
            syn.$l.get('txt_equalDay').value = $date.equalDay(date, cloneDate);
        },

        btn_isToday_click() {
            var date = $date.now();
            syn.$l.get('txt_isToday').value = $date.isToday(date);
        },

        btn_toString_d_click() {
            var date = $date.now();
            syn.$l.get('txt_toString').value = $date.toString(date, 'd');
        },

        btn_toString_t_click() {
            var date = $date.now();
            syn.$l.get('txt_toString').value = $date.toString(date, 't');
        },

        btn_toString_a_click() {
            var date = $date.now();
            syn.$l.get('txt_toString').value = $date.toString(date, 'a');
        },

        btn_toString_f_click() {
            var date = $date.now();
            syn.$l.get('txt_toString').value = $date.toString(date, 'f');
        },

        btn_toString_s_click() {
            var date = $date.now();
            syn.$l.get('txt_toString').value = $date.toString(date, 's');
        },

        btn_toString_n_click() {
            var date = $date.now();
            syn.$l.get('txt_toString').value = $date.toString(date, 'n');
        },

        btn_toString_mdn_click() {
            var date = $date.now();
            syn.$l.get('txt_toString').value = $date.toString(date, 'mdn');
        },

        btn_toString_w_click() {
            var date = $date.now();
            syn.$l.get('txt_toString').value = $date.toString(date, 'w');
        },

        btn_toString_wn_click() {
            var date = $date.now();
            syn.$l.get('txt_toString').value = $date.toString(date, 'wn');
        },

        btn_toString_m_click() {
            var date = $date.now();
            syn.$l.get('txt_toString').value = $date.toString(date, 'm');
        },

        btn_toString_ym_click() {
            var date = $date.now();
            syn.$l.get('txt_toString').value = $date.toString(date, 'ym');
        },

        btn_toString_day_click() {
            var date = $date.now();
            syn.$l.get('txt_toString').value = $date.toString(date);
        },

        btn_addSecond_click() {
            var date = $date.now();
            syn.$l.get('txt_toTimeCount').value = $date.addSecond(date, 1).toString();
        },

        btn_addMinute_click() {
            var date = $date.now();
            syn.$l.get('txt_toTimeCount').value = $date.addMinute(date, 1).toString();
        },

        btn_addHour_click() {
            var date = $date.now();
            syn.$l.get('txt_toTimeCount').value = $date.addHour(date, 1).toString();
        },

        btn_addDay_click() {
            var date = $date.now();
            syn.$l.get('txt_toTimeCount').value = $date.addDay(date, 1).toString();
        },

        btn_addWeek_click() {
            var date = $date.now();
            syn.$l.get('txt_toTimeCount').value = $date.addWeek(date, 1).toString();
        },

        btn_addMonth_click() {
            var date = $date.now();
            syn.$l.get('txt_toTimeCount').value = $date.addMonth(date, 1).toString();
        },

        btn_addYear_click() {
            var date = $date.now();
            syn.$l.get('txt_toTimeCount').value = $date.addYear(date, 1).toString();
        },

        btn_getFirstDate_click() {
            var date = $date.now();
            syn.$l.get('txt_getFirstLastDate').value = $date.getFirstDate(date).toString();
        },

        btn_getLastDate_click() {
            var date = $date.now();
            syn.$l.get('txt_getFirstLastDate').value = $date.getLastDate(date).toString();
        },

        btn_diff_second_click() {
            var date = $date.now();
            var diffDate = $date.addSecond(date, 10);
            syn.$l.get('txt_toDiffCount').value = $date.diff(date, diffDate, 'second').toString();
        },

        btn_diff_minute_click() {
            var date = $date.now();
            var diffDate = $date.addMinute(date, 1);
            syn.$l.get('txt_toDiffCount').value = $date.diff(date, diffDate, 'minute').toString();
        },

        btn_diff_hour_click() {
            var date = $date.now();
            var diffDate = $date.addHour(date, 1);
            syn.$l.get('txt_toDiffCount').value = $date.diff(date, diffDate, 'hour').toString();
        },

        btn_diff_day_click() {
            var date = $date.now();
            var diffDate = $date.addDay(date, 1);
            syn.$l.get('txt_toDiffCount').value = $date.diff(date, diffDate, 'day').toString();
        },

        btn_diff_week_click() {
            var date = $date.now();
            var diffDate = $date.addWeek(date, 1);
            syn.$l.get('txt_toDiffCount').value = $date.diff(date, diffDate, 'week').toString();
        },

        btn_diff_month_click() {
            var date = $date.now();
            var diffDate = $date.addMonth(date, 1);
            syn.$l.get('txt_toDiffCount').value = $date.diff(date, diffDate, 'month').toString();
        },

        btn_diff_year_click() {
            var date = $date.now();
            var diffDate = $date.addYear(date, 1);
            syn.$l.get('txt_toDiffCount').value = $date.diff(date, diffDate, 'year').toString();
        },

        btn_toTicks_click() {
            var date = $date.now();
            syn.$l.get('txt_toTicks').value = $date.toTicks(date);
        },

        btn_isDate_click() {
            syn.$l.get('txt_isDate').value = $date.isDate('2023-12-31T00:00:00');
        },

        btn_isISOString_click() {
            syn.$l.get('txt_isISOString').value = $date.isISOString('2023-12-11T01:51:53.115Z');
        },

        btn_weekOfMonth_click() {
            var weekOfMonths = $date.weekOfMonth(2023, 12);
            syn.$l.get('txt_weekOfMonth').value = JSON.stringify(weekOfMonths);
        },
    },
};

'use strict';
let $extension_number = {
    extends: [
        'parsehtml'
    ],

    event: {
        btn_duration_click() {
            syn.$l.get('txt_duration').value = $number.duration(100000000);
        },

        btn_toByteString_click() {
            syn.$l.get('txt_toByteString').value = $number.toByteString(100000000);
        },

        btn_random_click() {
            syn.$l.get('txt_random').value = $number.random(1, 10000);
        },

        btn_isRange_click() {
            syn.$l.get('txt_isRange').value = $number.isRange($number.random(1, 100), 30, 80);
        },

        btn_limit_click() {
            syn.$l.get('txt_limit').value = $number.limit($number.random(1, 100), 30, 80);
        },

        btn_percent_click() {
            syn.$l.get('txt_percent').value = $number.percent($number.random(1, 10000), 10000);
        }
    }
};

'use strict';
let $extension_object = {
    extends: [
        'parsehtml'
    ],

    event: {
        btn_isNullOrUndefined_click() {
            syn.$l.get('txt_isNullOrUndefined').value = `${$object.isNullOrUndefined('')}, ${$object.isNullOrUndefined(undefined)}, ${$object.isNullOrUndefined(null)}, ${$object.isNullOrUndefined({})}`;
        },

        btn_toCSV_click() {
            syn.$l.get('txt_toCSV').value = $object.toCSV([{ a: 1, b: 2 }, { a: 3, b: 4, c: 5 }, { a: 6 }, { b: 7 }], ['a', 'b'], ';');
        },

        btn_toParameterString_click() {
            var json = {
                symbol: 'hello world1',
                price: 12345,
                date: new Date(),
                boolean: true
            };

            syn.$l.get('txt_toParameterString').value = $object.toParameterString(json);
        },

        btn_getType_click() {
            syn.$l.get('txt_getType').value = `${$object.getType('')}, ${$object.getType(12345)}, ${$object.getType(true)}, ${$object.getType({})}, ${$object.getType(new Date())}, ${$object.getType(null)}, ${$object.getType(syn.$l.get('txt_getType'))}`;
        },

        btn_defaultValue_click() {
            syn.$l.get('txt_defaultValue').value = `${$object.defaultValue('string')}, ${$object.defaultValue('bool')}, ${$object.defaultValue('date')}, ${$object.defaultValue('number')}`;
        },

        btn_isDefined_click() {
            syn.$l.get('txt_valueType').value = $object.isDefined(undefined);
        },

        btn_isNull_click() {
            syn.$l.get('txt_valueType').value = $object.isNull(null);
        },

        btn_isArray_click() {
            syn.$l.get('txt_valueType').value = $object.isArray([]);
        },

        btn_isDate_click() {
            syn.$l.get('txt_valueType').value = $object.isDate(new Date());
        },

        btn_isString_click() {
            syn.$l.get('txt_valueType').value = $object.isString('');
        },

        btn_isNumber_click() {
            syn.$l.get('txt_valueType').value = $object.isNumber(12345);
        },

        btn_isFunction_click() {
            syn.$l.get('txt_valueType').value = $object.isFunction(() => { });
        },

        btn_isObject_click() {
            syn.$l.get('txt_valueType').value = $object.isObject({});
        },

        btn_isObjectEmpty_click() {
            syn.$l.get('txt_valueType').value = $object.isObjectEmpty({});
        },

        btn_isBoolean_click() {
            syn.$l.get('txt_valueType').value = $object.isBoolean(false);
        },

        btn_isEmpty_click() {
            syn.$l.get('txt_isEmpty').value = $object.isEmpty([]);
        },
    },
};

'use strict';
let $extension_string = {
    extends: [
        'parsehtml'
    ],

    event: {
        btn_toValue_click() {
            syn.$l.get('txt_toValue').value = `${$string.toValue('hello world')}, ${$string.toValue(new Date())}, ${$string.toValue({})}, ${$string.toValue(true)}, ${$string.toValue(null, 'default')}`;
        },

        btn_br_click() {
            syn.$l.get('txt_br').value = $string.br('hello\nworld');
        },

        btn_interpolate_click() {
            var json = {
                symbol: 'hello world',
                price: 12345,
                date: new Date(),
                boolean: true
            };

            syn.$l.get('txt_interpolate').value = $string.interpolate(`<span>#{symbol}</span> <span>#{price}</span> <span>#{date}</span> <span>#{boolean}</span>`, json);
        },

        btn_interpolates_click() {
            var json = [
                {
                    symbol: 'hello world1',
                    price: 12345,
                    date: new Date(),
                    boolean: true
                },
                {
                    symbol: 'hello world2',
                    price: 12345,
                    date: new Date(),
                    boolean: true
                },
                {
                    symbol: 'hello world3',
                    price: 12345,
                    date: new Date(),
                    boolean: true
                }
            ];

            syn.$l.get('txt_interpolate').value = $string.interpolate(`<span>#{symbol}</span> <span>#{price}</span> <span>#{date}</span> <span>#{boolean}</span>`, json);
        },

        btn_isNullOrEmpty_click() {
            syn.$l.get('txt_isNullOrEmpty').value = `${$string.isNullOrEmpty('')}, ${$string.isNullOrEmpty(undefined)}, ${$string.isNullOrEmpty(null)}, ${$string.isNullOrEmpty({})}`;
        },

        btn_sanitizeHTML_click() {
            syn.$l.get('txt_sanitizeHTML').value = $string.sanitizeHTML('<label class="form-label">$string.isNullOrEmpty()</label>');
        },

        btn_cleanHTML_click() {
            syn.$l.get('txt_cleanHTML').value = $string.cleanHTML('<label class="form-label">$string.isNullOrEmpty()</label>');
        },

        btn_toHtmlChar_click() {
            syn.$l.get('txt_toHtmlChar').value = $string.toHtmlChar('<label class="form-label">$string.isNullOrEmpty()</label>');
        },

        btn_toCharHtml_click() {
            syn.$l.get('txt_toCharHtml').value = $string.toCharHtml('&lt;label class="form-label"&gt;$string.isNullOrEmpty()&lt;/label&gt;');
        },

        btn_length_click() {
            syn.$l.get('txt_length').value = $string.length('안녕하세요 hello world');
        },

        btn_split_click() {
            syn.$l.get('txt_split').value = JSON.stringify($string.split('1,2,3,4,5', ','));
        },

        btn_isNumber_click() {
            syn.$l.get('txt_isNumber').value = $string.isNumber('-12,345.123');
        },

        btn_toNumber_click() {
            syn.$l.get('txt_toNumber').value = $string.toNumber('-12,345.123');
        },

        btn_capitalize_click() {
            syn.$l.get('txt_capitalize').value = $string.capitalize('aaa bbb ccc');
        },

        btn_toJson_click() {
            var json = $string.toJson('col1;col2\na;b\nc;d', {
                delimeter: ';'
            });
            syn.$l.get('txt_toJson').value = JSON.stringify(json);
        },

        btn_toParameterObject_click() {
            var json = $string.toParameterObject('@Name1:Value1;@Name2:Value2;@Name3:Value3');
            syn.$l.get('txt_toParameterObject').value = JSON.stringify(json);
        },

        btn_toBoolean_click() {
            syn.$l.get('txt_toBoolean').value = `${$string.toBoolean('true')}, ${$string.toBoolean('True')}, ${$string.toBoolean('TRUE')}, ${$string.toBoolean('Y')}, ${$string.toBoolean('1')}, ${$string.toBoolean(true)}`;
        },

        btn_toDynamic_click() {
            syn.$l.get('txt_toDynamic').value = `${$string.toDynamic('true')}, ${$string.toDynamic('')}, ${$string.toDynamic('', true)}, ${$string.toDynamic('12345')}, ${$string.toDynamic('2023-12-11T04:45:56.558Z')}`;
        },

        btn_toParseType_click() {
            syn.$l.get('txt_toParseType').value = `${$string.toParseType('true', 'bool')}, ${$string.toParseType('')}, ${$string.toParseType('12345', 'number')}, ${$string.toParseType('2023-12-11T04:45:56.558Z', 'date')}`;
        },

        btn_toNumberString_click() {
            syn.$l.get('txt_toNumberString').value = $string.toNumberString('f-1,234.12');
        },
    }
};

```

## 일관된 JavaScript 개발 코드의 중요성

- HandStack 화면은 `syn.js` 와 `syn.uicontrols.js` JavaScript 라이브러리를 이용해 일관 되고 편리한 UI/UX를 제공합니다.
- 이 라이브러리들은 화면의 공통 로직을 처리하고, 개발자가 비즈니스 로직에 집중할 수 있도록 돕습니다.
- 기본적으로 화면은 하나의 Javascript를 반드시 필요로 하며, 해당 스크립트의 파일명과 객체의 이름은 동일하게 부여합니다. 예를 들어 JavaScript 코드를 다음과 같이 만듭니다.

```js // JavaScript 코드 구성
'use strict';
let $FILEID = {
    // 화면 구성에 필요한 환경설정
    config: {
    },

    // 화면내 전역변수 선언
    prop: {
    },

    // life cycle, 외부 이벤트 hook 선언
    hook: {
    },

    // 사용자 이벤트 핸들러 선언
    event: {
    },

    // 거래 메서드 선언
    transaction: {
    },

    // 기능 메서드 선언
    method: {
    }
};

```

```js // JavaScript 코드 예제
'use strict';
let $TST010 = {
    config: {
        actionButtons: [{
            command: 'refresh',
            icon: 'refresh',
            action(evt) {
                location.reload();
            }
        }]
    },

    prop: {
        codeHelpID: null,
        activeRow: null,
        adjustHeight: 354
    },

    transaction: {
        LD01: {
            inputs: [{ type: 'Row', dataFieldID: 'MainForm' }],
            outputs: [{ type: 'Grid', dataFieldID: 'CodeDetail1' }]
        }
    },

    hook: {
        frameEvent(eventName, jsonObject) {
            if (eventName == 'buttonCommand') {
                switch (jsonObject.actionID) {
                    case 'search':
                        $this.method.search();
                        break;
                }
            }
        },

        pageLoad() {
            // $this.method.search();
        },

        pageResizing(dimension) {
            var height = dimension.windowHeight - $this.prop.adjustHeight;
            var adjustHeight = height < 300 ? 300 : height;
            syn.uicontrols.$auigrid.setControlSize('grdGrid1', { height: adjustHeight });
        },

        beforeTransaction(transactConfig) {
            if (transactConfig.functionID == 'LD01') {

            }
        },

        afterTransaction(error, functionID, responseData, addtionalData) {
            if ($object.isNullOrUndefined(error) == false) {
                syn.$l.eventLog('$this.hook.afterTransaction', `${functionID}: ${JSON.stringify(error)}`, 'Warning');
                return;
            }

            if (functionID == 'LD01') {
                syn.uicontrols.$auigrid.selectCell('grdGrid1', 0, 0);
            }
        }
    },

    event: {
        btnAddRow_click() {

        },
		
        txtApplicationID_click(evt) {
            console.log($this.prop.custom1);
        },
        
        txtApplicationName_focus(evt) {
            console.log($this.prop.custom2.toString());
        },
        
        txtApplicationName_change(evt) {
            console.log($this.prop.custom3.toString());
        },

        grdGrid1_afterSelectionEnd(elID, rowIndex, columnIndex, dataField, value) {
            if ($this.prop.activeRow != rowIndex) {
                // syn.$w.transactionAction('LD02');
            }

            $this.prop.activeRow = rowIndex;
        }
    },

    method: {
        search() {
            syn.$w.transactionAction('LD01');
        }
    }
}
```

## 기본 공통 컨트롤

JavaScript 내에서 컨트롤을 사용하기 위해 `syn.uicontrols.`와 약어를 조합하여 사용합니다. 예를 들어 CheckBox 의 경우 `syn.uicontrols.$checkbox` 로 코드를 작성합니다.

| 약어 | 컨트롤 이름 | 설명 |
| --- | --- | --- |
| `$checkbox` | CheckBox | 브라우저마다 다른 체크박스를 일관되게 표현합니다. |
| `$codepicker` | CodePicker | 코드도움 팝업 기능을 제공합니다. |
| `$colorpicker`| ColorPicker | 색상 팔레트를 제공합니다. |
| `$contextmenu`| ContextMenu | 오른쪽 마우스 버튼 컨텍스트 메뉴를 제공합니다. |
| `$data` | DataSource | 단일/여러 건의 데이터 소스 객체 기능을 제공합니다. |
| `$datepicker` | DatePicker | 날짜 선택 기능을 제공합니다. |
| `$dateperiodpicker` | DatePeriodPicker | 시작 및 종료 기간 날짜 선택 기능을 제공합니다. |
| `$select` | DropDownList | 단일 항목 선택 콤보박스를 제공합니다. |
| `$multiselect`| DropDownCheckList | 여러 항목 선택 콤보박스를 제공합니다. |
| `$element` | Element | HTML 항목의 `getValue`, `setValue` 기능을 제공합니다. |
| `$fileclient`| FileClient | 파일 업로드/다운로드 기능을 제공합니다. |
| `$list` | GridList | 데이터 조회에 특화된 기능을 제공합니다. |
| `$guide` | Guide | 화면 내 표시되는 도움말 기능을 제공합니다. |
| `$htmleditor`| HtmlEditor | 파일 업로드/다운로드 통합 HTML 편집기를 제공합니다. |
| `$organization`| OrganizationView | 조직도 데이터를 직관적으로 편집하는 기능을 제공합니다. |
| `$radio` | RadioButton | 브라우저마다 다른 라디오버튼을 일관되게 표현합니다. |
| `$sourceeditor`| SourceEditor | 소스 편집에 특화된 에디터 기능을 제공합니다. |
| `$textarea` | TextArea | 여러 텍스트 줄 관리 기능을 제공합니다. |
| `$textbox` | TextBox | 단일 텍스트 관리 기능을 제공합니다. |
| `$button` | Button | 버튼 관리 추가 기능을 제공합니다. |
| `$tree` | TreeView | 트리 구조를 표현하는 기능을 제공합니다. |
| `$auigrid` | AUIGrid | 대량 편집 그리드 기능을 제공합니다. |

### $checkbox CheckBox 예제 코드
```js
'use strict';
let $checkbox = {
    event: {
        btnGetValue_click() {
            syn.$l.eventLog('btnGetValue_click', JSON.stringify(syn.uicontrols.$checkbox.getValue('chkUseYN1')));
        },

        btnSetValue_click() {
            syn.uicontrols.$checkbox.setValue('chkUseYN1', true);
        },

        btnClear_click() {
            syn.uicontrols.$checkbox.clear('chkUseYN1');
        },

        btnToggleValue_click() {
            syn.uicontrols.$checkbox.toggleValue('chkUseYN2');
        },

        btnGetGroupNames_click() {
            syn.$l.eventLog('btnGetGroupNames_click', JSON.stringify(syn.uicontrols.$checkbox.getGroupNames()));
        }
    }
}
```

### $codepicker CodePicker 예제 코드
```js
'use strict';
let $codepicker = {
    hook: {
        frameEvent(eventName, jsonObject) {
            syn.$l.eventLog('ui_event', 'frameEvent - eventName: {0}, jsonObject: {1}'.format(eventName, JSON.stringify(jsonObject)));
        },
    },

    event: {
        btnGetValue_click() {
            syn.$l.eventLog('btnGetValue_click', JSON.stringify(syn.uicontrols.$codepicker.getValue('chpSubjectID')));
        },

        btnSetValue_click() {
            syn.uicontrols.$codepicker.setValue('chpSubjectID', 'HELLO');
        },

        btnClear_click() {
            syn.uicontrols.$codepicker.clear('chpSubjectID');
        },

        btnOpen_click() {
            syn.uicontrols.$codepicker.open('chpSubjectID');


        },

        btnSetText_click() {
            syn.uicontrols.$codepicker.setText('chpSubjectID', 'WORLD');
        },

        btnToParameterString_click() {
            var parameterObject = syn.uicontrols.$codepicker.toParameterObject('@ApplicationID:1;@ApplicationName:HELLO WORLD;');
            syn.$l.eventLog('btnToParameterString_click', JSON.stringify(parameterObject));
        },

        btnToParameterObject_click() {
            var parameterObject = syn.uicontrols.$codepicker.toParameterObject('@ApplicationID:1;@ApplicationName:HELLO WORLD;');
            parameterObject.ApplicationID = '0';
            var parameterString = syn.uicontrols.$codepicker.toParameterString(parameterObject);
            syn.$l.eventLog('btnToParameterObject_click', parameterString);
        },

        chpSubjectID_change(previousValue, previousText, changeValue) {
        }
    }
}

```

### $contextmenu ContextMenu 예제 코드
```js
'use strict';
let $contextmenu = {
    event: {
        btnGetControl_click() {
            var ctxButtonControl = syn.uicontrols.$contextmenu.getControl('ctxButtonControl');
            // https://github.com/mar10/jquery-ui-contextmenu
        },

        ctxButtonControl_close(evt, ui) {
            syn.$l.eventLog('ctxButtonControl_close', this.id);
        },

        ctxButtonControl_beforeOpen(evt, ui) {
            syn.$l.eventLog('ctxButtonControl_beforeOpen', evt.delegateTarget.id);
        },

        ctxButtonControl_open(evt, ui) {
            syn.$l.eventLog('ctxButtonControl_open', evt.delegateTarget.id);
        },

        ctxButtonControl_select(evt, ui) {
            syn.$l.eventLog('ctxButtonControl_select', ui.cmd);
        }
    }
}

```

### $data DataSource 예제 코드
```js
'use strict';
let $datasource = {
    prop: {
        metaColumns: {
            "ApplicationID": {
                "FieldID": "ApplicationID",
                "DataType": "string"
            },
            "CodeGroupID": {
                "FieldID": "CodeGroupID",
                "DataType": "string"
            },
            "CodeID": {
                "FieldID": "CodeID",
                "DataType": "string"
            },
            "CodeValue": {
                "FieldID": "CodeValue",
                "DataType": "string"
            }
        },

        tempDataList: [
            {
                "ApplicationID": 1,
                "CodeGroupID": "CMM001",
                "CodeID": "0",
                "CodeValue": "권한없음",
                "Custom1": "",
                "Custom2": "",
                "Custom3": "",
                "SelectYN": false,
                "SortingOrder": 1,
                "UseYN": true,
                "Remark": "",
                "CreateUserID": 0
            },
            {
                "ApplicationID": 1,
                "CodeGroupID": "CMM001",
                "CodeID": "1",
                "CodeValue": "권한존재",
                "Custom1": "",
                "Custom2": "",
                "Custom3": "",
                "SelectYN": false,
                "SortingOrder": 2,
                "UseYN": true,
                "Remark": "",
                "CreateUserID": 0
            }
        ],

        dataSet: [
            {
                "id": "1",
                "name": "Tiger Nixon",
                "position": "System Architect",
                "salary": "$320,800",
                "start_date": "2011/04/25",
                "office": "Edinburgh",
                "extn": "5421"
            },
            {
                "id": "2",
                "name": "Garrett Winters",
                "position": "Accountant",
                "salary": "$170,750",
                "start_date": "2011/07/25",
                "office": "Tokyo",
                "extn": "8422"
            },
            {
                "id": "3",
                "name": "Ashton Cox",
                "position": "Junior Technical Author",
                "salary": "$86,000",
                "start_date": "2009/01/12",
                "office": "San Francisco",
                "extn": "1562"
            }
        ]
    },

    event: {
        btnGetValue_click() {
            syn.$l.eventLog('btnGetValue_click', JSON.stringify(syn.uicontrols.$data.getValue('lstDataTable')));
        },

        btnSetValue_click() {
            syn.uicontrols.$data.setValue('lstDataTable', $this.prop.dataSet);
        },

        btnClear_click() {
            syn.uicontrols.$data.clear('lstDataTable');
        },

        btnInsertRow_click() {
            syn.uicontrols.$grid.insertRow('grdGrid', {
                amount: 1
            });
        },

        btnRemoveRow_click() {
            syn.uicontrols.$grid.removeRow('grdGrid');
        },
    }
}

```

### $datepicker DatePicker 예제 코드
```js
'use strict';
let $datepicker = {
    event: {
        btnGetValue_click() {
            syn.$l.eventLog('btnGetValue_click', JSON.stringify(syn.uicontrols.$datepicker.getValue('dtpDatePicker')));
        },

        btnSetValue_click() {
            syn.uicontrols.$datepicker.setValue('dtpDatePicker', '2020-02-28');
        },

        btnClear_click() {
            syn.uicontrols.$datepicker.clear('dtpDatePicker');
        },

        btnGetControl_click() {
            var picker = syn.uicontrols.$datepicker.getControl('dtpDatePicker');
            // https://github.com/Pikaday/Pikaday 메서드 참조
        }
    }
}

```

### $dateperiodpicker DatePeriodPicker 예제 코드
```js
'use strict';
let $dateperiodpicker = {
    event: {
        btnGetValue_click() {
            syn.$l.eventLog('btnGetValue_click', JSON.stringify(syn.uicontrols.$dateperiodpicker.getValue('dtpDatePeriodPicker')));
        },

        btnSetValue_click() {
            syn.uicontrols.$dateperiodpicker.setValue('dtpCreatedRangeAt', `${$date.toString($date.addMonth(new Date(), periodMonth), 'd')},${$date.toString(new Date(), 'd')}`);
        },

        btnClear_click() {
            syn.uicontrols.$dateperiodpicker.clear('dtpDatePeriodPicker');
        },

        btnGetControl_click() {
            var picker = syn.uicontrols.$dateperiodpicker.getControl('dtpDatePeriodPicker');
            // https://github.com/Pikaday/Pikaday 메서드 참조
        }
    }
}

```

### $select DropDownList 예제 코드
```js
'use strict';
let $dropdownlist = {
    config: {
        programID: 'OMS',
        businessID: 'SMP',
        systemID: 'BOP01',
        transactionID: 'SMP110',
        screenID: 'dropdownlist',
        dataSource: {
            CMM001: {
                CodeColumnID: 'CodeID',
                ValueColumnID: 'CodeValue',
                DataSource: [
                    {
                        CodeID: '0',
                        CodeValue: '권한없음'
                    },
                    {
                        CodeID: '1',
                        CodeValue: '권한존재'
                    }
                ]
            },
            CMM002: {
                CodeColumnID: 'CodeID',
                ValueColumnID: 'CodeValue',
                DataSource: [
                    {
                        CodeID: '0',
                        CodeValue: '남자'
                    },
                    {
                        CodeID: '1',
                        CodeValue: '여자'
                    },
                    {
                        CodeID: '2',
                        CodeValue: '공개안함'
                    }
                ]
            }
        },
        transactions: []
    },

    event: {
        btnGetValue_click() {
            syn.$l.eventLog('btnGetValue_click', JSON.stringify(syn.uicontrols.$select.getValue('ddlFileExtension')));
        },

        btnSetValue_click() {
            syn.uicontrols.$select.setValue('ddlFileExtension', '02');
        },

        btnClear_click() {
            syn.uicontrols.$select.clear('ddlFileExtension');
        },

        btnLoadData_click() {
            var dataSource = {
                CodeColumnID: 'CodeID',
                ValueColumnID: 'CodeValue',
                DataSource: [
                    {
                        CodeID: '0',
                        CodeValue: '남자'
                    },
                    {
                        CodeID: '1',
                        CodeValue: '여자'
                    },
                    {
                        CodeID: '2',
                        CodeValue: '공개안함'
                    }
                ]
            };

            syn.uicontrols.$select.loadData('ddlFileExtension', dataSource, true);
        },

        btnControlReload_click() {
            syn.uicontrols.$select.controlReload('ddlFileExtension');
        },

        btnGetSelectedIndex_click() {
            syn.$l.eventLog('btnGetSelectedIndex_click', syn.uicontrols.$select.getSelectedIndex('ddlFileExtension'));
        },

        btnSetSelectedIndex_click() {
            syn.uicontrols.$select.setSelectedIndex('ddlFileExtension', 3);
        },

        btnGetSelectedValue_click() {
            syn.$l.eventLog('btnGetSelectedValue_click', syn.uicontrols.$select.getSelectedValue('ddlFileExtension'));
        },

        btnGetSelectedText_click() {
            syn.$l.eventLog('btnGetSelectedText_click', syn.uicontrols.$select.getSelectedText('ddlFileExtension'));
        },

        btnSetSelectedValue_click() {
            syn.$l.eventLog('btnSetSelectedValue_click', syn.uicontrols.$select.setSelectedValue('ddlFileExtension', '1'));
        },

        btnSetSelectedText_click() {
            syn.$l.eventLog('btnSetSelectedText_click', syn.uicontrols.$select.setSelectedText('ddlFileExtension', '초2'));
        },

        btnGetControl_click() {
            var picker = syn.uicontrols.$select.getControl('ddlFileExtension');
            // https://github.com/pytesNET/tail.select/wiki 메서드 참조
        },

        btnDataRefresh_click() {
            syn.uicontrols.$select.dataRefresh('ddlBusinessRank', {
                dataSourceID: 'CHP001',
                storeSourceID: 'SYS002',
                parameters: '@GroupCode:SYS002;',
                local: false,
                toSynControl: false,
                required: true,
                selectedValue: '5'
            }, function () {
                alert('do....');
            });
        }
    }
}

```

### $multiselect DropDownCheckList 예제 코드
```js
'use strict';
let $dropdownchecklist = {
    event: {
        btnGetValue_click() {
            syn.$l.eventLog('btnGetValue_click', JSON.stringify(syn.uicontrols.$multiselect.getValue('ddlFileExtension')));
        },

        btnSetValue_click() {
            syn.uicontrols.$multiselect.setValue('ddlFileExtension', ['0', '2']);
        },

        btnClear_click() {
            syn.uicontrols.$multiselect.clear('ddlFileExtension');
        },

        btnLoadData_click() {
            var dataSource = {
                CodeColumnID: 'CodeID',
                ValueColumnID: 'CodeValue',
                DataSource: [
                    {
                        CodeID: '0',
                        CodeValue: '남자'
                    },
                    {
                        CodeID: '1',
                        CodeValue: '여자'
                    },
                    {
                        CodeID: '2',
                        CodeValue: '공개안함'
                    }
                ]
            };

            syn.uicontrols.$multiselect.loadData('ddlFileExtension', dataSource, true);
        },

        btnControlReload_click() {
            syn.uicontrols.$multiselect.controlReload('ddlFileExtension');
        },

        btnGetSelectedIndex_click() {
            syn.$l.eventLog('btnGetSelectedIndex_click', syn.uicontrols.$multiselect.getSelectedIndex('ddlFileExtension'));
        },

        btnSetSelectedIndex_click() {
            syn.uicontrols.$multiselect.setSelectedIndex('ddlFileExtension', 3);
        },

        btnGetSelectedValue_click() {
            syn.$l.eventLog('btnGetSelectedValue_click', syn.uicontrols.$multiselect.getSelectedValue('ddlFileExtension'));
        },

        btnGetSelectedText_click() {
            syn.$l.eventLog('btnGetSelectedText_click', syn.uicontrols.$multiselect.getSelectedText('ddlFileExtension'));
        },

        btnSetSelectedValue_click() {
            syn.uicontrols.$multiselect.setSelectedValue('ddlFileExtension', '1');

            setTimeout(function () {
                var values = [];
                values.push('1');
                values.push('2');
                values.push('3');
                values.push('4');
                syn.uicontrols.$multiselect.setSelectedValue('ddlFileExtension', values);
            }, 10000);
        },

        btnSetSelectedText_click() {
            syn.$l.eventLog('btnSetSelectedText_click', syn.uicontrols.$multiselect.setSelectedText('ddlFileExtension', '중2'));

            setTimeout(function () {
                var values = [];
                values.push('초4');
                values.push('초5');
                values.push('초6');
                syn.uicontrols.$multiselect.setSelectedText('ddlFileExtension', values);
            }, 10000);
        },

        btnGetControl_click() {
            var picker = syn.uicontrols.$multiselect.getControl('ddlFileExtension');
            // https://github.com/pytesNET/tail.select/wiki 메서드 참조
        },

        btnDataRefresh_click() {
            syn.uicontrols.$multiselect.dataRefresh('ddlBusinessRank', {
                dataSourceID: 'ZCB001',
                parameters: '@CodeGroupID:CMM013;',
                local: false,
                toSynControl: false,
                required: true,
                selectedValue: ['2', '5', '7']
            });
        }
    }
}

```

### $fileclient FileClient 예제 코드
```js
'use strict';
let $files = {
    event: {
        btnProfile1FileGetValue_click() {
            syn.$l.eventLog('btnProfile1FileGetValue_click', JSON.stringify(syn.uicontrols.$fileclient.getValue('txtProfile1FileID')));
        },

        btnProfile1FileSetValue_click() {
            syn.uicontrols.$fileclient.setValue('txtProfile1FileID', 'e9259ffe12534c83957906bdb2ff7d6b');
        },

        btnProfile1FileClear_click() {
            syn.uicontrols.$fileclient.clear('txtProfile1FileID');
        },

        btnProfile1FileUpload_click() {
            var uploadOptions = syn.uicontrols.$fileclient.getFileSetting('txtProfile1FileID');
            uploadOptions.fileUpdateCallback = 'fleProfile1File_Callback';
            uploadOptions.dependencyID = syn.$l.get('txtProfile1DependencyID').value != '' ? syn.$l.get('txtProfile1DependencyID').value : syn.uicontrols.$fileclient.getTemporaryDependencyID('txtProfile1DependencyID');
            uploadOptions.minHeight = 386;
            uploadOptions.profileFileName = '{0}_{1}'.format(syn.$w.Variable.ApplicationID, syn.$w.Variable.ApplicationNo);

            syn.uicontrols.$fileclient.uploadUI(uploadOptions);
        },

        btnProfile1FileDownload_click() {
            syn.uicontrols.$fileclient.fileDownload('txtProfile1FileID');
        },

        fleProfile1File_Callback(action, result) {
            syn.$l.eventLog('btnProfile1GetItem_click', action + ', ' + JSON.stringify(result));
        },

        btnProfile1GetItem_click() {
            syn.uicontrols.$fileclient.getItem('txtProfile1FileID', syn.$l.get('txtProfile1FileID').value, function (result) {
                syn.$l.eventLog('btnProfile1GetItem_click', JSON.stringify(result));
            });
        },

        btnProfile1DeleteItem_click() {
            syn.uicontrols.$fileclient.deleteItem('txtProfile1FileID', syn.$l.get('txtProfile1FileID').value, function (result) {
                syn.$l.eventLog('btnProfile1DeleteItem_click', JSON.stringify(result));
            });
        },

        btnProfile1UpdateDependencyID_click() {
            syn.uicontrols.$fileclient.updateDependencyID('txtProfile1FileID', syn.$l.get('txtProfile1DependencyID').value, 'targetDependencyID', function (result) {
                syn.$l.eventLog('btnProfile1UpdateDependencyID_click', JSON.stringify(result));
            });
        },

        btnProfile1UpdateFileName_click() {
            syn.uicontrols.$fileclient.updateFileName('txtProfile1FileID', '10_12345', '1950_yn1950', function (result) {
                syn.$l.eventLog('btnProfile1UpdateFileName_click', JSON.stringify(result));
            });
        },

        btnSingleFileGetValue_click() {
            syn.$l.eventLog('btnSingleFileGetValue_click', JSON.stringify(syn.uicontrols.$fileclient.getValue('txtSingleFileID')));
        },

        btnSingleFileSetValue_click() {
            syn.uicontrols.$fileclient.setValue('txtSingleFileID', 'e9259ffe12534c83957906bdb2ff7d6b');
        },

        btnSingleFileClear_click() {
            syn.uicontrols.$fileclient.clear('txtSingleFileID');
        },

        btnSingleFileUpload_click() {
            var uploadOptions = syn.uicontrols.$fileclient.getFileSetting('txtSingleFileID');
            uploadOptions.fileUpdateCallback = 'fleSingleFile_Callback';
            uploadOptions.dependencyID = syn.$l.get('txtSingleDependencyID').value != '' ? syn.$l.get('txtSingleDependencyID').value : syn.uicontrols.$fileclient.getTemporaryDependencyID('txtSingleDependencyID');
            uploadOptions.minHeight = 360;

            syn.uicontrols.$fileclient.uploadUI(uploadOptions);
        },

        btnSingleFileDownload_click() {
            syn.uicontrols.$fileclient.fileDownload('txtSingleFileID');
        },

        fleSingleFile_Callback(action, result) {
            syn.$l.eventLog('btnSingleGetItem_click', action + ', ' + JSON.stringify(result));
        },

        btnSingleGetItem_click() {
            syn.uicontrols.$fileclient.getItem('txtSingleFileID', syn.$l.get('txtSingleFileID').value, function (result) {
                syn.$l.eventLog('btnSingleGetItem_click', JSON.stringify(result));
            });
        },

        btnSingleDeleteItem_click() {
            syn.uicontrols.$fileclient.deleteItem('txtSingleFileID', syn.$l.get('txtSingleFileID').value, function (result) {
                syn.$l.eventLog('btnSingleDeleteItem_click', JSON.stringify(result));
            });
        },

        btnSingleUpdateDependencyID_click() {
            syn.uicontrols.$fileclient.updateDependencyID('txtSingleFileID', syn.$l.get('txtSingleDependencyID').value, 'targetDependencyID', function (result) {
                syn.$l.eventLog('btnSingleUpdateDependencyID_click', JSON.stringify(result));
            });
        },

        btnMultiFileGetValue_click() {
            syn.$l.eventLog('btnMultiFileGetValue_click', JSON.stringify(syn.uicontrols.$fileclient.getValue('txtMultiFileID')));
        },

        btnMultiFileSetValue_click() {
            syn.uicontrols.$fileclient.setValue('txtMultiFileID', 'e9259ffe12534c83957906bdb2ff7d6b');
        },

        btnMultiFileClear_click() {
            syn.uicontrols.$fileclient.clear('txtMultiFileID');
        },

        btnMultiFileUpload_click() {
            var uploadOptions = syn.uicontrols.$fileclient.getFileSetting('txtMultiFileID');
            uploadOptions.fileUpdateCallback = 'fleMultiFile_Callback';
            uploadOptions.dependencyID = syn.$l.get('txtMultiDependencyID').value != '' ? syn.$l.get('txtMultiDependencyID').value : syn.uicontrols.$fileclient.getTemporaryDependencyID('txtMultiDependencyID');
            uploadOptions.minHeight = 360;

            syn.uicontrols.$fileclient.uploadUI(uploadOptions);
        },

        btnMultiFileDownload_click() {
            const itemID = syn.$l.get('txtMultiItemID').value;
            const setting = syn.uicontrols.$fileclient.getFileSetting('txtMultiFileID');
            let options = {
                repositoryID: setting.repositoryID,
                itemID: itemID,
                fileMD5: '',
                tokenID: setting.tokenID,
                applicationID: syn.uicontrols.$fileclient.applicationID,
                businessID: syn.uicontrols.$fileclient.businessID
            };

            syn.uicontrols.$fileclient.fileDownload(options);
        },

        fleMultiFile_Callback(action, result) {
            syn.$l.eventLog('btnMultiGetItem_click', action + ', ' + JSON.stringify(result));
        },

        btnMultiGetItem_click() {
            syn.uicontrols.$fileclient.getItem('txtMultiFileID', syn.$l.get('txtMultiItemID').value, function (result) {
                syn.$l.eventLog('btnMultiGetItem_click', JSON.stringify(result));
            });
        },

        btnMultiGetItems_click() {
            syn.uicontrols.$fileclient.getItems('txtMultiFileID', syn.$l.get('txtMultiDependencyID').value, function (result) {
                syn.$l.eventLog('btnMultiGetItem_click', JSON.stringify(result));
            });
        },

        btnMultiDeleteItem_click() {
            syn.uicontrols.$fileclient.deleteItem('txtMultiFileID', syn.$l.get('txtMultiItemID').value, function (result) {
                syn.$l.eventLog('btnMultiDeleteItem_click', JSON.stringify(result));
            });
        },

        btnMultiDeleteItems_click() {
            syn.uicontrols.$fileclient.deleteItems('txtMultiFileID', syn.$l.get('txtMultiDependencyID').value, function (result) {
                syn.$l.eventLog('btnMultiDeleteItems_click', JSON.stringify(result));
            });
        },

        btnMultiUpdateDependencyID_click() {
            syn.uicontrols.$fileclient.updateDependencyID('txtMultiFileID', syn.$l.get('txtMultiDependencyID').value, 'targetDependencyID', function (result) {
                syn.$l.eventLog('btnMultiUpdateDependencyID_click', JSON.stringify(result));
            });
        },

        btnImageLinkFileGetValue_click() {
            syn.$l.eventLog('btnImageLinkFileGetValue_click', JSON.stringify(syn.uicontrols.$fileclient.getValue('txtImageLinkFileID')));
        },

        btnImageLinkFileSetValue_click() {
            syn.uicontrols.$fileclient.setValue('txtImageLinkFileID', 'e9259ffe12534c83957906bdb2ff7d6b');
        },

        btnImageLinkFileClear_click() {
            syn.uicontrols.$fileclient.clear('txtImageLinkFileID');
        },

        btnImageLinkFileUpload_click() {
            var uploadOptions = syn.uicontrols.$fileclient.getFileSetting('txtImageLinkFileID');
            uploadOptions.fileUpdateCallback = '$this.method.fleImageLinkFileCallback';
            uploadOptions.dependencyID = syn.$l.get('txtImageLinkDependencyID').value != '' ? syn.$l.get('txtImageLinkDependencyID').value : syn.uicontrols.$fileclient.getTemporaryDependencyID('txtImageLinkDependencyID');
            uploadOptions.minHeight = 360;

            syn.uicontrols.$fileclient.uploadUI(uploadOptions);
        },

        btnImageLinkFileDownload_click() {
            syn.uicontrols.$fileclient.fileDownload('txtImageLinkFileID');
        },

        btnImageLinkGetItem_click() {
            syn.uicontrols.$fileclient.getItem('txtImageLinkFileID', syn.$l.get('txtImageLinkItemID').value, function (result) {
                syn.$l.eventLog('btnImageLinkGetItem_click', JSON.stringify(result));
            });
        },

        btnImageLinkGetItems_click() {
            syn.uicontrols.$fileclient.getItems('txtImageLinkFileID', syn.$l.get('txtImageLinkDependencyID').value, function (result) {
                syn.$l.eventLog('btnImageLinkGetItem_click', JSON.stringify(result));
            });
        },

        btnImageLinkDeleteItem_click() {
            syn.uicontrols.$fileclient.deleteItem('txtImageLinkFileID', syn.$l.get('txtImageLinkItemID').value, function (result) {
                syn.$l.eventLog('btnImageLinkDeleteItem_click', JSON.stringify(result));
            });
        },

        btnImageLinkDeleteItems_click() {
            syn.uicontrols.$fileclient.deleteItems('txtImageLinkFileID', syn.$l.get('txtImageLinkDependencyID').value, function (result) {
                syn.$l.eventLog('btnImageLinkDeleteItems_click', JSON.stringify(result));
            });
        },

        btnImageLinkUpdateDependencyID_click() {
            syn.uicontrols.$fileclient.updateDependencyID('txtImageLinkFileID', syn.$l.get('txtImageLinkDependencyID').value, 'targetDependencyID', function (result) {
                syn.$l.eventLog('btnImageLinkUpdateDependencyID_click', JSON.stringify(result));
            });
        }
    },

    method: {
        fleImageLinkFileCallback(action, result) {
            syn.$l.eventLog('btnImageLinkGetItem_click', action + ', ' + JSON.stringify(result));
        }
    }
}

```

### $list GridList 예제 코드
```js
'use strict';
let $gridlist = {
    prop: {
        dataSet: [
            {
                "id": "1",
                "name": "Tiger Nixon",
                "position": "System Architect",
                "salary": "$320,800",
                "start_date": "2011/04/25",
                "office": "Edinburgh",
                "extn": "5421"
            },
            {
                "id": "2",
                "name": "Garrett Winters",
                "position": "Accountant",
                "salary": "$170,750",
                "start_date": "2011/07/25",
                "office": "Tokyo",
                "extn": "8422"
            },
            {
                "id": "3",
                "name": "Ashton Cox",
                "position": "Junior Technical Author",
                "salary": "$86,000",
                "start_date": "2009/01/12",
                "office": "San Francisco",
                "extn": "1562"
            },
            {
                "id": "4",
                "name": "Cedric Kelly",
                "position": "Senior Javascript Developer",
                "salary": "$433,060",
                "start_date": "2012/03/29",
                "office": "Edinburgh",
                "extn": "6224"
            },
            {
                "id": "5",
                "name": "Airi Satou",
                "position": "Accountant",
                "salary": "$162,700",
                "start_date": "2008/11/28",
                "office": "Tokyo",
                "extn": "5407"
            },
            {
                "id": "6",
                "name": "Brielle Williamson",
                "position": "Integration Specialist",
                "salary": "$372,000",
                "start_date": "2012/12/02",
                "office": "New York",
                "extn": "4804"
            },
            {
                "id": "7",
                "name": "Herrod Chandler",
                "position": "Sales Assistant",
                "salary": "$137,500",
                "start_date": "2012/08/06",
                "office": "San Francisco",
                "extn": "9608"
            },
            {
                "id": "8",
                "name": "Rhona Davidson",
                "position": "Integration Specialist",
                "salary": "$327,900",
                "start_date": "2010/10/14",
                "office": "Tokyo",
                "extn": "6200"
            },
            {
                "id": "9",
                "name": "Colleen Hurst",
                "position": "Javascript Developer",
                "salary": "$205,500",
                "start_date": "2009/09/15",
                "office": "San Francisco",
                "extn": "2360"
            },
            {
                "id": "10",
                "name": "Sonya Frost",
                "position": "Software Engineer",
                "salary": "$103,600",
                "start_date": "2008/12/13",
                "office": "Edinburgh",
                "extn": "1667"
            },
            {
                "id": "11",
                "name": "Jena Gaines",
                "position": "Office Manager",
                "salary": "$90,560",
                "start_date": "2008/12/19",
                "office": "London",
                "extn": "3814"
            },
            {
                "id": "12",
                "name": "Quinn Flynn",
                "position": "Support Lead",
                "salary": "$342,000",
                "start_date": "2013/03/03",
                "office": "Edinburgh",
                "extn": "9497"
            },
            {
                "id": "13",
                "name": "Charde Marshall",
                "position": "Regional Director",
                "salary": "$470,600",
                "start_date": "2008/10/16",
                "office": "San Francisco",
                "extn": "6741"
            },
            {
                "id": "14",
                "name": "Haley Kennedy",
                "position": "Senior Marketing Designer",
                "salary": "$313,500",
                "start_date": "2012/12/18",
                "office": "London",
                "extn": "3597"
            },
            {
                "id": "15",
                "name": "Tatyana Fitzpatrick",
                "position": "Regional Director",
                "salary": "$385,750",
                "start_date": "2010/03/17",
                "office": "London",
                "extn": "1965"
            },
            {
                "id": "16",
                "name": "Michael Silva",
                "position": "Marketing Designer",
                "salary": "$198,500",
                "start_date": "2012/11/27",
                "office": "London",
                "extn": "1581"
            },
            {
                "id": "17",
                "name": "Paul Byrd",
                "position": "Chief Financial Officer (CFO)",
                "salary": "$725,000",
                "start_date": "2010/06/09",
                "office": "New York",
                "extn": "3059"
            },
            {
                "id": "18",
                "name": "Gloria Little",
                "position": "Systems Administrator",
                "salary": "$237,500",
                "start_date": "2009/04/10",
                "office": "New York",
                "extn": "1721"
            },
            {
                "id": "19",
                "name": "Bradley Greer",
                "position": "Software Engineer",
                "salary": "$132,000",
                "start_date": "2012/10/13",
                "office": "London",
                "extn": "2558"
            },
            {
                "id": "20",
                "name": "Dai Rios",
                "position": "Personnel Lead",
                "salary": "$217,500",
                "start_date": "2012/09/26",
                "office": "Edinburgh",
                "extn": "2290"
            },
            {
                "id": "21",
                "name": "Jenette Caldwell",
                "position": "Development Lead",
                "salary": "$345,000",
                "start_date": "2011/09/03",
                "office": "New York",
                "extn": "1937"
            },
            {
                "id": "22",
                "name": "Yuri Berry",
                "position": "Chief Marketing Officer (CMO)",
                "salary": "$675,000",
                "start_date": "2009/06/25",
                "office": "New York",
                "extn": "6154"
            },
            {
                "id": "23",
                "name": "Caesar Vance",
                "position": "Pre-Sales Support",
                "salary": "$106,450",
                "start_date": "2011/12/12",
                "office": "New York",
                "extn": "8330"
            },
            {
                "id": "24",
                "name": "Doris Wilder",
                "position": "Sales Assistant",
                "salary": "$85,600",
                "start_date": "2010/09/20",
                "office": "Sydney",
                "extn": "3023"
            },
            {
                "id": "25",
                "name": "Angelica Ramos",
                "position": "Chief Executive Officer (CEO)",
                "salary": "$1,200,000",
                "start_date": "2009/10/09",
                "office": "London",
                "extn": "5797"
            },
            {
                "id": "26",
                "name": "Gavin Joyce",
                "position": "Developer",
                "salary": "$92,575",
                "start_date": "2010/12/22",
                "office": "Edinburgh",
                "extn": "8822"
            },
            {
                "id": "27",
                "name": "Jennifer Chang",
                "position": "Regional Director",
                "salary": "$357,650",
                "start_date": "2010/11/14",
                "office": "Singapore",
                "extn": "9239"
            },
            {
                "id": "28",
                "name": "Brenden Wagner",
                "position": "Software Engineer",
                "salary": "$206,850",
                "start_date": "2011/06/07",
                "office": "San Francisco",
                "extn": "1314"
            },
            {
                "id": "29",
                "name": "Fiona Green",
                "position": "Chief Operating Officer (COO)",
                "salary": "$850,000",
                "start_date": "2010/03/11",
                "office": "San Francisco",
                "extn": "2947"
            },
            {
                "id": "30",
                "name": "Shou Itou",
                "position": "Regional Marketing",
                "salary": "$163,000",
                "start_date": "2011/08/14",
                "office": "Tokyo",
                "extn": "8899"
            },
            {
                "id": "31",
                "name": "Michelle House",
                "position": "Integration Specialist",
                "salary": "$95,400",
                "start_date": "2011/06/02",
                "office": "Sydney",
                "extn": "2769"
            },
            {
                "id": "32",
                "name": "Suki Burks",
                "position": "Developer",
                "salary": "$114,500",
                "start_date": "2009/10/22",
                "office": "London",
                "extn": "6832"
            },
            {
                "id": "33",
                "name": "Prescott Bartlett",
                "position": "Technical Author",
                "salary": "$145,000",
                "start_date": "2011/05/07",
                "office": "London",
                "extn": "3606"
            },
            {
                "id": "34",
                "name": "Gavin Cortez",
                "position": "Team Leader",
                "salary": "$235,500",
                "start_date": "2008/10/26",
                "office": "San Francisco",
                "extn": "2860"
            },
            {
                "id": "35",
                "name": "Martena Mccray",
                "position": "Post-Sales support",
                "salary": "$324,050",
                "start_date": "2011/03/09",
                "office": "Edinburgh",
                "extn": "8240"
            },
            {
                "id": "36",
                "name": "Unity Butler",
                "position": "Marketing Designer",
                "salary": "$85,675",
                "start_date": "2009/12/09",
                "office": "San Francisco",
                "extn": "5384"
            },
            {
                "id": "37",
                "name": "Howard Hatfield",
                "position": "Office Manager",
                "salary": "$164,500",
                "start_date": "2008/12/16",
                "office": "San Francisco",
                "extn": "7031"
            },
            {
                "id": "38",
                "name": "Hope Fuentes",
                "position": "Secretary",
                "salary": "$109,850",
                "start_date": "2010/02/12",
                "office": "San Francisco",
                "extn": "6318"
            },
            {
                "id": "39",
                "name": "Vivian Harrell",
                "position": "Financial Controller",
                "salary": "$452,500",
                "start_date": "2009/02/14",
                "office": "San Francisco",
                "extn": "9422"
            },
            {
                "id": "40",
                "name": "Timothy Mooney",
                "position": "Office Manager",
                "salary": "$136,200",
                "start_date": "2008/12/11",
                "office": "London",
                "extn": "7580"
            },
            {
                "id": "41",
                "name": "Jackson Bradshaw",
                "position": "Director",
                "salary": "$645,750",
                "start_date": "2008/09/26",
                "office": "New York",
                "extn": "1042"
            },
            {
                "id": "42",
                "name": "Olivia Liang",
                "position": "Support Engineer",
                "salary": "$234,500",
                "start_date": "2011/02/03",
                "office": "Singapore",
                "extn": "2120"
            },
            {
                "id": "43",
                "name": "Bruno Nash",
                "position": "Software Engineer",
                "salary": "$163,500",
                "start_date": "2011/05/03",
                "office": "London",
                "extn": "6222"
            },
            {
                "id": "44",
                "name": "Sakura Yamamoto",
                "position": "Support Engineer",
                "salary": "$139,575",
                "start_date": "2009/08/19",
                "office": "Tokyo",
                "extn": "9383"
            },
            {
                "id": "45",
                "name": "Thor Walton",
                "position": "Developer",
                "salary": "$98,540",
                "start_date": "2013/08/11",
                "office": "New York",
                "extn": "8327"
            },
            {
                "id": "46",
                "name": "Finn Camacho",
                "position": "Support Engineer",
                "salary": "$87,500",
                "start_date": "2009/07/07",
                "office": "San Francisco",
                "extn": "2927"
            },
            {
                "id": "47",
                "name": "Serge Baldwin",
                "position": "Data Coordinator",
                "salary": "$138,575",
                "start_date": "2012/04/09",
                "office": "Singapore",
                "extn": "8352"
            },
            {
                "id": "48",
                "name": "Zenaida Frank",
                "position": "Software Engineer",
                "salary": "$125,250",
                "start_date": "2010/01/04",
                "office": "New York",
                "extn": "7439"
            },
            {
                "id": "49",
                "name": "Zorita Serrano",
                "position": "Software Engineer",
                "salary": "$115,000",
                "start_date": "2012/06/01",
                "office": "San Francisco",
                "extn": "4389"
            },
            {
                "id": "50",
                "name": "Jennifer Acosta",
                "position": "Junior Javascript Developer",
                "salary": "$75,650",
                "start_date": "2013/02/01",
                "office": "Edinburgh",
                "extn": "3431"
            },
            {
                "id": "51",
                "name": "Cara Stevens",
                "position": "Sales Assistant",
                "salary": "$145,600",
                "start_date": "2011/12/06",
                "office": "New York",
                "extn": "3990"
            },
            {
                "id": "52",
                "name": "Hermione Butler",
                "position": "Regional Director",
                "salary": "$356,250",
                "start_date": "2011/03/21",
                "office": "London",
                "extn": "1016"
            },
            {
                "id": "53",
                "name": "Lael Greer",
                "position": "Systems Administrator",
                "salary": "$103,500",
                "start_date": "2009/02/27",
                "office": "London",
                "extn": "6733"
            },
            {
                "id": "54",
                "name": "Jonas Alexander",
                "position": "Developer",
                "salary": "$86,500",
                "start_date": "2010/07/14",
                "office": "San Francisco",
                "extn": "8196"
            },
            {
                "id": "55",
                "name": "Shad Decker",
                "position": "Regional Director",
                "salary": "$183,000",
                "start_date": "2008/11/13",
                "office": "Edinburgh",
                "extn": "6373"
            },
            {
                "id": "56",
                "name": "Michael Bruce",
                "position": "Javascript Developer",
                "salary": "$183,000",
                "start_date": "2011/06/27",
                "office": "Singapore",
                "extn": "5384"
            },
            {
                "id": "57",
                "name": "Donna Snider",
                "position": "Customer Support",
                "salary": "$112,000",
                "start_date": "2011/01/25",
                "office": "New York",
                "extn": "4226"
            }
        ]
    },
    event: {
        btnGetValue_click() {
            syn.$l.eventLog('btnGetValue_click', JSON.stringify(syn.uicontrols.$list.getValue('lstDataTable')));
        },

        btnSetValue_click() {
            syn.uicontrols.$list.setValue('lstDataTable', $this.prop.dataSet);
        },

        btnClear_click() {
            syn.uicontrols.$list.clear('lstDataTable');
        },

        btnchk_click() {
            var result = syn.uicontrols.$list.getControl('lstDataTable').table.column(0).checkboxes.selected().toArray();
            console.log("선택된 데이터: " + result);
        },

        btnGetControl_click() {
            var listDataTable = syn.uicontrols.$list.getControl('lstDataTable');
            // https://datatables.net/upgrade/1.10-convert#API 참조
        },

        lstDataTable_select(data, e, dt, type, indexes) {
            // dt.cell(2, 5).data('<span><a>[ - ]</a></span>').draw();
        }
    }
}
```

### $guide Guide 예제 코드
```js
'use strict';
let $guide = {
    event: {
        btnGuideTour_click(evt) {
            syn.uicontrols.$guide.introStart('hlpDataSource');
        }
    }
}
```

### $htmleditor HtmlEditor 예제 코드
```js
'use strict';
let $htmleditor = {
    event: {
        btnGetValue_click() {
            syn.$l.eventLog('btnGetValue_click', JSON.stringify(syn.uicontrols.$htmleditor.getValue('txtHtmlEditor')));
        },

        btnSetValue_click() {
            syn.uicontrols.$htmleditor.setValue('txtHtmlEditor', '안녕하세요');
        },

        btnClear_click() {
            syn.uicontrols.$htmleditor.clear('txtHtmlEditor');
        },

        btnExecCommand_click() {
            syn.uicontrols.$htmleditor.execCommand('txtHtmlEditor', 'bold');
            syn.uicontrols.$htmleditor.execCommand('txtHtmlEditor', 'backColor', '#0000FF');
        },

        btnInsertImage_click() {
            syn.uicontrols.$htmleditor.execCommand('txtHtmlEditor', 'insertimage', 'http://www.qcn.co.kr/editor/assets/sample.png');
        },

        txtHtmlEditor_documentReady(elID, editor) {
            syn.$l.eventLog('txtHtmlEditor_documentReady', elID);
        }
    }
}

```

### $organization OrganizationView 예제 코드
```js
'use strict';
let $organization = {
    event: {
        orgChartView_nodeTemplate(data) {
            return '<div class="title">' + data.data.name + '</div><div class="content">' + data.title + '</div>';
        },

        orgChartView_createNode($node, data) {
            var secondMenuIcon = $('<i>', {
                'class': 'oci oci-info-circle second-menu-icon',
                click() {
                    $(this).siblings('.second-menu').toggle();
                }
            });
            var secondMenu = '<div class="second-menu"><img class="avatar" src="https://dabeng.github.io/OrgChart/img/avatar/' + data.id + '.jpg"></div>';
            $node.append(secondMenuIcon).append(secondMenu);
        },

        orgChartView_nodedrop(evt, params) {
            syn.$l.eventLog('orgChartView_nodedrop', 'draggedNode:' + params.draggedNode.children('.title').text()
                + ', dragZone:' + params.dragZone.children('.title').text()
                + ', dropZone:' + params.dropZone.children('.title').text());
        },

        orgChartView_select(evt, node) {
            debugger;
            var nodeText = node.find('.title').text();
            syn.$l.eventLog('orgChartView_select', nodeText);
        },

        orgChartView_click(evt, focusNodes) {
            debugger;
            syn.$l.eventLog('orgChartView_click', focusNodes);
        },

        btnGetValue_click() {
            syn.$l.eventLog('btnGetValue_click', JSON.stringify(syn.uicontrols.$organization.getValue('orgChartView')));
        },

        btnSetValue_click() {
            var dataSource = JSON.parse(syn.$l.get('txtSourceData').value);
            syn.uicontrols.$organization.setValue('orgChartView', dataSource);
        },

        btnClear_click() {
            syn.uicontrols.$organization.clear('orgChartView');
        },

        btnGetControl_click() {
            var orgChartView = syn.uicontrols.$organization.getControl('orgChartView');
            // https://github.com/dabeng/OrgChart
            // https://dabeng.github.io/OrgChart/
        },
    }
}

```

### $radio RadioButton 예제 코드
```js
'use strict';
let $radiobutton = {
    event: {
        btnGetValue_click() {
            syn.$l.eventLog('btnGetValue_click', JSON.stringify(syn.uicontrols.$radio.getValue('rdoUseYN1')));
        },

        btnSetValue_click() {
            syn.uicontrols.$radio.setValue('rdoUseYN1', true);
        },

        btnClear_click() {
            syn.uicontrols.$radio.clear('rdoUseYN1');
        },

        btnSelectedValue_click() {
            syn.uicontrols.$radio.selectedValue('rdoUseYN', 'value 2');
        },

        btnGetGroupNames_click() {
            syn.$l.eventLog('btnGetGroupNames_click', JSON.stringify(syn.uicontrols.$radio.getGroupNames()));
        },

        rdoUseYN1_change() {
            console.log('rdoUseYN1_change');
        },

        rdoUseYN2_change() {
            console.log('rdoUseYN2_change');
        },

        rdoUseYN3_change() {
            console.log('rdoUseYN3_change');
        }
    }
}

```

### $sourceeditor SourceEditor 예제 코드
```js
'use strict';
let $sourceeditor = {
    event: {
        btnGetValue_click() {
            syn.$l.eventLog('btnGetValue_click', JSON.stringify(syn.uicontrols.$sourceeditor.getValue('txtEditor1')));
        },

        btnSetValue_click() {
            syn.uicontrols.$sourceeditor.setValue('txtEditor1', 'function hello() {\n\talert("Hello world!");\n}');
        },

        btnClear_click() {
            syn.uicontrols.$sourceeditor.clear('txtEditor1');
        }
    }
}

```

### $textarea TextArea 예제 코드
```js
'use strict';
let $textarea = {
    event: {
        btnGetValue_click() {
            syn.$l.eventLog('btnGetValue_click', JSON.stringify(syn.uicontrols.$textarea.getValue('txtTextarea')));
        },

        btnSetValue_click() {
            syn.uicontrols.$textarea.setValue('txtTextarea', '안녕하세요');
        },

        btnClear_click() {
            syn.uicontrols.$textarea.clear('txtTextarea');
        },

        txtTextarea_blur() {
            syn.uicontrols.$textarea.setValue('txtTextarea', '안녕하세요');
        }
    }
}

```

### $textbox TextBox 예제 코드
```js
'use strict';
let $textbox = {
    event: {
        btnGetValue_click() {
            syn.$l.eventLog('btnGetValue_click', JSON.stringify(syn.uicontrols.$textbox.getValue('txtApplicationID')));
        },

        btnSetValue_click() {
            syn.uicontrols.$textbox.setValue('txtApplicationID', '안녕하세요');
        },

        btnClear_click() {
            syn.uicontrols.$textbox.clear('txtApplicationID');
        }
    },
}

```

### $tree TreeView 예제 코드
```js
'use strict';
let $treeview = {
    prop: {
        dataSet: [
            {
                "PROGRAMID": 1,
                "PROGRAMNAME": "루트 디렉토리",
                "PARENTID": null,
                "PARENTNM": "",
                "VIEWYN": "1",
                "FOLDERYN": "1",
                "ASSEMBLYNAME": "DWP",
                "CLASSNAME": "",
                "SEQ": 1
            },
            {
                "PROGRAMID": 101,
                "PROGRAMNAME": "AI 서비스",
                "PARENTID": 1,
                "PARENTNM": "루트 디렉토리",
                "VIEWYN": "1",
                "FOLDERYN": "1",
                "ASSEMBLYNAME": "DWP",
                "CLASSNAME": "",
                "SEQ": 100
            },
            {
                "PROGRAMID": 110,
                "PROGRAMNAME": "AI 서비스",
                "PARENTID": 101,
                "PARENTNM": "AI 서비스",
                "VIEWYN": "1",
                "FOLDERYN": "1",
                "ASSEMBLYNAME": "DWP",
                "CLASSNAME": "",
                "SEQ": 100
            },
            {
                "PROGRAMID": 111,
                "PROGRAMNAME": "AI 서비스 관리",
                "PARENTID": 110,
                "PARENTNM": "AI 서비스",
                "VIEWYN": "1",
                "FOLDERYN": "0",
                "ASSEMBLYNAME": "DWP",
                "CLASSNAME": "AIS010",
                "SEQ": 100
            },
            {
                "PROGRAMID": 112,
                "PROGRAMNAME": "학습 모델 관리",
                "PARENTID": 110,
                "PARENTNM": "AI 서비스",
                "VIEWYN": "1",
                "FOLDERYN": "0",
                "ASSEMBLYNAME": "DWP",
                "CLASSNAME": "AIM010",
                "SEQ": 100
            },


            {
                "PROGRAMID": 201,
                "PROGRAMNAME": "프로모션",
                "PARENTID": 1,
                "PARENTNM": "루트 디렉토리",
                "VIEWYN": "1",
                "FOLDERYN": "1",
                "ASSEMBLYNAME": "DWP",
                "CLASSNAME": "",
                "SEQ": 200
            },
            {
                "PROGRAMID": 210,
                "PROGRAMNAME": "메시지 템플릿",
                "PARENTID": 201,
                "PARENTNM": "프로모션",
                "VIEWYN": "1",
                "FOLDERYN": "1",
                "ASSEMBLYNAME": "DWP",
                "CLASSNAME": "",
                "SEQ": 200
            },
            {
                "PROGRAMID": 211,
                "PROGRAMNAME": "이메일/알림톡 템플릿",
                "PARENTID": 210,
                "PARENTNM": "메시지 템플릿",
                "VIEWYN": "1",
                "FOLDERYN": "0",
                "ASSEMBLYNAME": "DWP",
                "CLASSNAME": "EML010",
                "SEQ": 200
            },
            {
                "PROGRAMID": 220,
                "PROGRAMNAME": "메시지 발송",
                "PARENTID": 201,
                "PARENTNM": "프로모션",
                "VIEWYN": "1",
                "FOLDERYN": "1",
                "ASSEMBLYNAME": "DWP",
                "CLASSNAME": "",
                "SEQ": 200
            },
            {
                "PROGRAMID": 221,
                "PROGRAMNAME": "메일 발송",
                "PARENTID": 220,
                "PARENTNM": "메시지 발송",
                "VIEWYN": "1",
                "FOLDERYN": "0",
                "ASSEMBLYNAME": "DWP",
                "CLASSNAME": "PMS010",
                "SEQ": 200
            },
            {
                "PROGRAMID": 222,
                "PROGRAMNAME": "알림톡 발송",
                "PARENTID": 220,
                "PARENTNM": "메시지 발송",
                "VIEWYN": "1",
                "FOLDERYN": "0",
                "ASSEMBLYNAME": "DWP",
                "CLASSNAME": "PMS020",
                "SEQ": 200
            },
            {
                "PROGRAMID": 230,
                "PROGRAMNAME": "메시지 발송 이력",
                "PARENTID": 201,
                "PARENTNM": "프로모션",
                "VIEWYN": "1",
                "FOLDERYN": "1",
                "ASSEMBLYNAME": "DWP",
                "CLASSNAME": "",
                "SEQ": 200
            },
            {
                "PROGRAMID": 231,
                "PROGRAMNAME": "메일 발송 이력",
                "PARENTID": 230,
                "PARENTNM": "메시지 발송 이력",
                "VIEWYN": "1",
                "FOLDERYN": "0",
                "ASSEMBLYNAME": "DWP",
                "CLASSNAME": "PML010",
                "SEQ": 200
            },
            {
                "PROGRAMID": 232,
                "PROGRAMNAME": "알림톡 발송 이력",
                "PARENTID": 230,
                "PARENTNM": "메시지 발송 이력",
                "VIEWYN": "1",
                "FOLDERYN": "0",
                "ASSEMBLYNAME": "DWP",
                "CLASSNAME": "PML020",
                "SEQ": 200
            },



            {
                "PROGRAMID": 301,
                "PROGRAMNAME": "환경설정",
                "PARENTID": 1,
                "PARENTNM": "루트 디렉토리",
                "VIEWYN": "1",
                "FOLDERYN": "1",
                "ASSEMBLYNAME": "DWP",
                "CLASSNAME": "",
                "SEQ": 300
            },
            {
                "PROGRAMID": 310,
                "PROGRAMNAME": "계정관리",
                "PARENTID": 301,
                "PARENTNM": "환경설정",
                "VIEWYN": "1",
                "FOLDERYN": "1",
                "ASSEMBLYNAME": "DWP",
                "CLASSNAME": "",
                "SEQ": 300
            },
            {
                "PROGRAMID": 311,
                "PROGRAMNAME": "사용자관리",
                "PARENTID": 310,
                "PARENTNM": "계정관리",
                "VIEWYN": "1",
                "FOLDERYN": "0",
                "ASSEMBLYNAME": "DWP",
                "CLASSNAME": "USR010",
                "SEQ": 300
            },
            {
                "PROGRAMID": 312,
                "PROGRAMNAME": "프로모션수신사용자그룹",
                "PARENTID": 310,
                "PARENTNM": "계정관리",
                "VIEWYN": "1",
                "FOLDERYN": "0",
                "ASSEMBLYNAME": "DWP",
                "CLASSNAME": "USR020",
                "SEQ": 300
            },
            {
                "PROGRAMID": 313,
                "PROGRAMNAME": "외부서비스계정",
                "PARENTID": 310,
                "PARENTNM": "계정관리",
                "VIEWYN": "1",
                "FOLDERYN": "0",
                "ASSEMBLYNAME": "DWP",
                "CLASSNAME": "USR030",
                "SEQ": 300
            },
            {
                "PROGRAMID": 320,
                "PROGRAMNAME": "외부서비스",
                "PARENTID": 301,
                "PARENTNM": "환경설정",
                "VIEWYN": "1",
                "FOLDERYN": "1",
                "ASSEMBLYNAME": "DWP",
                "CLASSNAME": "",
                "SEQ": 300
            },
            {
                "PROGRAMID": 321,
                "PROGRAMNAME": "스킬/메일발송서버",
                "PARENTID": 320,
                "PARENTNM": "외부서비스",
                "VIEWYN": "1",
                "FOLDERYN": "0",
                "ASSEMBLYNAME": "DWP",
                "CLASSNAME": "SVR010",
                "SEQ": 300
            },
            {
                "PROGRAMID": 322,
                "PROGRAMNAME": "챗봇 오픈빌더",
                "PARENTID": 320,
                "PARENTNM": "외부서비스",
                "VIEWYN": "1",
                "FOLDERYN": "0",
                "ASSEMBLYNAME": "DWP",
                "CLASSNAME": "URL|https://accounts.kakao.com/login/kakaobusiness?continue=https://i.kakao.com/openbuilder",
                "SEQ": 300
            }
        ]
    },

    event: {
        btnGetValue_click() {
            syn.$l.eventLog('btnGetValue_click', JSON.stringify(syn.uicontrols.$tree.getValue('tvlTreeView')));
        },

        btnSetValue_click() {
            syn.uicontrols.$tree.setValue('tvlTreeView', $this.prop.dataSet);
        },

        btnClear_click() {
            syn.uicontrols.$tree.clear('tvlTreeView');
        },

        btnGetControl_click() {
            var tvlTreeView = syn.uicontrols.$tree.getControl('tvlTreeView');
            // https://github.com/mar10/fancytree/wiki
            // https://wwwendt.de/tech/fancytree/demo/#welcome.html
            // https://wwwendt.de/tech/fancytree/doc/jsdoc/global.html#NodeData
        },

        tvlTreeView_click(evt, data) {
            syn.$l.eventLog('tvlTreeView_click', '');
        },

        tvlTreeView_dblclick(evt, data) {
            syn.$l.eventLog('tvlTreeView_dblclick', '');
        },

        tvlTreeView_select(evt, data) {
            syn.$l.eventLog('tvlTreeView_select', '');
            // syn.uicontrols.$tree.setSelectedAll('tvlTreeView', data.node);
        },

        ctxTreeItem_beforeOpen(evt, ui) {
            var node = $.ui.fancytree.getNode(ui.target);
            syn.$l.eventLog('ctxTreeItem_beforeOpen', 'before open ' + ui.cmd + ' on ' + node);
        },

        ctxTreeItem_select(evt, ui) {
            var node = $.ui.fancytree.getNode(ui.target);
            syn.$l.eventLog('ctxTreeItem_select', 'select ' + ui.cmd + ' on ' + node);
        }
    }
}
```

### $auigrid AUIGrid 예제 코드
```js
'use strict';
let $webgrid2 = {
	prop: {
		metaColumns: {
			"Flag": {
				"fieldID": "Flag",
				"dataType": "string"
			},
			"PersonID": {
				"fieldID": "PersonID",
				"dataType": "int"
			},
			"UserName": {
				"fieldID": "UserName",
				"dataType": "string"
			},
			"MaritalStatus": {
				"fieldID": "MaritalStatus",
				"dataType": "bool"
			},
			"ReligionYN": {
				"fieldID": "ReligionYN",
				"dataType": "bool"
			},
			"GenderType": {
				"fieldID": "GenderType",
				"dataType": "string"
			},
			"GenderTypeName": {
				"fieldID": "GenderType",
				"dataType": "string"
			},
			"CreateDateTime": {
				"fieldID": "CreateDateTime",
				"dataType": "string"
			}
		},

		grid_setValue: null,

		dataSource: [
			{ Flag: 'R', PersonID: '1235571', UserName: 'hello world: <a href="http://www.naver.com" target="_blank">Ted Right</a> <img src="https://raw.githubusercontent.com/dotnet/machinelearning-samples/master/images/app-type-e2e-black.png" style="vertical-align:middle;height: 22px;"/>', MaritalStatus: 0, ReligionYN: 1, GenderType: '1', GenderTypeName: '남성', CreateDateTime: '2020-02-01' },
			{ Flag: 'R', PersonID: '1235572', UserName: '<a href="http://www.naver.com" target="_blank">Frank Honest</a>', MaritalStatus: 0, ReligionYN: 0, GenderType: '1', GenderTypeName: '남성', CreateDateTime: '2020-03-01' },
			{ Flag: 'R', PersonID: '1235573', UserName: '<a href="http://www.naver.com" target="_blank">Joan Well</a>', MaritalStatus: 1, ReligionYN: 0, GenderType: '2', GenderTypeName: '여성', CreateDateTime: '2020-02-11' },
			{ Flag: 'R', PersonID: '1235574', UserName: '<a href="http://www.naver.com" target="_blank">Gail Polite</a>', MaritalStatus: 1, ReligionYN: 0, GenderType: '2', GenderTypeName: '여성', CreateDateTime: '2020-02-21' },
			{ Flag: 'R', PersonID: '1235575', UserName: '<a href="http://www.naver.com" target="_blank">Michael Fair</a>', MaritalStatus: 0, ReligionYN: 1, GenderType: '3', GenderTypeName: '중성', CreateDateTime: '2020-04-01' },
			{ Flag: 'R', PersonID: '235576', UserName: '<a href="http://www.naver.com" target="_blank">Michael Fair</a>', MaritalStatus: 0, ReligionYN: 1, GenderType: '3', GenderTypeName: '중성', CreateDateTime: '2020-04-01' },
			{ Flag: 'R', PersonID: '235577', UserName: '<a href="http://www.naver.com" target="_blank">Michael Fair</a>', MaritalStatus: 0, ReligionYN: 1, GenderType: '3', GenderTypeName: '중성', CreateDateTime: '2020-04-01' },
			{ Flag: 'R', PersonID: '235578', UserName: '<a href="http://www.naver.com" target="_blank">Michael Fair</a>', MaritalStatus: 0, ReligionYN: 1, GenderType: '3', GenderTypeName: '중성', CreateDateTime: '2020-04-01' },
			{ Flag: 'R', PersonID: '235579', UserName: '<a href="http://www.naver.com" target="_blank">Michael Fair</a>', MaritalStatus: 0, ReligionYN: 1, GenderType: '3', GenderTypeName: '중성', CreateDateTime: '2020-04-01' },
			{ Flag: 'R', PersonID: '2355710', UserName: '<a href="http://www.naver.com" target="_blank">Michael Fair</a>', MaritalStatus: 0, ReligionYN: 1, GenderType: '3', GenderTypeName: '중성', CreateDateTime: '2020-04-01' },
			{ Flag: 'R', PersonID: '3355711', UserName: '<a href="http://www.naver.com" target="_blank">Michael Fair</a>', MaritalStatus: 0, ReligionYN: 1, GenderType: '3', GenderTypeName: '중성', CreateDateTime: '2020-04-01' },
			{ Flag: 'R', PersonID: '3355712', UserName: '<a href="http://www.naver.com" target="_blank">Michael Fair</a>', MaritalStatus: 0, ReligionYN: 1, GenderType: '3', GenderTypeName: '중성', CreateDateTime: '2020-04-01' },
			{ Flag: 'R', PersonID: '3355713', UserName: '<a href="http://www.naver.com" target="_blank">Michael Fair</a>', MaritalStatus: 0, ReligionYN: 1, GenderType: '3', GenderTypeName: '중성', CreateDateTime: '2020-04-01' },
			{ Flag: 'R', PersonID: '3355714', UserName: '<a href="http://www.naver.com" target="_blank">Michael Fair</a>', MaritalStatus: 0, ReligionYN: 1, GenderType: '3', GenderTypeName: '중성', CreateDateTime: '2020-04-01' },
			{ Flag: 'R', PersonID: '3355715', UserName: '<a href="http://www.naver.com" target="_blank">Michael Fair</a>', MaritalStatus: 0, ReligionYN: 1, GenderType: '3', GenderTypeName: '중성', CreateDateTime: '2020-04-01' },
			{ Flag: 'R', PersonID: '3355716', UserName: '<a href="http://www.naver.com" target="_blank">Michael Fair</a>', MaritalStatus: 0, ReligionYN: 1, GenderType: '3', GenderTypeName: '중성', CreateDateTime: '2020-04-01' },
			{ Flag: 'R', PersonID: '2355717', UserName: '<a href="http://www.naver.com" target="_blank">Michael Fair</a>', MaritalStatus: 0, ReligionYN: 1, GenderType: '3', GenderTypeName: '중성', CreateDateTime: '2020-04-01' },
			{ Flag: 'R', PersonID: '2355718', UserName: '<a href="http://www.naver.com" target="_blank">Michael Fair</a>', MaritalStatus: 0, ReligionYN: 1, GenderType: '3', GenderTypeName: '중성', CreateDateTime: '2020-04-01' },
			{ Flag: 'R', PersonID: '2355719', UserName: '<a href="http://www.naver.com" target="_blank">Michael Fair</a>', MaritalStatus: 0, ReligionYN: 1, GenderType: '3', GenderTypeName: '중성', CreateDateTime: '2020-04-01' }
		],
	},

	hook: {
		pageLoad() {
			$this.grid_setValue = syn.uicontrols.$auigrid.setValue;
			syn.uicontrols.$auigrid.setValue = function (elID, value, metaColumns) {
				$this.grid_setValue(elID, value, metaColumns);
			};
		},
	},

    event: {
        btnDynamicData_click() {
            var dataSource = $object.clone($this.prop.dataSource);
            var container1 = document.getElementById('example1');

            var headers = [];
            if (dataSource.length > 0) {
                var item = dataSource[0];
                for (var key in item) {
                    headers.push(key);
                }
            }

            var hot1 = new Handsontable(container1, {
                readOnly: true,
                data: dataSource,
                colHeaders: headers
            });
        },

		btnPseudoStyle_click() {
			var gridPseudo = '.handsontable tbody tr td:nth-of-type({0}) {' +
				'            background-color: #f0f0f0;' +
				'            text-decoration: underline;' +
				'            color: black;' +
				'            font-weight: 900;' +
				'            cursor: pointer;' +
				'        }';

			var head = document.head || document.getElementsByTagName('head')[0];
			var sheet = document.getElementById('cssWeekendPseudoStyle');
			sheet.innerHTML = '';

			var styles = [];
			for (var i = 0; i < 10; i++) {
				styles.push(gridPseudo.format(i.toString()));
			}

			sheet.innerHTML = styles.join('\n\n');
			head.appendChild(sheet);
		},

		grdGrid_afterSelectionEnd(row, column, row2, column2, selectionLayerLevel) {
		},

		grdGrid_beforeKeyDown() {
		},

		grdGrid_afterCreateRow() {
			// syn.uicontrols.$auigrid.setDataAtCell('grdGrid', arguments[0], "MaritalStatus", true);
		},

		btnGetValueRow_click() {
			syn.$l.eventLog('btnGetValue_click Row', JSON.stringify(syn.uicontrols.$auigrid.getValue('grdGrid', 'Row', $this.prop.metaColumns)));
		},

		btnGetValueList_click() {
			syn.$l.eventLog('btnGetValue_click List', JSON.stringify(syn.uicontrols.$auigrid.getValue('grdGrid', 'List', $this.prop.metaColumns)));
		},

		btnSetValue_click() {
			syn.uicontrols.$auigrid.setValue('grdGrid', $object.clone($this.prop.dataSource), $this.prop.metaColumns);
		},

		btnClear_click() {
			syn.uicontrols.$auigrid.clear('grdGrid');
		},

		btnGetInitializeColumns_click() {
			var columns = [
				['PersonID', '사용자ID', 200, false, 'numeric', false, 'left'],
				['UserName', '사용자', 200, false, 'text', false, 'left'],
				['GenderType', '성별ID', 200, false, 'text', false, 'left'],
				['GenderTypeName', '성별', 200, false, 'text', false, 'left']
			];

			var settings = syn.uicontrols.$auigrid.getInitializeColumns({ columns: columns });
			syn.$l.eventLog('btnGetInitializeColumns_click Row', JSON.stringify(settings));
		},

		btnGetSettings_click() {
			var settings = syn.uicontrols.$auigrid.getSettings('grdGrid');

			if (settings.data && settings.data.length > 0) {
				var length = settings.data.length;
				for (var i = 0; i < length; i++) {
					settings.data[i].MaritalStatus = false;
				}

				var hot = syn.uicontrols.$auigrid.getGridControl('grdGrid');
				hot.render();

				// syn.uicontrols.$auigrid.updateSettings('grdGrid', settings);
			}
		},

		btnUpdateSettings_click() {
			var settings = syn.uicontrols.$auigrid.getSettings('grdGrid');
			settings.cells = function (row, col, prop) {
				if (prop == 'ReligionYN') {
					var cellProperties = {};
					cellProperties.readOnly = true;
					return cellProperties;
				}
				else if (settings.keyLockedColumns.length > 0) {
					var cellProperties = {};
					var hot = this.instance;
					var rowData = hot.getSourceDataAtRow(row);

					if (rowData) {
						if (rowData.Flag && rowData.Flag != 'C' && settings.keyLockedColumns.indexOf(prop) > -1) {
							cellProperties.readOnly = true;
						}
					}

					return cellProperties;
				}
			};

			syn.uicontrols.$auigrid.updateSettings('grdGrid', settings);
		},

		btnUpdateSettings1_click() {
			var settings = syn.uicontrols.$auigrid.getSettings('grdGrid');
			settings.cells = function (row, col, prop) {
				if (settings.keyLockedColumns.length > 0) {
					var cellProperties = {};
					var hot = this.instance;
					var rowData = hot.getSourceDataAtRow(row);

					if (rowData) {
						if (rowData.Flag && rowData.Flag != 'C' && settings.keyLockedColumns.indexOf(prop) > -1) {
							cellProperties.readOnly = true;
						}
					}

					return cellProperties;
				}
			};

			syn.uicontrols.$auigrid.updateSettings('grdGrid', settings);
		},

		btnUpdateSettings2_click() {
			var settings = syn.uicontrols.$auigrid.getSettings('grdGrid');
			settings.nestedHeaders = [
				['A', { label: 'B', colspan: 8 }, 'C'],
				['블라', '블라', '블라', 'Q', 'R', 'S', 'T', 'U', 'V', 'W']
			];

			var hot = syn.uicontrols.$auigrid.getGridControl('grdGrid');
			var plugin = hot.getPlugin('autoColumnSize');

			if (plugin.isEnabled() == false) {
				plugin.enablePlugin();
			}

			setTimeout(function () {
				plugin.recalculateAllColumnsWidth();
				settings.colWidths = plugin.widths;
				syn.uicontrols.$auigrid.updateSettings('grdGrid', settings);
			}, 100);
		},


		btnLoadData_click() {
			syn.uicontrols.$auigrid.loadData('grdGrid', $object.clone($this.prop.dataSource));
		},

		btnCountRows_click() {
			syn.$l.eventLog('btnCountRows_click', JSON.stringify(syn.uicontrols.$auigrid.countRows('grdGrid', true)));
		},

		rowCount: 0,
		btnInsertRow_click() {
			syn.uicontrols.$auigrid.insertRow('grdGrid', {
				amount: 1
			}, function (row) {
				syn.uicontrols.$auigrid.setDataAtCell('grdGrid', row, 2, $this.rowCount++);
				syn.uicontrols.$auigrid.selectCell('grdGrid', row, 2);
			});
		},

		btnRemoveRow_click() {
			syn.uicontrols.$auigrid.removeRow('grdGrid');
		},

		btnIsUpdateData_click() {
			syn.$l.eventLog('btnIsUpdateData_click', JSON.stringify(syn.uicontrols.$auigrid.isUpdateData('grdGrid')));
		},

		btnGetFlag_click() {
			syn.$l.eventLog('btnGetFlag_click', JSON.stringify(syn.uicontrols.$auigrid.getFlag('grdGrid', 0)));
		},

		btnSetFlag_click() {
			syn.uicontrols.$auigrid.setFlag('grdGrid', 0, 'U');
			syn.$l.eventLog('btnGetFlag_click', JSON.stringify(syn.uicontrols.$auigrid.getFlag('grdGrid', 0)));
		},

		btnGetDataAtCell_click() {
			syn.$l.eventLog('btnGetDataAtCell_click', JSON.stringify(syn.uicontrols.$auigrid.getDataAtCell('grdGrid', 0, 2)));
		},

		btnSetDataAtCell_click() {
			syn.uicontrols.$auigrid.setDataAtCell('grdGrid', 0, 2, 'HELLO WORLD');
			syn.$l.eventLog('btnGetFlag_click', JSON.stringify(syn.uicontrols.$auigrid.getDataAtCell('grdGrid', 0, 2)));
		},

		btnGetCellMeta_click() {
			syn.$l.eventLog('btnGetCellMeta_click', JSON.stringify(syn.uicontrols.$auigrid.getCellMeta('grdGrid', 0, 2)));
		},

		btnSetCellMeta_click() {
			syn.uicontrols.$auigrid.setCellMeta('grdGrid', 0, 2, 'key', 'value');
		},

		btnGetUpdateData_click() {
			syn.$l.eventLog('btnGetUpdateData_click Row', JSON.stringify(syn.uicontrols.$auigrid.getUpdateData('grdGrid', 'Row', $this.prop.metaColumns)));
			syn.$l.eventLog('btnGetUpdateData_click List', JSON.stringify(syn.uicontrols.$auigrid.getUpdateData('grdGrid', 'List', $this.prop.metaColumns)));
		},

		btnGetPhysicalRowIndex_click() {
			syn.$l.eventLog('btnGetPhysicalRowIndex_click', JSON.stringify(syn.uicontrols.$auigrid.getPhysicalRowIndex('grdGrid', 0)));
		},

		btnGetPhysicalColIndex_click() {
			syn.$l.eventLog('btnGetPhysicalColIndex_click', JSON.stringify(syn.uicontrols.$auigrid.getPhysicalColIndex('grdGrid', 2)));
		},

		btnGetSourceDataAtRow_click() {
			syn.$l.eventLog('btnGetSourceDataAtRow_click', JSON.stringify(syn.uicontrols.$auigrid.getSourceDataAtRow('grdGrid', 0)));
		},

		btnVisibleColumns_click() {
			syn.uicontrols.$auigrid.visibleColumns('grdGrid', [7], false);

			// setTimeout(function () {
			//     alert('click to show !!!');
			// 
			//     syn.uicontrols.$auigrid.visibleColumns('grdGrid', [1, 2], true);
			// }, 25);
		},

		btnVisibleRows_click() {
			syn.uicontrols.$auigrid.visibleRows('grdGrid', [1, 2], false);

			// setTimeout(function () {
			//     alert('click to show !!!');
			// 
			//     syn.uicontrols.$auigrid.visibleRows('grdGrid', [1, 2], true);
			// }, 25);
		},

		btnUnHiddenRows_click() {
			syn.uicontrols.$auigrid.unHiddenRows('grdGrid');
		},

		btnUnHiddenColumns_click() {
			syn.uicontrols.$auigrid.unHiddenColumns('grdGrid');
		},

		btnPropToCol_click() {
			syn.$l.eventLog('btnPropToCol_click', JSON.stringify(syn.uicontrols.$auigrid.propToCol('grdGrid', 'GenderType')));
		},

		btnColToProp_click() {
			syn.$l.eventLog('btnColToProp_click', JSON.stringify(syn.uicontrols.$auigrid.colToProp('grdGrid', 2)));
		},

		btnGetColHeader_click() {
			syn.$l.eventLog('btnGetColHeader_click', JSON.stringify(syn.uicontrols.$auigrid.getColHeader('grdGrid', 2)));
		},

		btnCountCols_click() {
			syn.$l.eventLog('btnCountCols_click', JSON.stringify(syn.uicontrols.$auigrid.countCols('grdGrid')));
		},

		btnGetSelected_click() {
			syn.$l.eventLog('btnGetSelected_click', JSON.stringify(syn.uicontrols.$auigrid.getSelected('grdGrid')));
		},

		btnGetActiveRowIndex_click() {
			syn.$l.eventLog('btnGetActiveRowIndex_click', JSON.stringify(syn.uicontrols.$auigrid.getActiveRowIndex('grdGrid')));
		},

		btnGetActiveColIndex_click() {
			syn.$l.eventLog('btnGetActiveColIndex_click', JSON.stringify(syn.uicontrols.$auigrid.getActiveColIndex('grdGrid')));
		},

		btnSelectCell_click() {
			syn.uicontrols.$auigrid.selectCell('grdGrid', 0, 2)
		},

		btnExportFile_click() {
			syn.uicontrols.$auigrid.exportFile('grdGrid', { filename: 'grid' });
		},

		btnExportAsString_click() {
			var value = syn.uicontrols.$auigrid.exportAsString('grdGrid');
			syn.$l.eventLog('btnExportAsString_click', value);
		},

		btnImportFile_click() {
			syn.uicontrols.$auigrid.importFile('grdGrid');
		},

		btnGetGridControl_click() {
			var hot = syn.uicontrols.$auigrid.getGridControl('grdGrid');
		},

		btnGetGridSetting_click() {
			var gridSettings = syn.uicontrols.$auigrid.getGridSetting('grdGrid');
		},

		btnGetColumnWidths_click() {
			syn.$l.eventLog('btnGetColumnWidths_click', JSON.stringify(syn.uicontrols.$auigrid.getColumnWidths('grdGrid')));
		},

		btnScrollViewportTo_click() {
			syn.uicontrols.$auigrid.scrollViewportTo('grdGrid', 0, 2);
		},

		btnIsEmptyRow_click() {
			syn.$l.eventLog('btnIsEmptyRow_click', JSON.stringify(syn.uicontrols.$auigrid.isEmptyRow('grdGrid', 0)));
		},

		btnIsEmptyCol_click() {
			syn.$l.eventLog('btnIsEmptyCol_click', JSON.stringify(syn.uicontrols.$auigrid.isEmptyCol('grdGrid', 2)));
		},

		btnGetDataAtRow_click() {
			syn.$l.eventLog('btnGetDataAtRow_click', JSON.stringify(syn.uicontrols.$auigrid.getDataAtRow('grdGrid', 0)));
		},

		btnGetDataAtCol_click() {
			syn.$l.eventLog('btnGetDataAtCol_click', JSON.stringify(syn.uicontrols.$auigrid.getDataAtCol('grdGrid', 2)));
		},

		btnGetSourceDataAtCol_click() {
			syn.$l.eventLog('btnGetSourceDataAtCol_click', JSON.stringify(syn.uicontrols.$auigrid.getSourceDataAtCol('grdGrid', 2)));
		},

		btnSetDataAtRow_click() {
			syn.uicontrols.$auigrid.setDataAtRow('grdGrid', [[0, 0, 'U'], [0, 1, '7'], [0, 2, 'HELLO WORLD'], [0, 3, '2'], [0, 4, '여성']]);
		},

		btnValidateColumns_click() {
			syn.$l.eventLog('btnValidateColumns_click', JSON.stringify(syn.uicontrols.$auigrid.validateColumns('grdGrid', [0, 1, 2])));
		},

		btnValidateRows_click() {
			syn.$l.eventLog('btnValidateRows_click', JSON.stringify(syn.uicontrols.$auigrid.validateRows('grdGrid', [0, 1, 2])));
		},

		btnGetLogicalRowIndex_click() {
			syn.$l.eventLog('btnGetFlag_click', JSON.stringify(syn.uicontrols.$auigrid.getLogicalRowIndex('grdGrid', 0)));
		},

		btnGetLogicalColIndex_click() {
			syn.$l.eventLog('btnGetLogicalColIndex_click', JSON.stringify(syn.uicontrols.$auigrid.getLogicalColIndex('grdGrid', 2)));
		},

		btnGetFirstShowColIndex_click() {
			syn.$l.eventLog('btnGetFirstShowColIndex_click', JSON.stringify(syn.uicontrols.$auigrid.getFirstShowColIndex('grdGrid')));
		},

		btnGetLastShowColIndex_click() {
			syn.$l.eventLog('btnGetLastShowColIndex_click', JSON.stringify(syn.uicontrols.$auigrid.getLastShowColIndex('grdGrid')));
		},

		btnAddCondition_click() {
			syn.uicontrols.$auigrid.addCondition('grdGrid', 'GenderType', 'by_value', '1');
			syn.uicontrols.$auigrid.addCondition('grdGrid', 'CreateDateTime', 'lt', '2020-03-01');
		},

		btnRemoveCondition_click() {
			syn.uicontrols.$auigrid.removeCondition('grdGrid', 'GenderType');
		},

		btnClearConditions_click() {
			syn.uicontrols.$auigrid.clearConditions('grdGrid');
		},

		grdGrid_cellButtonClick(elID, row, column, prop, value) {
			syn.$l.eventLog('grdGrid_cellButtonClick', '{0}, {1}, {2}, {3}, {4}'.format(elID, row, column, prop, value));
		},

		grdGrid_cellRadioClick(elID, row, column, prop, value) {
			syn.$l.eventLog('grdGrid_cellRadioClick', '{0}, {1}, {2}, {3}, {4}'.format(elID, row, column, prop, value));
		},

		btnMerge_click() {
			syn.uicontrols.$auigrid.merge('grdGrid', 1, 1, 3, 1);

			syn.uicontrols.$auigrid.scrollViewportTo('grdGrid', 1, 1);
			setTimeout(function () {
				syn.uicontrols.$auigrid.scrollViewportTo('grdGrid', 0, 1);
			}, 25);
		},

		btnUnMerge_click() {
			var rowCount = syn.uicontrols.$auigrid.countRows('grdGrid');
			syn.uicontrols.$auigrid.unmerge('grdGrid', 1, 1, rowCount, 1);
		},

		isAlert: true,
		btnIsCellClassName_click() {
			alert(syn.uicontrols.$auigrid.isCellClassName('grdGrid', 0, 3, 'my-class'));
		},

		btnSetCellClassName_click() {
			syn.uicontrols.$auigrid.setCellClassName('grdGrid', -1, -1, 'my-class', $this.isAlert);
			$this.isAlert = !$this.isAlert;
		},

		grdGrid_applyCells(elID, row, column, prop) {

		},

		grdGrid_customSummary(elID, columnID, col, columnData) {
			return '합계: 12345';
		},

		grdGrid_selectAllCheck(elID, col, checked) {
			var hot = syn.uicontrols.$auigrid.getGridControl(elID);
			var gridSettings = syn.uicontrols.$auigrid.getSettings(elID);

			if (gridSettings.data && gridSettings.data.length > 0) {
				var visiblePersonIDs = syn.uicontrols.$auigrid.getDataAtCol(elID, 'PersonID');
				var data = gridSettings.data;
				var filterdData = data.filter(function (item) {
					var result = false;
					if (visiblePersonIDs.indexOf(item.PersonID) > -1) {
						result = true;
					}

					return result;
				});

				var length = filterdData.length;
				var colProp = hot.colToProp(col);
				for (var i = 0; i < length; i++) {
					var flag = filterdData[i]['Flag'];
					if (flag == 'R') {
						filterdData[i]['Flag'] = 'U';
					}

					if (flag != 'S') {
						filterdData[i][colProp] = checked == true ? '1' : '0';
					}
				}
			}
		},

		btnRefreshSummary_click() {
			syn.uicontrols.$auigrid.refreshSummary('grdGrid');
		}
	},
}

```
