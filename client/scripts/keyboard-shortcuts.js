/**
 * This module simply defines keyboard actions
 * to be performed on certain keyboard shortcuts.
 *
 * @type {exports}
 */
var history     = require('./history');
var state       = require('./state');
var keyboard    = require('./keyboard');
var bar         = require('./bar');

module.exports = function(socket) {
    keyboard.on('tab', function() {
        document.execCommand('insertHTML', false, "&#9;");
        return false;
    });

    keyboard.on('ctrl + s', function() {
        bar.alert('Saving...');
        state.openFile.data = $('[id="file-' + state.openFile.path + '"]').text();
        socket.emit('resource.save', state.openFile);
        return false;
    });

    keyboard.on('ctrl + q', function() {
        Prism.highlightAll();
    });

    keyboard.on(';,enter,tab,",\',backspace,del', function() {
        history.past.push($('[id="file-' + state.openFile.path + '"]').text());
    });

    keyboard.on('ctrl + z', function() {
        if (history.past.length) {
            history.future.push($('[id="file-' + state.openFile.path + '"]').text());
            $('[id="file-' + state.openFile.path + '"]').text(history.past.pop());
        } else {
            bar.alert("We reached the beginning of the history");
        }

        return false;
    });

    keyboard.on('ctrl + shift + z', function() {
        if (history.future.length) {
            history.past.push($('[id="file-' + state.openFile.path + '"]').text());
            $('[id="file-' + state.openFile.path + '"]').text(history.future.pop());
        } else {
            bar.alert("We reached the end of the history");
        }

        return false;
    });
};