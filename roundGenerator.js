module.exports = {
    createRound: function(roundNumber) {
        let firstDigit = Math.floor(Math.random() * 10);
        let secondDigit = Math.floor(Math.random() * 10);
        let operations=['+', '-', '*', '/'];
        let operationIndex = Math.floor(Math.random() * 3);
        let operation = operations[operationIndex];

        let round = {
            round:roundNumber,
            x: firstDigit,
            y: secondDigit,
            operation: operation,
            numberPlayed: 0,
            correctResult: function (operationIndex) {
                switch(operationIndex) {
                    case 0:
                        return firstDigit + secondDigit;
                        break;
                    case 1:
                        return firstDigit -secondDigit;
                        break;
                    case 2:
                        return firstDigit * secondDigit;
                        break;
                    case 3:
                        return firstDigit / secondDigit;
                        break;
                }
            }(operationIndex)
        };

        return round;
    }
};

