const { validationResult } = require('express-validator');

function spValidationResult() {

    // Use function make work on obj possible, why ?
    function decorateAsValidationResult(obj) {

        obj.getErrors = () => {
            let errors = {};
            obj.array().forEach(
                (error) => {
                    // TODO use en array ?
                    if (errors[error.param]) {
                        errors[error.param] += " " + error.msg
                    } else {
                        errors[error.param] = error.msg;
                    }
                }
            )
            // TODO use other statut for other location than 'body'?
            return errors;
        }

        return obj;
    }

    return req => decorateAsValidationResult(validationResult(req));
}
module.exports = {
  spValidationResult: spValidationResult() // without () return the function
};