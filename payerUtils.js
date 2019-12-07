const csvSeparatorRegEx = /,/g

exports.sanitizePayer = payer => payer.replace(csvSeparatorRegEx, '');