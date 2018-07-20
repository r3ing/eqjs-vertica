;(function ($, window) {
    
        //Ensure that global variables exist
        var EQ = window.EQ = window.EQ || {};
    
        EQ.view = EQ.view || {};
        /// <namespace name="EQ.view.chartProvider" version="1.0.0">
        /// <summary>
        /// Contains different functions for generating google charts.
        /// </summary>
        /// </namespace>
        EQ.view.chartProvider = {
            
            _dataTable: null,
            _dataView: null,
        
            _labelColumn: null,
            _dataColumns: [],
        
            _chartType : 10,

            chartTypes: {
                "3": { name: "Column chart" },
                //"4": { name: "Histogram" },
                "5": { name: "Bar chart" },
                "6": { name: "Combo chart" },
                "7": { name: "Area chart" },
                "9": { name: "Line chart" },
                "10": { name: "Pie chart", chartAreaWidth: "100%" }
                //"17": { name: "Gauge" },
                //"18": { name: "Candlestick" }
            }, 
           
            init: function (dataTable, defType, labelColumn, dataColumns) {
                this._dataTable = dataTable;
                this._chartType = defType;
                this._labelColumn = labelColumn;
                this._dataColumns = dataColumns;

                if (this._labelColumn != null && this._dataColumns && this._dataColumns.length > 0) {
                    this._dataView = new google.visualization.DataView(this._dataTable);
                    this.updateChartColumns();
                }
                
            },

            setType: function(newChartType){
                this._chartType = newChartType;
            },

            setLabelColumn:  function(labelColumn){
                this._labelColumn = labelColumn;
            },

            setDataColumns: function(dataColumns){
                this._dataColumns = dataColumns;
            },

            updateChartColumns: function(){
                if (this._dataView) {
                    this._dataView.setColumns([].concat(this._labelColumn).concat(this._dataColumns));
                }
            },

            draw: function(chartDiv){
                if (this._dataView != null) {
                    var chartOptions = {
                        width: "100%",
                        height: "100%",
                        chartArea: { width: this.chartTypes[this._chartType.toString()].chartAreaWidth || "50%" }
                    };
            
                    var chart = this._createChart(chartDiv.get(0));
                    chart.draw(this._dataView, chartOptions);
                }
            },

            getProviderType: function(){
                return "google";
            },

            preparePlaceholder: function(placeholder){
                return placeholder;
            },

            _createChart: function(placeholder) {
                switch (this._chartType) {
                    case 3:
                        return new google.visualization.ColumnChart(placeholder);
                    case 4:
                        return new google.visualization.Histogram(placeholder);
                    case 5:
                        return new google.visualization.BarChart(placeholder);
                    case 6:
                        return new google.visualization.ComboChart(placeholder);
                    case 7:
                        return new google.visualization.AreaChart(placeholder);
                    case 9:
                        return new google.visualization.LineChart(placeholder);
                    case 10:
                        return new google.visualization.PieChart(placeholder);
                    case 17:
                        return new google.visualization.Gauge(placeholder);
                    case 18:
                        return new google.visualization.CandlestickChart(placeholder);
                    default:
                        return new google.visualization.PieChart(placeholder);
                }
            }

        };
    
    
    })(jQuery, window);