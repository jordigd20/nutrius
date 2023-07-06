const quitarTildes = (str) => {

    var output = '';
    var accents = {
        a: 'àáâãäåæ',
        e: 'èéêëæ',
        i: 'ìíîï',
        o: 'òóôõöø',
        u: 'ùúûü',
        A: 'ÀÁÂÃÄÅ',
        E: 'ÈÉÊË',
        I: 'ÌÍÎÏ',
        O: 'ÒÓÖÔ',
        U: 'ÙÚÛÜ',
    };

    for (let i = 0; i < str.length; i++) {
        if (accents[str[i]] !== undefined) {
            output += '[' + str[i] + accents[str[i]] + ']';
        } else {
            output += str[i];
        }
    }

    return output;
}

module.exports = { quitarTildes }