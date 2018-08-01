<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="content-type" content="text/html;charset=UTF-8" />

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

        /*
        .eqjs-qp-row-predicate {
            visibility: hidden;
        }
        */
        .eqjs-qp-condition-button-addPredicate{
            visibility: hidden;
        }
        .eqjs-qp-condition-button-addCondition{
            visibility: hidden;
        }

		.title-app{
			font: normal 18pt "Segoe UI Light", "Segoe Light", "Segoe UI", Arial, Helvetica, sans-serif;
			color: #4F4F4F;
			padding: 0 0 4px 10px;
			#background: #F9F9F9;
			border-bottom: 1px solid #7BC4F8;
			height: 38px;
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
            loadQueryUrl: "QueryBuilder.php?action=loadQuery",
            saveQueryUrl: "QueryBuilder.php?action=saveQuery",
			listRequestUrl: "QueryBuilder.php?action=listRequestlistRequest",
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
    <h3 class="title-app">
        <?php
        if(trim($tipo) == 'ADM')	echo 'MANTENEDOR - ';
        else 				echo '';

        if ($descripcion != '')	echo $descripcion;
        else 							echo '';
        ?>
        <small>...</small>
    </h3>
    <div id="content">
        <div class="header-panel">
            <div class="entities-block">
                <hr class="entities-hr hr" />
                <div class="entities-title">Tablas</div>
                <div class="entities-panel-container">
                    <!-- EntitiesPanel widget placeholder -->
                    <div id="EntitiesPanel" onselectstart="return false"></div>
                </div>
            </div>

            <div class="central-block">
                <div class="columns-block">
                    <hr class="columns-hr hr" />
                    <div class="columns-title">Columnas</div>
                    <div class="columns-panel-container">
                        <!-- ColumnsPanel widget placeholder -->
                        <div id="ColumnsPanel"></div>
                    </div>
                </div>
                <div class="conditions-block">
                    <hr class="conditions-hr hr" />
                    <div class="conditions-title">Condiciones</div>
                    <div class="query-panel-container">
                        <!-- QueryPanel widget placeholder -->
                        <div id="QueryPanel"></div>
                    </div>
                </div>
            </div>
            
            <div class="menu-block">
                <hr class="menu-hr hr" />
                <div class="menu-title">Menú</div>
                <div class="menu-content">
                    <div id="ClearQueryButton" class="eqv-button clear-button">Clear query</div>
                    <div id="LoadQueryButton" class="eqv-button load-query-button">Load query</div>
                    <div id="SaveQueryButton" class="eqv-button save-query-button">Save query</div>
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
                <div class="result-panel-title">Resultado
                    <!--
                    <span id="btnExport"  >
                         <a href="/EasyQuery/ExportToFileExcel">Export to Excel</a>   
                         <a href="/EasyQuery/ExportToFileCsv">Export to CSV</a>
                    </span>
                     -->
                    <span id="ResultCount" style="display:none; margin-left:20px; font-size:small"></span>

                    <span id="ResultExportButtons"  >
                         <a href="#" onclick="tableToExcel('table', 'report')">Exportar a Excel</a>
                         <a href="#" onclick="tableToCSV('report.csv')">Exportar a CSV</a>
                    </span>

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

    <script type="text/javascript">

        var tableToExcel = (function() {
            var uri = 'data:application/vnd.ms-excel;base64,'
                , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
                , base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) }
                , format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) }
            return function(table, name) {
                if (!table.nodeType) table = document.getElementsByTagName(table)[0]
                var ctx = {worksheet: name || 'Worksheet', table: table.innerHTML}
                window.location.href = uri + base64(format(template, ctx))
            }
        })()

        function downloadCSV(csv, filename) {
            var csvFile;
            var downloadLink;

            // CSV file
            csvFile = new Blob([csv], {type: "text/csv"});
            // Download link
            downloadLink = document.createElement("a");
            // File name
            downloadLink.download = filename;
            // Create a link to the file
            downloadLink.href = window.URL.createObjectURL(csvFile);
            // Hide download link
            downloadLink.style.display = "none";
            // Add the link to DOM
            document.body.appendChild(downloadLink);
            // Click download link
            downloadLink.click();
        }

        function tableToCSV(filename) {
            var csv = [];
            var rows = document.querySelectorAll("table tr");

            for (var i = 0; i < rows.length; i++) {
                var row = [], cols = rows[i].querySelectorAll("td, th");

                for (var j = 0; j < cols.length; j++)
                    row.push(cols[j].innerText);

                csv.push(row.join(","));
            }
            // Download CSV file
            downloadCSV(csv.join("\n"), filename);
        }


    </script>

</body>
</html>
