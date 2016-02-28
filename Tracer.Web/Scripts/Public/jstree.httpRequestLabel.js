/**
 * ### Checkbox plugin
 *
 * This plugin renders checkbox icons in front of each node, making multiple selection much easier.
 * It also supports tri-state behavior, meaning that if a node has a few of its children checked it will be rendered as undetermined, and state will be propagated up.
 */
/*globals jQuery, define, exports, require, document */
(function (factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        define('jstree.httpRequestLabel', ['jquery','jstree'], factory);
    }
    else if(typeof exports === 'object') {
        factory(require('jquery'), require('jstree'));
    }
    else {
        factory(jQuery, jQuery.jstree);
    }
}(function ($, jstree, undefined) {
    "use strict";

    if ($.jstree.plugins.httpRequestLabel) { return; }

    /**
	 * stores all defaults for the httpRequestLabel
	 * @name $.jstree.defaults.httpRequestLabel
	 * @plugin checkbox
	 */
    $.jstree.defaults.httpRequestLabel = {
        /**
		 * a boolean indicating if checkboxes should be visible (can be changed at a later time using `show_checkboxes()` and `hide_checkboxes`). Defaults to `true`.
		 * @name $.jstree.defaults.httpRequestLabel.visible
		 * @plugin checkbox
		 */
        visible				: true,
        /**
		 * a boolean indicating if clicking anywhere on the node should act as clicking on the checkbox. Defaults to `true`.
		 * @name $.jstree.defaults.httpRequestLabel.whole_node
		 * @plugin checkbox
		 */
        whole_node			: true
        /**
		 * a boolean indicating if the selected style of a node should be kept, or removed. Defaults to `true`.
		 * @name $.jstree.defaults.httpRequestLabel.keep_selected_style
		 * @plugin checkbox
		 */
       // keep_selected_style	: true
    };
    $.jstree.plugins.httpRequestLabel = function (options, parent) {
        this.bind = function () {
            parent.bind.call(this);

            this.element.on("init.jstree", $.proxy(function() {
                this._data.httpRequestLabel.visible = this.settings.httpRequestLabel.visible;

            }, this));

            this.element.on('model.jstree', $.proxy(function (e, data) {
                
            }, this));
            
        };

        this.redraw_node = function(element, deep, is_callback, force_render) {
            element = parent.redraw_node.apply(this, arguments);

            if (element) {

                var hasHttpRequest = false;
                var node = this.get_json(element);
                var event = node.data;

                var cssClasses = "";

                if (event.HttpRequest) {
                    hasHttpRequest = true;
                    cssClasses = "label http-request label-warning";
                }

                if (hasHttpRequest == false) {
                    return element;
                }

                var statusCode = "";

                if (event.HttpResponse) {

                    statusCode = event.HttpResponse.HttpStatusCode;

                    if (event.HttpResponse.HttpStatusCode == "OK") {
                        cssClasses = "label http-request label-success";
                    } else {
                        cssClasses = "label http-request label-danger";
                    }
                }

                var label = $('<span>', {
                    'class': cssClasses,
                    text: 'HTTP ' + event.HttpRequest.HttpMethod + ': ' + event.HttpRequest.Uri + " " + statusCode
                });

                var anchor = $(element).find('.jstree-anchor:first');
                label.insertAfter(anchor);
            }
            
            return element;
        };
        
        this.get_state = function () {
            var state = parent.get_state.apply(this, arguments);
            
            return state;
        };
        this.set_state = function (state, callback) {
            var res = parent.set_state.apply(this, arguments);
            
            return res;
        };
        this.refresh = function (skip_loading, forget_state) {

            return parent.refresh.apply(this, arguments);
        };
    };

    // include the checkbox plugin by default
    $.jstree.defaults.plugins.push("httpRequestLabel");
}));