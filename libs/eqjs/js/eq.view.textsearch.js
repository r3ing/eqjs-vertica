; (function ($, window) {

    //Ensure that global variables exist
    var EQ = window.EQ = window.EQ || {};
    EQ.view = EQ.view || {};


    /// <namespace name="EQ.view.textsearch" version="1.0.0">
    /// <summary>
    /// Contains different functions for managing core EasyQuery pages (views): process user input, render result set, etc.
    /// </summary>
    /// </namespace>

    EQ.view.textsearch = {

        _resultPanel: null,

        _applyTextSearchButton: null,

        _clearTextButton: null,

        _funcs: {},

        _useHighlightForTextSearch: false,

        _textSearchInputId: null,

        _findControlById: function (controlId) {
            var result = $("#" + controlId);
            if (result.length == 0) {
                result = null;
            }

            return result;
        },


        init: function (options) {
            options = options || window.easyQueryViewSettings || {};

            var resultPanelId = options.resultPanelId || "ResultPanel";
            this._resultPanel = this._findControlById(resultPanelId);

            var resultCountSpanId = options.resultCountSpanId || "ResultCount";
            this._resultCountSpan = this._findControlById(resultCountSpanId);


            var applyTextSearchButtonId = options.applyTextSearchButtonId || "ApplyTextSearchButton";
            this._applyTextSearchButton = this._findControlById(applyTextSearchButtonId);

            var textSearchInputId = options.textSearchInputId || "TextSearchInput";
            this._textSearchInputId = this._findControlById(textSearchInputId);

            var clearTextButtonId = options.clearTextSearchButtonId || "ClearTextSearchButton";
            this._clearTextButton = this._findControlById(clearTextButtonId);

            if (typeof (options.useHighlightForTextSearch) !== "undefined") {
                this._useHighlightForTextSearch = options.useHighlightForTextSearch;
            }

            this.showChart = typeof (options.showChart) !== "undefined" ? options.showChart : true;

            this.pagingOptions = options.paging;

            var self = this

            this.serviceUrl = typeof (options.serviceUrl) !== "undefined" ? options.serviceUrl : "/EasyQuery/";

            this.useBootstrap = typeof (options.useBootstrap) !== "undefined" ? options.useBootstrap : false;

            this.applyTextSearchUrl = options.applyTextSearchUrl || this.combinePath(this.serviceUrl, "ApplyTextSearch");

            this.applyTextSearch({ page: 1 });

            //Clear Query button
            if (!this._funcs.clearButtonClick) {
                var self = this;
                this._funcs.clearButtonClick = function () {
                    $(self._textSearchInputId).val("");
                }
            }

            //clear button
            if (this._clearTextButton) {
                this._clearTextButton.off("click", this._funcs.clearButtonClick);
                this._clearTextButton.on("click", this._funcs.clearButtonClick);
            }

            //Clear Query button
            if (!this._funcs.applyTextSearchButtonClick) {
                var self = this;
                this._funcs.applyTextSearchButtonClick = function () {
                    self.applyTextSearch({ page: 1 });
                }
            }

            // apply full-text filter button             
            if (this._applyTextSearchButton) {
                this._applyTextSearchButton.off("click", this._funcs.applyTextSearchButtonClick);
                this._applyTextSearchButton.on("click", this._funcs.applyTextSearchButtonClick);
            }

            //Enter 
            $(this._textSearchInputId).keypress(function (e) {
                if (e.which == 13) {
                    self._funcs.applyTextSearchButtonClick();
                }
            });

        },

        _clearErrorsInPanel: function (panel) {
            if (panel) {
                if (panel.hasClass('error')) {
                    panel.removeClass('error');
                }
                panel.empty();
            }
        },

        _clearErrors: function () {
            this._clearErrorsInPanel(this._resultPanel);
        },

        _clearResultPanel: function () {
            if (this._resultPanel) {
                this._resultPanel.empty();
            }

            if (this._exportButtons) {
                this._exportButtons.hide();
            }

            if (this._resultCountSpan) {
                this._resultCountSpan.hide();
            }
        },

        applyTextSearch: function (options) {
            var self = this;
            var paging, pageNavigator;
            var text = $(self._textSearchInputId).val() || "";
            var resultProgressIndicator = $('<div></div>', { 'class': 'result-panel loader' });

            options = options || {};
            if (!options.page) {
                var pg = self.getCurrentPaging();
                options.page = pg.page;
            }

            var requestData = { "text": text, "options": options };
            var resultPanel = self._resultPanel;

            $.ajax({
                type: "POST",
                contentType: "application/json",
                url: self.applyTextSearchUrl,
                data: JSON.stringify(requestData),

                beforeSend: function () {
                    if (resultPanel) {
                        resultPanel.animate({ opacity: '0.5' }, 200);
                        resultPanel.html(resultProgressIndicator);
                    }
                },
                success: function (data) {
                    try {
                        if (resultPanel) {
                            resultPanel.html(data);
                            paging = self.getCurrentPaging();
                            if (paging.pageCount > 1) {
                                var pageNavigatorPlaceholder = $("#PageNavigator");
                                if (pageNavigatorPlaceholder.length > 0) {
                                    pageNavigator = self.renderPageNavigator({
                                        pageIndex: paging.pageIndex,
                                        pageCount: paging.pageCount,
                                        pageSelectedCallback: function (pageNum) {
                                            //alert("Go to page " + $(this).data("page"));
                                            self.applyTextSearch({ page: pageNum });
                                        }
                                    });

                                    pageNavigatorPlaceholder.append(pageNavigator);
                                }
                            }

                            resultPanel.animate({ 'opacity': 1 }, 200);
                            if (self._useHighlightForTextSearch) {
                                self.highlightTextSearch();
                            }
                        }
                    }
                    finally {
                        resultProgressIndicator.remove();
                    }

                },
                error: function (statusCode, errorMessage, operation) {
                    resultProgressIndicator.remove();
                    if (resultPanel) {
                        resultPanel.empty();
                        resultPanel
                            .append("<div></div>").addClass('error')
                            .append('<div>Error during ' + operation + ' request:  <div>' + errorMessage + '</div></div>');
                    }
                }
            });

        },

        highlightTextSearch: function () {
            var text = $(this._textSearchInputId).val().toLowerCase();
            var insertValue1 = "<span style='background-color: yellow'>";
            var insertValue2 = "</span>";
            if (text !== "") {
                $("td").each(function () {
                    var startIndex = $(this).text().toLowerCase().indexOf(text);
                    if (startIndex >= 0) {
                        var pos = 0;
                        var value = $(this).text();
                        var indexInMas = [];
                        while (true) {
                            var index = $(this).text().toLowerCase().indexOf(text, pos);
                            if (index >= 0) {
                                indexInMas.push(index);
                                pos = index + text.length;
                            } else {
                                pos++;
                            }
                            if (pos >= value.length - 1) {
                                break;
                            }
                        }
                        if (indexInMas.length > 0) {
                            $(this).text("");
                            for (var i = 0; i < indexInMas.length; i++) {
                                if (i === 0) {
                                    $(this).append(value.substring(0, indexInMas[i]));
                                }

                                $(this).append(insertValue1 + value.substring(indexInMas[i], indexInMas[i] + text.length) + insertValue2);

                                if (i < indexInMas.length - 1) {
                                    $(this).append(value.substring(indexInMas[i] + text.length, indexInMas[i + 1]));
                                } else {
                                    $(this).append(value.substring(indexInMas[i] + text.length));
                                }

                            }
                        }
                    }
                });
            }

        },

        renderPageNavigator: function (options) {
            var self = this;
            var pageIndex = options.pageIndex || 1;
            var pageCount = options.pageCount || 1;

            var buttonClick = function () {
                var pageNum = $(this).data("page");
                if (options.pageSelectedCallback) {
                    options.pageSelectedCallback(pageNum);
                }
                //do nothing by default
            };

            var maxButtonCount = options.maxButtonCount || 10;

            var zeroBasedIndex = pageIndex - 1;
            var firstPageIndex = zeroBasedIndex - (zeroBasedIndex % maxButtonCount) + 1;
            var lastPageIndex = firstPageIndex + maxButtonCount - 1;
            if (lastPageIndex > pageCount) {
                lastPageIndex = pageCount;
            }

            var ul = $("<ul></ul>");
            if (self.useBootstrap) {
                ul.addClass("pagination");
            }
            else {
                ul.addClass("eqview-pagination");
            }
            if (options.cssClass) {
                ul.addClass(options.cssClass);
            }

            var li = $("<li></li>");
            if (self.useBootstrap) {
                li.addClass("page-item");
            }
            var a = $("<span aria-hidden='true'>&laquo;</span>");
            if (self.useBootstrap) {
                a.addClass("page-link");
            }

            if (firstPageIndex == 1) {
                li.addClass("disabled");
            }
            else {
                if (self.useBootstrap) {
                    a = $("<a href='javascript:void(0)' data-page='" + (firstPageIndex - 1) + "'>&laquo;</a>");
                    a.addClass("page-link");
                } else {
                    a = $("<a href='javascript:void(0)' data-page='" + (firstPageIndex - 1) + "'></a>").append(a);
                }
                a.on("click", buttonClick);
            }
            li.append(a);
            ul.append(li);

            for (var i = firstPageIndex; i <= lastPageIndex; i++) {
                li = $("<li></li>");
                if (self.useBootstrap) {
                    li.addClass("page-item");
                }
                if (i == pageIndex)
                    li.addClass("active");
                a = $("<a href='javascript:void(0)' class='page-link' data-page='" + i + "'>" + i + "</a>");
                if (self.useBootstrap) {
                    a.addClass("page-link");
                }
                a.on("click", buttonClick);
                li.append(a);
                ul.append(li);
            }

            li = $("<li></li>");
            if (self.useBootstrap) {
                li.addClass("page-item");
            }
            a = $("<span aria-hidden='true'>&raquo;</span>");
            if (self.useBootstrap) {
                a.addClass("page-link");
            }
            if (lastPageIndex == pageCount) {
                li.addClass("disabled");
            }
            else {
                if (EQ.client.useBootstrap) {
                    a = $("<a href='javascript:void(0)' data-page='" + (lastPageIndex + 1) + "'>&raquo;</a>");
                    a.addClass("page-link");
                } else {
                    a = $("<a href='javascript:void(0)' data-page='" + (lastPageIndex + 1) + "'></a>").append(a);
                }
                a.on("click", buttonClick);
            }
            li.append(a);
            ul.append(li);

            return ul;
        },

        getCurrentPaging: function () {
            result = { pageIndex: 1, pageCount: 1 };
            var pageNavigator = $("#PageNavigator");
            if (pageNavigator.length > 0) {
                var pageIndex = pageNavigator.data("pageindex");
                var pageCount = pageNavigator.data("pagecount");
                if (pageIndex)
                    result.pageIndex = pageIndex;
                if (pageCount)
                    result.pageCount = pageCount;
            }
            return result;
        },

        combinePath: function (path1, path2) {
            var result = path1;
            if (result != null && result.length > 0) {

                if (result.charAt(result.length - 1) != '/')
                    result += "/";
                result += path2;
            }
            else
                result = path2;

            return result;
        }

    }

    $(function () {
        EQ.view.textsearch.init();
    });

})(jQuery, window);