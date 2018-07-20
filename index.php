<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>EasyQuery</title>

    <script src="libs/jquey/jquery-1.10.2.js"></script>
    <script src="libs/jquey/jquery-ui.js"></script>
    <link href="libs/jquey/jquery-ui.css" rel="stylesheet" type="text/css" />
    <script type="text/javascript" src="libs/gstatic/loader.js"></script>

    <link href="libs/eqjs/css/easyquery.css" rel="stylesheet" type="text/css" media="screen" />
    <link href="libs/eqjs/css/eq-icons-default.min.css" rel="stylesheet" type="text/css" media="screen" />
    <link href="libs/eqjs/css/eqview.css" rel="stylesheet" type="text/css" />
    <link href="libs/eqjs/css/easychart.css" rel="stylesheet" type="text/css" />

    <style>
        * {
            padding: 0;
            margin: 0;
        }

        body, p, td, th, div {
            font-family: Trebuchet MS, Tahoma, Verdana, Geneva, Arial, Helvetica, sans-serif;
            font-size: 11px;
            margin: 0;
            padding: 0;
        }
    </style>

    <script type="text/javascript">

		var myListRequestHandler = function (params, onResult) {
			var processed = true;
			if (params.listName == "RegionList") {
				var query = EQ.client.getQuery();
				var country = EQ.core.getOneValueForAttr(query, "Customer.Country");
				if (country == "Canada") {
					onResult([
						{ id: "BC", text: "British Columbia" },
						{ id: "Quebec", text: "Quebec" }
					]);

				}
				else {
					onResult([
						{ id: "CA", text: "California" },
						{ id: "CO", text: "Colorado" },
						{ id: "OR", text: "Oregon" },
						{ id: "WA", text: "Washington" }
					]);
				}
			}
			else {
				processed = false; 
			}

			return processed;

		};
		
        window.easyQuerySettings = {
			loadModelUrl: "QueryBuilder.php?action=getModel",
			syncQueryUrl: "QueryBuilder.php?action=syncQuery",
			executeQueryUrl: "QueryBuilder.php?action=executeQuery",
			listRequestUrl: "QueryBuilder.php?action=listRequest",
            modelId: "ModelID",
            listRequestHandler: myListRequestHandler,
            entitiesPanel: { showCheckboxes: true },
			columnsPanel: { allowAggrColumns: true, attrElementFormat: "{entity} {attr}", showColumnCaptions: true, adjustEntitiesMenuHeight: false },
			queryPanel: {alwaysShowButtonsInPredicates: false, adjustEntitiesMenuHeight: false }
        };

        window.easyQueryViewSettings = {
            showChart: true,
            useEasyChart: true
        };

        // Load the Visualization API and the piechart package.
        google.charts.load('current', {'packages':['corechart']});

        
        // Set a callback to run when the Google Visualization API is loaded.
        google.charts.setOnLoadCallback(GoogleVisualizationLoaded);

        function GoogleVisualizationLoaded() {
            //alert("Visualization loaded!!!");
        }


        function getPrefix() {
            var res = window.location.pathname;
            if (res.charAt(res.length-1) !== '/')
                res = res + '/';
            return res;
        }

    </script>
    
</head>

<body>


<div id="main">
    <div class="header">
        <!--
            <div class="title">EasyQuery</div>
            <div class="sub-title">User-friendly ad-hoc query builder for your web-site</div>
        -->
        </div>
    <div id="content">
        <div class="header-panel">
            <div class="entities-block">
                <hr class="entities-hr hr" />
                <div class="entities-title">Entities</div>
                <div class="entities-panel-container">
                    <!-- EntitiesPanel widget placeholder -->
                    <div id="EntitiesPanel" onselectstart="return false"></div>
                </div>
            </div>

            <div class="central-block">
                <div class="columns-block">
                    <hr class="columns-hr hr" />
                    <div class="columns-title">Columns</div>
                    <div class="columns-panel-container">
                        <!-- ColumnsPanel widget placeholder -->
                        <div id="ColumnsPanel"></div>
                    </div>
                </div>
                <div class="conditions-block">
                    <hr class="conditions-hr hr" />
                    <div class="conditions-title">Conditions</div>
                    <div class="query-panel-container">
                        <!-- QueryPanel widget placeholder -->
                        <div id="QueryPanel"></div>
                    </div>
                </div>
            </div>
            
            <div class="menu-block">
                <hr class="menu-hr hr" />
                <div class="menu-title">Menu</div>
                <div class="menu-content">
                    <div id="ClearQueryButton" class="eqv-button clear-button">Clear query</div>
                    <div id="ExecuteQueryButton" class="eqv-button execute-button">Execute</div>
                </div>
            </div>
        </div>

        <div class="bottom-panel">
            <div class="sql-panel">
                <hr class="sql-panel-hr hr" />
                <div class="sql-panel-title">SQL</div>
                <div id="SqlPanel" class="sql-block">
                    <div class="sql-panel-result"></div>
                </div>
            </div>
            <div class="result-panel">
                <hr class="result-panel-hr hr" />
                <div class="result-panel-title">Result 
                    <!--
                    <span id="btnExport"  >
                         <a href="/EasyQuery/ExportToFileExcel">Export to Excel</a>   
                         <a href="/EasyQuery/ExportToFileCsv">Export to CSV</a>
                    </span>
                     -->
                </div>
                <div id="ResultPanel" class="result-panel-content">
                </div>
                <div class="result-panel-content-padding">
                </div>
            </div>

        </div>
    </div>
</div>

    <script src="libs/eqjs/js/eq.all.min.js" type="text/javascript"></script>
    <script src="libs/eqjs/js/eq.view.basic.js" type="text/javascript"></script>
    <script src="libs/eqjs/js/easychart.js" type="text/javascript"></script>
    
</body>
</html>
