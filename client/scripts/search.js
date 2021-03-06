var state       = require('./state');
var socket      = require('./socket');
var ui          = require('./ui');
var fs          = require('./fs');
var config      = require('./config');
var resources   = ui.resources;
var bar         = ui.bar;

socket.on('search.result', function(resource){
    fs.addResource(resource);
});

/**
 * Search object.
 *
 * @type {{executeSearch: executeSearch, toggle: toggle, getSearchRegex: getSearchRegex, reset: reset, show: show, isOpen: isOpen}}
 */
var search = {
    /**
     * Executes a search and hides elements
     * which are not matching it.
     */
    executeSearch: function(text) {
        if (text) {
            $('#fs .resource').remove();
            var mode = bar().attr('mode');
            socket.emit('search.' + mode, {text: text, root: fs.getStructure().root});
        } else {
            fs.reset();
        };
    },
    /**
     * Toggles the search box.
     */
    toggle: function(mode) {
        mode = mode || 'find';

        if (search.isOpen()) {
            search.hide();
        } else {
            search.show(mode);
        }
    },
    /**
     * Hides the search box.
     */
    hide: function() {
        bar().hide();
        bar().removeClass();
        bar().empty();
        bar().unbind();
        state.switchFocus('fs');
        fs.reset();
    },
    /**
     * Shows the search box.
     */
    show: function(mode) {
        bar().empty();
        state.switchFocus('bar');

        bar().finish();
        bar().removeClass();
        bar().addClass('message-search');
        bar().attr('contenteditable', 'true');
        bar().attr('mode', mode);

        var placeholder = 'Search files / directories';
        
        if (bar().attr('mode') === 'grep') {
          placeholder = 'Find in files';
        }

        bar().attr('data-ph', placeholder + '... (looking in ' + fs.getStructure().root.path + ')');
        bar().show();
        bar().focus();

        bar().on('keyup', function () {
            var searchValue = $(this).text();

            setTimeout(function(){
                if(searchValue == bar().text()) {
                    search.executeSearch(searchValue)
                };
            }, config.get('search.timeout'));
        });

        /**
         * Do not allow pressing 'enter'.
         */
        bar().keypress(function(e){
            return e.which != 13;
        });
    },
    /**
     * Checks whether the search box is open.
     *
     * @returns {*}
     */
    isOpen: function() {
        return bar().hasClass('message-search');
    }
};

module.exports = search;