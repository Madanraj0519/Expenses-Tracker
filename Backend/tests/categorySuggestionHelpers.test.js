const test = require('node:test');
const assert = require('node:assert/strict');
const { suggestCategory } = require('../utils/categorySuggestionHelpers');

test('prefers the user’s previous category for the same normalized description', () => {
    const result = suggestCategory('  Blue Bottle Coffee  ', [
        { description: 'blue-bottle coffee', category: 'Work Meals' },
    ]);

    assert.equal(result.suggestion, 'Work Meals');
    assert.equal(result.confidence, 0.96);
    assert.equal(result.source, 'your_history');
});

test('uses common merchant keywords only when personal history has no match', () => {
    const result = suggestCategory('Monthly Netflix subscription', []);

    assert.equal(result.suggestion, 'Service');
    assert.equal(result.source, 'keyword_match');
    assert.ok(result.confidence < 0.8);
    assert.equal(suggestCategory('business transfer', []).suggestion, null);
});

test('does not make a category claim for blank or unmatched descriptions', () => {
    assert.equal(suggestCategory(' ', []).suggestion, null);
    assert.equal(suggestCategory('miscellaneous transfer', []).suggestion, null);
    assert.equal(suggestCategory(null, []).suggestion, null);
});

test('avoids confident suggestions when identical descriptions have conflicting labels', () => {
    const result = suggestCategory('monthly transfer', [
        { description: 'monthly transfer', category: 'Food' },
        { description: 'monthly-transfer', category: 'Travel' },
    ]);
    assert.equal(result.suggestion, null);
    assert.equal(result.source, 'conflicting_history');
});
