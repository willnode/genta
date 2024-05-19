import {logTables} from './db.js';

// Run the conversation and print the result
logTables().then(result => {
    if (result) {
        console.log(result);
    }
});
