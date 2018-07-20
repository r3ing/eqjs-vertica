;(function ($, window) {

    //Ensure that global variables exist
    var EQ = window.EQ = window.EQ || {};


    /// <namespace name="EQ.view" version="1.0.0">
    /// <summary>
    /// Contains different functions for managing core EasyQuery pages (views): process user input, render result set, etc.
    /// </summary>
    /// </namespace>
    EQ.view = {

        EqDataTable: function (data) {
            if (typeof data === 'string') {
                this.table = JSON.parse(data);
            }
            else {
                this.table = data;
            }
        },

        beforeTableRendering: null,
        formatColumnHeader: null,
        formatGridCell: null,
        useEasyChart : false,
        
        //applies options commong for all "view" objects (like "view.basic", "view.grid" or "view.report")
        applyCommonOptions: function(options) {
            if (options.beforeTableRendering) {
                this.beforeTableRendering = options.beforeTableRendering;
			}
            if (options.formatColumnHeader) {
                this.formatColumnHeader = options.formatColumnHeader;
			}
            if (options.formatGridCell) {
                this.formatGridCell = options.formatGridCell;
			}
            if (typeof options.useEasyChart !== "undefined") {
                this.useEasyChart = options.useEasyChart;
            }
        },

        isChartJSDefined: function() {
            return (typeof Chart != 'undefined');
        },

        isGoogleVisualizationDefined: function () {
            return (typeof google != 'undefined') && (typeof google.visualization != 'undefined');
        },

        isGoogleChartDefined: function () {
            return this.isGoogleVisualizationDefined() && (typeof google.visualization.PieChart != 'undefined');
        },

        getDataTableClass: function () {
            var result = this.EqDataTable;
            if (this.isGoogleVisualizationDefined() && (typeof google.visualization.DataTable != 'undefined')) {
                result = google.visualization.DataTable;
            }
            return result;
        },

        renderGridByDataTable: function (dataTable) {
            if (this.beforeTableRendering) {
                this.beforeTableRendering(dataTable);
			}

            var tbl = $('<table></table>').css('width', '100%');

            var colCount = dataTable.getNumberOfColumns();
            for (var i = 0; i < colCount; i++) {
                var colLabel = dataTable.getColumnLabel(i);
                if (this.formatColumnHeader) {
                    colLabel = this.formatColumnHeader(dataTable, i, colLabel);
				}
                tbl.append('<th>' + colLabel + '</th>');
            }
            tbl.wrapInner('<tr class="result-grid-header"></tr>');

            var rowCount = dataTable.getNumberOfRows();
            for (i = 0; i < rowCount; i++) {
                var trbody = '';
                for (var j = 0; j < colCount; j++) {
                    var val = dataTable.getFormattedValue(i, j);
                    if (this.formatGridCell) {
                        val = this.formatGridCell(dataTable, i, j, val);
					}
                    var td = '<td>' + val + '</td>';
                    trbody += td;
                }
                tbl.append('<tr>' + trbody + '</tr>');
            }

            return tbl;
        },

        renderGridOldStyle: function (resultSet) {
            var tbl = $('<table />').css('width', '100%');

            for (var i = 0; i < resultSet.cols.length; i++) {
                tbl.append('<th>' + resultSet.cols[i] + '</th>');
            }

            tbl.wrapInner('<tr class="result-grid-header"></tr>');
            for (i = 0; i < resultSet.rows.length; i++) {
                var trbody = '';
                var row = resultSet.rows[i];

                for (var j = 0; j < row.length; j++) {
                    trbody += '<td>' + row[j] + '</td>';
                }
                tbl.append('<tr>' + trbody + '</tr>');
            }
            return tbl;
        },

        renderPageNavigator: function (options) {
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
            if (EQ.client.useBootstrap) {
                ul.addClass("pagination");
            }
            else {
                ul.addClass("eqview-pagination");
            }
            if (options.cssClass) {
                ul.addClass(options.cssClass);
			}

            var li = $("<li></li>");
            if (EQ.client.useBootstrap) {
                li.addClass("page-item");
            }
            var a = $("<span aria-hidden='true'>&laquo;</span>");
            if (EQ.client.useBootstrap) {
                a.addClass("page-link");
            }

            if (firstPageIndex == 1) {
                li.addClass("disabled");
            }
            else {
                if (EQ.client.useBootstrap) {
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
                if (EQ.client.useBootstrap) {
                    li.addClass("page-item");
                }
                if (i == pageIndex)
                    li.addClass("active");
                a = $("<a href='javascript:void(0)' class='page-link' data-page='" + i + "'>" + i + "</a>");
                if (EQ.client.useBootstrap) {
                    a.addClass("page-link");
                }
                a.on("click", buttonClick);
                li.append(a);
                ul.append(li);
            }

            li = $("<li></li>");
            if (EQ.client.useBootstrap) {
                li.addClass("page-item");
            }
            a = $("<span aria-hidden='true'>&raquo;</span>");
            if (EQ.client.useBootstrap) {
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

        _prepareForChart: function (dataTable) {
            if (!this.isGoogleChartDefined() && !this.isChartJSDefined()) {
				return false;
            }
            if (dataTable.getNumberOfColumns() < 2) {
				return false;
			}
            var type1 = dataTable.getColumnType(0);
            if (type1 != "string") {
				return false;
			}
            if (dataTable.getColumnType(1) != "number") {
				return false;
			}

            return true;
        },



        drawChart: function (dataTable, placeHolder, options) {
            if (this.useEasyChart){
                this.drawEasyChart(dataTable, placeHolder, options);
            }
            else {
                this.drawSimpleChart(dataTable, placeHolder, options);
            }
        },

        drawSimpleChart: function(dataTable, placeHolder, options){
            if (this._prepareForChart(dataTable) && this.isGoogleChartDefined()) {
                // Set chart options
                options = options || { 'width': 300 };

                // Instantiate and draw our chart, passing in some options.
                var chart = new google.visualization.PieChart(placeHolder);
                chart.draw(dataTable, options);
            }
        },

        drawEasyChart: function (dataTable, placeHolder, options) {
            if (this._prepareForChart(dataTable)) {
                var self = this;
                options = options || { 'width': 300 };
                var chartElement = $(placeHolder);
                chartElement.EasyChart(options);
                chartElement.EasyChart("draw", dataTable, this.chartState, function (state) {
                    self.chartState = state;
                }); 
            }
        },

    };


    EQ.view.EqDataTable.prototype = {
        getNumberOfColumns: function () {
            return this.table.cols.length;
        },

        getColumnObject: function(colIndex) {
            return colIndex < this.table.cols.length ? this.table.cols[colIndex] : null;
        }, 

        getColumnId: function (colIndex) {
            var col = this.getColumnObject(colIndex);
            return col ? col.id : null;
        },

        getColumnLabel: function (colIndex) {
            var col = this.getColumnObject(colIndex);
            return col ? col.label : null;
        },

        getColumnType: function (colIndex) {
            var col = this.getColumnObject(colIndex);
            return col ? col.type : null;
        },

        getColumnProperties: function(colIndex) {
            var col = this.getColumnObject(colIndex);
            return col ? col.p : null;
        },

        getNumberOfRows: function () {
            return this.table.rows.length;
        },

        getFormattedValue: function (rowIndex, colIndex) {
            var row = rowIndex < this.table.rows.length ? this.table.rows[rowIndex] : null;
            if (row) {
                var cell = colIndex < this.table.cols.length ? row.c[colIndex] : null;
                if (cell) {
                    if (typeof cell.f != 'undefined') {
                        return cell.f;
                    }

                    var v = cell.v;
                    var dt;
                    if (typeof v != 'undefined' && v !== null) {                    
                        var colType = this.getColumnType(colIndex);
                        if (colType == 'date' || colType == 'datetime') {
                            dt = eval("new " + v);
                            if (colType == 'date') {
                                v = dt.toLocaleDateString();
                            }
                            else {
                                v = dt.toLocaleString();
                            }
                        }
                        else if (colType == 'timeofday') {
                            dt = new Date();
                            dt.setHours(v[0], v[1], v[2], v[3]);
                            v = dt.toLocaleTimeString();
                        }

                    }
                    return v;
                }
            }
            return null;
        }
    };


})(jQuery, window);


