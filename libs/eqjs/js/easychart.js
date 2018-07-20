; (function ($, undefined) {

        //Ensure that global variables exist
        var EQ = window.EQ = window.EQ || {};      
        EQ.view = EQ.view || {};
    
        $.widget('eqjs.EasyChart', {
            _dataTable: null,
            _dataView: null,
    
            _potentialLabelColumns: [],
            _potentialDataColumns: [],
            _labelColumn: null,
            _dataColumns: [],
            _settingsDiv: null,
    
            _ccHeader: "eqjs-chart-header",
            _ccMain: "eqjs-chart-main",
            _ccSettings: "eqjs-chart-settings",
            _ccContent: "eqjs-chart-content",
    
    
            _stateChangedCallback: null,
    
            _defaultChartType: 10,
    
            _chartProvider: null,
    
            _chartTypes: null,
    
            options: {
    
                //3 - Column, 4 - Histogram, 5 - Bar, 6 - Combo, 7 - Area, 9 - Line, 10 - Pie, 12 - Donut, 17 - Gauge, 18 - Candlestick
                chartType: 10
            },

            _tryInitChartProvider: function() {
                if (typeof EQ.view.chartProvider == 'undefined'){
                    return false;
                }

                if (this._chartProvider == null){
                    this._chartProvider = EQ.view.chartProvider;
                }
            
                return true;
            },
    
            _setOption: function (key, value) {
                if (arguments.length == 2) {
                    if (key == "chartType") {
                        if (value && this._chartTypes.hasOwnProperty(value.toString())) {
                            this.options.chartType = value;
                        }
                        else {
                            this.options.chartType = this._defaultChartType;
                        }
                    }
                    else {
                        this.options[key] = value;
                    };
                    this._render();
                    return this;
                }
                else {
                    return this.options[key];
                }
            },
    
            _create: function () {
    
            },
    
            _clear: function () {
                this.element.html('')
            },
    
    
            draw: function (dataTable, state, stateChangedCallback) {
                if (this._tryInitChartProvider()){
                    var self = this;
                    this._chartTypes = this._chartProvider.chartTypes;
                    state = state || { dataColumns: [] };
                    this._setOption("chartType", state.chartType || this.options.chartType);
        
                    self._dataTable = dataTable;
        
                    self._stateChangedCallback = stateChangedCallback;
        
                    if (self._dataTable) {
                        self._potentialLabelColumns = [];
                        self._potentialDataColumns = [];
                        var colNum = self._dataTable.getNumberOfColumns();
                        var colType, colLabel;
        
                        var stateLabelIsOk = false;
                        var stateDataColumns = [].concat(state.dataColumns);
        
                        for (var i = 0; i < colNum; i++) {
                            colType = self._dataTable.getColumnType(i);
                            colLabel = self._dataTable.getColumnLabel(i);
                            if (colType == 'string') {
                                self._potentialLabelColumns.push({ idx: i, label: colLabel });
                                if (state.labelColumn == i) {
                                    stateLabelIsOk = true;
                                }
                            }
                            else if (colType == 'number') {
                                self._potentialDataColumns.push({ idx: i, label: colLabel });
                                while (stateDataColumns.indexOf(i) >= 0) {
                                    stateDataColumns.splice(stateDataColumns.indexOf(i), 1);
                                }
                            }
                        };
        
                        if (self._potentialLabelColumns.length > 0) {
                            if (stateLabelIsOk) {
                                self._labelColumn = state.labelColumn;
                            }
                            else {
                                self._labelColumn = self._potentialLabelColumns[0].idx;
                            }
                        };
        
                        if (self._potentialDataColumns.length > 0) {
                            if (state.dataColumns.length > 0 && stateDataColumns.length == 0) {  //all state data columns are available in dataTable
                                self._dataColumns = [].concat(state.dataColumns);
                            }
                            else {
                                self._dataColumns = [].concat(self._potentialDataColumns[0].idx);
                            }
                        };
        
                        self._chartProvider.init(this._dataTable,this.options.chartType, this._labelColumn, this._dataColumns);
                    }
        
                }

                this.refresh();
                
            },
    
            refresh: function () {
                this._render();
            },
    
            resize: function () {
                this._render();
            },
    
            _render: function () {
                var self = this;
    
                this._clear();
    
                var headerDiv = $('<div></div>')
                    .addClass(self._ccHeader)
                    ,
                    mainDiv = $('<div></div>')
                        .addClass(self._ccMain);
                
                if (this._chartProvider != null){
                    var chartTypeSelector = $("<select></select>");
    
                    for (var ctkey in this._chartTypes) {
                        var ctype = this._chartTypes[ctkey];
                        var sopt = $('<option />', { value: ctkey, text: ctype.name });
        
                        sopt.appendTo(chartTypeSelector);
                    }
        
                    chartTypeSelector.val(this.options.chartType)
        
                    chartTypeSelector.appendTo(headerDiv);
        
                    chartTypeSelector.change(function () {
                        var ctkey = $(this).val();
                        self.options.chartType = parseInt(ctkey);
                        self._chartProvider.setType(self.options.chartType);
                        self.refresh();
                        self._onStateChanged();
                    });
        
                    this._settingsDiv = $("<div></div>")
                        .addClass(this._ccSettings)
                        .hide()
                        .appendTo(mainDiv);
        
                    this._chartDiv = $("<div></div>")
                        .addClass(this._ccContent)
                        .hide()
        
                    this._chartDiv = this._chartProvider.preparePlaceholder(this._chartDiv);

                    this._chartDiv.appendTo(mainDiv).fadeIn(1000);
        
                    this._initSettingsDiv();
        
        
                    if (this._dataTable != null && this._dataTable.getNumberOfRows() > 0) {
                        var chartSettingsBtn = $("<div></div>")
                            .addClass("eqjs-chart-settings-icon")
                            .attr("title", "Settings")
                            .appendTo(headerDiv);
        
        
                        chartSettingsBtn.click(function () {
                            self._toggleSettings();
                        });
        
        
                        self._redrawTwice();
                    }
                    else {
                        $("<div></div>")
                            .addClass("eqjs-chart-no-data")
                            .text("No Data")
                            .appendTo(mainDiv);
                    }
                } else {
                    $("<div></div>")
                    .addClass("eqjs-chart-no-data")
                    .text("Chart Provider is not defined")
                    .appendTo(mainDiv);
                }
               
    
                this.element.append(headerDiv);
                this.element.append(mainDiv);
            },
    
            _toggleSettings: function (callback) {
                var first, second;
    
                if (this._chartDiv.is(":visible")) {
                    first = this._chartDiv;
                    second = this._settingsDiv;
                }
                else {
                    first = this._settingsDiv;
                    second = this._chartDiv;
                }
    
                first.fadeToggle({
                    duration: 200,
                    complete: function () {
                        second.fadeToggle({
                            duration: 200,
                            complete: callback
                        });
                    }
                });
            },
    
            _initSettingsDiv: function () {
                var self = this;
    
                $("<div></div")
                    .text("SETTINGS")
                    .addClass(this._ccSettings + '-header')
                    .appendTo(this._settingsDiv);
    
                // Label column
                var labelDiv = $("<div></div")
                    .addClass(this._ccSettings + '-single')
                    .appendTo(this._settingsDiv);
    
                $("<span></span>")
                    .text("Label column: ")
                    .css({ "display": "inline-block" })
                    .appendTo(labelDiv);
    
                var labelColumnSelector = $("<select></select>")
                    .css({ "display": "inline-block" })
                    .appendTo(labelDiv);
    
                this._potentialLabelColumns.forEach(function (item, idx, arr) {
                    var sopt = $('<option />', { value: item.idx, text: item.label });
                    sopt.appendTo(labelColumnSelector);
                });
    
                labelColumnSelector.val(this._labelColumn);
    
                labelColumnSelector.change(function () {
                    self._labelColumn = parseInt($(this).val());
                    self._chartProvider.setLabelColumn(self._labelColumn);
                    self._chartProvider.updateChartColumns()
                    self._toggleSettings(function () {
                        self.refresh();
                        self._onStateChanged();
                    });
                });
    
                // Data column
                var dataDiv = $("<div></div")
                    .addClass(this._ccSettings + '-single')
                    .appendTo(this._settingsDiv);
    
                $("<span></span>")
                    .text("Data column: ")
                    .css({ "display": "inline-block" })
                    .appendTo(dataDiv);
    
                var dataColumnSelector = $("<select></select>")
                    .css({ "display": "inline-block" })
                    .appendTo(dataDiv);
    
                this._potentialDataColumns.forEach(function (item, idx, arr) {
                    var sopt = $('<option />', { value: item.idx, text: item.label });
                    sopt.appendTo(dataColumnSelector);
                });
    
                dataColumnSelector.val(this._dataColumns[0]);
    
                dataColumnSelector.change(function () {
                    self._dataColumns[0] = parseInt($(this).val());
                    self._chartProvider.setDataColumns(self._dataColumns);
                    self._chartProvider.updateChartColumns()
                    self._toggleSettings(function () {
                        self.refresh();
                        self._onStateChanged();
                    });
                });
    
            },
    
            redraw: function () {
                this._chartProvider.draw(this._chartDiv);
            },
    
            _redrawTwice: function () {
                var self = this;
    
                self.redraw();
                setTimeout(function () { self.redraw() }, 200);
            },
    
            _onStateChanged: function () {
                if (this._stateChangedCallback) {
                    var state = {};
    
                    state.chartType = this.options.chartType;
                    state.labelColumn = this._labelColumn;
                    state.dataColumns = [].concat(this._dataColumns);
    
                    this._stateChangedCallback(state);
                }
            }
    
        });
    
    })(jQuery);