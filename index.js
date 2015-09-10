var fs = require('fs');
var readline = require('readline');

function startsWith(value, pattern) {
    return value.lastIndexOf(pattern, 0) === 0;
}

function extractWebsiteUrl(lines, currentItemFirstIndex, currentIndex) {
    for (var i = currentIndex; i >= currentItemFirstIndex; i--) {
        // go back, searching for the right line
        if (startsWith(lines[i], 'www'))
            return lines[i].trim();
    }

    return '';
}

function extractValue(lines, currentIndex, label, allowAdditionalLines) {
    for (var i = currentIndex; i > (currentIndex - 10); i--) {
        // go back, searching for the right line
        if (startsWith(lines[i], label)) {
            if (!allowAdditionalLines)
                // Return the single matching line
                return lines[i].split(':')[1].trim();
            else {
                // Return the current and any subsequent lines
                var matchingLines = [lines[i].split(':')[1].trim()];
                for(var j = i + 1; j < currentIndex; j++) { // Don't go further than the currentIndex
                    if (lines[j].indexOf(':') === -1) {
                        matchingLines.push(lines[j]);
                    } else {
                        break;
                    }
                }
                
                return matchingLines.join(' ');
            }
        }
    }

    throw 'Unable to find a ' + label;
}

function getPreviousNonSeparatedLines(allLines, currentItemFirstIndex, currentItemLastIndex) {
    var matchingLines = [];
    var j = currentItemFirstIndex;
    for(; j < currentItemLastIndex; j++) {
        if (allLines[j].indexOf(':') === -1 && !startsWith(allLines[j], 'www')) {
            matchingLines.push(allLines[j]);
        } else {
            break;
        }
    }
    
    return matchingLines.join(' ');
}

function parseData(allLines) {
    var items = [];
    var currentItemFirstIndex = 0;
    for (var i = 0; i < allLines.length; i++) {
        if (startsWith(allLines[i], 'Revenue')) { // startsWith...
            try {
                // Go back until the previous revenue 

                // Get the 5 lines for this company
                var item = {
                    description: getPreviousNonSeparatedLines(allLines, currentItemFirstIndex, i),
                    website: extractWebsiteUrl(allLines, currentItemFirstIndex,  i),
                    sector: extractValue(allLines, i, 'Sector', true),
                    region: extractValue(allLines, i, 'Region', true),
                    revenue: extractValue(allLines, i, 'Revenue', false)
                };
                items.push(item);
                currentItemFirstIndex = i + 1;
            }
            catch (e) {
                console.log('Failed to parse at line ' + i + ' (' + e + ')');
            }
        }
    }

    return items;
}

function writeToCsv(filePath, items) {
    fs.truncateSync(filePath, 0);
    for(var i=0; i < items.length; i++) {
        var values = [];
        
        for (var prop in items[i]) {
            if (items[i].hasOwnProperty(prop))
                values.push('"' + items[i][prop] + '"');
        }
        
        var record = values.join(', ');
        fs.appendFileSync(filePath, record + '\n');
    }
}

var lineReader = readline.createInterface({
    input: fs.createReadStream('./data.txt'),
    terminal: false
});

var lines = [];

lineReader.on('line', function(line) {
    lines.push(line);
});

lineReader.on('close', function() {
    var companies = parseData(lines);
    fs.writeFile('output.json', JSON.stringify(companies));
    console.log('Found ' + companies.length + ' companies.');
    writeToCsv('companies.csv', companies);
});
