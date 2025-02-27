function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

/*!
 * numbro.js language configuration
 * language : Dutch
 * locale: Belgium
 * author : Dieter Luypaert : https://github.com/moeriki
 */

var nlBE = {
    languageTag: "nl-BE",
    delimiters: {
        thousands: " ",
        decimal: ","
    },
    abbreviations: {
        thousand: "k",
        million: "mln",
        billion: "mld",
        trillion: "bln"
    },
    ordinal: number => {
        let remainder = number % 100;
        return (number !== 0 && remainder <= 1 || remainder === 8 || remainder >= 20) ? "ste" : "de";
    },
    currency: {
        symbol: "€",
        position: "postfix",
        code: "EUR"
    },
    currencyFormat: {
        thousandSeparated: true,
        totalLength: 4,
        spaceSeparated: true,
        average: true
    },
    formats: {
        fourDigits: {
            totalLength: 4,
            spaceSeparated: true,
            average: true
        },
        fullWithTwoDecimals: {
            output: "currency",
            mantissa: 2,
            spaceSeparated: true,
            thousandSeparated: true
        },
        fullWithTwoDecimalsNoCurrency: {
            mantissa: 2,
            thousandSeparated: true
        },
        fullWithNoDecimals: {
            output: "currency",
            spaceSeparated: true,
            thousandSeparated: true,
            mantissa: 0
        }
    }
};

var nlBE$1 = /*@__PURE__*/getDefaultExportFromCjs(nlBE);

export { nlBE$1 as default };
