const csvSeparatorRegEx = /,/g

exports.sanitize = value => value && value.replace(csvSeparatorRegEx, '');