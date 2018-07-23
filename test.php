<?php
    $link = new PDO('odbc:Driver={Vertica};Database=SWITCH;Servername=10.0.31.122', 'readOnly','X4rg#mV?G%h9&-Jq');
    $link->setAttribute(PDO::ATTR_EMULATE_PREPARES, true);
    $link->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $query="select tipo_trx, cod_trx from RIPLEY.trx_cabecera
                 where comercio = 1 and
                       fecha between to_date('01072018','ddmmyyyy') and to_date('10072018','ddmmyyyy') and
                       cod_sucursal = 10012
                       and cod_trx=3
                 group by tipo_trx, cod_trx" ;
    $result = $link->prepare($query);
    $result->execute(); 
    $result ->fetchAll(PDO::FETCH_ASSOC);

    foreach ($result as $value){
        $tablename = array_keys($value);
    }

    echo "<table><tr>";
    foreach ($tablename  as $key){
        echo "<td>".$key."</td>";
    }
    echo "</tr></table>";

    $metadata = $query->getColumnMeta(0);
    var_dump($metadata);
?>