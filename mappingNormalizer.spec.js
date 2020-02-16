const { normalizeCategories } = require("./mappingNormalizer");

describe("normalizeCategories", () => {
    test("should normilize the structure", () => {
        const categories = {
            Other: {
                Other: ["allegro", "tpay"]
            },
            Income: {
                Other: ["Income"],
                Deposit: ["Deposit"],
                "Social Security": ["KIE CENTRUM"]
            },
            Insurance: {
                Health: ["EUROP ASSISTANC"]
            }
        };

        const payers = {
            "Deposit": {
                "category": "Income",
                "subCategory": "Deposit",
            },
            "EUROP ASSISTANC": {
                "category": "Insurance",
                "subCategory": "Health",
            },
            "Income": {
                "category": "Income",
                "subCategory": "Other",
            },
            "KIE CENTRUM": {
                "category": "Income",
                "subCategory": "Social Security",
            },
            allegro: {
                category: "Other",
                subCategory: "Other"
            },
            tpay: {
                category: "Other",
                subCategory: "Other"
            }
        };

        expect(normalizeCategories(categories)).toEqual(payers);
    });

    test('should return empty object when no payers are provided', () => {
        const categories = {
            Other: {
                Other: []
            },
            Income: {
                Other: null
            }
        };
        
        expect(normalizeCategories(categories)).toEqual({})
    })
});
