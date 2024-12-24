// Run: node tests/unit_number_range.js

import { parseNumberRanges } from '../controllers/cron_controller.js';

// Test cases
const testCases = [{
    input: '1, 2, 3-5, 10-12, 15, 20-25, 30',
    output: [1, 2, 3, 4, 5, 10, 11, 12, 15, 20, 21, 22, 23, 24, 25, 30],
}, {
    input: '1-5, 10-15, 20-25, 30',
    output: [1, 2, 3, 4, 5, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23, 24, 25, 30],
}, {
    input: '1-5, 10 - 15, 20',
    output: [1, 2, 3, 4, 5, 10, 11, 12, 13, 14, 15, 20],
}];

let result = true;
for(const { input, output } of testCases) {
    const result = parseNumberRanges(input);
    console.log(result);
    if(result.length === output.length && result.every((value, index) => value === output[index])) {
        console.info('PASS');
    } else {
        console.warn('FAIL');
        result = false;
    }
}

result
    ? console.info('Test: PASS')
    : console.error('Test: FAIL');