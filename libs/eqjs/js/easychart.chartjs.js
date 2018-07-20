;(function ($, window) {
    
        //Ensure that global variables exist
        var EQ = window.EQ = window.EQ || {};
    
        EQ.view = EQ.view || {};
        /// <namespace name="EQ.view.chartProvider" version="1.0.0">
        /// <summary>
        /// Contains different functions for generating chartJS charts.
        /// </summary>
        /// </namespace>
        EQ.view.chartProvider = {
            
            _dataTable: null,
            
            _labelColumn: null,
            _dataColumns: [],
            
            _chartType: 10,
            
            _colors: [
                    '#4dc9f6',
                    '#f67019',
                    '#f53794',
                    '#537bc4',
                    '#acc236',
                    '#166a8f',
                    '#00a950',
                    '#58595b',
                    '#8549ba'
            ],

            chartTypes: {
                "3": { name: "Column chart" },
                //"4": { name: "Histogram" },
                "5": { name: "Bar chart" },
              //  "6": { name: "Combo chart" },
              //  "7": { name: "Area chart" },
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
                if(this._dataTable) {
                    this._chartLabels = [];
                    this._chartColumns = [];
                    for (var i = 0; i < this._dataTable.getNumberOfRows(); i++) {
                        this._chartLabels.push(this._dataTable.getFormattedValue(i, this._labelColumn));
                        this._chartColumns.push(this._dataTable.getFormattedValue(i, this._dataColumns[0]));
                    }
                }
            },

            draw: function(chartDiv){
                if (this._dataTable != null && this._dataTable.getNumberOfRows() > 0) {
                    var config = this._generateConfig();
            
                    var chart = chartDiv.get(0).lastElementChild.getContext("2d");
                    window.myPie = new Chart(chart, config);
                }
            },

            preparePlaceholder: function(placeholder){
                return placeholder.append('<canvas id="chart-area" />');
            },

            _generateConfig: function(){
                var dataColors = [];
                var datasetName = this._dataTable.getColumnLabel(this._dataColumns[0]);
                var displayLegend = true;
                var fillValue = true;
                var borderColor;
                if (this._chartType === 10) {
                    displayLegend = false;
                    for (var i = 0; i < this._chartLabels.length; i++) {
                        dataColors.push(this._colors[i % this._colors.length]);
                    }
                } else {
                    dataColors = this._colors[3];
                }
                if (this._chartType === 9) {
                    fillValue = false;
                    borderColor = dataColors;
                }
            
                return {
                    type: this._getChartType(),
                    data: {
                        datasets: [{
                            data: this._chartColumns,
                            backgroundColor: dataColors,
                            borderColor: borderColor,
                            label: datasetName,
                            fill: fillValue
                        }],
                        labels: this._chartLabels
                    },
                    options: {
                        legend: {
                            display: displayLegend
                        }
                    }
                };
            },

            getProviderType: function(){
                return "chartjs";
            },

            _randomColor: function() {
                var randomIndex = Math.round(Math.random() * 10) % this._colors.length;
                return this._colors[randomIndex];
            },

            _getChartType: function() {
                switch (this._chartType) {
                       case 3:
                           return "bar";
                       case 5:
                           return "horizontalBar";
                       case 9:
                           return "line";
                       case 10:
                           return "pie";
                       default:
                           return "pie";
               }   
            }
        }
    
    
})(jQuery, window);